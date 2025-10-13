import { Injectable } from '@nestjs/common';
import {
  CreateSectionCommand,
  DeleteSectionCommand,
  DeleteSectionResponseDto,
  FindSectionQuery,
  ListRestaurantSectionsQuery,
  ListSectionsQuery,
  PaginatedSectionResponse,
  SectionResponseDto,
  UpdateSectionCommand,
} from '../dto/index.js';
import {
  CreateSectionUseCase,
  DeleteSectionUseCase,
  FindSectionUseCase,
  ListRestaurantSectionsUseCase,
  ListSectionsUseCase,
  UpdateSectionUseCase,
} from '../use-cases/index.js';

@Injectable()
export class SectionsService {
  constructor(
    private readonly createSectionUseCase: CreateSectionUseCase,
    private readonly listSectionsUseCase: ListSectionsUseCase,
    private readonly listRestaurantSectionsUseCase: ListRestaurantSectionsUseCase,
    private readonly findSectionUseCase: FindSectionUseCase,
    private readonly updateSectionUseCase: UpdateSectionUseCase,
    private readonly deleteSectionUseCase: DeleteSectionUseCase,
  ) {}

  async create(command: CreateSectionCommand): Promise<SectionResponseDto> {
    return this.createSectionUseCase.execute(command);
  }

  async list(query: ListSectionsQuery): Promise<PaginatedSectionResponse> {
    return this.listSectionsUseCase.execute(query);
  }

  async listByRestaurant(
    query: ListRestaurantSectionsQuery,
  ): Promise<PaginatedSectionResponse> {
    return this.listRestaurantSectionsUseCase.execute(query);
  }

  async findOne(query: FindSectionQuery): Promise<SectionResponseDto> {
    return this.findSectionUseCase.execute(query);
  }

  async update(command: UpdateSectionCommand): Promise<SectionResponseDto> {
    return this.updateSectionUseCase.execute(command);
  }

  async delete(
    command: DeleteSectionCommand,
  ): Promise<DeleteSectionResponseDto> {
    return this.deleteSectionUseCase.execute(command);
  }
}
