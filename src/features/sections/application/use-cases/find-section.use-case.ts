import { UseCase } from '@shared/application/ports/use-case.port.js';
import { SectionMapper } from '../mappers/index.js';
import { SectionResponseDto, FindSectionQuery } from '../dto/index.js';
import { type SectionRepositoryPort } from '../ports/index.js';
import { SectionNotFoundError } from '../../domain/index.js';

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
