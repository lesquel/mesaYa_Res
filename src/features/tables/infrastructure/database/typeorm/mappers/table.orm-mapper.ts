import { Table } from '../../../../domain';
import { TableOrmEntity } from '../orm';
import { SectionOrmEntity } from '../../../../../sections/infrastructure/database/typeorm/orm';

export class TableOrmMapper {
  // Mapper responsable de convertir entre Table <-> TableOrmEntity.
  // Mantén lógica de mapeo aquí; evitar mezclar reglas de negocio.
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
    entity.height = s.height;
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
      height: entity.height ?? entity.width,
      status: 'AVAILABLE',
      isAvailable: true,
      tableImageId: entity.tableImageId,
      chairImageId: entity.chairImageId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
