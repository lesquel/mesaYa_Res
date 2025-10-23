import { ApiProperty } from '@nestjs/swagger';
import type { ImageAnalyticsResponse } from '../../application/dto/analytics/image-analytics.response';

class ImageAnalyticsSummaryDto {
  @ApiProperty({ description: 'Total de imágenes registradas' })
  totalImages: number;

  @ApiProperty({ description: 'Número de entidades únicas con imágenes' })
  uniqueEntities: number;

  @ApiProperty({ description: 'Promedio de imágenes por entidad' })
  averageImagesPerEntity: number;

  @ApiProperty({ description: 'Imágenes creadas en los últimos 30 días' })
  imagesLast30Days: number;
}

class ImageAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha en formato YYYY-MM-DD' })
  date: string;

  @ApiProperty({ description: 'Cantidad de imágenes registradas en la fecha' })
  count: number;
}

class ImageAnalyticsUploadsDto {
  @ApiProperty({ description: 'Total de imágenes en el período analizado' })
  total: number;

  @ApiProperty({ type: [ImageAnalyticsTrendPointDto] })
  byDate: ImageAnalyticsTrendPointDto[];
}

class ImageAnalyticsEntityDistributionItemDto {
  @ApiProperty({ description: 'Identificador de la entidad' })
  entityId: number;

  @ApiProperty({ description: 'Cantidad de imágenes asociadas a la entidad' })
  count: number;
}

export class ImageAnalyticsResponseDto {
  @ApiProperty({ type: ImageAnalyticsSummaryDto })
  summary: ImageAnalyticsSummaryDto;

  @ApiProperty({ type: ImageAnalyticsUploadsDto })
  uploads: ImageAnalyticsUploadsDto;

  @ApiProperty({ type: [ImageAnalyticsEntityDistributionItemDto] })
  entities: ImageAnalyticsEntityDistributionItemDto[];

  static fromApplication(response: ImageAnalyticsResponse): ImageAnalyticsResponseDto {
    const dto = new ImageAnalyticsResponseDto();
    dto.summary = {
      totalImages: response.summary.totalImages,
      uniqueEntities: response.summary.uniqueEntities,
      averageImagesPerEntity: response.summary.averageImagesPerEntity,
      imagesLast30Days: response.summary.imagesLast30Days,
    };
    dto.uploads = {
      total: response.uploads.total,
      byDate: response.uploads.byDate.map((point) => ({
        date: point.date,
        count: point.count,
      })),
    };
    dto.entities = response.entities.map((entity) => ({
      entityId: entity.entityId,
      count: entity.count,
    }));
    return dto;
  }
}
