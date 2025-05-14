import { Module } from '@nestjs/common';
import { Stripe } from 'stripe';
import { STRIPE_CLIENT } from './providers';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../../auth/auth.module';
import { StripeController } from './controller';

@Module({
  controllers: [StripeController],
  providers: [
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const stripeSecretKey =
          configService.getOrThrow<string>('STRIPE_SECRET_KEY');

        return new Stripe(stripeSecretKey, {});
      },
    },
  ],
  imports: [AuthModule],
  exports: [],
})
export class StripeModule {}
