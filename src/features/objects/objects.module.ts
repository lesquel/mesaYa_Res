import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module.js';
import { ObjectsController } from './interface/controllers/objects.controller.js';
import { ObjectsService } from './application/services/objects.service.js';
import {
  CreateGraphicObjectUseCase,
  DeleteGraphicObjectUseCase,
  FindGraphicObjectUseCase,
  ListGraphicObjectsUseCase,
  UpdateGraphicObjectUseCase,
  GRAPHIC_OBJECT_REPOSITORY,
  GRAPHIC_OBJECT_EVENT_PUBLISHER,
} from './application/index.js';
import {
  GraphicObjectOrmEntity,
} from './infrastructure/database/typeorm/orm/index.js';
import { GraphicObjectTypeOrmRepository } from './infrastructure/database/typeorm/repositories/graphic-object-typeorm.repository.js';
import { GraphicObjectEventNoopProvider } from './infrastructure/providers/graphic-object-event-noop.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([GraphicObjectOrmEntity]), AuthModule],
  controllers: [ObjectsController],
  providers: [
    { provide: GRAPHIC_OBJECT_REPOSITORY, useClass: GraphicObjectTypeOrmRepository },
    { provide: GRAPHIC_OBJECT_EVENT_PUBLISHER, useClass: GraphicObjectEventNoopProvider },
    CreateGraphicObjectUseCase,
    ListGraphicObjectsUseCase,
    FindGraphicObjectUseCase,
    UpdateGraphicObjectUseCase,
    DeleteGraphicObjectUseCase,
    ObjectsService,
  ],
  exports: [
    CreateGraphicObjectUseCase,
    ListGraphicObjectsUseCase,
    FindGraphicObjectUseCase,
    UpdateGraphicObjectUseCase,
    DeleteGraphicObjectUseCase,
    ObjectsService,
  ],
})
export class ObjectsModule {}
