import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export interface ApiPaginatedResponseOptions {
  model: Type<unknown>;
  description?: string;
}

const buildPaginationSchema = (model: Type<unknown>) => ({
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: { $ref: getSchemaPath(model) },
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'number', example: 1 },
        pageSize: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 2 },
        totalItems: { type: 'number', example: 20 },
        hasNext: { type: 'boolean', example: false },
        hasPrev: { type: 'boolean', example: false },
        offset: { type: 'number', example: 0 },
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
      required: ['page', 'pageSize', 'totalPages', 'totalItems'],
    },
  },
  required: ['data', 'pagination'],
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
