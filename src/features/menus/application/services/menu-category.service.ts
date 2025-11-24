import { ILoggerPort } from '@shared/application/ports/logger.port';
import { MenuCategoryDomainService } from '@features/menus/domain';
import { IMenuCategoryRepositoryPort } from '@features/menus/domain';
import {
  CreateMenuCategoryDto,
  DeleteMenuCategoryDto,
  GetMenuCategoryByIdDto,
  ListMenuCategoriesQuery,
  UpdateMenuCategoryDto,
} from '../dtos/input';
import {
  DeleteMenuCategoryResponseDto,
  MenuCategoryResponseDto,
} from '../dtos/output';
import {
  CreateMenuCategoryUseCase,
  DeleteMenuCategoryUseCase,
  GetMenuCategoryByIdUseCase,
  ListMenuCategoriesUseCase,
  UpdateMenuCategoryUseCase,
} from '../use-cases';
import { MenuCategoryMapper } from '../mappers';

export class MenuCategoryService {
  private readonly menuCategoryDomainService: MenuCategoryDomainService;
  private readonly createCategoryUseCase: CreateMenuCategoryUseCase;
  private readonly updateCategoryUseCase: UpdateMenuCategoryUseCase;
  private readonly deleteCategoryUseCase: DeleteMenuCategoryUseCase;
  private readonly listCategoriesUseCase: ListMenuCategoriesUseCase;
  private readonly getCategoryUseCase: GetMenuCategoryByIdUseCase;

  constructor(
    logger: ILoggerPort,
    repository: IMenuCategoryRepositoryPort,
    mapper: MenuCategoryMapper,
  ) {
    this.menuCategoryDomainService = new MenuCategoryDomainService(repository);

    this.createCategoryUseCase = new CreateMenuCategoryUseCase(
      logger,
      this.menuCategoryDomainService,
      mapper,
    );

    this.updateCategoryUseCase = new UpdateMenuCategoryUseCase(
      logger,
      this.menuCategoryDomainService,
      mapper,
    );

    this.deleteCategoryUseCase = new DeleteMenuCategoryUseCase(
      logger,
      this.menuCategoryDomainService,
    );

    this.listCategoriesUseCase = new ListMenuCategoriesUseCase(
      logger,
      this.menuCategoryDomainService,
      mapper,
    );

    this.getCategoryUseCase = new GetMenuCategoryByIdUseCase(
      logger,
      this.menuCategoryDomainService,
      mapper,
    );
  }

  async create(dto: CreateMenuCategoryDto): Promise<MenuCategoryResponseDto> {
    return this.createCategoryUseCase.execute(dto);
  }

  async update(dto: UpdateMenuCategoryDto): Promise<MenuCategoryResponseDto> {
    return this.updateCategoryUseCase.execute(dto);
  }

  async delete(
    dto: DeleteMenuCategoryDto,
  ): Promise<DeleteMenuCategoryResponseDto> {
    return this.deleteCategoryUseCase.execute(dto);
  }

  async findById(categoryId: string): Promise<MenuCategoryResponseDto> {
    return this.getCategoryUseCase.execute({ categoryId });
  }

  async findByRestaurant(
    restaurantId: string,
  ): Promise<MenuCategoryResponseDto[]> {
    return this.listCategoriesUseCase.execute({ restaurantId });
  }

  async findAll(): Promise<MenuCategoryResponseDto[]> {
    return this.listCategoriesUseCase.execute({});
  }
}
