import { PartialType } from '@nestjs/mapped-types';
import { CreateTableDto } from './create-table.dto.js';

export class UpdateTableDto extends PartialType(CreateTableDto) {}

export type UpdateTableCommand = UpdateTableDto & { tableId: string };
