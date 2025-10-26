import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { SectionOrmEntity } from '../../../../../sections/infrastructure/database/typeorm/orm';
import { GraphicObjectOrmEntity } from '../../../../../objects/infrastructure/database/typeorm/orm';

@Entity({ name: 'section_object' })
export class SectionObjectOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'seccion_objeto_id' })
  id: string;

  @ManyToOne(() => SectionOrmEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id', referencedColumnName: 'id' })
  section: SectionOrmEntity;
  @RelationId((e: SectionObjectOrmEntity) => e.section)
  sectionId: string;

  @ManyToOne(() => GraphicObjectOrmEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'object_id', referencedColumnName: 'id' })
  object: GraphicObjectOrmEntity;
  @RelationId((e: SectionObjectOrmEntity) => e.object)
  objectId: string;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'fecha_creacion',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'fecha_modificacion',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
