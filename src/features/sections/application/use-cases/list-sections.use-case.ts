import { UseCase } from '@shared/application/ports/use-case.port';
import { ListSectionsQuery, PaginatedSectionResponse } from '../dto';
import { SectionMapper } from '../mappers';
import { type SectionRepositoryPort } from '../ports';

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
