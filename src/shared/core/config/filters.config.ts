import { INestApplication } from '@nestjs/common';
import { DomainExceptionFilter } from '@shared/interface/filters/domain-exception.filter';

export function configureFilters(app: INestApplication) {
  app.useGlobalFilters(new DomainExceptionFilter());
}
