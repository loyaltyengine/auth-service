import { AccessTokenDto } from 'src/modules/tokens/dto/access-token.dto';
import { UserDto } from 'src/modules/users/dto/user.dto';

export interface LoginResultDto {
    user: UserDto;
    accessToken: AccessTokenDto;
}
