import { CreateUserDto } from '../dto/create-user.dto';
import { PasswordUserDto } from '../dto/password-user.dto';
import { UserDto } from '../dto/user.dto';

export interface IUsersService {
    createUser(user: CreateUserDto): Promise<UserDto>;
    getUserById(id: string): Promise<UserDto>;
    getUserByEmail(email: string): Promise<UserDto>;
    getUserByEmailWithPassword(email: string): Promise<PasswordUserDto | null>;
}
