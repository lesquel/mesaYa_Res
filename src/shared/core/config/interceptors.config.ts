import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResponseEnvelopeInterceptor } from '@shared/interface/interceptors/response-envelope.interceptor';

export function configureInterceptors(app: INestApplication) {
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor(reflector));
}
