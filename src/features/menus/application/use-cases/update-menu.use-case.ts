import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuDomainService } from '@features/menus/domain';
import { MenuMapper } from '../mappers';
import { UpdateMenuDto } from '../dtos/input/update-menu.dto';
import { MenuResponseDto } from '../dtos/output/menu-response.dto';

export class UpdateMenuUseCase
  implements UseCase<UpdateMenuDto, MenuResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuDomainService: MenuDomainService,
    private readonly menuMapper: MenuMapper,
  ) {}

  async execute(dto: UpdateMenuDto): Promise<MenuResponseDto> {
    this.logger.log(`Updating menu ${dto.menuId}`, 'UpdateMenuUseCase');

    const menuUpdate = this.menuMapper.fromUpdateDtoToDomain(dto);
    const menu = await this.menuDomainService.updateMenu(menuUpdate);

    this.logger.log(`Menu updated ${menu.id}`, 'UpdateMenuUseCase');

    return this.menuMapper.fromEntitytoDTO(menu);
  }
}
