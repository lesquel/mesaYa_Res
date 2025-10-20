import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuDomainService } from '@features/menus/domain';
import { MenuMapper } from '../mappers';
import { GetMenuByIdDto } from '../dtos/input/get-menu-by-id.dto';
import { MenuResponseDto } from '../dtos/output/menu-response.dto';

export class GetMenuByIdUseCase
  implements UseCase<GetMenuByIdDto, MenuResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuDomainService: MenuDomainService,
    private readonly menuMapper: MenuMapper,
  ) {}

  async execute(dto: GetMenuByIdDto): Promise<MenuResponseDto> {
    this.logger.log(`Fetching menu ${dto.menuId}`, 'GetMenuByIdUseCase');

    const menu = await this.menuDomainService.findMenuById(dto.menuId);

    this.logger.log(`Menu retrieved ${menu.id}`, 'GetMenuByIdUseCase');

    return this.menuMapper.fromEntitytoDTO(menu);
  }
}
