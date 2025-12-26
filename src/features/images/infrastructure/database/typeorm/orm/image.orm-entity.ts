import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'image' })
export class ImageOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'imagen_id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'url', nullable: false })
  url!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'storage_path',
    nullable: false,
  })
  storagePath!: string;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'fecha_creacion',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'fecha_modificacion',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'titulo',
    nullable: true,
    default: 'Untitled',
  })
  title!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'descripcion',
    nullable: true,
    default: 'No description',
  })
  description!: string;

  @Column('uuid', { name: 'entidad_id', nullable: false })
  entityId!: string;
}
