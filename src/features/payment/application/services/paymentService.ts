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
import { IPaymentRepositoryPort } from '../../domain/repositories';
import { ILoggerPort } from '@shared/application/ports/logger.port';
import { PaymentEntityDTOMapper } from '../mappers';

export class PaymentService {
  private createPaymentUseCase: CreatePaymentUseCase;
  private getPaymentByIdUseCase: GetPaymentByIdUseCase;
  private getAllPaymentsUseCase: GetAllPaymentsUseCase;
  private updatePaymentStatusUseCase: UpdatePaymentStatusUseCase;
  private deletePaymentUseCase: DeletePaymentUseCase;

  constructor(
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
