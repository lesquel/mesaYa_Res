import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('MesaYa API') // ejemplo
    .setDescription('API para la gestión de reservas y restaurantes')
    .setVersion('1.0.0')
    .addBearerAuth() // Para JWT
    .addTag('Users', 'Operaciones relacionadas con usuarios')
    .addTag('Restaurants', 'Gestión de restaurantes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
