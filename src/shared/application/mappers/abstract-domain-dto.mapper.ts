export abstract class EntityDTOMapper<Entity, DTO> {
  abstract fromEntitytoDTO(entity: Entity): DTO;
  abstract fromDTOtoEntity(dto: DTO): Entity;

  fromEntitytoDTOList(entities: Entity[]): DTO[] {
    return entities.map((entity) => this.fromEntitytoDTO(entity));
  }

  fromDTOtoEntityList(dtos: DTO[]): Entity[] {
    return dtos.map((dto) => this.fromDTOtoEntity(dto));
  }
}
