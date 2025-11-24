import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuCategoryDomainService } from '@features/menus/domain';
import { DeleteMenuCategoryDto } from '../dtos/input';
import { DeleteMenuCategoryResponseDto } from '../dtos/output';

export class DeleteMenuCategoryUseCase
  implements UseCase<DeleteMenuCategoryDto, DeleteMenuCategoryResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuCategoryDomainService: MenuCategoryDomainService,
  ) {}

  async execute(
    dto: DeleteMenuCategoryDto,
  ): Promise<DeleteMenuCategoryResponseDto> {
    this.logger.log(
      `Deleting menu category ${dto.categoryId}`,
      'DeleteMenuCategoryUseCase',
    );

    await this.menuCategoryDomainService.deleteCategory(dto.categoryId);

    this.logger.log(
      `Menu category deleted ${dto.categoryId}`,
      'DeleteMenuCategoryUseCase',
    );

    return { categoryId: dto.categoryId };
  }
}
