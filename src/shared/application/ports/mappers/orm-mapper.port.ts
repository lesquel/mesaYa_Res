export abstract class OrmMapperPort<Domain, Orm> {
  abstract toDomain(orm: Orm): Domain;
  abstract toOrm(domain: Domain): Orm;

  toDomainList(orms: Orm[]): Domain[] {
    return orms.map((orm) => this.toDomain(orm));
  }

  toOrmList(domains: Domain[]): Orm[] {
    return domains.map((domain) => this.toOrm(domain));
  }
}
