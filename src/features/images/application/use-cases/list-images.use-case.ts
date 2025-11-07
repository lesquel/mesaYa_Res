import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaginatedResult } from '@shared/application/types/pagination';
import { Image } from '../../domain/index.js';
import { ImageMapper } from '../mappers/index.js';
import { IMAGE_REPOSITORY, type ImageRepositoryPort } from '../ports/index.js';
import { ImageResponseDto, ListImagesQuery } from '../dto/index.js';

export type PaginatedImageResponse = PaginatedResult<ImageResponseDto>;

@Injectable()
export class ListImagesUseCase
  implements UseCase<ListImagesQuery, PaginatedImageResponse>
{
  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly repo: ImageRepositoryPort,
  ) {}

  async execute(query: ListImagesQuery): Promise<PaginatedImageResponse> {
    const result = await this.repo.paginate(query);
    return {
      ...result,
      results: result.results.map((image: Image) =>
        ImageMapper.toResponse(image),
      ),
    };
  }
}
