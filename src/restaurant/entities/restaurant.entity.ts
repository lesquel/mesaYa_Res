import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'restaurante' })
export class Restaurant {
  @PrimaryGeneratedColumn('uuid', { name: 'restaurante_id' })
  restauranteId: string;

  @Column({ type: 'varchar', length: 100, name: 'nombre', nullable: false })
  @Index()
  nombre: string;

  @Column({ type: 'text', name: 'descripcion', nullable: true })
  descripcion?: string | null;

  @Column({ type: 'varchar', length: 200, name: 'ubicacion', nullable: false })
  ubicacion: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'horarios_atencion',
    nullable: false,
  })
  horariosAtencion: string;

  @Column({ type: 'int', name: 'capacidad_total', nullable: false })
  capacidadTotal: number;

  // FK a suscripción (relación se puede definir cuando exista la entidad Suscripcion)
  @Column({ type: 'int', name: 'suscripcion_id', nullable: false })
  suscripcionId: number;

  // FK a imagen (puede ser opcional según el diseño)
  @Column({ type: 'int', name: 'imagen_id', nullable: true })
  imagenId?: number | null;

  @Column({ type: 'boolean', name: 'activo', nullable: false })
  activo: boolean;
}
