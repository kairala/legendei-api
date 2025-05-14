import { IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  priceId: string;
}
