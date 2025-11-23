import { Section } from '../../domain';
import { SectionResponseDto } from '../dto';
import { Table } from '@features/tables/domain/entities/table.entity';
import { TableMapper } from '@features/tables/application/mappers/table.mapper';

export class SectionMapper {
  static toResponse(section: Section): SectionResponseDto {
    const snapshot = section.snapshot();
    return {
      id: snapshot.id,
      restaurantId: snapshot.restaurantId,
      name: snapshot.name,
      description: snapshot.description,
      width: snapshot.width,
      height: snapshot.height,
      posX: snapshot.posX,
      posY: snapshot.posY,
      status: snapshot.status,
      layoutMetadata: snapshot.layoutMetadata,
      tables: snapshot.tables
        ? snapshot.tables.map((t) => TableMapper.toResponse(Table.rehydrate(t)))
        : undefined,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
