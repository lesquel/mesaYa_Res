import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionObjectNotFoundError } from '../../domain';
import { FindSectionObjectQuery, SectionObjectResponseDto } from '../dto';
import { SectionObjectMapper } from '../mappers';
import {
  SECTION_OBJECT_REPOSITORY,
  type SectionObjectRepositoryPort,
} from '../ports';

@Injectable()
export class FindSectionObjectUseCase
  implements UseCase<FindSectionObjectQuery, SectionObjectResponseDto>
{
  constructor(
    @Inject(SECTION_OBJECT_REPOSITORY)
    private readonly repo: SectionObjectRepositoryPort,
  ) {}

  async execute(
    query: FindSectionObjectQuery,
  ): Promise<SectionObjectResponseDto> {
    const entity = await this.repo.findById(query.sectionObjectId);
    if (!entity) throw new SectionObjectNotFoundError(query.sectionObjectId);
    return SectionObjectMapper.toResponse(entity);
  }
}
