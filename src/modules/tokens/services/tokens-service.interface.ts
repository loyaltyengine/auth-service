import { AccessTokenPayload } from '../payloads/access-token.payload';
import { AccessTokenDto } from '../dto/access-token.dto';
import { RefreshTokenPayload } from '../payloads/refresh-token.payload';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

export interface TokensService {
    signAccessToken(payload: AccessTokenPayload): Promise<AccessTokenDto>;
    signRefreshToken(payload: RefreshTokenPayload): Promise<RefreshTokenDto>;
    rotateRefreshToken(payload: RefreshTokenPayload): Promise<RefreshTokenDto>;
    verifyAccessToken(token: string): Promise<AccessTokenPayload>;
    verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
    revokeAccessToken(token: string): Promise<void>;
    revokeRefreshToken(token: string): Promise<void>;
    deleteExpiredRefreshTokens(): Promise<void>;
}
