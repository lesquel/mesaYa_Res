import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionDomainService } from '../../domain/index';
import { SectionMapper } from '../mappers/index';
import { SectionResponseDto, CreateSectionCommand } from '../dto/index';

export class CreateSectionUseCase
  implements UseCase<CreateSectionCommand, SectionResponseDto>
{
  constructor(private readonly sectionDomainService: SectionDomainService) {}

  async execute(command: CreateSectionCommand): Promise<SectionResponseDto> {
    const saved = await this.sectionDomainService.createSection({
      restaurantId: command.restaurantId,
      name: command.name,
      description: command.description,
      width: command.width,
      height: command.height,
    });
    return SectionMapper.toResponse(saved);
  }
}
