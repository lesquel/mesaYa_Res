import { applyDecorators, SetMetadata } from '@nestjs/common';
import type { ApiPaginationQueryOptions } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';

export const IS_PAGINATED_ENDPOINT = Symbol('IS_PAGINATED_ENDPOINT');

export const PaginatedEndpoint = (
  options: ApiPaginationQueryOptions = {},
): ClassDecorator & MethodDecorator =>
  applyDecorators(
    SetMetadata(IS_PAGINATED_ENDPOINT, true),
    ApiPaginationQuery(options),
  );
