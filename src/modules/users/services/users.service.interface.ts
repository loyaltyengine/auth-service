import { CreateUserDto } from '../dto/create-user.dto';
import { PasswordUserDto } from '../dto/password-user.dto';
import { UserDto } from '../dto/user.dto';

export interface IUsersService {
    createUser(user: CreateUserDto): Promise<UserDto>;
    getActiveUserById(id: string): Promise<UserDto>;
    getActiveUserByEmail(email: string): Promise<UserDto>;
    getUserByEmailWithPassword(email: string): Promise<PasswordUserDto | null>;
}
