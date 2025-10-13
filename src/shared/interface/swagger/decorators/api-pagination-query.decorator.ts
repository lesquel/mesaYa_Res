import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export interface ApiPaginationQueryOptions {
  allowSearch?: boolean;
}

/**
 * Centraliza la documentación Swagger para parámetros de paginación en endpoints GET.
 * Reutiliza el mismo conjunto de consultas (`page`, `offset`, `limit`, `sortBy`, `sortOrder`, `q`).
 */
export const ApiPaginationQuery = (
  options: ApiPaginationQueryOptions = {},
): ClassDecorator & MethodDecorator => {
  const decorators: Array<ClassDecorator | MethodDecorator> = [
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Número de página (1-based)',
    }),
    ApiQuery({
      name: 'offset',
      required: false,
      type: Number,
      example: 0,
      description: 'Desplazamiento opcional para paginación basada en offset',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Cantidad de elementos por página (1-100)',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      example: 'createdAt',
      description: 'Campo por el cual ordenar los resultados',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: ['ASC', 'DESC'],
      example: 'ASC',
      description: 'Dirección del ordenamiento',
    }),
  ];

  if (options.allowSearch !== false) {
    decorators.push(
      ApiQuery({
        name: 'q',
        required: false,
        type: String,
        example: 'pizza',
        description: 'Texto de búsqueda libre',
      }),
    );
  }

  return applyDecorators(...decorators);
};
