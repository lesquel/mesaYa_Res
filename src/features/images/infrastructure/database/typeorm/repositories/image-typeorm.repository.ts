import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Image } from '../../../../domain/index.js';
import { ImageOrmEntity } from '../orm/index.js';
import { ImageOrmMapper } from '../mappers/index.js';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';
import { ListImagesQuery } from '../../../../application/dto/index.js';
import { type ImageRepositoryPort } from '../../../../application/ports/index.js';

@Injectable()
export class ImageTypeOrmRepository implements ImageRepositoryPort {
  constructor(
    @InjectRepository(ImageOrmEntity)
    private readonly images: Repository<ImageOrmEntity>,
  ) {}

  async save(image: Image): Promise<Image> {
    const existing =
      image.maybeId !== null
        ? await this.images.findOne({ where: { id: image.maybeId } })
        : null;

    const entity = ImageOrmMapper.toOrmEntity(image);
    const merged = existing ? this.images.merge(existing, entity) : entity;
    const saved = await this.images.save(merged);
    return ImageOrmMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Image | null> {
    const entity = await this.images.findOne({ where: { id } });
    return entity ? ImageOrmMapper.toDomain(entity) : null;
  }

  async delete(id: number): Promise<void> {
    await this.images.delete({ id });
  }

  async paginate(query: ListImagesQuery): Promise<PaginatedResult<Image>> {
    const qb = this.buildBaseQuery();
    return this.execPagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<ImageOrmEntity> {
    return this.images.createQueryBuilder('image');
  }

  private async execPagination(
    qb: SelectQueryBuilder<ImageOrmEntity>,
    query: ListImagesQuery,
  ): Promise<PaginatedResult<Image>> {
    const alias = qb.alias;
    const sortMap: Record<string, string> = {
      url: `${alias}.url`,
      storagePath: `${alias}.storagePath`,
      title: `${alias}.title`,
      description: `${alias}.description`,
      entityId: `${alias}.entityId`,
      createdAt: `${alias}.createdAt`,
    };
    const sortByColumn =
      query.sortBy && sortMap[query.sortBy] ? sortMap[query.sortBy] : undefined;

    const paginationResult = await paginateQueryBuilder(qb, {
      ...query.pagination,
      route: query.route,
      sortBy: sortByColumn,
      sortOrder: query.sortOrder,
      q: query.search ?? undefined,
      allowedSorts: Object.values(sortMap),
      searchable: [
        `${alias}.url`,
        `${alias}.storagePath`,
        `${alias}.title`,
        `${alias}.description`,
      ],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((entity) =>
        ImageOrmMapper.toDomain(entity as ImageOrmEntity),
      ),
    };
  }
}
