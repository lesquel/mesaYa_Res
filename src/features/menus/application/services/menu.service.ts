import { ILoggerPort } from '@shared/application/ports/logger.port';
import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
} from '@shared/infrastructure/kafka';
import {
  CreateMenuUseCase,
  GetMenuByIdUseCase,
  ListMenusUseCase,
  UpdateMenuUseCase,
  DeleteMenuUseCase,
} from '../use-cases';
import type {
  CreateMenuDto,
  GetMenuByIdDto,
  UpdateMenuDto,
  DeleteMenuDto,
  ListMenusQuery,
} from '../dtos/input';
import type {
  MenuResponseDto,
  MenuListResponseDto,
  DeleteMenuResponseDto,
} from '../dtos/output';
import { IMenuRepositoryPort, MenuDomainService } from '@features/menus/domain';
import { MenuMapper } from '../mappers';

export class MenuService {
  private readonly menuDomainService: MenuDomainService;

  private readonly createMenuUseCase: CreateMenuUseCase;
  private readonly getMenuByIdUseCase: GetMenuByIdUseCase;
  private readonly listMenusUseCase: ListMenusUseCase;
  private readonly updateMenuUseCase: UpdateMenuUseCase;
  private readonly deleteMenuUseCase: DeleteMenuUseCase;

  constructor(
    logger: ILoggerPort,
    menuRepository: IMenuRepositoryPort,
    menuMapper: MenuMapper,
    private readonly kafkaService: KafkaService,
  ) {
    this.menuDomainService = new MenuDomainService(menuRepository);

    this.createMenuUseCase = new CreateMenuUseCase(
      logger,
      this.menuDomainService,
      menuMapper,
    );

    this.getMenuByIdUseCase = new GetMenuByIdUseCase(
      logger,
      this.menuDomainService,
      menuMapper,
    );

    this.listMenusUseCase = new ListMenusUseCase(
      logger,
      this.menuDomainService,
      menuMapper,
    );

    this.updateMenuUseCase = new UpdateMenuUseCase(
      logger,
      this.menuDomainService,
      menuMapper,
    );

    this.deleteMenuUseCase = new DeleteMenuUseCase(
      logger,
      this.menuDomainService,
    );
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.MENUS,
    payload: ({ result, toPlain }) => {
      const entity = toPlain(result ?? {});
      const entityId = (entity as { menuId?: string }).menuId ?? '';
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: entityId,
        entity_subtype: 'menu',
        data: entity,
      };
    },
  })
  async create(dto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.createMenuUseCase.execute(dto);
  }

  async findById(dto: GetMenuByIdDto): Promise<MenuResponseDto> {
    return this.getMenuByIdUseCase.execute(dto);
  }

  async findAll(query: ListMenusQuery): Promise<MenuListResponseDto> {
    return this.listMenusUseCase.execute(query);
  }

  async findByRestaurant(
    restaurantId: string,
    query: ListMenusQuery,
  ): Promise<MenuListResponseDto> {
    return this.listMenusUseCase.execute({ ...query, restaurantId });
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.MENUS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateMenuDto];
      const entity = toPlain(result ?? {});
      const entityId =
        (command?.menuId as string | undefined) ||
        (entity as { menuId?: string }).menuId ||
        '';
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: entityId,
        entity_subtype: 'menu',
        data: entity,
      };
    },
  })
  async update(dto: UpdateMenuDto): Promise<MenuResponseDto> {
    return this.updateMenuUseCase.execute(dto);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.MENUS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteMenuDto];
      const deletion = toPlain(result ?? {});
      const entityId =
        (deletion as { menuId?: string }).menuId || command?.menuId || '';
      return {
        event_type: EVENT_TYPES.DELETED,
        entity_id: entityId,
        entity_subtype: 'menu',
        data: deletion,
      };
    },
  })
  async delete(dto: DeleteMenuDto): Promise<DeleteMenuResponseDto> {
    return this.deleteMenuUseCase.execute(dto);
  }
}
