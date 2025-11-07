import {
  GraphicObject,
  GraphicObjectNotFoundError,
  type GraphicObjectProps,
} from '../entities/index.js';
import { IGraphicObjectDomainRepositoryPort } from '../repositories/index.js';
import {
  type GraphicObjectCreateRequest,
  type GraphicObjectDeleteRequest,
  type GraphicObjectUpdateRequest,
} from '../types/index.js';

export class GraphicObjectDomainService {
  constructor(
    private readonly graphicObjectRepository: IGraphicObjectDomainRepositoryPort,
  ) {}

  async createGraphicObject(
    request: GraphicObjectCreateRequest,
  ): Promise<GraphicObject> {
    const graphicObject = GraphicObject.create(request.objectId, {
      posX: request.posX,
      posY: request.posY,
      width: request.width,
      height: request.height,
      imageId: request.imageId,
    });

    return this.graphicObjectRepository.save(graphicObject);
  }

  async updateGraphicObject(
    request: GraphicObjectUpdateRequest,
  ): Promise<GraphicObject> {
    const graphicObject = await this.ensureGraphicObject(request.objectId);

    const patch: Partial<GraphicObjectProps> = {};

    if (request.posX !== undefined) {
      patch.posX = request.posX;
    }

    if (request.posY !== undefined) {
      patch.posY = request.posY;
    }

    if (request.width !== undefined) {
      patch.width = request.width;
    }

    if (request.height !== undefined) {
      patch.height = request.height;
    }

    if (request.imageId !== undefined) {
      patch.imageId = request.imageId;
    }

    if (Object.keys(patch).length > 0) {
      graphicObject.update(patch);
    }

    return this.graphicObjectRepository.save(graphicObject);
  }

  async deleteGraphicObject(
    request: GraphicObjectDeleteRequest,
  ): Promise<GraphicObject> {
    const graphicObject = await this.ensureGraphicObject(request.objectId);

    await this.graphicObjectRepository.delete(graphicObject.id);
    return graphicObject;
  }

  private async ensureGraphicObject(objectId: string): Promise<GraphicObject> {
    const graphicObject = await this.graphicObjectRepository.findById(objectId);

    if (!graphicObject) {
      throw new GraphicObjectNotFoundError(objectId);
    }

    return graphicObject;
  }
}
