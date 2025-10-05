import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { DeleteSectionCommand } from '../dto/input/delete-section.command.js';
import { DeleteSectionResponseDto } from '../dto/output/delete-section.response.dto.js';
import {
  SECTION_REPOSITORY,
  type SectionRepositoryPort,
} from '../ports/section-repository.port.js';
import { SectionNotFoundError } from '../../domain/errors/section-not-found.error.js';

@Injectable()
export class DeleteSectionUseCase
  implements UseCase<DeleteSectionCommand, DeleteSectionResponseDto>
{
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: SectionRepositoryPort,
  ) {}

  async execute(
    command: DeleteSectionCommand,
  ): Promise<DeleteSectionResponseDto> {
    const section = await this.sectionRepository.findById(command.sectionId);

    if (!section) {
      throw new SectionNotFoundError(command.sectionId);
    }

    await this.sectionRepository.delete(command.sectionId);

    return { ok: true };
  }
}
