import type { GraphicObjectResponseDto } from './graphic-object.response.dto.js';

export interface DeleteGraphicObjectResponseDto {
  ok: boolean;
  graphicObject: GraphicObjectResponseDto;
}
