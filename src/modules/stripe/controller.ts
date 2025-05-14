/* eslint-disable no-case-declarations */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Post,
  RawBodyRequest,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from './providers';
import JwtAuthGuard from '../../guards/jwtAuth.guard';
import { UserService } from '../../auth/services/user.service';
import { CreatePaymentIntentDto } from './dto/createPaymentIntent.dto';
import { Plans } from '../../db/schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Controller('stripe')
export class StripeController {
  private productsCache: (Stripe.Product & {
    prices?: Stripe.Price[];
    features?: Stripe.ProductFeature[];
  })[];

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get('products')
  @UseGuards(JwtAuthGuard)
  async getProducts() {
    if (this.productsCache) {
      return this.productsCache;
    }

    const products = await this.stripe.products.list({
      active: true,
    });

    const result: (Stripe.Product & {
      prices?: Stripe.Price[];
      features?: Stripe.ProductFeature[];
    })[] = products.data;

    for (const product of result) {
      const prices = await this.stripe.prices.list({
        product: product.id,
        active: true,
      });

      const features = await this.stripe.products.listFeatures(product.id, {});

      product.features = features.data;
      product.prices = prices.data;
    }

    this.productsCache = result;

    return result;
  }

  @Post('intent')
  @UseGuards(JwtAuthGuard)
  async intent(@Req() request: any, @Body() body: CreatePaymentIntentDto) {
    const user = await this.userService.findUserByEmail(
      request.user.email as string,
    );

    if (!user) {
      throw new NotFoundException();
    }

    if (!user.stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      user.stripeCustomerId = customer.id;
      await this.userService.update(user._id, user);
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [
        {
          price: body.priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.confirmation_secret'],
    });

    await this.userService.update(user._id, {
      stripeSubscriptionId: subscription.id,
    });

    return subscription;
  }

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody!,
        signature,
        this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err) {
      throw new BadRequestException(err);
    }

    // Extract the object from the event.
    console.log('Received event:', event.type);

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    switch (event.type) {
      case 'invoice.paid':
        console.log('Invoice paid');
        console.log(event.data.object);

        if (event.data.object.status !== 'paid') {
          console.log('Invoice not paid');
        }

        const email = event.data.object.customer_email;

        console.log('Email: ', email);
        const user = await this.userService.findByStripeCustomerId(
          event.data.object.customer as string,
        );

        if (!user) {
          throw new BadRequestException(
            `User not found for customer: ${event.data.object.customer as string}`,
          );
        }

        const subscriptionId = event.data.object.parent?.subscription_details
          ?.subscription as string;

        if (!subscriptionId) {
          throw new BadRequestException(`Subscription id missing`);
        }

        const subscription =
          await this.stripe.subscriptions.retrieve(subscriptionId);

        if (!subscription) {
          throw new BadRequestException(`Subscription not found`);
        }

        const product = await this.stripe.products.retrieve(
          subscription.items.data[0].price.product as string,
        );

        const plan = product.metadata.slug;

        await this.userService.update(user._id, {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: event.data.object.customer as string,
          currentPlan: plan as Plans,
        });

        break;
      case 'invoice.payment_failed':
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        const userFailed = await this.userService.findByStripeCustomerId(
          event.data.object.customer as string,
        );

        if (!userFailed) {
          throw new BadRequestException(
            `User not found for customer: ${event.data.object.customer as string}`,
          );
        }

        await this.userService.update(userFailed._id, {
          currentPlan: 'free',
        });

        break;
      case 'customer.subscription.deleted':
        const userDeleted = await this.userService.findByStripeCustomerId(
          event.data.object.customer as string,
        );

        if (!userDeleted) {
          throw new BadRequestException(
            `User not found for customer: ${event.data.object.customer as string}`,
          );
        }

        await this.userService.update(userDeleted._id, {
          stripeSubscriptionId: null,
          currentPlan: 'free',
        });
        break;
      default:
      // Unexpected event type
    }
  }
}
