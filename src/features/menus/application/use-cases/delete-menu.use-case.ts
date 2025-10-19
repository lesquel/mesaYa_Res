import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { MenuDomainService } from '@features/menus/domain';
import { DeleteMenuDto } from '../dtos/input/delete-menu.dto';
import { DeleteMenuResponseDto } from '../dtos/output/delete-menu-response.dto';

export class DeleteMenuUseCase
  implements UseCase<DeleteMenuDto, DeleteMenuResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly menuDomainService: MenuDomainService,
  ) {}

  async execute(dto: DeleteMenuDto): Promise<DeleteMenuResponseDto> {
    this.logger.log(`Deleting menu ${dto.menuId}`, 'DeleteMenuUseCase');

    await this.menuDomainService.deleteMenu(dto.menuId);

    this.logger.log(`Menu deleted ${dto.menuId}`, 'DeleteMenuUseCase');

    return { menuId: dto.menuId };
  }
}
