import { Module } from '@nestjs/common';
import { LOGGER } from './logger.constants';
import { WinstonLoggerAdapter } from './wiston/winstonLogger.adapter';

@Module({
  providers: [
    {
      provide: LOGGER,
      useClass: WinstonLoggerAdapter,
    },
  ],
  exports: [LOGGER],
})
export class LoggerModule {}
