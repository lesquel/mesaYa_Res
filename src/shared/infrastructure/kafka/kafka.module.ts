import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { KafkaConsumerExplorer } from './kafka.consumer.explorer.js';
import { KafkaService } from './kafka.service.js';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [KafkaService, KafkaConsumerExplorer],
  exports: [KafkaService],
})
export class KafkaModule {}
