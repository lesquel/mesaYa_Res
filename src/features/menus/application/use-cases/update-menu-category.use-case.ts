import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuCategoryDomainService } from '@features/menus/domain';
import { UpdateMenuCategoryDto } from '../dtos/input';
import { MenuCategoryResponseDto } from '../dtos/output';
import { MenuCategoryMapper } from '../mappers';

export class UpdateMenuCategoryUseCase
  implements UseCase<UpdateMenuCategoryDto, MenuCategoryResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuCategoryDomainService: MenuCategoryDomainService,
    private readonly menuCategoryMapper: MenuCategoryMapper,
  ) {}

  async execute(dto: UpdateMenuCategoryDto): Promise<MenuCategoryResponseDto> {
    this.logger.log(
      `Updating menu category ${dto.categoryId}`,
      'UpdateMenuCategoryUseCase',
    );

    const category = await this.menuCategoryDomainService.updateCategory(
      this.menuCategoryMapper.fromUpdateDtoToDomain(dto),
    );

    this.logger.log(
      `Menu category updated ${category.id}`,
      'UpdateMenuCategoryUseCase',
    );

    return this.menuCategoryMapper.fromEntityToDTO(category);
  }
}
