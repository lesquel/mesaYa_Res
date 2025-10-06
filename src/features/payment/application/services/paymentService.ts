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
import { IPaymentRepository } from '../ports/repositories';

export class PaymentService {
  private createPaymentUseCase: CreatePaymentUseCase;
  private getPaymentByIdUseCase: GetPaymentByIdUseCase;
  private getAllPaymentsUseCase: GetAllPaymentsUseCase;
  private updatePaymentStatusUseCase: UpdatePaymentStatusUseCase;
  private deletePaymentUseCase: DeletePaymentUseCase;

  constructor(paymentRepository: IPaymentRepository) {
    this.createPaymentUseCase = new CreatePaymentUseCase(paymentRepository);
    this.getPaymentByIdUseCase = new GetPaymentByIdUseCase(paymentRepository);
    this.getAllPaymentsUseCase = new GetAllPaymentsUseCase(paymentRepository);
    this.updatePaymentStatusUseCase = new UpdatePaymentStatusUseCase(
      paymentRepository,
    );
    this.deletePaymentUseCase = new DeletePaymentUseCase(paymentRepository);
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
