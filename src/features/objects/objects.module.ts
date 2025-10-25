import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { ObjectsService } from './application/services/objects.service';
import {
  CreateGraphicObjectUseCase,
  DeleteGraphicObjectUseCase,
  FindGraphicObjectUseCase,
  ListGraphicObjectsUseCase,
  UpdateGraphicObjectUseCase,
  GRAPHIC_OBJECT_REPOSITORY,
  GRAPHIC_OBJECT_EVENT_PUBLISHER,
  GetGraphicObjectAnalyticsUseCase,
  GRAPHIC_OBJECT_ANALYTICS_REPOSITORY,
} from './application';
import { GraphicObjectOrmEntity } from './infrastructure/database/typeorm/orm';
import {
  GraphicObjectTypeOrmRepository,
  GraphicObjectAnalyticsTypeOrmRepository,
} from './infrastructure/database/typeorm/repositories';
import { GraphicObjectEventNoopProvider } from './infrastructure/providers/graphic-object-event-noop.provider';
import {
  GraphicObjectDomainService,
  IGraphicObjectDomainRepositoryPort,
} from './domain';
import {
  AdminObjectsController,
  PublicObjectsController,
} from './interface/controllers/v1';

@Module({
  imports: [TypeOrmModule.forFeature([GraphicObjectOrmEntity]), AuthModule],
  controllers: [AdminObjectsController, PublicObjectsController],
  providers: [
    GraphicObjectTypeOrmRepository,
    GraphicObjectEventNoopProvider,
    {
      provide: GRAPHIC_OBJECT_REPOSITORY,
      useExisting: GraphicObjectTypeOrmRepository,
    },
    {
      provide: GRAPHIC_OBJECT_EVENT_PUBLISHER,
      useExisting: GraphicObjectEventNoopProvider,
    },
    {
      provide: GRAPHIC_OBJECT_ANALYTICS_REPOSITORY,
      useClass: GraphicObjectAnalyticsTypeOrmRepository,
    },
    {
      provide: IGraphicObjectDomainRepositoryPort,
      useExisting: GraphicObjectTypeOrmRepository,
    },
    {
      provide: GraphicObjectDomainService,
      useFactory: (repository: IGraphicObjectDomainRepositoryPort) =>
        new GraphicObjectDomainService(repository),
      inject: [IGraphicObjectDomainRepositoryPort],
    },
    CreateGraphicObjectUseCase,
    ListGraphicObjectsUseCase,
    FindGraphicObjectUseCase,
    UpdateGraphicObjectUseCase,
    DeleteGraphicObjectUseCase,
    GetGraphicObjectAnalyticsUseCase,
    ObjectsService,
  ],
  exports: [
    CreateGraphicObjectUseCase,
    ListGraphicObjectsUseCase,
    FindGraphicObjectUseCase,
    UpdateGraphicObjectUseCase,
    DeleteGraphicObjectUseCase,
    GetGraphicObjectAnalyticsUseCase,
    ObjectsService,
    GRAPHIC_OBJECT_REPOSITORY,
  ],
})
export class ObjectsModule {}
