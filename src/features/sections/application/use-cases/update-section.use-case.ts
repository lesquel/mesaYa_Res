import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionDomainService } from '../../domain';
import { SectionMapper } from '../mappers';
import { SectionResponseDto, UpdateSectionCommand } from '../dto';

export class UpdateSectionUseCase
  implements UseCase<UpdateSectionCommand, SectionResponseDto>
{
  constructor(private readonly sectionDomainService: SectionDomainService) {}

  async execute(command: UpdateSectionCommand): Promise<SectionResponseDto> {
    const saved = await this.sectionDomainService.updateSection({
      sectionId: command.sectionId,
      restaurantId: command.restaurantId,
      name: command.name,
      description: command.description,
      width: command.width,
      height: command.height,
    });
    return SectionMapper.toResponse(saved);
  }
}
