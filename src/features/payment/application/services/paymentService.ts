import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  CreatePaymentUseCase,
  GetPaymentByIdUseCase,
  GetAllPaymentsUseCase,
  UpdatePaymentStatusUseCase,
  DeletePaymentUseCase,
} from '../use-cases';
import {
  CreatePaymentDto,
  UpdatePaymentStatusDto,
  GetPaymentByIdDto,
  DeletePaymentDto,
} from '../dtos/input';
import {
  PaymentResponseDto,
  PaymentListResponseDto,
  DeletePaymentResponseDto,
} from '../dtos/output';
<<<<<<< HEAD
import { PaymentEntityDTOMapper } from '../mappers';
import {
  IPaymentRepositoryPort,
  PaymentDomainService,
} from '@features/payment/domain';
=======
import { IPaymentRepositoryPort } from '../../domain/repositories';
import { ILoggerPort } from '@shared/application/ports/logger.port';
import { PaymentEntityDTOMapper } from '../mappers';

>>>>>>> fe5730e (refactor(payment): restructure payment repository ports and mappers)
export class PaymentService {
  private createPaymentUseCase: CreatePaymentUseCase;
  private getPaymentByIdUseCase: GetPaymentByIdUseCase;
  private getAllPaymentsUseCase: GetAllPaymentsUseCase;
  private updatePaymentStatusUseCase: UpdatePaymentStatusUseCase;
  private deletePaymentUseCase: DeletePaymentUseCase;
  private readonly paymentDomainService: PaymentDomainService;

  constructor(
<<<<<<< HEAD
    private readonly logger: ILoggerPort,
    paymentRepository: IPaymentRepositoryPort,
    paymentEntityToMapper: PaymentEntityDTOMapper,
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
      this.paymentDomainService,
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
=======
    logger: ILoggerPort,
    paymentRepository: IPaymentRepositoryPort,
    paymentEntityToMapper: PaymentEntityDTOMapper,
  ) {
    this.createPaymentUseCase = new CreatePaymentUseCase(
      logger,
      paymentRepository,
      paymentEntityToMapper,
    );
    this.getPaymentByIdUseCase = new GetPaymentByIdUseCase(
      logger,
      paymentRepository,
    );
    this.getAllPaymentsUseCase = new GetAllPaymentsUseCase(
      logger,
      paymentRepository,
    );
    this.updatePaymentStatusUseCase = new UpdatePaymentStatusUseCase(
      logger,
      paymentRepository,
      paymentEntityToMapper,
    );
    this.deletePaymentUseCase = new DeletePaymentUseCase(
      logger,
      paymentRepository,
>>>>>>> fe5730e (refactor(payment): restructure payment repository ports and mappers)
    );
  }

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

  async updatePaymentStatus(
    dto: UpdatePaymentStatusDto,
  ): Promise<PaymentResponseDto> {
    return await this.updatePaymentStatusUseCase.execute(dto);
  }

  async deletePayment(
    dto: DeletePaymentDto,
  ): Promise<DeletePaymentResponseDto> {
    return await this.deletePaymentUseCase.execute(dto);
  }
}
