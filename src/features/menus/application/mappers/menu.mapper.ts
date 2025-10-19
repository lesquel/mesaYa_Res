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
      imageUrl: entity.imageUrl,
      dishes,
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
      imageUrl: dto.imageUrl,
      dishes,
    });
  }

  fromCreateDtoToDomain(dto: CreateMenuDto): MenuCreate {
    const price = new MoneyVO(dto.price);

    return {
      restaurantId: dto.restaurantId,
      name: dto.name,
      description: dto.description,
      price,
      imageUrl: dto.imageUrl,
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
    if (dto.imageUrl !== undefined) update.imageUrl = dto.imageUrl;
    if (dto.dishes !== undefined) {
      update.dishes = dto.dishes.map((dishDto) =>
        this.dishMapper.fromUpdateDtoToDomain(dishDto),
      );
    }

    return update;
  }
}
