import type { SectionResponseDto } from './section.response.dto.js';

export interface DeleteSectionResponseDto {
  ok: boolean;
  section: SectionResponseDto;
}
