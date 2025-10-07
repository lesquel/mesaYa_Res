export abstract class DomainDTOMapper<Entity, DTO> {
  abstract toDTO(entity: Entity): DTO;
  abstract toDomain(dto: DTO): Entity;

  toDTOList(entities: Entity[]): DTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }

  toDomainList(dtos: DTO[]): Entity[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
