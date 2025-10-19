import { ILoggerPort } from '@shared/application/ports/logger.port';
import {
  CreateMenuUseCase,
  GetMenuByIdUseCase,
  ListMenusUseCase,
  UpdateMenuUseCase,
  DeleteMenuUseCase,
} from '../use-cases';
import {
  CreateMenuDto,
  GetMenuByIdDto,
  UpdateMenuDto,
  DeleteMenuDto,
} from '../dtos/input';
import {
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

  async create(dto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.createMenuUseCase.execute(dto);
  }

  async findById(dto: GetMenuByIdDto): Promise<MenuResponseDto> {
    return this.getMenuByIdUseCase.execute(dto);
  }

  async findAll(): Promise<MenuListResponseDto> {
    return this.listMenusUseCase.execute();
  }

  async update(dto: UpdateMenuDto): Promise<MenuResponseDto> {
    return this.updateMenuUseCase.execute(dto);
  }

  async delete(dto: DeleteMenuDto): Promise<DeleteMenuResponseDto> {
    return this.deleteMenuUseCase.execute(dto);
  }
}
