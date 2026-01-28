import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  paymentKey: string;

  @IsString()
  orderId: string;

  @IsString()
  amount: string;
}
