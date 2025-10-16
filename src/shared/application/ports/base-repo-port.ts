export abstract class IBaseRepositoryPort<
  Entity,
  CreateInput = Entity,
  UpdateInput = Entity,
> {
  abstract create(data: CreateInput): Promise<Entity>;
  abstract update(data: UpdateInput): Promise<Entity | null>;
  abstract findById(id: string): Promise<Entity | null>;
  abstract findAll(): Promise<Entity[]>;
  abstract delete(id: string): Promise<boolean>;
}
