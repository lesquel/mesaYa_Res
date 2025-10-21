import type { GraphicObjectResponseDto } from './graphic-object.response.dto';

export interface DeleteGraphicObjectResponseDto {
  ok: boolean;
  graphicObject: GraphicObjectResponseDto;
}
