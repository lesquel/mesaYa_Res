import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuCategoryDomainService } from '@features/menus/domain';
import { GetMenuCategoryByIdDto } from '../dtos/input';
import { MenuCategoryResponseDto } from '../dtos/output';
import { MenuCategoryMapper } from '../mappers';

export class GetMenuCategoryByIdUseCase
  implements UseCase<GetMenuCategoryByIdDto, MenuCategoryResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuCategoryDomainService: MenuCategoryDomainService,
    private readonly menuCategoryMapper: MenuCategoryMapper,
  ) {}

  async execute(dto: GetMenuCategoryByIdDto): Promise<MenuCategoryResponseDto> {
    this.logger.log(
      `Fetching menu category ${dto.categoryId}`,
      'GetMenuCategoryByIdUseCase',
    );

    const category = await this.menuCategoryDomainService.findById(
      dto.categoryId,
    );

    return this.menuCategoryMapper.fromEntityToDTO(category);
  }
}
