import { GraphicObject } from '../entities/graphic-object.entity';

export abstract class IGraphicObjectDomainRepositoryPort {
  abstract save(object: GraphicObject): Promise<GraphicObject>;
  abstract findById(objectId: string): Promise<GraphicObject | null>;
  abstract delete(objectId: string): Promise<void>;
}
