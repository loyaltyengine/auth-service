import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUsersService } from './users.service.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import type { IUsersRepository } from '../repositories/users.repository.interface';
import { BadRequestException } from 'src/shared/exceptions/bad-request.exception';
import { hashValue } from 'src/shared/utils';
import { PasswordUserDto } from '../dto/password-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { ErrorType } from 'src/shared/enums/error-type.enum';

@Injectable()
export class UsersService implements IUsersService {
    private readonly USER_NOT_FOUND = 'User not found';

    constructor(
        @Inject('IUsersRepository')
        private readonly usersRepository: IUsersRepository,
    ) {}

    async createUser(user: CreateUserDto): Promise<UserDto> {
        if (await this.usersRepository.emailExists(user.email)) {
            throw new BadRequestException('Bad request', ErrorType.EMAIL_ALREADY_EXISTS, 'Email already in use');
        }

        const createdUser = await this.usersRepository.create({
            ...user,
            password: await hashValue(user.password),
        });

        return UserMapper.toDto(createdUser);
    }

    async getUserById(id: string): Promise<UserDto> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException(this.USER_NOT_FOUND);
        }
        return UserMapper.toDto(user);
    }

    async getUserByEmail(email: string): Promise<UserDto> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException(this.USER_NOT_FOUND);
        }
        return UserMapper.toDto(user);
    }

    async getUserByEmailWithPassword(email: string): Promise<PasswordUserDto | null> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            // not throwing a NotFoundException because of security reasons
            return null;
        }
        return UserMapper.toPasswordDto(user);
    }
}
