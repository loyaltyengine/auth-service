import { CreateRefreshTokenDto } from '../dto/create-refresh-token.dto';
import { RefreshTokenModel } from '../models/refresh-token.model';

export interface ITokensRepository {
    createRefreshToken(refreshToken: CreateRefreshTokenDto): Promise<RefreshTokenModel>;
    findRefreshTokenByJti(jti: string): Promise<RefreshTokenModel | null>;
    updateRefreshToken(jti: string, updates: Partial<CreateRefreshTokenDto>): Promise<RefreshTokenModel>;
    deleteRevokedOrExpiredTokens(): Promise<void>;
}
