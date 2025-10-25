import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ImageOrmEntity } from '@features/images/infrastructure/database/typeorm/orm';

@Entity({ name: 'object' })
export class GraphicObjectOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'objeto_id' })
  id: string;

  @Column({ type: 'int', name: 'pos_x', nullable: false })
  posX: number;

  @Column({ type: 'int', name: 'pos_y', nullable: false })
  posY: number;

  @Column({ type: 'int', name: 'ancho', nullable: false })
  width: number;

  @Column({ type: 'int', name: 'alto', nullable: false })
  height: number;

  @Column({ type: 'uuid', name: 'imagen_id', nullable: false })
  imageId: string;

  @ManyToOne(() => ImageOrmEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'imagen_id' })
  image?: ImageOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
