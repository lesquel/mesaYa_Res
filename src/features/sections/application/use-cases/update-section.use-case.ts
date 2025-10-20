import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionMapper } from '../mappers/index';
import { SectionResponseDto, UpdateSectionCommand } from '../dto/index';
import {
  type RestaurantSectionReaderPort,
  type SectionRepositoryPort,
} from '../ports/index';
import {
  SectionNotFoundError,
  SectionRestaurantNotFoundError,
  type SectionUpdate,
} from '../../domain/index';

export class UpdateSectionUseCase
  implements UseCase<UpdateSectionCommand, SectionResponseDto>
{
  constructor(
    private readonly sectionRepository: SectionRepositoryPort,
    private readonly restaurantReader: RestaurantSectionReaderPort,
  ) {}

  async execute(command: UpdateSectionCommand): Promise<SectionResponseDto> {
    const section = await this.sectionRepository.findById(command.sectionId);

    if (!section) {
      throw new SectionNotFoundError(command.sectionId);
    }

    if (
      command.restaurantId !== undefined &&
      command.restaurantId !== section.restaurantId
    ) {
      const exists = await this.restaurantReader.exists(command.restaurantId);
      if (!exists) {
        throw new SectionRestaurantNotFoundError(command.restaurantId);
      }
    }

    const updateData: SectionUpdate = {};

    if (command.name !== undefined) {
      updateData.name = command.name;
    }
    if (command.description !== undefined) {
      updateData.description = command.description;
    }
    if (command.restaurantId !== undefined) {
      updateData.restaurantId = command.restaurantId;
    }
    if (command.width !== undefined) {
      updateData.width = command.width;
    }
    if (command.height !== undefined) {
      updateData.height = command.height;
    }

    section.update(updateData);

    const saved = await this.sectionRepository.save(section);
    return SectionMapper.toResponse(saved);
  }
}
