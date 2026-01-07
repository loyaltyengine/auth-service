import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersServiceImpl } from './services/users.service';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';

@Module({
    providers: [
        PrismaService,
        { provide: 'UsersService', useClass: UsersServiceImpl },
        { provide: 'UsersRepository', useClass: PrismaUsersRepository },
    ],
    exports: ['UsersService'],
})
export class UsersModule {}
