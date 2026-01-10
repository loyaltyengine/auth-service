import { RefreshTokenModel } from '../models/refresh-token.model';
import { CreateRefreshTokenData } from './types/create-refresh-token.data';
import { UpdateRefreshTokenData } from './types/update-refresh-token.data';

export interface TokensRepository {
    createRefreshToken(refreshToken: CreateRefreshTokenData): Promise<RefreshTokenModel>;
    findRefreshTokenByJti(jti: string): Promise<RefreshTokenModel | null>;
    updateRefreshToken(jti: string, updates: UpdateRefreshTokenData): Promise<RefreshTokenModel>;
    deleteRevokedOrExpiredTokens(): Promise<void>;
}
