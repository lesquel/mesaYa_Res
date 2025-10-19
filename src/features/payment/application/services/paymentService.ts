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
import { ILoggerPort } from '@shared/application/ports/logger.port';
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
    logger: ILoggerPort,
    paymentRepository: IPaymentRepositoryPort,
    paymentEntityToMapper: PaymentEntityDTOMapper,
  ) {
    this.paymentDomainService = new PaymentDomainService(paymentRepository);
    this.createPaymentUseCase = new CreatePaymentUseCase(
      logger,
      this.paymentDomainService,
      paymentEntityToMapper,
    );
    this.getPaymentByIdUseCase = new GetPaymentByIdUseCase(
      logger,
      this.paymentDomainService,
      paymentEntityToMapper,
    );
    this.getAllPaymentsUseCase = new GetAllPaymentsUseCase(
      logger,
      this.paymentDomainService,
      paymentEntityToMapper,
    );
    this.updatePaymentStatusUseCase = new UpdatePaymentStatusUseCase(
      logger,
      paymentEntityToMapper,
      this.paymentDomainService,
    );
    this.deletePaymentUseCase = new DeletePaymentUseCase(
      logger,
      this.paymentDomainService,
    );
  }

  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return await this.createPaymentUseCase.execute(dto);
  }

  async getPaymentById(dto: GetPaymentByIdDto): Promise<PaymentResponseDto> {
    return await this.getPaymentByIdUseCase.execute(dto);
  }

  async getAllPayments(): Promise<PaymentListResponseDto> {
    return await this.getAllPaymentsUseCase.execute();
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
