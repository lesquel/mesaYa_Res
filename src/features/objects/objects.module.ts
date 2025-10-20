import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { ObjectsController } from './interface/controllers/v1/objects.controller';
import { ObjectsService } from './application/services/objects.service';
import {
  CreateGraphicObjectUseCase,
  DeleteGraphicObjectUseCase,
  FindGraphicObjectUseCase,
  ListGraphicObjectsUseCase,
  UpdateGraphicObjectUseCase,
  GRAPHIC_OBJECT_REPOSITORY,
  GRAPHIC_OBJECT_EVENT_PUBLISHER,
} from './application/index';
import { GraphicObjectOrmEntity } from './infrastructure/database/typeorm/orm/index';
import { GraphicObjectTypeOrmRepository } from './infrastructure/database/typeorm/repositories/graphic-object-typeorm.repository';
import { GraphicObjectEventNoopProvider } from './infrastructure/providers/graphic-object-event-noop.provider';

@Module({
  imports: [TypeOrmModule.forFeature([GraphicObjectOrmEntity]), AuthModule],
  controllers: [ObjectsController],
  providers: [
    {
      provide: GRAPHIC_OBJECT_REPOSITORY,
      useClass: GraphicObjectTypeOrmRepository,
    },
    {
      provide: GRAPHIC_OBJECT_EVENT_PUBLISHER,
      useClass: GraphicObjectEventNoopProvider,
    },
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
