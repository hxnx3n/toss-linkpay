import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Get('client-key')
  getClientKey() {
    return {
      success: true,
      data: {
        clientKey: this.paymentService.getClientKey(),
      },
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPaymentLink(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentService.createPaymentLink(createPaymentDto);
    return {
      success: true,
      message: '결제 링크가 생성되었습니다.',
      data: {
        paymentId: payment.id,
        paymentUrl: `/pay/${payment.id}`,
      },
    };
  }

  @Get(':uuid')
  async getPayment(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const payment = await this.paymentService.getPaymentByUuid(uuid);
    return {
      success: true,
      data: payment,
    };
  }

  @Post(':uuid/confirm')
  async confirmPayment(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ) {
    const payment = await this.paymentService.confirmPayment(uuid, confirmPaymentDto);
    return {
      success: true,
      message: '결제가 완료되었습니다.',
      data: payment,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllPayments() {
    const payments = await this.paymentService.getAllPayments();
    return {
      success: true,
      data: payments,
    };
  }

  @Post(':uuid/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelPayment(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const payment = await this.paymentService.cancelPayment(uuid);
    return {
      success: true,
      message: '결제가 취소되었습니다.',
      data: payment,
    };
  }

  @Post(':uuid/refund')
  @UseGuards(JwtAuthGuard)
  async refundPayment(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const payment = await this.paymentService.refundPayment(uuid);
    return {
      success: true,
      message: '환불이 완료되었습니다.',
      data: payment,
    };
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async deletePayment(@Param('uuid', ParseUUIDPipe) uuid: string) {
    await this.paymentService.deletePayment(uuid);
    return {
      success: true,
      message: '결제 내역이 삭제되었습니다.',
    };
  }

  @Post('delete-all')
  @UseGuards(JwtAuthGuard)
  async deleteAllPayments() {
    const count = await this.paymentService.deleteAllPayments();
    return {
      success: true,
      message: `${count}건의 결제 내역이 삭제되었습니다.`,
      data: { deletedCount: count },
    };
  }
}
