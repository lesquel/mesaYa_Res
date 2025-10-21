import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'image' })
export class ImageOrmEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'imagen_id' })
  id!: number;

  @Column({ type: 'varchar', length: 255, name: 'url', nullable: false })
  url!: string;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'fecha_creacion',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({ type: 'varchar', length: 20, name: 'titulo', nullable: false })
  title!: string;

  @Column({ type: 'varchar', length: 100, name: 'descripcion', nullable: false })
  description!: string;

  @Column({ type: 'int', name: 'entidad_id', nullable: false })
  entityId!: number;
}
