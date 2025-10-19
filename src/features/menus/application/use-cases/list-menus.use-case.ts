import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuDomainService } from '@features/menus/domain';
import { MenuMapper } from '../mappers';
import { MenuListResponseDto } from '../dtos/output/menu-list-response.dto';

export class ListMenusUseCase implements UseCase<void, MenuListResponseDto> {
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuDomainService: MenuDomainService,
    private readonly menuMapper: MenuMapper,
  ) {}

  async execute(): Promise<MenuListResponseDto> {
    this.logger.log('Fetching all menus', 'ListMenusUseCase');

    const menus = await this.menuDomainService.findAllMenus();

    this.logger.log(`Retrieved ${menus.length} menu(s)`, 'ListMenusUseCase');

    return menus.map((menu) => this.menuMapper.fromEntitytoDTO(menu));
  }
}
