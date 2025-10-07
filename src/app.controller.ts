import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Información de la API')
@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getInfo() {
    const API_TITLE = this.configService.get<string>('APP_TITLE');
    const API_DESCRIPTION = this.configService.get<string>('APP_DESCRIPTION');
    const API_VERSION = this.configService.get<string>('APP_VERSION');

    return {
      name: API_TITLE,
      description: API_DESCRIPTION,
      version: API_VERSION,
      docs: '/docs/api',
    };
  }
}
