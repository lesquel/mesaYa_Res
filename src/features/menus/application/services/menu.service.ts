import { ILoggerPort } from '@shared/application/ports/logger.port';
import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
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
    topic: KAFKA_TOPICS.MENU_CREATED,
    payload: ({ result, toPlain }) => {
      const entity = toPlain(result ?? {});
      const entityId = (entity as { menuId?: string }).menuId ?? null;
      return {
        action: 'menu.created',
        entityId,
        entity,
      };
    },
  })
  async create(dto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.createMenuUseCase.execute(dto);
  }

  async findById(dto: GetMenuByIdDto): Promise<MenuResponseDto> {
    return this.getMenuByIdUseCase.execute(dto);
  }

  async findAll(): Promise<MenuListResponseDto> {
    return this.listMenusUseCase.execute();
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.MENU_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateMenuDto];
      const entity = toPlain(result ?? {});
      const entityId =
        (command?.menuId as string | undefined) ||
        (entity as { menuId?: string }).menuId ||
        null;
      return {
        action: 'menu.updated',
        entityId,
        entity,
      };
    },
  })
  async update(dto: UpdateMenuDto): Promise<MenuResponseDto> {
    return this.updateMenuUseCase.execute(dto);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.MENU_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteMenuDto];
      const deletion = toPlain(result ?? {});
      const entityId =
        (deletion as { menuId?: string }).menuId || command?.menuId || null;
      return {
        action: 'menu.deleted',
        entityId,
        entity: deletion,
      };
    },
  })
  async delete(dto: DeleteMenuDto): Promise<DeleteMenuResponseDto> {
    return this.deleteMenuUseCase.execute(dto);
  }
}
