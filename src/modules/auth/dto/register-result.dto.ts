import { UserDto } from 'src/modules/users/dto/user.dto';

export interface RegisterResultDto {
    user: UserDto;
    accessToken: string;
}
