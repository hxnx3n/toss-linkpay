import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) { }

  async createPaymentLink(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      title: createPaymentDto.title,
      amount: createPaymentDto.amount,
      description: createPaymentDto.description,
      items: createPaymentDto.items || null,
      status: PaymentStatus.PENDING,
    });

    return await this.paymentRepository.save(payment);
  }

  async getPaymentByUuid(uuid: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: uuid },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    return payment;
  }

  getClientKey(): string {
    return process.env.TOSS_CLIENT_KEY;
  }

  async confirmPayment(uuid: string, confirmPaymentDto: ConfirmPaymentDto): Promise<Payment> {
    const payment = await this.getPaymentByUuid(uuid);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('이미 처리된 결제입니다.');
    }

    if (payment.amount !== parseInt(confirmPaymentDto.amount)) {
      throw new BadRequestException('결제 금액이 일치하지 않습니다.');
    }

    const secretKey = process.env.TOSS_SECRET_KEY;
    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    try {
      const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey: confirmPaymentDto.paymentKey,
          orderId: confirmPaymentDto.orderId,
          amount: parseInt(confirmPaymentDto.amount),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        payment.status = PaymentStatus.FAILED;
        await this.paymentRepository.save(payment);
        throw new BadRequestException(result.message || '결제 승인에 실패했습니다.');
      }

      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      payment.paymentKey = confirmPaymentDto.paymentKey;
      payment.paymentMethod = result.method || result.type || 'UNKNOWN';

      return await this.paymentRepository.save(payment);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);
      throw new BadRequestException('결제 처리 중 오류가 발생했습니다.');
    }
  }

  async getAllPayments(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async cancelPayment(uuid: string): Promise<Payment> {
    const payment = await this.getPaymentByUuid(uuid);

    if (payment.status === PaymentStatus.CANCELLED) {
      throw new BadRequestException('이미 취소된 결제입니다.');
    }

    if (payment.status === PaymentStatus.COMPLETED && payment.paymentKey) {
      const secretKey = process.env.TOSS_SECRET_KEY;
      const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

      try {
        const response = await fetch(`https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${encryptedSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cancelReason: '관리자 취소',
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new BadRequestException(result.message || '결제 취소에 실패했습니다.');
        }
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('결제 취소 처리 중 오류가 발생했습니다.');
      }
    }

    payment.status = PaymentStatus.CANCELLED;
    return await this.paymentRepository.save(payment);
  }

  async refundPayment(uuid: string): Promise<Payment> {
    const payment = await this.getPaymentByUuid(uuid);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('완료된 결제만 환불할 수 있습니다.');
    }

    if (!payment.paymentKey) {
      throw new BadRequestException('결제 키가 없어 환불할 수 없습니다.');
    }

    const secretKey = process.env.TOSS_SECRET_KEY;
    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    try {
      const response = await fetch(`https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: '고객 요청에 의한 환불',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new BadRequestException(result.message || '환불 처리에 실패했습니다.');
      }

      payment.status = PaymentStatus.CANCELLED;
      return await this.paymentRepository.save(payment);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('환불 처리 중 오류가 발생했습니다.');
    }
  }

  async deletePayment(uuid: string): Promise<void> {
    const payment = await this.getPaymentByUuid(uuid);
    await this.paymentRepository.remove(payment);
  }

  async deleteAllPayments(): Promise<number> {
    const count = await this.paymentRepository.count();
    await this.paymentRepository.clear();
    return count;
  }
}
