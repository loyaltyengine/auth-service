import { Module } from '@nestjs/common';
import { PropertiesService } from './services/properties.service';

@Module({
    exports: [PropertiesService],
    providers: [PropertiesService],
})
export class PropertiesModule {}
