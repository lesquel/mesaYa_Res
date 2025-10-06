import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/interfaces/use-case.js';
import {
  DeleteSectionCommand,
  DeleteSectionResponseDto,
} from '../dto/index.js';
import {
  SECTION_REPOSITORY,
  type SectionRepositoryPort,
} from '../ports/index.js';
import { SectionNotFoundError } from '../../domain/index.js';

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
