import { AccessTokenDto } from 'src/modules/tokens/dto/access-token.dto';
import { RefreshTokenDto } from 'src/modules/tokens/dto/refresh-token.dto';

export interface RefreshResultDto {
    accessToken: AccessTokenDto;
    refreshToken: RefreshTokenDto;
}
