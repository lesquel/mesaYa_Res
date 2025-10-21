import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { KafkaConsumerExplorer } from './kafka.consumer.explorer';
import { KafkaService } from './kafka.service';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [KafkaService, KafkaConsumerExplorer],
  exports: [KafkaService],
})
export class KafkaModule {}
