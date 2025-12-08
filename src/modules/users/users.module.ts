import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './services/users.service';
import { UsersPrismaRepository } from './repositories/users.prisma.repository';

@Module({
    providers: [
        PrismaService,
        { provide: 'IUsersService', useClass: UsersService },
        { provide: 'IUsersRepository', useClass: UsersPrismaRepository },
    ],
    exports: ['IUsersService'],
})
export class UsersModule {}
