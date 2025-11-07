import { ApiProperty } from '@nestjs/swagger';
import type { GraphicObjectAnalyticsResponse } from '../../application/dto/analytics/graphic-object-analytics.response.js';

class GraphicObjectAnalyticsSummaryDto {
  @ApiProperty({ description: 'Total de objetos registrados' })
  totalObjects!: number;

  @ApiProperty({ description: 'Imágenes únicas referenciadas' })
  uniqueImages!: number;

  @ApiProperty({ description: 'Promedio de ancho (px)' })
  averageWidth!: number;

  @ApiProperty({ description: 'Promedio de alto (px)' })
  averageHeight!: number;

  @ApiProperty({ description: 'Promedio de área (px²)' })
  averageArea!: number;

  @ApiProperty({ description: 'Promedio de posición en X' })
  averagePositionX!: number;

  @ApiProperty({ description: 'Promedio de posición en Y' })
  averagePositionY!: number;

  @ApiProperty({ description: 'Objetos creados en los últimos 30 días' })
  objectsLast30Days!: number;
}

class GraphicObjectAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha en formato YYYY-MM-DD' })
  date!: string;

  @ApiProperty({ description: 'Cantidad de objetos creados en la fecha' })
  count!: number;
}

class GraphicObjectAnalyticsObjectsDto {
  @ApiProperty({ description: 'Total de objetos en el período analizado' })
  total!: number;

  @ApiProperty({ type: [GraphicObjectAnalyticsTrendPointDto] })
  byDate!: GraphicObjectAnalyticsTrendPointDto[];
}

class GraphicObjectAnalyticsImageItemDto {
  @ApiProperty({ description: 'Identificador de la imagen', format: 'uuid' })
  imageId!: string;

  @ApiProperty({ description: 'Objetos asociados a la imagen' })
  count!: number;
}

class GraphicObjectAnalyticsSizeBucketDto {
  @ApiProperty({ description: 'Etiqueta del segmento de tamaño' })
  bucket!: string;

  @ApiProperty({ description: 'Cantidad de objetos en el segmento' })
  count!: number;
}

class GraphicObjectAnalyticsOrientationDto {
  @ApiProperty({ description: 'Orientación del objeto' })
  orientation!: string;

  @ApiProperty({ description: 'Cantidad de objetos con esta orientación' })
  count!: number;
}

export class GraphicObjectAnalyticsResponseDto {
  @ApiProperty({ type: GraphicObjectAnalyticsSummaryDto })
  summary!: GraphicObjectAnalyticsSummaryDto;

  @ApiProperty({ type: GraphicObjectAnalyticsObjectsDto })
  objects!: GraphicObjectAnalyticsObjectsDto;

  @ApiProperty({ type: [GraphicObjectAnalyticsImageItemDto] })
  images!: GraphicObjectAnalyticsImageItemDto[];

  @ApiProperty({ type: [GraphicObjectAnalyticsSizeBucketDto] })
  sizeBuckets!: GraphicObjectAnalyticsSizeBucketDto[];

  @ApiProperty({ type: [GraphicObjectAnalyticsOrientationDto] })
  orientations!: GraphicObjectAnalyticsOrientationDto[];

  static fromApplication(
    response: GraphicObjectAnalyticsResponse,
  ): GraphicObjectAnalyticsResponseDto {
    const dto = new GraphicObjectAnalyticsResponseDto();
    dto.summary = {
      totalObjects: response.summary.totalObjects,
      uniqueImages: response.summary.uniqueImages,
      averageWidth: response.summary.averageWidth,
      averageHeight: response.summary.averageHeight,
      averageArea: response.summary.averageArea,
      averagePositionX: response.summary.averagePositionX,
      averagePositionY: response.summary.averagePositionY,
      objectsLast30Days: response.summary.objectsLast30Days,
    };
    dto.objects = {
      total: response.objects.total,
      byDate: response.objects.byDate.map((point) => ({
        date: point.date,
        count: point.count,
      })),
    };
    dto.images = response.images.map((row) => ({
      imageId: row.imageId,
      count: row.count,
    }));
    dto.sizeBuckets = response.sizeBuckets.map((row) => ({
      bucket: row.bucket,
      count: row.count,
    }));
    dto.orientations = response.orientations.map((row) => ({
      orientation: row.orientation,
      count: row.count,
    }));
    return dto;
  }
}
