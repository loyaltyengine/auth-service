import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from './users-service.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import type { UsersRepository } from '../repositories/users-repository.interface';
import { BadRequestException } from 'src/shared/exceptions/bad-request.exception';
import { hashValue } from 'src/shared/utils';
import { PasswordUserDto } from '../dto/password-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { ErrorType } from '@loyalty-engine/auth-v1-types' ;
import { NotFoundException } from 'src/shared/exceptions/not-found.exception';
import { EmailDto } from '../dto/email.dto';
import { MakePrimaryEmailResultDto } from '../dto/make-primary-email-result.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserData } from '../repositories/types/update-user.data';
import { CreateUserData } from '../repositories/types/create-user.data';

@Injectable()
export class UsersServiceImpl implements UsersService {
    private readonly USER_NOT_FOUND_MGS = 'User not found';
    private readonly USER_NOT_FOUND_DESC = 'User not found';

    private readonly INACTIVE_USER_MGS = 'Inactive user';
    private readonly INACTIVE_USER_DESC = 'The user account is inactive.';

    constructor(
        @Inject('UsersRepository')
        private readonly usersRepository: UsersRepository,
    ) { }

    async createUser(user: CreateUserDto): Promise<UserDto> {
        if (await this.usersRepository.emailExists(user.email)) {
            throw new BadRequestException('Bad request', ErrorType.EmailAlreadyExists, 'Email already in use');
        }

        const createUserData: CreateUserData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            isEmailPrimary: user.isEmailPrimary,
            password: user.password ? await hashValue(user.password) : undefined,
        };

        const createdUser = await this.usersRepository.create(createUserData);

        return UserMapper.toDto(createdUser);
    }

    async updateUser(userId: string, updates: UpdateUserDto): Promise<UserDto> {
        const updateData: UpdateUserData = {
            firstName: updates.firstName,
            lastName: updates.lastName,
        };
        const updatedUser = await this.usersRepository.updateUser(userId, updateData);
        return UserMapper.toDto(updatedUser);
    }

    async getActiveUserById(id: string): Promise<UserDto> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException(this.USER_NOT_FOUND_MGS, ErrorType.NotFound, this.USER_NOT_FOUND_DESC);
        }

        if (!user.isActive) {
            throw new BadRequestException(this.INACTIVE_USER_MGS, ErrorType.InactiveUser, this.INACTIVE_USER_DESC);
        }
        return UserMapper.toDto(user);
    }

    async getActiveUserByEmail(email: string): Promise<UserDto> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException(this.USER_NOT_FOUND_MGS, ErrorType.NotFound, this.USER_NOT_FOUND_DESC);
        }

        if (!user.isActive) {
            throw new BadRequestException(this.INACTIVE_USER_MGS, ErrorType.InactiveUser, this.INACTIVE_USER_DESC);
        }

        return UserMapper.toDto(user);
    }

    async findUserByEmailWithPassword(email: string): Promise<PasswordUserDto | null> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            // not throwing a NotFoundException because of security reasons
            return null;
        }
        // Returning even if the user is inactive for login purposes
        // Inactive accounts can log in but cannot retrieve profile unless reactivated
        // inactive_user exception is thrown in getActiveUserById method
        return UserMapper.toPasswordDto(user);
    }

    async findEmail(email: string): Promise<EmailDto | null> {
        const emailRecord = await this.usersRepository.findEmailByAddress(email);
        if (!emailRecord) {
            return null;
        }
        return UserMapper.toEmailDto(emailRecord);
    }

    async deactivateUserById(id: string): Promise<void> {
        const user = await this.usersRepository.findById(id);
        if (user?.isActive) {
            await this.usersRepository.deactivateUserById(user.id);
        }
    }

    async activateUserById(id: string): Promise<void> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException(this.USER_NOT_FOUND_MGS, ErrorType.NotFound, this.USER_NOT_FOUND_DESC);
        }

        if (!user.isActive) {
            await this.usersRepository.activateUserById(user.id);
        }
    }

    async deleteUserById(id: string): Promise<void> {
        const user = await this.usersRepository.findById(id);
        if (user) {
            await this.usersRepository.deleteUserById(user.id);
        }
    }

    async makePrimaryEmail(userId: string, emailId: string): Promise<MakePrimaryEmailResultDto> {
        const existingEmail = await this.usersRepository.findEmailByIdAndUserId(emailId, userId);
        if (!existingEmail) {
            throw new NotFoundException('Email not found', ErrorType.NotFound, 'The specified email does not exist for the user');
        }

        const oldPrimaryEmail = await this.usersRepository.findPrimaryEmailByUserId(userId);
        if (!oldPrimaryEmail) {
            // Just in case but should never happen because a user must have a primary email
            throw new Error('Primary email not found for the user');
        }

        if (oldPrimaryEmail.email !== existingEmail.email) {
            await this.usersRepository.updateEmail(oldPrimaryEmail.email, { isPrimary: false });
        }

        await this.usersRepository.updateEmail(existingEmail.email, { isPrimary: true });

        return {
            old: oldPrimaryEmail.email,
            new: existingEmail.email,
        };
    }

    async addEmailToUser(userId: string, email: string): Promise<EmailDto> {
        if (await this.usersRepository.emailExists(email)) {
            throw new BadRequestException('Email already exists', ErrorType.EmailAlreadyExists, 'Email already in use');
        }
        const newEmail = await this.usersRepository.createEmail(userId, email);
        return UserMapper.toEmailDto(newEmail);
    }

    async deleteEmailById(userId: string, emailId: string): Promise<void> {
        const email = await this.usersRepository.findEmailByIdAndUserId(emailId, userId);
        if (email) {
            if (email.isPrimary) {
                throw new BadRequestException('Cannot delete primary email', ErrorType.PrimaryEmail, 'Primary email cannot be deleted. Change primary email before deletion.');
            }
            await this.usersRepository.deleteEmailById(userId, emailId);
        }
    }

    async getEmailsByUserId(userId: string): Promise<EmailDto[]> {
        const emails = await this.usersRepository.retrieveEmailsByUserId(userId);
        return emails.map(UserMapper.toEmailDto);
    }

}
