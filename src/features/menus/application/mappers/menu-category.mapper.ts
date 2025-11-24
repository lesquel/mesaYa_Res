import { MenuCategoryEntity } from '@features/menus/domain';
import {
  MenuCategoryCreate,
  MenuCategoryUpdate,
} from '@features/menus/domain/types';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto } from '../dtos/input';
import { MenuCategoryResponseDto } from '../dtos/output';

export class MenuCategoryMapper {
  fromEntityToDTO(entity: MenuCategoryEntity): MenuCategoryResponseDto {
    return {
      categoryId: entity.id,
      restaurantId: entity.restaurantId,
      name: entity.name,
      description: entity.description ?? null,
      icon: entity.icon ?? null,
      position: entity.position ?? null,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  fromCreateDtoToDomain(dto: CreateMenuCategoryDto): MenuCategoryCreate {
    return {
      restaurantId: dto.restaurantId,
      name: dto.name,
      description: dto.description ?? null,
      icon: dto.icon ?? null,
      position: dto.position ?? null,
      isActive: dto.isActive ?? true,
    };
  }

  fromUpdateDtoToDomain(dto: UpdateMenuCategoryDto): MenuCategoryUpdate {
    const update: MenuCategoryUpdate = {
      categoryId: dto.categoryId,
    };

    if (dto.name !== undefined) {
      update.name = dto.name;
    }

    if (dto.description !== undefined) {
      update.description = dto.description;
    }

    if (dto.icon !== undefined) {
      update.icon = dto.icon;
    }

    if (dto.position !== undefined) {
      update.position = dto.position;
    }

    if (dto.isActive !== undefined) {
      update.isActive = dto.isActive;
    }

    return update;
  }
}
