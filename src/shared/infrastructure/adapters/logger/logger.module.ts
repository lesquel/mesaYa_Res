import { Module } from '@nestjs/common';
import { LOGGER } from './logger.constants';
import { WinstonLoggerAdapter } from './wiston/winstonLogger.adapter';
// Nota: la carpeta se llama `wiston/` por compatibilidad histórica del proyecto.
// Mantener el nombre evita cambiar rutas en múltiples archivos en esta limpieza.
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logger.interceptor';
import { ILoggerPort } from '@shared/application/ports/logger.port';

@Module({
  providers: [
    {
      provide: LOGGER,
      useClass: WinstonLoggerAdapter,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (logger: ILoggerPort) => new LoggingInterceptor(logger),
      inject: [LOGGER],
    },
  ],
  exports: [LOGGER],
})
export class LoggerModule {}
