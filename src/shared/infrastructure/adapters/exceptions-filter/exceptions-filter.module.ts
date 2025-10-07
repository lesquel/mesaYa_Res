import { Module } from '@nestjs/common';
import { AllExceptionsFilter } from './exceptions-filter';
import { LoggerModule } from '../logger/logger.module';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class ExceptionsFilterModule {}
