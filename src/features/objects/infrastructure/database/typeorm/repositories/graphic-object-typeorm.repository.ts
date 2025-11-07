import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { GraphicObject } from '../../../../domain/index.js';
import { IGraphicObjectDomainRepositoryPort } from '../../../../domain/repositories/index.js';
import { GraphicObjectOrmEntity } from '../orm/index.js';
import { GraphicObjectOrmMapper } from '../mappers/index.js';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';
import { PaginatedResult } from '@shared/application/types/pagination';
import { ListGraphicObjectsQuery } from '../../../../application/dto/index.js';
import { type GraphicObjectRepositoryPort } from '../../../../application/ports/index.js';

@Injectable()
export class GraphicObjectTypeOrmRepository
  implements GraphicObjectRepositoryPort, IGraphicObjectDomainRepositoryPort
{
  constructor(
    @InjectRepository(GraphicObjectOrmEntity)
    private readonly objects: Repository<GraphicObjectOrmEntity>,
  ) {}

  async save(object: GraphicObject): Promise<GraphicObject> {
    const existing = await this.objects.findOne({ where: { id: object.id } });
    const entity = GraphicObjectOrmMapper.toOrmEntity(object);
    const merged = existing ? this.objects.merge(existing, entity) : entity;
    const saved = await this.objects.save(merged);
    return GraphicObjectOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<GraphicObject | null> {
    const entity = await this.objects.findOne({ where: { id } });
    return entity ? GraphicObjectOrmMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.objects.delete({ id });
  }

  async paginate(
    query: ListGraphicObjectsQuery,
  ): Promise<PaginatedResult<GraphicObject>> {
    const qb = this.buildBaseQuery();
    return this.execPagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<GraphicObjectOrmEntity> {
    const alias = 'object';
    return this.objects.createQueryBuilder(alias);
  }

  private async execPagination(
    qb: SelectQueryBuilder<GraphicObjectOrmEntity>,
    query: ListGraphicObjectsQuery,
  ): Promise<PaginatedResult<GraphicObject>> {
    const alias = qb.alias;
    const sortMap: Record<string, string> = {
      posX: `${alias}.posX`,
      posY: `${alias}.posY`,
      width: `${alias}.width`,
      height: `${alias}.height`,
      imageId: `${alias}.imageId`,
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
        `${alias}.posX`,
        `${alias}.posY`,
        `${alias}.width`,
        `${alias}.height`,
        `${alias}.imageId`,
      ],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((e) =>
        GraphicObjectOrmMapper.toDomain(e),
      ),
    };
  }
}
