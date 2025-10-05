import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { SectionMapper } from '../mappers/section.mapper.js';
import { SectionResponseDto } from '../dto/output/section.response.dto.js';
import { FindSectionQuery } from '../dto/input/find-section.query.js';
import {
  SECTION_REPOSITORY,
  type SectionRepositoryPort,
} from '../ports/section-repository.port.js';
import { SectionNotFoundError } from '../../domain/errors/section-not-found.error.js';

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
