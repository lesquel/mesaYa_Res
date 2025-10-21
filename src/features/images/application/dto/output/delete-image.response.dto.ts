import type { ImageResponseDto } from './image.response.dto.js';

export interface DeleteImageResponseDto {
  ok: boolean;
  image: ImageResponseDto;
}
