import { UseCase } from '@shared/application/ports/use-case.port';
import { ListSectionsQuery, PaginatedSectionResponse } from '../dto/index';
import { SectionMapper } from '../mappers/index';
import { type SectionRepositoryPort } from '../ports/index';

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
