import type { SectionResponseDto } from './section.response.dto';

export interface DeleteSectionResponseDto {
  ok: boolean;
  section: SectionResponseDto;
}
