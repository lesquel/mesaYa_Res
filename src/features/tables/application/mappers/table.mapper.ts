import { Table } from '../../domain/index';
import { TableResponseDto } from '../dto/index';

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
    };
  }
}
