import { Injectable } from '@nestjs/common';
import { IUsersRepository } from './users.repository.interface';
import { UserModel } from '../models/user.model';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersPrismaRepository implements IUsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByEmail(email: string): Promise<UserModel | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        return user;
    }

    async findById(id: string): Promise<UserModel | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        return user;
    }

    async create(user: CreateUserDto): Promise<UserModel> {
        const newUser = await this.prisma.user.create({
            data: user,
        });
        return newUser;
    }

    async emailExists(email: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { email },
        });
        return count > 0;
    }
}
