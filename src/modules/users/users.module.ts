import { Global, Module } from '@nestjs/common';
import { UsersServiceImpl } from './services/users.service';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';
import { UsersController } from './controllers/users.controller';

@Global()
@Module({
    controllers:[UsersController],
    providers: [
        { provide: 'UsersService', useClass: UsersServiceImpl },
        { provide: 'UsersRepository', useClass: PrismaUsersRepository },
    ],
    exports: ['UsersService'],
})
export class UsersModule {}
