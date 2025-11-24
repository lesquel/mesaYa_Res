import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuCategoryDomainService } from '@features/menus/domain';
import { CreateMenuCategoryDto } from '../dtos/input';
import { MenuCategoryResponseDto } from '../dtos/output';
import { MenuCategoryMapper } from '../mappers';

export class CreateMenuCategoryUseCase
  implements UseCase<CreateMenuCategoryDto, MenuCategoryResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuCategoryDomainService: MenuCategoryDomainService,
    private readonly menuCategoryMapper: MenuCategoryMapper,
  ) {}

  async execute(dto: CreateMenuCategoryDto): Promise<MenuCategoryResponseDto> {
    this.logger.log(
      `Creating menu category '${dto.name}' for restaurant ${dto.restaurantId}`,
      'CreateMenuCategoryUseCase',
    );

    const category = await this.menuCategoryDomainService.createCategory(
      this.menuCategoryMapper.fromCreateDtoToDomain(dto),
    );

    this.logger.log(
      `Menu category created with ID ${category.id}`,
      'CreateMenuCategoryUseCase',
    );

    return this.menuCategoryMapper.fromEntityToDTO(category);
  }
}
