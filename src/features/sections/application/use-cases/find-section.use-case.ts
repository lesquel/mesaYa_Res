import { UseCase } from '@shared/application/ports/use-case.port';
import { SectionMapper } from '../mappers/index';
import { SectionResponseDto, FindSectionQuery } from '../dto/index';
import { type SectionRepositoryPort } from '../ports/index';
import { SectionNotFoundError } from '../../domain/index';

export class FindSectionUseCase
  implements UseCase<FindSectionQuery, SectionResponseDto>
{
  constructor(private readonly sectionRepository: SectionRepositoryPort) {}

  async execute(query: FindSectionQuery): Promise<SectionResponseDto> {
    const section = await this.sectionRepository.findById(query.sectionId);

    if (!section) {
      throw new SectionNotFoundError(query.sectionId);
    }

    return SectionMapper.toResponse(section);
  }
}
