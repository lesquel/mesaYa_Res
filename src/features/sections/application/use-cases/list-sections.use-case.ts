import { UseCase } from '@shared/application/ports/use-case.port.js';
import { ListSectionsQuery, PaginatedSectionResponse } from '../dto/index.js';
import { SectionMapper } from '../mappers/index.js';
import { type SectionRepositoryPort } from '../ports/index.js';

export class ListSectionsUseCase
  implements UseCase<ListSectionsQuery, PaginatedSectionResponse>
{
  constructor(private readonly sectionRepository: SectionRepositoryPort) {}

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
