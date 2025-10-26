import { Table } from '../../domain';
import { TableResponseDto } from '../dto';

export class TableMapper {
  static toResponse(table: Table): TableResponseDto {
    const s = table.snapshot();
    return {
      id: s.id,
      sectionId: s.sectionId,
      number: s.number,
      capacity: s.capacity,
      posX: s.posX,
      posY: s.posY,
      width: s.width,
      tableImageId: s.tableImageId,
      chairImageId: s.chairImageId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }
}
