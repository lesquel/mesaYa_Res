import type { TableResponseDto } from './table.response.dto';

export interface DeleteTableResponseDto {
  ok: boolean;
  table: TableResponseDto;
}
