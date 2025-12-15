import { Inject, Injectable } from '@nestjs/common';
import { ITokenService } from './token-service.interface';
import { AccessTokenDto } from '../dto/access-token.dto';
import { AccessTokenPayloadDto } from '../dto/access-token-payload.dto';
import { JwtService } from '@nestjs/jwt';
import {
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
} from 'src/shared/constants';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { ITokensRepository } from '../repositories/tokens-repository.interface';
import { createJti, hashValue, verifyHashedValue } from 'src/shared/utils';
import { RefreshTokenPayloadDto } from '../dto/refresh-token-payload.dto';

@Injectable()
export class TokenService implements ITokenService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @Inject('ITokensRepository') private readonly tokensRepository: ITokensRepository,
    ) {}

    async signAccessToken(payload: AccessTokenPayloadDto): Promise<AccessTokenDto> {
        return {
            token: await this.jwtService.signAsync(payload, {
                secret: ACCESS_TOKEN_SECRET,
                expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            }),
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            tokenType: 'Bearer',
        };
    }

    async signRefreshToken(payload: RefreshTokenPayloadDto): Promise<RefreshTokenDto> {
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: REFRESH_TOKEN_SECRET,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        });

        const hashedToken = await hashValue(refreshToken);

        await this.tokensRepository.createRefreshToken({
            jti: payload.jti,
            tokenHash: hashedToken,
            user: {
                connect: { id: payload.userId },
            },
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000),
        });

        return {
            token: refreshToken,
            userId: payload.userId,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        };
    }

    async rotateRefreshToken(payload: RefreshTokenPayloadDto): Promise<RefreshTokenDto> {
        // Revoke the old refresh token
        await this.tokensRepository.updateRefreshToken(payload.jti, {
            revoked: true,
            revokedAt: new Date(),
        });
        // Issue a new refresh token
        const newRefreshToken = await this.signRefreshToken({
            userId: payload.userId,
            jti: createJti(),
        });

        return {
            token: newRefreshToken.token,
            userId: payload.userId,
            expiresIn: newRefreshToken.expiresIn,
        };
    }

    async verifyAccessToken(token: string): Promise<AccessTokenPayloadDto> {
        throw new Error('Method not implemented.');
    }

    async verifyRefreshToken(token: string): Promise<RefreshTokenPayloadDto | null> {
        try {
            const payload = await this.jwtService.verifyAsync<RefreshTokenPayloadDto>(token, {
                secret: REFRESH_TOKEN_SECRET,
            });

            const dbToken = await this.tokensRepository.findRefreshTokenByJti(payload.jti);

            if (!dbToken || dbToken.revoked || !(await verifyHashedValue(token, dbToken.tokenHash))) {
                return null;
            }

            return payload;
        } catch {
            return null;
        }
    }

    async deleteExpiredRefreshTokens(): Promise<void> {
        const now = new Date();
        // TODO: add proper dates
        await this.tokensRepository.deleteRevokedOrExpiredTokens(now, now);
    }
}
