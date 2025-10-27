import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka';
import {
  CreatePaymentUseCase,
  GetPaymentByIdUseCase,
  GetAllPaymentsUseCase,
  UpdatePaymentStatusUseCase,
  DeletePaymentUseCase,
} from '../use-cases';
import type {
  CreatePaymentDto,
  UpdatePaymentStatusDto,
  GetPaymentByIdDto,
  DeletePaymentDto,
} from '../dtos/input';
import type {
  PaymentResponseDto,
  PaymentListResponseDto,
  DeletePaymentResponseDto,
} from '../dtos/output';
import { PaymentEntityDTOMapper } from '../mappers';
import {
  IPaymentRepositoryPort,
  PaymentDomainService,
} from '@features/payment/domain';
export class PaymentService {
  private createPaymentUseCase: CreatePaymentUseCase;
  private getPaymentByIdUseCase: GetPaymentByIdUseCase;
  private getAllPaymentsUseCase: GetAllPaymentsUseCase;
  private updatePaymentStatusUseCase: UpdatePaymentStatusUseCase;
  private deletePaymentUseCase: DeletePaymentUseCase;
  private readonly paymentDomainService: PaymentDomainService;

  constructor(
    private readonly logger: ILoggerPort,
    paymentRepository: IPaymentRepositoryPort,
    paymentEntityToMapper: PaymentEntityDTOMapper,
    private readonly kafkaService: KafkaService,
  ) {
    this.paymentDomainService = new PaymentDomainService(paymentRepository);
    this.createPaymentUseCase = new CreatePaymentUseCase(
      this.logger,
      this.paymentDomainService,
      paymentEntityToMapper,
    );
    this.getPaymentByIdUseCase = new GetPaymentByIdUseCase(
      this.logger,
      this.paymentDomainService,
      paymentEntityToMapper,
    );
    this.getAllPaymentsUseCase = new GetAllPaymentsUseCase(
      this.logger,
      paymentRepository,
      paymentEntityToMapper,
    );
    this.updatePaymentStatusUseCase = new UpdatePaymentStatusUseCase(
      this.logger,
      paymentEntityToMapper,
      this.paymentDomainService,
    );
    this.deletePaymentUseCase = new DeletePaymentUseCase(
      this.logger,
      this.paymentDomainService,
    );
  }

  /**
   * Emits `mesa-ya.payments.created` with `{ action, entityId, entity }` and returns the created payment DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.PAYMENT_CREATED,
    payload: ({ result, toPlain }) => {
      const entity = toPlain(result ?? {});
      const entityId = (entity as { paymentId?: string }).paymentId ?? null;
      return {
        action: 'payment.created',
        entityId,
        entity,
      };
    },
  })
  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return await this.createPaymentUseCase.execute(dto);
  }

  async getPaymentById(dto: GetPaymentByIdDto): Promise<PaymentResponseDto> {
    return await this.getPaymentByIdUseCase.execute(dto);
  }

  async getAllPayments(
    params?: PaginatedQueryParams,
  ): Promise<PaymentListResponseDto> {
    return await this.getAllPaymentsUseCase.execute(params);
  }

  /**
   * Emits `mesa-ya.payments.updated` with `{ action, entityId, status, entity }` and returns the updated payment DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.PAYMENT_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdatePaymentStatusDto];
      const entity = toPlain(result ?? {});
      const entityId =
        (command?.paymentId as string | undefined) ||
        (entity as { paymentId?: string }).paymentId ||
        null;
      return {
        action: 'payment.updated',
        entityId,
        status:
          (entity as { paymentStatus?: unknown }).paymentStatus ??
          command?.status ??
          null,
        entity,
      };
    },
  })
  async updatePaymentStatus(
    dto: UpdatePaymentStatusDto,
  ): Promise<PaymentResponseDto> {
    return await this.updatePaymentStatusUseCase.execute(dto);
  }

  /**
   * Emits `mesa-ya.payments.deleted` with `{ action, entityId, entity }` and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.PAYMENT_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeletePaymentDto];
      const deletion = toPlain(result ?? {});
      const entityId =
        (deletion as { paymentId?: string }).paymentId ||
        command?.paymentId ||
        null;
      return {
        action: 'payment.deleted',
        entityId,
        entity: deletion,
      };
    },
  })
  async deletePayment(
    dto: DeletePaymentDto,
  ): Promise<DeletePaymentResponseDto> {
    return await this.deletePaymentUseCase.execute(dto);
  }
}
