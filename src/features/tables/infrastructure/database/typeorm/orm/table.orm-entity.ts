import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SectionOrmEntity } from '@features/sections/infrastructure/database/typeorm/orm';
import type { ReservationOrmEntity } from '@features/reservation/infrastructure/orm/reservation.orm-entity';

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

  @Column({ type: 'int', name: 'height', nullable: false, default: 0 })
  height: number;

  @Column({ type: 'uuid', name: 'table_image_id', nullable: false })
  tableImageId: string;

  @Column({ type: 'uuid', name: 'chair_image_id', nullable: false })
  chairImageId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('ReservationOrmEntity', (reservation: ReservationOrmEntity) => reservation.table)
  reservations: ReservationOrmEntity[];
}
