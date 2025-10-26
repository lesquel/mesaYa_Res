import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IPaymentRepositoryPort } from '@features/payment/domain/repositories';
import { PaymentEntity } from '@features/payment/domain/entities/payment.entity';
import { PaymentStatusVO } from '@features/payment/domain/entities/values';
import { MoneyVO } from '@shared/domain/entities/values';
import { paymentsSeed } from '../data';
import { CustomerSeedService } from './customer-seed.service';
import { SubscriptionSeedService } from './subscription-seed.service';

@Injectable()
export class PaymentSeedService {
  private readonly logger = new Logger(PaymentSeedService.name);
  private paymentIds: string[] = []; // Track created payment IDs

  constructor(
    @Inject(IPaymentRepositoryPort)
    private readonly paymentRepository: IPaymentRepositoryPort,
    private readonly customerSeedService: CustomerSeedService,
    private readonly subscriptionSeedService: SubscriptionSeedService,
  ) {}

  async seedPayments(): Promise<void> {
    this.logger.log('💳 Seeding payments...');

    // Check if payments already exist
    if (this.paymentIds.length > 0) {
      this.logger.log(
        '⏭️  Payments already exist in this session, skipping...',
      );
      return;
    }

    for (const paymentSeed of paymentsSeed) {
      let reservationId: string | undefined;
      let subscriptionId: string | undefined;

      // Determine if this payment is for a reservation or subscription
      if (paymentSeed.reservationIndex !== undefined) {
        reservationId = this.customerSeedService.getReservationId(
          paymentSeed.reservationIndex,
        );

        if (!reservationId) {
          this.logger.warn(
            `Skipping payment: reservation at index ${paymentSeed.reservationIndex} not found`,
          );
          continue;
        }
      } else if (paymentSeed.subscriptionIndex !== undefined) {
        subscriptionId = this.subscriptionSeedService.getSubscriptionId(
          paymentSeed.subscriptionIndex,
        );

        if (!subscriptionId) {
          this.logger.warn(
            `Skipping payment: subscription at index ${paymentSeed.subscriptionIndex} not found`,
          );
          continue;
        }
      } else {
        this.logger.warn(
          'Skipping payment: must have either reservationIndex or subscriptionIndex',
        );
        continue;
      }

      // Create payment entity
      const paymentId = randomUUID();
      const payment = PaymentEntity.create(paymentId, {
        amount: new MoneyVO(paymentSeed.amount),
        date: paymentSeed.date,
        paymentStatus: PaymentStatusVO.create(paymentSeed.paymentStatus),
        reservationId,
        subscriptionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedPayment = await this.paymentRepository.create(payment);
      this.paymentIds.push(savedPayment.id);
    }

    this.logger.log(`✅ Created ${this.paymentIds.length} payments`);
  }

  getPaymentIds(): string[] {
    return [...this.paymentIds];
  }

  getPaymentId(index: number): string | undefined {
    return this.paymentIds[index];
  }

  clearTrackedIds(): void {
    this.paymentIds = [];
  }
}
