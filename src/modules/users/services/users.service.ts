import { Inject, Injectable } from '@nestjs/common';
import { IUsersService } from './users.service.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import type { IUsersRepository } from '../repositories/users.repository.interface';
import { BadRequestException } from 'src/shared/exceptions/bad-request.exception';
import { hashValue } from 'src/shared/utils';
import { PasswordUserDto } from '../dto/password-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { ErrorType } from 'src/shared/enums/error-type.enum';
import { NotFoundException } from 'src/shared/exceptions/not-found.exception';
import { EmailDto } from '../dto/email.dto';

@Injectable()
export class UsersService implements IUsersService {
    private readonly USER_NOT_FOUND_MGS = 'User not found';
    private readonly USER_NOT_FOUND_DESC = 'User not found';

    private readonly INACTIVE_USER_MGS = 'Inactive user';
    private readonly INACTIVE_USER_DESC = 'The user account is inactive.';

    constructor(
        @Inject('IUsersRepository')
        private readonly usersRepository: IUsersRepository,
    ) {}

    async createUser(user: CreateUserDto): Promise<UserDto> {
        if (await this.usersRepository.emailExists(user.email)) {
            throw new BadRequestException('Bad request', ErrorType.EMAIL_ALREADY_EXISTS, 'Email already in use');
        }

        const createdUser = await this.usersRepository.create({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            isEmailPrimary: user.isEmailPrimary,
            password: user.password ? await hashValue(user.password) : undefined,
        });

        return UserMapper.toDto(createdUser);
    }

    async getActiveUserById(id: string): Promise<UserDto> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException(this.USER_NOT_FOUND_MGS, ErrorType.NOT_FOUND, this.USER_NOT_FOUND_DESC);
        }

        if (!user.isActive) {
            throw new BadRequestException(this.INACTIVE_USER_MGS, ErrorType.INACTIVE_USER, this.INACTIVE_USER_DESC);
        }
        return UserMapper.toDto(user);
    }

    async getActiveUserByEmail(email: string): Promise<UserDto> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException(this.USER_NOT_FOUND_MGS, ErrorType.NOT_FOUND, this.USER_NOT_FOUND_DESC);
        }

        if (!user.isActive) {
            throw new BadRequestException(this.INACTIVE_USER_MGS, ErrorType.INACTIVE_USER, this.INACTIVE_USER_DESC);
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
        return UserMapper.toPasswordDto(user);
    }

    async findEmail(email: string): Promise<EmailDto | null> {
        const emailRecord = await this.usersRepository.findEmailByAddress(email);
        if (!emailRecord) {
            return null;
        }
        return { userId: emailRecord.userId, email: emailRecord.email };
    }
}
