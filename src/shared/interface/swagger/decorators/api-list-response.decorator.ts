import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export interface ApiListResponseOptions {
  model: Type<unknown>;
  description?: string;
}

const buildListSchema = (model: Type<unknown>) => ({
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
        totalPages: { type: 'number', example: 5 },
        totalItems: { type: 'number', example: 42 },
      },
      required: ['page', 'pageSize', 'totalPages', 'totalItems'],
    },
  },
  required: ['data', 'pagination'],
});

export const ApiListResponse = (
  options: ApiListResponseOptions,
): ClassDecorator & MethodDecorator => {
  const { model, description } = options;
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({ description, schema: buildListSchema(model) }),
  );
};
