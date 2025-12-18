import { UserModel } from '../models/user.model';
import { UserDto } from '../dto/user.dto';
import { PasswordUserDto } from '../dto/password-user.dto';

export class UserMapper {
    static toDto(user: UserModel): UserDto {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }

    static toPasswordDto(user: UserModel): PasswordUserDto {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
        };
    }
}
