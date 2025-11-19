import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Table,
  TableSectionNotFoundError,
  ITableDomainRepositoryPort,
} from '../../../../domain';
import { TableOrmEntity } from '../orm';
import { TableOrmMapper } from '../mappers';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';
import { PaginatedResult } from '@shared/application/types/pagination';
import {
  ListTablesQuery,
  ListSectionTablesQuery,
} from '../../../../application/dto';
import { type TableRepositoryPort } from '../../../../application/ports';
import { SectionOrmEntity } from '../../../../../sections/infrastructure/database/typeorm/orm';

// Nota: Este repositorio mapea entre la entidad ORM (`TableOrmEntity`) y el
// agregado de dominio `Table`. Las transformaciones se realizan mediante
// `TableOrmMapper` para mantener la capa de infraestructura separada del dominio.

@Injectable()
export class TableTypeOrmRepository
  implements TableRepositoryPort, ITableDomainRepositoryPort
{
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
    if (!section || section.id !== s.sectionId) {
      section =
        (await this.sections.findOne({ where: { id: s.sectionId } })) ??
        undefined;
      if (!section) {
        throw new TableSectionNotFoundError(s.sectionId);
      }
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

  async findBySectionAndNumber(
    sectionId: string,
    number: number,
  ): Promise<Table | null> {
    const entity = await this.tables
      .createQueryBuilder('table')
      .leftJoin('table.section', 'section')
      .where('section.id = :sectionId', { sectionId })
      .andWhere('table.number = :number', { number })
      .getOne();
    return entity ? TableOrmMapper.toDomain(entity) : null;
  }

  async listBySection(sectionId: string): Promise<Table[]> {
    const entities = await this.tables
      .createQueryBuilder('table')
      .leftJoin('table.section', 'section')
      .where('section.id = :sectionId', { sectionId })
      .getMany();
    return entities.map((entity) => TableOrmMapper.toDomain(entity));
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
