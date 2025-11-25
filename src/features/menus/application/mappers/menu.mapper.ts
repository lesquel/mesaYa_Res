import { EntityDTOMapper } from '@shared/application/mappers/abstract-domain-dto.mapper';
import { MoneyVO } from '@shared/domain/entities/values';
import {
  MenuEntity,
  DishEntity,
  MenuCreate,
  MenuUpdate,
} from '@features/menus/domain';
import { CreateMenuDto, UpdateMenuDto, MenuDto } from '../dtos';
import { DishMapper } from './dish.mapper';

export class MenuMapper extends EntityDTOMapper<MenuEntity, MenuDto> {
  constructor(private readonly dishMapper: DishMapper) {
    super();
  }

  fromEntitytoDTO(entity: MenuEntity): MenuDto {
    const dishes = entity.dishes?.map((dishSnapshot) =>
      this.dishMapper.fromEntitytoDTO(DishEntity.rehydrate(dishSnapshot)),
    );

    return {
      menuId: entity.id,
      restaurantId: entity.restaurantId,
      name: entity.name,
      description: entity.description,
      price: entity.price.amount,
      imageId: entity.imageId,
      dishes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  fromDTOtoEntity(dto: MenuDto): MenuEntity {
    const price = new MoneyVO(dto.price);
    const dishes = dto.dishes?.map((dishDto) =>
      this.dishMapper.fromDTOtoEntity(dishDto).snapshot(),
    );

    return MenuEntity.create(dto.menuId ?? '', {
      restaurantId: dto.restaurantId,
      name: dto.name,
      description: dto.description,
      price,
      imageId: dto.imageId,
      dishes,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }

  fromCreateDtoToDomain(dto: CreateMenuDto): MenuCreate {
    const price = new MoneyVO(dto.price);

    return {
      restaurantId: dto.restaurantId,
      name: dto.name,
      description: dto.description,
      price,
      imageId: dto.imageId ?? null,
      dishes: dto.dishes?.map((dishDto) =>
        this.dishMapper.fromCreateDtoToDomain(dishDto),
      ),
    };
  }

  fromUpdateDtoToDomain(dto: UpdateMenuDto): MenuUpdate {
    const update: MenuUpdate = {
      menuId: dto.menuId,
    };

    if (dto.name !== undefined) update.name = dto.name;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.price !== undefined) update.price = new MoneyVO(dto.price);
    if (dto.imageId !== undefined) update.imageId = dto.imageId;
    if (dto.dishes !== undefined) {
      update.dishes = dto.dishes.map((dishDto) =>
        this.dishMapper.fromUpdateDtoToDomain(dishDto),
      );
    }

    return update;
  }
}
