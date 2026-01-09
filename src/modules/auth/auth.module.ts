import { Module } from '@nestjs/common';
import { AuthServiceImpl } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [{ provide: 'AuthService', useClass: AuthServiceImpl }],
    exports: ['AuthService'],
})
export class AuthModule {}
