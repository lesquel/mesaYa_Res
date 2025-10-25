import { Image } from '../../domain/index';
import { PaginatedResult } from '@shared/application/types/pagination';
import { ListImagesQuery } from '../dto/index';

export const IMAGE_REPOSITORY = Symbol('IMAGE_REPOSITORY');

export interface ImageRepositoryPort {
  save(image: Image): Promise<Image>;
  findById(id: string): Promise<Image | null>;
  delete(id: string): Promise<void>;
  paginate(query: ListImagesQuery): Promise<PaginatedResult<Image>>;
}
