import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Table } from '../../../../domain/index.js';
import { TableOrmEntity } from '../orm/index.js';
import { TableOrmMapper } from '../mappers/index.js';
import { paginateQueryBuilder } from '../../../../../../shared/infrastructure/pagination/paginate.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';
import {
  ListTablesQuery,
  ListSectionTablesQuery,
} from '../../../../application/dto/index.js';
import { type TableRepositoryPort } from '../../../../application/ports/index.js';
import { SectionOrmEntity } from '../../../../../sections/infrastructure/database/typeorm/orm/index.js';

@Injectable()
export class TableTypeOrmRepository implements TableRepositoryPort {
  constructor(
    @InjectRepository(TableOrmEntity)
    private readonly tables: Repository<TableOrmEntity>,
    @InjectRepository(SectionOrmEntity)
    private readonly sections: Repository<SectionOrmEntity>,
  ) {}

  async save(table: Table): Promise<Table> {
    const s = table.snapshot();
    const existing = await this.tables.findOne({
      where: { id: s.id },
      relations: ['section'],
    });

    let section = existing?.section;
    if (!existing) {
      section =
        (await this.sections.findOne({ where: { id: s.sectionId } })) ??
        undefined;
      if (!section) throw new Error('Section not found');
    }

    const entity = TableOrmMapper.toOrmEntity(table, {
      existing: existing ?? undefined,
      section,
    });
    const saved = await this.tables.save(entity);
    return TableOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Table | null> {
    const entity = await this.tables.findOne({
      where: { id },
      relations: ['section'],
    });
    return entity ? TableOrmMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.tables.delete({ id });
  }

  async paginate(query: ListTablesQuery): Promise<PaginatedResult<Table>> {
    const qb = this.buildBaseQuery();
    return this.execPagination(qb, query);
  }

  async paginateBySection(
    query: ListSectionTablesQuery,
  ): Promise<PaginatedResult<Table>> {
    const qb = this.buildBaseQuery().where('section.id = :sectionId', {
      sectionId: query.sectionId,
    });
    return this.execPagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<TableOrmEntity> {
    const alias = 'table';
    return this.tables
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.section`, 'section');
  }

  private async execPagination(
    qb: SelectQueryBuilder<TableOrmEntity>,
    query: ListTablesQuery,
  ): Promise<PaginatedResult<Table>> {
    const alias = qb.alias;
    const sortMap: Record<string, string> = {
      number: `${alias}.number`,
      capacity: `${alias}.capacity`,
      width: `${alias}.width`,
    };
    const sortByColumn =
      query.sortBy && sortMap[query.sortBy] ? sortMap[query.sortBy] : undefined;

    const paginationResult = await paginateQueryBuilder(qb, {
      ...query.pagination,
      route: query.route,
      sortBy: sortByColumn,
      sortOrder: query.sortOrder,
      q: query.search,
      allowedSorts: Object.values(sortMap),
      searchable: [`${alias}.number`, `${alias}.capacity`],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((e) => TableOrmMapper.toDomain(e)),
    };
  }
}
