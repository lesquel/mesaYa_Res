import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller({ path: 'seed', version: '1' })
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  // Note: Auth seeding (auth-only endpoint) has been removed.
  // Auth data (users, roles, permissions) is now seeded by Auth MS on startup.

  @Get()
  @ApiOperation({
    summary: 'Ejecutar seeding de la base de datos',
    description:
      'Popula la base de datos con datos de negocio (suscripciones, restaurantes, menús, etc.). ' +
      'Nota: Los datos de autenticación (usuarios, roles, permisos) son sembrados por el Auth MS.',
  })
  @ApiResponse({
    status: 200,
    description: 'Seed ejecutado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Database seeded successfully' },
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error al ejecutar el seed',
  })
  async execute(): Promise<{ message: string; success: boolean }> {
    return await this.seedService.execute();
  }
}
