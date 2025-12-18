import { UserDto } from './user.dto';
export interface PasswordUserDto extends UserDto {
    password: string;
}
