import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SubscriptionService } from '@features/subscription/application';
import type {
  CreateSubscriptionDto,
  SubscriptionResponseDto,
  SubscriptionListResponseDto,
  UpdateSubscriptionDto,
  UpdateSubscriptionStateDto,
  DeleteSubscriptionDto,
  DeleteSubscriptionResponseDto,
} from '@features/subscription/application';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';

@ApiTags('Subscriptions')
@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create subscription' })
  async createSubscription(
    @Body() dto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List subscriptions' })
  @PaginatedEndpoint()
  async getSubscriptions(
    @PaginationParams() params: PaginatedQueryParams,
  ): Promise<SubscriptionListResponseDto> {
    return this.subscriptionService.findAll(params);
  }

  @Get(':subscriptionId')
  @ApiOperation({ summary: 'Find subscription by ID' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  async getSubscriptionById(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findById({ subscriptionId });
  }

  @Patch(':subscriptionId')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  async updateSubscription(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: Omit<UpdateSubscriptionDto, 'subscriptionId'>,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.update({
      ...dto,
      subscriptionId,
    });
  }

  @Patch(':subscriptionId/state')
  @ApiOperation({ summary: 'Update subscription state' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  async updateSubscriptionState(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: Omit<UpdateSubscriptionStateDto, 'subscriptionId'>,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.updateState({
      ...dto,
      subscriptionId,
    });
  }

  @Delete(':subscriptionId')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  async deleteSubscription(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ): Promise<DeleteSubscriptionResponseDto> {
    const dto: DeleteSubscriptionDto = { subscriptionId };
    return this.subscriptionService.delete(dto);
  }
}
