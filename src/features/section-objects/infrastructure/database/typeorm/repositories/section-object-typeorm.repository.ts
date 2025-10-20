import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SectionObject } from '../../../../domain/index.js';
import { SectionObjectOrmEntity } from '../orm/index.js';
import { SectionObjectOrmMapper } from '../mappers/index.js';
import { paginateQueryBuilder } from '../../../../../../shared/infrastructure/pagination/paginate.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';
import { ListSectionObjectsQuery } from '../../../../application/dto/index.js';
import { type SectionObjectRepositoryPort } from '../../../../application/ports/index.js';

@Injectable()
export class SectionObjectTypeOrmRepository
  implements SectionObjectRepositoryPort
{
  constructor(
    @InjectRepository(SectionObjectOrmEntity)
    private readonly repo: Repository<SectionObjectOrmEntity>,
  ) {}

  async save(entity: SectionObject): Promise<SectionObject> {
    const existing = await this.repo.findOne({ where: { id: entity.id } });
    const orm = SectionObjectOrmMapper.toOrmEntity(entity);
    const merged = existing ? this.repo.merge(existing, orm) : orm;
    const saved = await this.repo.save(merged);
    return SectionObjectOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<SectionObject | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? SectionObjectOrmMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async paginate(
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedResult<SectionObject>> {
    const qb = this.buildBaseQuery();
    return this.execPagination(qb, query);
  }

  async paginateBySection(
    sectionId: string,
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedResult<SectionObject>> {
    const qb = this.buildBaseQuery().where(
      'sectionObject.sectionId = :sectionId',
      { sectionId },
    );
    return this.execPagination(qb, query);
  }

  async paginateByObject(
    objectId: string,
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedResult<SectionObject>> {
    const qb = this.buildBaseQuery().where(
      'sectionObject.objectId = :objectId',
      { objectId },
    );
    return this.execPagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<SectionObjectOrmEntity> {
    const alias = 'sectionObject';
    return this.repo.createQueryBuilder(alias);
  }

  private async execPagination(
    qb: SelectQueryBuilder<SectionObjectOrmEntity>,
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedResult<SectionObject>> {
    const alias = qb.alias;
    const sortMap: Record<string, string> = {
      sectionId: `${alias}.sectionId`,
      objectId: `${alias}.objectId`,
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
      searchable: [`${alias}.sectionId`, `${alias}.objectId`],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((e) =>
        SectionObjectOrmMapper.toDomain(e),
      ),
    };
  }
}
