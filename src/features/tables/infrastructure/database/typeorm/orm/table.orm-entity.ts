import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { SectionOrmEntity } from '../../../../../sections/infrastructure/database/typeorm/orm/index';

@Entity({ name: 'table' })
export class TableOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'table_id' })
  id: string;

  @ManyToOne(() => SectionOrmEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id', referencedColumnName: 'id' })
  section: SectionOrmEntity;

  @RelationId((t: TableOrmEntity) => t.section)
  sectionId: string;

  @Column({ type: 'int', name: 'number', nullable: false })
  number: number;

  @Column({ type: 'int', name: 'capacity', nullable: false })
  capacity: number;

  @Column({ type: 'int', name: 'pos_x', nullable: false })
  posX: number;

  @Column({ type: 'int', name: 'pos_y', nullable: false })
  posY: number;

  @Column({ type: 'int', name: 'width', nullable: false })
  width: number;

  @Column({ type: 'int', name: 'table_image_id', nullable: false })
  tableImageId: number;

  @Column({ type: 'int', name: 'chair_image_id', nullable: false })
  chairImageId: number;
}
