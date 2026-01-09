import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users-repository.interface';
import { UserModel } from '../models/user.model';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { CreateUserData } from './types/create-user.data';
import { EmailModel } from '../models/email.model';
import { UpdateEmailData } from './types/update-email.data';
import { UpdateUserData } from './types/update-user.data';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
    constructor(private readonly prisma: PrismaService) { }

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

    async updateUser(userId: string, data: UpdateUserData): Promise<UserModel> {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                password: data.password,
            },
            include: {
                emails: true,
            },
        });
        return updatedUser;
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

    async deactivateUserById(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async activateUserById(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { isActive: true },
        });
    }

    async deleteUserById(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }
    async updateEmail(email: string, data: UpdateEmailData): Promise<void> {
        await this.prisma.email.update({
            where: { email },
            data: {
                isPrimary: data.isPrimary,
            },
        });
    }

    async findEmailByAddressAndUserId(email: string, userId: string): Promise<EmailModel | null> {
        const emailRecord = await this.prisma.email.findFirst({
            where: { email, userId },
        });
        return emailRecord;
    }

    async findPrimaryEmailByUserId(userId: string): Promise<EmailModel | null> {
        const emailRecord = await this.prisma.email.findFirst({
            where: { userId, isPrimary: true },
        });
        return emailRecord;
    }

    async createEmail(userId: string, email: string): Promise<EmailModel> {
        const newEmail = await this.prisma.email.create({
            data: {
                userId,
                email
            },
        });
        return newEmail;
    }
    async deleteEmailById(userId: string, emailId: string): Promise<void> {
        await this.prisma.email.delete({
            where: {
                id: emailId,
                userId: userId,
            },
        });
    }

    async retrieveEmailsByUserId(userId: string): Promise<EmailModel[]> {
        const emails = await this.prisma.email.findMany({
            where: { userId },
        });
        return emails;
    }

    async findEmailByIdAndUserId(emailId: string, userId: string): Promise<EmailModel | null> {
        const emailRecord = await this.prisma.email.findFirst({
            where: { id: emailId, userId },
        });
        return emailRecord;
    }
}
