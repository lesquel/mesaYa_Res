import { Injectable } from '@nestjs/common';
import { CreateSectionObjectCommand, DeleteSectionObjectCommand, FindSectionObjectQuery, ListSectionObjectsQuery, SectionObjectResponseDto, DeleteSectionObjectResponseDto } from '../dto/index.js';
import { CreateSectionObjectUseCase, DeleteSectionObjectUseCase, FindSectionObjectUseCase, ListByObjectUseCase, ListBySectionUseCase, ListSectionObjectsUseCase, UpdateSectionObjectUseCase } from '../use-cases/index.js';
import { PaginatedSectionObjectResponse } from '../use-cases/list-section-objects.use-case.js';

@Injectable()
export class SectionObjectsService {
  constructor(
    private readonly createUseCase: CreateSectionObjectUseCase,
    private readonly listUseCase: ListSectionObjectsUseCase,
    private readonly listBySectionUseCase: ListBySectionUseCase,
    private readonly listByObjectUseCase: ListByObjectUseCase,
    private readonly findUseCase: FindSectionObjectUseCase,
    private readonly updateUseCase: UpdateSectionObjectUseCase,
    private readonly deleteUseCase: DeleteSectionObjectUseCase,
  ) {}

  create(command: CreateSectionObjectCommand): Promise<SectionObjectResponseDto> { return this.createUseCase.execute(command); }
  list(query: ListSectionObjectsQuery): Promise<PaginatedSectionObjectResponse> { return this.listUseCase.execute(query); }
  listBySection(sectionId: string, query: ListSectionObjectsQuery): Promise<PaginatedSectionObjectResponse> { return this.listBySectionUseCase.execute({ sectionId, ...query }); }
  listByObject(objectId: string, query: ListSectionObjectsQuery): Promise<PaginatedSectionObjectResponse> { return this.listByObjectUseCase.execute({ objectId, ...query }); }
  findOne(query: FindSectionObjectQuery): Promise<SectionObjectResponseDto> { return this.findUseCase.execute(query); }
  update(command: any): Promise<SectionObjectResponseDto> { return this.updateUseCase.execute(command); }
  delete(command: DeleteSectionObjectCommand): Promise<DeleteSectionObjectResponseDto> { return this.deleteUseCase.execute(command); }
}
