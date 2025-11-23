import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThrottleRead } from '@shared/infrastructure/decorators';

/**
 * Handles legacy or mistaken calls to /public/restaurants/reservations so they
 * no longer hit the dynamic :id route and trigger UUID validation errors.
 * The actual reservations resources live under /public/reservations.
 */
@ApiTags('Restaurants - Public')
@Controller({ path: 'public/restaurants/reservations', version: '1' })
export class PublicRestaurantReservationsController {
  @Get()
  @ThrottleRead()
  @ApiOperation({
    summary: 'Legacy alias for public reservations endpoint',
    description:
      'Guides clients to use /api/v1/public/reservations instead of the restaurants detail route.',
  })
  handleLegacyPath(): never {
    throw new NotFoundException({
      message: 'Use /api/v1/public/reservations for reservation resources',
      movedTo: '/api/v1/public/reservations',
    });
  }
}
