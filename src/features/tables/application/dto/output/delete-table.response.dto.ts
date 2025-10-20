import type { TableResponseDto } from './table.response.dto.js';

export interface DeleteTableResponseDto {
  ok: boolean;
  table: TableResponseDto;
}
