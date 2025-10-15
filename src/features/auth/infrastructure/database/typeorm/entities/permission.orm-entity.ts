import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'permission' })
export class PermissionOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'permission_id' })
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true, name: 'name' })
  @Index({ unique: true })
  name: string;
}
