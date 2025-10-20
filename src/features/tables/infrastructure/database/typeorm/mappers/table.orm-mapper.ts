import { Table } from '../../../../domain/index.js';
import { TableOrmEntity } from '../orm/index.js';
import { SectionOrmEntity } from '../../../../../sections/infrastructure/database/typeorm/orm/index.js';

export class TableOrmMapper {
  static toOrmEntity(
    table: Table,
    ctx: { existing?: TableOrmEntity; section?: SectionOrmEntity },
  ): TableOrmEntity {
    const s = table.snapshot();
    const entity = ctx.existing ?? new TableOrmEntity();
    entity.id = s.id;
    entity.section = ctx.section ?? entity.section;
    entity.number = s.number;
    entity.capacity = s.capacity;
    entity.posX = s.posX;
    entity.posY = s.posY;
    entity.width = s.width;
    entity.tableImageId = s.tableImageId;
    entity.chairImageId = s.chairImageId;
    return entity;
  }

  static toDomain(entity: TableOrmEntity): Table {
    return Table.rehydrate({
      id: entity.id,
      sectionId: entity.sectionId,
      number: entity.number,
      capacity: entity.capacity,
      posX: entity.posX,
      posY: entity.posY,
      width: entity.width,
      tableImageId: entity.tableImageId,
      chairImageId: entity.chairImageId,
    });
  }
}
