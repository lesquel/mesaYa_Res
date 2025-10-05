import { PartialType } from '@nestjs/mapped-types';
import { CreateSectionDto } from './create-section.dto.js';

export class UpdateSectionDto extends PartialType(CreateSectionDto) {}

export type UpdateSectionCommand = UpdateSectionDto & {
  sectionId: string;
};
