import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import {
  SubscriptionCreationFailedError,
  SubscriptionNotFoundError,
  SubscriptionPlanInactiveError,
  SubscriptionPlanNotFoundError,
  SubscriptionRestaurantNotFoundError,
} from '@features/subscription/domain';
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
    try {
      return await this.subscriptionService.create(dto);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List subscriptions' })
  @PaginatedEndpoint()
  async getSubscriptions(
    @PaginationParams() params: PaginatedQueryParams,
  ): Promise<SubscriptionListResponseDto> {
    try {
      return await this.subscriptionService.findAll(params);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':subscriptionId')
  @ApiOperation({ summary: 'Find subscription by ID' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  async getSubscriptionById(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ): Promise<SubscriptionResponseDto> {
    try {
      return await this.subscriptionService.findById({ subscriptionId });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':subscriptionId')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  async updateSubscription(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: Omit<UpdateSubscriptionDto, 'subscriptionId'>,
  ): Promise<SubscriptionResponseDto> {
    try {
      return await this.subscriptionService.update({
        ...dto,
        subscriptionId,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':subscriptionId/state')
  @ApiOperation({ summary: 'Update subscription state' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  async updateSubscriptionState(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: Omit<UpdateSubscriptionStateDto, 'subscriptionId'>,
  ): Promise<SubscriptionResponseDto> {
    try {
      return await this.subscriptionService.updateState({
        ...dto,
        subscriptionId,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':subscriptionId')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiParam({ name: 'subscriptionId', type: 'string', format: 'uuid' })
  async deleteSubscription(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ): Promise<DeleteSubscriptionResponseDto> {
    try {
      const dto: DeleteSubscriptionDto = { subscriptionId };
      return await this.subscriptionService.delete(dto);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof SubscriptionNotFoundError) {
      throw new NotFoundException(error.message);
    }

    if (
      error instanceof SubscriptionPlanNotFoundError ||
      error instanceof SubscriptionRestaurantNotFoundError
    ) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof SubscriptionPlanInactiveError) {
      throw new ConflictException(error.message);
    }

    if (error instanceof SubscriptionCreationFailedError) {
      throw new BadRequestException(error.message);
    }

    throw error as Error;
  }
}
