import { Module } from '@nestjs/common';
import { ApiKeysServiceImpl } from './services/api-keys.service';
import { ApiKeysController } from './controllers/api-keys.controller';
import { PropertiesModule } from '../properties/properties.module';
import { PrismaService } from '../../database/prisma.service';
import { ApiKeysPrismaRepository } from './repositories/api-keys.repository';

@Module({
    imports: [PropertiesModule],
    controllers: [ApiKeysController],
    providers: [{ provide: 'ApiKeysService', useClass: ApiKeysServiceImpl }, { provide: 'ApiKeysRepository', useClass: ApiKeysPrismaRepository }, PrismaService],
    exports: ['ApiKeysService'],
})
export class ApiKeysModule {}
