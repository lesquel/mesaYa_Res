import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import { OwnerUpgradeService } from '@features/owner-upgrade/application/services/owner-upgrade.service';
import { OwnerUpgradeRequestDto } from '../../dto/owner-upgrade-request.dto';
import { OwnerUpgradeResponseDto } from '../../dto/owner-upgrade-response.dto';

@ApiTags('owners')
@Controller({ path: 'owners/apply', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OwnerUpgradeController {
  constructor(private readonly ownerUpgradeService: OwnerUpgradeService) {}

  @Post()
  @ApiOperation({ summary: 'Solicita upgrade de usuario a owner' })
  @ApiCreatedResponse({ type: OwnerUpgradeResponseDto })
  async apply(
    @Body() dto: OwnerUpgradeRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<OwnerUpgradeResponseDto> {
    return this.ownerUpgradeService.apply(dto, user.userId);
  }
}
