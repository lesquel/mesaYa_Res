import { Image } from '../../domain/index.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';
import { ListImagesQuery } from '../dto/index.js';

export const IMAGE_REPOSITORY = Symbol('IMAGE_REPOSITORY');

export interface ImageRepositoryPort {
  save(image: Image): Promise<Image>;
  findById(id: number): Promise<Image | null>;
  delete(id: number): Promise<void>;
  paginate(query: ListImagesQuery): Promise<PaginatedResult<Image>>;
}
