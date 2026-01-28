import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { Payment } from './payment/entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'linkpay',
      password: process.env.DATABASE_PASSWORD || 'linkpay123',
      database: process.env.DATABASE_NAME || 'linkpay',
      entities: [Payment],
      synchronize: true,
    }),
    AuthModule,
    PaymentModule,
  ],
})
export class AppModule { }
