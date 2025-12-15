import { AccessTokenPayloadDto } from '../dto/access-token-payload.dto';
import { AccessTokenDto } from '../dto/access-token.dto';
import { RefreshTokenPayloadDto } from '../dto/refresh-token-payload.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

export interface ITokenService {
    signAccessToken(payload: AccessTokenPayloadDto): Promise<AccessTokenDto>;
    signRefreshToken(payload: RefreshTokenPayloadDto): Promise<RefreshTokenDto>;
    rotateRefreshToken(payload: RefreshTokenPayloadDto): Promise<RefreshTokenDto>;
    verifyAccessToken(token: string): Promise<AccessTokenPayloadDto>;
    verifyRefreshToken(token: string): Promise<RefreshTokenPayloadDto | null>;
    deleteExpiredRefreshTokens(): Promise<void>;
}
