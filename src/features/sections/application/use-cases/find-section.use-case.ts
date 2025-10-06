import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { SectionMapper } from '../mappers/index.js';
import { SectionResponseDto, FindSectionQuery } from '../dto/index.js';
import {
  SECTION_REPOSITORY,
  type SectionRepositoryPort,
} from '../ports/index.js';
import { SectionNotFoundError } from '../../domain/index.js';

@Injectable()
export class FindSectionUseCase
  implements UseCase<FindSectionQuery, SectionResponseDto>
{
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: SectionRepositoryPort,
  ) {}

  async execute(query: FindSectionQuery): Promise<SectionResponseDto> {
    const section = await this.sectionRepository.findById(query.sectionId);

    if (!section) {
      throw new SectionNotFoundError(query.sectionId);
    }

    return SectionMapper.toResponse(section);
  }
}
