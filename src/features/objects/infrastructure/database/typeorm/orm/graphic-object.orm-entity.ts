import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'int', name: 'imagen_id', nullable: false })
  imageId: number;
}
