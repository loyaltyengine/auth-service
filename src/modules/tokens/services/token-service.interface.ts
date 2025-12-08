import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { AccessTokenDto } from '../dto/access-token.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

export interface ITokenService {
    signAccessToken(payload: JwtPayloadDto): Promise<AccessTokenDto>;
}
