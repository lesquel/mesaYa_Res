import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka/index';
import type {
  CreateImageCommand,
  DeleteImageCommand,
  FindImageQuery,
  ImageResponseDto,
  ListImagesQuery,
  UpdateImageCommand,
  DeleteImageResponseDto,
} from '../dto/index';
import {
  CreateImageUseCase,
  DeleteImageUseCase,
  FindImageUseCase,
  ListImagesUseCase,
  UpdateImageUseCase,
  type PaginatedImageResponse,
} from '../use-cases/index';

@Injectable()
export class ImagesService {
  constructor(
    private readonly createImage: CreateImageUseCase,
    private readonly listImages: ListImagesUseCase,
    private readonly findImage: FindImageUseCase,
    private readonly updateImage: UpdateImageUseCase,
    private readonly deleteImage: DeleteImageUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Emits `mesa-ya.images.created` with `{ action, entity }` and returns the created image DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.IMAGE_CREATED,
    payload: ({ result, toPlain }) => ({
      action: 'image.created',
      entity: toPlain(result),
    }),
  })
  async create(command: CreateImageCommand): Promise<ImageResponseDto> {
    return this.createImage.execute(command);
  }

  async list(query: ListImagesQuery): Promise<PaginatedImageResponse> {
    return this.listImages.execute(query);
  }

  async findOne(query: FindImageQuery): Promise<ImageResponseDto> {
    return this.findImage.execute(query);
  }

  /**
   * Emits `mesa-ya.images.updated` with `{ action, entityId, entity }` and returns the updated image DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.IMAGE_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateImageCommand];
      return {
        action: 'image.updated',
        entityId: command.imageId,
        entity: toPlain(result),
      };
    },
  })
  async update(command: UpdateImageCommand): Promise<ImageResponseDto> {
    return this.updateImage.execute(command);
  }

  /**
   * Emits `mesa-ya.images.deleted` with `{ action, entityId, entity }` and returns the deleted image snapshot.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.IMAGE_DELETED,
    payload: ({ result, toPlain }) => {
      const { image } = result as DeleteImageResponseDto;
      return {
        action: 'image.deleted',
        entityId: image.id,
        entity: toPlain(image),
      };
    },
  })
  async delete(command: DeleteImageCommand): Promise<DeleteImageResponseDto> {
    return this.deleteImage.execute(command);
  }
}
