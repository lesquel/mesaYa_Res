import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  FileTypeValidator,
  MaxFileSizeValidator,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard.js';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator.js';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  ImagesService,
  CreateImageDto,
  UpdateImageDto,
  type CreateImageCommand,
  type DeleteImageCommand,
  type UpdateImageCommand,
  GetImageAnalyticsUseCase,
} from '../../../application/index.js';
import type { ImageFilePayload } from '../../../application/dto/input/create-image.dto.js';
import type { Multer } from 'multer';
import {
  ImageAnalyticsRequestDto,
  ImageAnalyticsResponseDto,
} from '../../dto/index.js';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@ApiTags('Images - Admin')
@Controller({ path: 'admin/image', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminImagesController {
  constructor(
    private readonly images: ImagesService,
    private readonly getImageAnalytics: GetImageAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @Permissions('image:create')
  @ApiOperation({ summary: 'Crear imagen (Admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Banner' },
        description: {
          type: 'string',
          example: 'Main banner for the landing section',
        },
        entityId: { type: 'integer', example: 1 },
        file: { type: 'string', format: 'binary' },
      },
      required: ['title', 'description', 'entityId', 'file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: CreateImageDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/i }),
        ],
      }),
    )
    file: Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');

    const payload: ImageFilePayload = {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    };

    const command: CreateImageCommand = { ...dto, file: payload };
    return this.images.create(command);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('image:read')
  @ApiOperation({ summary: 'Analíticas de imágenes (Admin)' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha inicial (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha final (ISO 8601)',
  })
  @ApiQuery({
    name: 'entityId',
    required: false,
    type: String,
    description: 'Filtra por entidad asociada',
  })
  async analytics(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: ImageAnalyticsRequestDto,
  ): Promise<ImageAnalyticsResponseDto> {
    const analytics = await this.getImageAnalytics.execute(query.toQuery());
    return ImageAnalyticsResponseDto.fromApplication(analytics);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('image:update')
  @ApiOperation({ summary: 'Actualizar imagen (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID de la imagen' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Banner' },
        description: {
          type: 'string',
          example: 'Main banner for the landing section',
        },
        entityId: { type: 'integer', example: 1 },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateImageDto,
    @UploadedFile() file?: Multer.File,
  ) {
    let filePayload: ImageFilePayload | undefined;

    if (file) {
      if (file.size > MAX_IMAGE_SIZE_BYTES)
        throw new BadRequestException('File size exceeds 5 MB limit');
      if (!/^image\//.test(file.mimetype))
        throw new BadRequestException('Only image files are allowed');

      filePayload = {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      };
    }

    const command: UpdateImageCommand = {
      imageId: id,
      ...dto,
      file: filePayload,
    };
    return this.images.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @Permissions('image:delete')
  @ApiOperation({ summary: 'Eliminar imagen (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID de la imagen' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const command: DeleteImageCommand = { imageId: id };
    return this.images.delete(command);
  }
}
