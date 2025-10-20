import { UseCase } from '@shared/application/ports/use-case.port.js';
import { Section, SectionRestaurantNotFoundError } from '../../domain/index.js';
import { SectionMapper } from '../mappers/index.js';
import { SectionResponseDto, CreateSectionCommand } from '../dto/index.js';
import {
  type RestaurantSectionReaderPort,
  type SectionRepositoryPort,
} from '../ports/index.js';

export class CreateSectionUseCase
  implements UseCase<CreateSectionCommand, SectionResponseDto>
{
  constructor(
    private readonly sectionRepository: SectionRepositoryPort,
    private readonly restaurantReader: RestaurantSectionReaderPort,
  ) {}

  async execute(command: CreateSectionCommand): Promise<SectionResponseDto> {
    const restaurantExists = await this.restaurantReader.exists(
      command.restaurantId,
    );

    if (!restaurantExists) {
      throw new SectionRestaurantNotFoundError(command.restaurantId);
    }

    const section = Section.create({
      restaurantId: command.restaurantId,
      name: command.name,
      description: command.description ?? null,
      width: command.width,
      height: command.height,
    });

    const saved = await this.sectionRepository.save(section);
    return SectionMapper.toResponse(saved);
  }
}
