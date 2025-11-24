import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuCategoryDomainService } from '@features/menus/domain';
import { ListMenuCategoriesQuery } from '../dtos/input';
import { MenuCategoryResponseDto } from '../dtos/output';
import { MenuCategoryMapper } from '../mappers';

export class ListMenuCategoriesUseCase
  implements UseCase<ListMenuCategoriesQuery, MenuCategoryResponseDto[]>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuCategoryDomainService: MenuCategoryDomainService,
    private readonly menuCategoryMapper: MenuCategoryMapper,
  ) {}

  async execute(
    dto: ListMenuCategoriesQuery,
  ): Promise<MenuCategoryResponseDto[]> {
    this.logger.log('Listing menu categories', 'ListMenuCategoriesUseCase');

    const categories = dto.restaurantId
      ? await this.menuCategoryDomainService.findByRestaurant(dto.restaurantId)
      : await this.menuCategoryDomainService.findAll();

    return categories.map((category) =>
      this.menuCategoryMapper.fromEntityToDTO(category),
    );
  }
}
