import { UseCase } from '@shared/application/ports/use-case.port';
import {
  ListRestaurantSectionsQuery,
  PaginatedSectionResponse,
} from '../dto/index';
import { SectionMapper } from '../mappers/index';
import { type SectionRepositoryPort } from '../ports/index';

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
