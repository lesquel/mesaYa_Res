import { UseCase } from '@shared/application/ports/use-case.port';
import { ListRestaurantSectionsQuery, PaginatedSectionResponse } from '../dto';
import { SectionMapper } from '../mappers';
import { type SectionRepositoryPort } from '../ports';

export class ListRestaurantSectionsUseCase
  implements UseCase<ListRestaurantSectionsQuery, PaginatedSectionResponse>
{
  constructor(private readonly sectionRepository: SectionRepositoryPort) {}

  async execute(
    query: ListRestaurantSectionsQuery,
  ): Promise<PaginatedSectionResponse> {
    const result = await this.sectionRepository.paginateByRestaurant(query);

    return {
      ...result,
      results: result.results.map((section) =>
        SectionMapper.toResponse(section),
      ),
    };
  }
}
