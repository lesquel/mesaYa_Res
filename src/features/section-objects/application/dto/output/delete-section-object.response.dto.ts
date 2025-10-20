import type { SectionObjectResponseDto } from './section-object.response.dto.js';

export interface DeleteSectionObjectResponseDto {
  ok: boolean;
  sectionObject: SectionObjectResponseDto;
}
