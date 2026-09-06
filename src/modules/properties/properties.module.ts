import { Module } from '@nestjs/common';
import { PropertiesServiceImpl } from './services/properties.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    exports: ['PropertiesService'],
    providers: [{
        provide: 'PropertiesService',
        useClass: PropertiesServiceImpl
    }],
})
export class PropertiesModule {}
