import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuDomainService } from '@features/menus/domain';
import { MenuMapper } from '../mappers';
import { CreateMenuDto } from '../dtos/input/create-menu.dto';
import { MenuResponseDto } from '../dtos/output/menu-response.dto';

export class CreateMenuUseCase
  implements UseCase<CreateMenuDto, MenuResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuDomainService: MenuDomainService,
    private readonly menuMapper: MenuMapper,
  ) {}

  async execute(dto: CreateMenuDto): Promise<MenuResponseDto> {
    this.logger.log(
      `Creating menu '${dto.name}' for restaurant ${dto.restaurantId}`,
      'CreateMenuUseCase',
    );

    const menuCreate = this.menuMapper.fromCreateDtoToDomain(dto);
    const menu = await this.menuDomainService.createMenu(menuCreate);

    this.logger.log(`Menu created with ID: ${menu.id}`, 'CreateMenuUseCase');

    return this.menuMapper.fromEntitytoDTO(menu);
  }
}
