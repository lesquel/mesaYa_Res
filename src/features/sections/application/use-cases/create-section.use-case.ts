import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionDomainService } from '../../domain';
import { SectionMapper } from '../mappers';
import { SectionResponseDto, CreateSectionCommand } from '../dto';

export class CreateSectionUseCase
  implements UseCase<CreateSectionCommand, SectionResponseDto>
{
  constructor(private readonly sectionDomainService: SectionDomainService) {}

  async execute(command: CreateSectionCommand): Promise<SectionResponseDto> {
    console.log('Creating section with command:', command);
    const saved = await this.sectionDomainService.createSection({
      restaurantId: command.restaurantId,
      name: command.name,
      description: command.description,
      width: command.width,
      height: command.height,
    });
    console.log('Created section with ID:', saved.id);
    return SectionMapper.toResponse(saved);
  }
}
