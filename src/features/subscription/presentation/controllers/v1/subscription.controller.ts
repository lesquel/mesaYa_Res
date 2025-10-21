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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { SubscriptionService } from '@features/subscription/application';
import type {
  SubscriptionResponseDto,
  SubscriptionListResponseDto,
  DeleteSubscriptionDto,
  DeleteSubscriptionResponseDto,
} from '@features/subscription/application';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import {
  CreateSubscriptionRequestDto,
  DeleteSubscriptionResponseSwaggerDto,
  SubscriptionResponseSwaggerDto,
  UpdateSubscriptionRequestDto,
  UpdateSubscriptionStateRequestDto,
} from '@features/subscription/presentation/dto/index';

@ApiTags('Subscriptions')
@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create subscription' })
  @ApiBody({ type: CreateSubscriptionRequestDto })
  @ApiCreatedResponse({
    description: 'Subscription successfully created',
    type: SubscriptionResponseSwaggerDto,
  })
  async createSubscription(
    @Body() dto: CreateSubscriptionRequestDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List subscriptions' })
  @PaginatedEndpoint()
  @ApiOkResponse({
    description: 'Array of subscriptions',
    type: SubscriptionResponseSwaggerDto,
    isArray: true,
  })
  async getSubscriptions(
    @PaginationParams() params: PaginatedQueryParams,
  ): Promise<SubscriptionListResponseDto> {
    return this.subscriptionService.findAll(params);
  }

  @Get(':subscriptionId')
  @ApiOperation({ summary: 'Find subscription by ID' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Subscription details',
    type: SubscriptionResponseSwaggerDto,
  })
  async getSubscriptionById(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findById({ subscriptionId });
  }

  @Patch(':subscriptionId')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateSubscriptionRequestDto })
  @ApiOkResponse({
    description: 'Subscription updated',
    type: SubscriptionResponseSwaggerDto,
  })
  async updateSubscription(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: UpdateSubscriptionRequestDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.update({
      ...dto,
      subscriptionId,
    });
  }

  @Patch(':subscriptionId/state')
  @ApiOperation({ summary: 'Update subscription state' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateSubscriptionStateRequestDto })
  @ApiOkResponse({
    description: 'Subscription state updated',
    type: SubscriptionResponseSwaggerDto,
  })
  async updateSubscriptionState(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: UpdateSubscriptionStateRequestDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.updateState({
      ...dto,
      subscriptionId,
    });
  }

  @Delete(':subscriptionId')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Subscription deleted',
    type: DeleteSubscriptionResponseSwaggerDto,
  })
  async deleteSubscription(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ): Promise<DeleteSubscriptionResponseDto> {
    const dto: DeleteSubscriptionDto = { subscriptionId };
    return this.subscriptionService.delete(dto);
  }
}
