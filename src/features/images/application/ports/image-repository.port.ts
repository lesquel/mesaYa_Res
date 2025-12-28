import { Image } from '../../domain';
import { PaginatedResult } from '@shared/application/types';
import { ListImagesQuery } from '../dto';

export const IMAGE_REPOSITORY = Symbol('IMAGE_REPOSITORY');

export interface ImageRepositoryPort {
  save(image: Image): Promise<Image>;
  findById(id: string): Promise<Image | null>;
  delete(id: string): Promise<void>;
  paginate(query: ListImagesQuery): Promise<PaginatedResult<Image>>;
}
