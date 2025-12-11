import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
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
   * Emits `mesa-ya.images.events` with event_type='created' and returns the created image DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.IMAGES,
    payload: ({ result, toPlain }) => {
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
      };
    },
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
   * Emits `mesa-ya.images.events` with event_type='updated' and returns the updated image DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.IMAGES,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateImageCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: command.imageId,
        data: entity,
      };
    },
  })
  async update(command: UpdateImageCommand): Promise<ImageResponseDto> {
    return this.updateImage.execute(command);
  }

  /**
   * Emits `mesa-ya.images.events` with event_type='deleted' and returns the deleted image snapshot.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.IMAGES,
    payload: ({ result, toPlain }) => {
      const { image } = result as DeleteImageResponseDto;
      return {
        event_type: EVENT_TYPES.DELETED,
        entity_id: image.id,
        data: toPlain(image),
      };
    },
  })
  async delete(command: DeleteImageCommand): Promise<DeleteImageResponseDto> {
    return this.deleteImage.execute(command);
  }
}
