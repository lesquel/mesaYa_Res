import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ImageNotFoundError } from '../../domain';
import { ImageMapper } from '../mappers';
import { FindImageQuery, ImageResponseDto } from '../dto';
import { IMAGE_REPOSITORY, type ImageRepositoryPort } from '../ports';

@Injectable()
export class FindImageUseCase
  implements UseCase<FindImageQuery, ImageResponseDto>
{
  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly repo: ImageRepositoryPort,
  ) {}

  async execute(query: FindImageQuery): Promise<ImageResponseDto> {
    const image = await this.repo.findById(query.imageId);
    if (!image) throw new ImageNotFoundError(query.imageId);
    return ImageMapper.toResponse(image);
  }
}
