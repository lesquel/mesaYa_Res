import { ILoggerPort } from '@shared/application/ports/logger.port';
import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
} from '@shared/infrastructure/kafka';
import {
  CreateDishUseCase,
  GetDishByIdUseCase,
  ListDishesUseCase,
  UpdateDishUseCase,
  DeleteDishUseCase,
} from '../use-cases';
import type {
  CreateDishDto,
  GetDishByIdDto,
  UpdateDishDto,
  DeleteDishDto,
  ListDishesQuery,
} from '../dtos/input';
import type {
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
    private readonly kafkaService: KafkaService,
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

  @KafkaEmit({
    topic: KAFKA_TOPICS.MENUS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [CreateDishDto];
      const entity = toPlain(result ?? {});
      const entityId = (entity as { dishId?: string }).dishId ?? '';
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: entityId,
        entity_subtype: 'dish',
        data: entity,
        metadata: { restaurant_id: command?.restaurantId ?? null },
      };
    },
  })
  async create(dto: CreateDishDto): Promise<DishResponseDto> {
    return this.createDishUseCase.execute(dto);
  }

  async findById(dto: GetDishByIdDto): Promise<DishResponseDto> {
    return this.getDishByIdUseCase.execute(dto);
  }

  async findAll(query: ListDishesQuery): Promise<DishListResponseDto> {
    return this.listDishesUseCase.execute(query);
  }

  async findByRestaurant(
    restaurantId: string,
    query: ListDishesQuery,
  ): Promise<DishListResponseDto> {
    return this.listDishesUseCase.execute({
      ...query,
      restaurantId,
    });
  }

  async findByMenu(
    menuId: string,
    query: ListDishesQuery,
  ): Promise<DishListResponseDto> {
    return this.listDishesUseCase.execute({
      ...query,
      menuId,
    });
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.MENUS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateDishDto];
      const entity = toPlain(result ?? {});
      const entityId =
        (command?.dishId as string | undefined) ||
        (entity as { dishId?: string }).dishId ||
        '';
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: entityId,
        entity_subtype: 'dish',
        data: entity,
      };
    },
  })
  async update(dto: UpdateDishDto): Promise<DishResponseDto> {
    return this.updateDishUseCase.execute(dto);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.MENUS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteDishDto];
      const deletion = toPlain(result ?? {});
      const entityId =
        (deletion as { dishId?: string }).dishId || command?.dishId || '';
      return {
        event_type: EVENT_TYPES.DELETED,
        entity_id: entityId,
        entity_subtype: 'dish',
        data: deletion,
      };
    },
  })
  async delete(dto: DeleteDishDto): Promise<DeleteDishResponseDto> {
    return this.deleteDishUseCase.execute(dto);
  }
}
