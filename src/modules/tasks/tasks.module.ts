import { Module } from '@nestjs/common';
import { TokenService } from '../tokens/services/token.service';

@Module({
    providers:[TokenService]
})
export class TasksModule {}
