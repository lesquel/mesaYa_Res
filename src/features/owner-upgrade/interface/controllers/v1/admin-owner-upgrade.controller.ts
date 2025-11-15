import {
  Body,
  Controller,
  Param,
  Patch,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { RolesGuard } from '@features/auth/interface/guards/roles.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import { OwnerUpgradeDecisionDto } from '../../dto/owner-upgrade-decision.dto';
import { OwnerUpgradeResponseDto } from '../../dto/owner-upgrade-response.dto';
import { OwnerUpgradeService } from '@features/owner-upgrade/application/services/owner-upgrade.service';
import { Roles } from '@features/auth/interface/decorators/roles.decorator';

@ApiTags('owners')
@Controller({ path: 'owners', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminOwnerUpgradeController {
  constructor(private readonly ownerUpgradeService: OwnerUpgradeService) {}

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
