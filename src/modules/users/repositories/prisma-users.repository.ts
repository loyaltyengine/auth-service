import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users-repository.interface';
import { UserModel } from '../models/user.model';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { CreateUserData } from './types/create-user.data';
import { EmailModel } from '../models/email.model';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByEmail(email: string): Promise<UserModel | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                emails: {
                    some: {
                        email: email,
                    }
                }
            },
            include: {
                emails: true // return user with emails
            }
        });
        return user;
    }

    async findById(id: string): Promise<UserModel | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                emails: true,
            },
        });
        return user;
    }

    async create(data: CreateUserData): Promise<UserModel> {
        const newUser = await this.prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                emails: {
                    create: {
                        email: data.email,
                        isVerified: data.isEmailVerified,
                        isPrimary: data.isEmailPrimary,
                    },
                },
                password: data.password,
            },
            include: {
                emails: true,
            },
        });
        return newUser;
    }

    async emailExists(email: string): Promise<boolean> {
        const count = await this.prisma.email.count({
            where: { email },
        });
        return count > 0;
    }

    async findEmailByAddress(email: string): Promise<EmailModel | null> {
        const emailRecord = await this.prisma.email.findUnique({
            where: { email },
        });
        return emailRecord;
    }
}
