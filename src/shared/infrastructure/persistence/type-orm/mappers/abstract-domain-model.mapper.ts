export abstract class DomainORMMapper<Domain, ORM> {
  abstract toORM(domain: Domain): ORM;
  abstract toDomain(orm: ORM): Domain;

  toORMList(domains: Domain[]): ORM[] {
    return domains.map((d) => this.toORM(d));
  }

  toDomainList(orms: ORM[]): Domain[] {
    return orms.map((o) => this.toDomain(o));
  }
}
