import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { RolesGuard } from '@features/auth/interface/guards/roles.guard';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
import { OwnerUpgradeDecisionDto } from '../../dto/owner-upgrade-decision.dto';
import { OwnerUpgradeResponseDto } from '../../dto/owner-upgrade-response.dto';
import { OwnerUpgradeService } from '@features/owner-upgrade/application/services/owner-upgrade.service';
import { Roles } from '@features/auth/interface/decorators/roles.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  ListOwnerUpgradeRequestsQuery,
  PaginatedOwnerUpgradeResponse,
} from '@features/owner-upgrade/application/dto';
import { OwnerUpgradeRequestStatus } from '@features/owner-upgrade/domain/owner-upgrade-request-status.enum';

@ApiTags('owners')
@Controller({ path: 'owners', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminOwnerUpgradeController {
  constructor(private readonly ownerUpgradeService: OwnerUpgradeService) {}

  @Get('upgrade-requests')
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Listar solicitudes de upgrade de owner (ADMIN)' })
  @ApiBearerAuth()
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: OwnerUpgradeResponseDto,
    description: 'Listado paginado de solicitudes de upgrade',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OwnerUpgradeRequestStatus,
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  async listUpgradeRequests(
    @PaginationParams({
      defaultRoute: '/owners/upgrade-requests',
      allowExtraParams: true,
    })
    pagination: PaginatedQueryParams,
    @Query() raw: Record<string, unknown>,
  ): Promise<PaginatedOwnerUpgradeResponse> {
    const query: ListOwnerUpgradeRequestsQuery = { ...pagination };

    if (typeof raw.status === 'string') {
      const normalized = raw.status.toUpperCase() as OwnerUpgradeRequestStatus;
      if (Object.values(OwnerUpgradeRequestStatus).includes(normalized)) {
        query.status = normalized;
      }
    }

    if (typeof raw.userId === 'string' && raw.userId.trim()) {
      query.userId = raw.userId.trim();
    }

    return this.ownerUpgradeService.listRequests(query);
  }

  @Get('upgrade-requests/:requestId')
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Obtiene detalle de solicitud de upgrade (ADMIN)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'requestId', description: 'UUID de la solicitud' })
  async getUpgradeRequest(
    @Param('requestId', ParseUUIDPipe) requestId: string,
  ): Promise<OwnerUpgradeResponseDto> {
    return this.ownerUpgradeService.findRequestById(requestId);
  }

  @Patch(':ownerId/approve')
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Aprueba o rechaza solicitudes de owner' })
  @ApiResponse({ type: OwnerUpgradeResponseDto })
  async approve(
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
    @Body() decision: OwnerUpgradeDecisionDto,
    @CurrentUser() admin: CurrentUserPayload,
  ): Promise<OwnerUpgradeResponseDto> {
    return this.ownerUpgradeService.process(ownerId, decision, admin.userId);
  }
}
