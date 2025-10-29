import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuDomainService } from '@features/menus/domain';
import { MenuMapper } from '../mappers';
import { MenuListResponseDto } from '../dtos/output/menu-list-response.dto';
import { ListMenusQuery } from '../dtos/input/list-menus.query';

export class ListMenusUseCase
  implements UseCase<ListMenusQuery, MenuListResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuDomainService: MenuDomainService,
    private readonly menuMapper: MenuMapper,
  ) {}

  async execute(query: ListMenusQuery): Promise<MenuListResponseDto> {
    this.logger.log('Fetching menus', 'ListMenusUseCase');

    const pagination = await this.menuDomainService.paginateMenus(query);

    this.logger.log(
      `Retrieved ${pagination.results.length} menu(s)`,
      'ListMenusUseCase',
    );

    return {
      ...pagination,
      results: pagination.results.map((menu) =>
        this.menuMapper.fromEntitytoDTO(menu),
      ),
    };
  }
}
