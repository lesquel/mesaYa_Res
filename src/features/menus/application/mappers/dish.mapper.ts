import { EntityDTOMapper } from '@shared/application/mappers/abstract-domain-dto.mapper';
import { MoneyVO } from '@shared/domain/entities/values';
import { DishEntity, DishCreate, DishUpdate } from '@features/menus/domain';
import { CreateDishDto, UpdateDishDto, DishDto } from '../dtos';

export class DishMapper extends EntityDTOMapper<DishEntity, DishDto> {
  fromEntitytoDTO(entity: DishEntity): DishDto {
    return {
      dishId: entity.id,
      restaurantId: entity.restaurantId,
      name: entity.name,
      description: entity.description,
      price: entity.price.amount,
      imageId: entity.imageId ?? undefined,
      menuId: entity.menuId ?? undefined,
      categoryId: entity.categoryId ?? null,
      categoryName: entity.categoryName ?? null,
      categoryDescription: entity.categoryDescription ?? null,
      categoryOrder: entity.categoryOrder ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  fromDTOtoEntity(dto: DishDto): DishEntity {
    const price = new MoneyVO(dto.price);

    return DishEntity.create(dto.dishId ?? '', {
      restaurantId: dto.restaurantId,
      name: dto.name,
      description: dto.description,
      price,
      imageId: dto.imageId ?? undefined,
      menuId: dto.menuId ?? undefined,
      categoryId: dto.categoryId ?? undefined,
      categoryName: dto.categoryName ?? undefined,
      categoryDescription: dto.categoryDescription ?? undefined,
      categoryOrder: dto.categoryOrder ?? undefined,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }

  fromCreateDtoToDomain(dto: CreateDishDto): DishCreate {
    const price = new MoneyVO(dto.price);

    return {
      restaurantId: dto.restaurantId,
      name: dto.name,
      description: dto.description,
      price,
      imageId: dto.imageId,
      menuId: dto.menuId,
      categoryId: dto.categoryId,
      categoryName: dto.categoryName,
      categoryDescription: dto.categoryDescription,
      categoryOrder: dto.categoryOrder,
    };
  }

  fromUpdateDtoToDomain(dto: UpdateDishDto): DishUpdate {
    const update: DishUpdate = {
      dishId: dto.dishId,
    };

    if (dto.name !== undefined) update.name = dto.name;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.price !== undefined) update.price = new MoneyVO(dto.price);
    if (dto.imageId !== undefined) update.imageId = dto.imageId;
    if (dto.menuId !== undefined) update.menuId = dto.menuId;
    if (dto.categoryId !== undefined) update.categoryId = dto.categoryId;
    if (dto.categoryName !== undefined) update.categoryName = dto.categoryName;
    if (dto.categoryDescription !== undefined)
      update.categoryDescription = dto.categoryDescription;
    if (dto.categoryOrder !== undefined) update.categoryOrder = dto.categoryOrder;

    return update;
  }
}
