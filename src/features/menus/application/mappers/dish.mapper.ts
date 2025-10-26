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

    return update;
  }
}
