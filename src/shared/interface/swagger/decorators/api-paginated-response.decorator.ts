import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export interface ApiPaginatedResponseOptions {
  model: Type<unknown>;
  description?: string;
}

const buildPaginationSchema = (model: Type<unknown>) => ({
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: { $ref: getSchemaPath(model) },
    },
    total: { type: 'number', example: 20 },
    page: { type: 'number', example: 1 },
    limit: { type: 'number', example: 10 },
    offset: { type: 'number', example: 0 },
    pages: { type: 'number', example: 2 },
    hasNext: { type: 'boolean', example: false },
    hasPrev: { type: 'boolean', example: false },
    links: {
      type: 'object',
      nullable: true,
      properties: {
        self: { type: 'string', example: '/api/v1/resource?page=1' },
        next: { type: 'string', nullable: true, example: null },
        prev: { type: 'string', nullable: true, example: null },
        first: { type: 'string', example: '/api/v1/resource?page=1' },
        last: { type: 'string', example: '/api/v1/resource?page=2' },
      },
    },
  },
  required: [
    'results',
    'total',
    'page',
    'limit',
    'offset',
    'pages',
    'hasNext',
    'hasPrev',
  ],
});

export const ApiPaginatedResponse = (
  options: ApiPaginatedResponseOptions,
): ClassDecorator & MethodDecorator => {
  const { model, description } = options;

  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description,
      schema: buildPaginationSchema(model),
    }),
  );
};
