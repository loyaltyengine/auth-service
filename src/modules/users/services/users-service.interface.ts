import { CreateUserDto } from '../dto/create-user.dto';
import { EmailDto } from '../dto/email.dto';
import { PasswordUserDto } from '../dto/password-user.dto';
import { UserDto } from '../dto/user.dto';

export interface UsersService {
    createUser(user: CreateUserDto): Promise<UserDto>;
    getActiveUserById(id: string): Promise<UserDto>;
    getActiveUserByEmail(email: string): Promise<UserDto>;
    findUserByEmailWithPassword(email: string): Promise<PasswordUserDto | null>;
    findEmail(email: string): Promise<EmailDto | null>;
}
