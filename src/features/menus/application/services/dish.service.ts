import { ILoggerPort } from '@shared/application/ports/logger.port';
import {
  CreateDishUseCase,
  GetDishByIdUseCase,
  ListDishesUseCase,
  UpdateDishUseCase,
  DeleteDishUseCase,
} from '../use-cases';
import {
  CreateDishDto,
  GetDishByIdDto,
  UpdateDishDto,
  DeleteDishDto,
} from '../dtos/input';
import {
  DishResponseDto,
  DishListResponseDto,
  DeleteDishResponseDto,
} from '../dtos/output';
import { IDishRepositoryPort, DishDomainService } from '@features/menus/domain';
import { DishMapper } from '../mappers';

export class DishService {
  private readonly dishDomainService: DishDomainService;

  private readonly createDishUseCase: CreateDishUseCase;
  private readonly getDishByIdUseCase: GetDishByIdUseCase;
  private readonly listDishesUseCase: ListDishesUseCase;
  private readonly updateDishUseCase: UpdateDishUseCase;
  private readonly deleteDishUseCase: DeleteDishUseCase;

  constructor(
    logger: ILoggerPort,
    dishRepository: IDishRepositoryPort,
    dishMapper: DishMapper,
  ) {
    this.dishDomainService = new DishDomainService(dishRepository);

    this.createDishUseCase = new CreateDishUseCase(
      logger,
      this.dishDomainService,
      dishMapper,
    );

    this.getDishByIdUseCase = new GetDishByIdUseCase(
      logger,
      this.dishDomainService,
      dishMapper,
    );

    this.listDishesUseCase = new ListDishesUseCase(
      logger,
      this.dishDomainService,
      dishMapper,
    );

    this.updateDishUseCase = new UpdateDishUseCase(
      logger,
      this.dishDomainService,
      dishMapper,
    );

    this.deleteDishUseCase = new DeleteDishUseCase(
      logger,
      this.dishDomainService,
    );
  }

  async create(dto: CreateDishDto): Promise<DishResponseDto> {
    return this.createDishUseCase.execute(dto);
  }

  async findById(dto: GetDishByIdDto): Promise<DishResponseDto> {
    return this.getDishByIdUseCase.execute(dto);
  }

  async findAll(): Promise<DishListResponseDto> {
    return this.listDishesUseCase.execute();
  }

  async update(dto: UpdateDishDto): Promise<DishResponseDto> {
    return this.updateDishUseCase.execute(dto);
  }

  async delete(dto: DeleteDishDto): Promise<DeleteDishResponseDto> {
    return this.deleteDishUseCase.execute(dto);
  }
}
