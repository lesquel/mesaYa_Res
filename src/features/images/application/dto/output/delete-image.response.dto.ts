import type { ImageResponseDto } from './image.response.dto';

export interface DeleteImageResponseDto {
  ok: boolean;
  image: ImageResponseDto;
}
