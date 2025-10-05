import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { ListSectionsQuery } from '../dto/input/list-sections.query.js';
import { PaginatedSectionResponse } from '../dto/output/section.response.dto.js';
import { SectionMapper } from '../mappers/section.mapper.js';
import {
  SECTION_REPOSITORY,
  type SectionRepositoryPort,
} from '../ports/section-repository.port.js';

@Injectable()
export class ListSectionsUseCase
  implements UseCase<ListSectionsQuery, PaginatedSectionResponse>
{
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: SectionRepositoryPort,
  ) {}

  async execute(query: ListSectionsQuery): Promise<PaginatedSectionResponse> {
    const result = await this.sectionRepository.paginate(query);

    return {
      ...result,
      results: result.results.map((section) =>
        SectionMapper.toResponse(section),
      ),
    };
  }
}
