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
    MILLISECONDS_PER_SECOND,
    ACCESS_TOKEN_TYPE,
} from 'src/shared/constants';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { ITokensRepository } from '../repositories/tokens-repository.interface';
import { createJti, hashValue, verifyHashedValue } from 'src/shared/utils';
import { RefreshTokenPayloadDto } from '../dto/refresh-token-payload.dto';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';
import { ErrorType } from 'src/shared/enums/error-type.enum';
import type { UsersService } from 'src/modules/users/services/users-service.interface';

@Injectable()
export class TokenService implements ITokenService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @Inject('ITokensRepository') private readonly tokensRepository: ITokensRepository,
    ) {}

    async signAccessToken(payload: AccessTokenPayloadDto): Promise<AccessTokenDto> {
        const signedToken = await this.jwtService.signAsync(payload, {
            secret: ACCESS_TOKEN_SECRET,
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        });
        return {
            token: signedToken,
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            tokenType: ACCESS_TOKEN_TYPE,
        };
    }

    async signRefreshToken(payload: RefreshTokenPayloadDto): Promise<RefreshTokenDto> {
        // Sign the refresh token
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: REFRESH_TOKEN_SECRET,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        });

        // Store token in the database
        await this.tokensRepository.createRefreshToken({
            jti: payload.jti,
            tokenHash: await hashValue(refreshToken),
            user: {
                connect: { id: payload.userId },
            },
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * MILLISECONDS_PER_SECOND),
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
        // Check if token is blacklisted
        const blacklistKey = `blacklist:${token}`;
        const isBlacklisted = await this.cacheManager.get(blacklistKey);

        if (isBlacklisted) {
            throw new AuthenticationException(
                'Authentication failed: Token has been revoked',
                ErrorType.INVALID_TOKEN,
                'The provided token has been revoked',
            );
        }

        try {
            // Verify the token
            const payload = await this.jwtService.verifyAsync<AccessTokenPayloadDto>(token, {
                secret: ACCESS_TOKEN_SECRET,
            });

            return payload;
        } catch {
            throw new AuthenticationException(
                'Authentication failed: Invalid token',
                ErrorType.INVALID_TOKEN,
                'The provided token is invalid or expired',
            );
        }
    }

    async revokeAccessToken(token: string): Promise<void> {
        try {
            // Already verified by the Auth guard
            const payload = this.jwtService.decode<AccessTokenPayloadDto>(token);

            if (payload?.exp) {
                // Add to blacklist until token it expires
                const now = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
                const ttl = Math.max((payload.exp - now) * MILLISECONDS_PER_SECOND, 0);

                if (ttl > 0) {
                    const blacklistKey = `blacklist:${token}`;
                    await this.cacheManager.set(blacklistKey, true, ttl);
                }
            }
        } catch {
            // Invalid token format, ignore
        }
    }

    async revokeRefreshToken(token: string): Promise<void> {
        try {
            const payload = this.jwtService.decode<RefreshTokenPayloadDto>(token);
            // Revoke in database
            await this.tokensRepository.updateRefreshToken(payload.jti, {
                revoked: true,
                revokedAt: new Date(),
            });
        } catch {
            // Invalid token, ignore
        }
    }

    async verifyRefreshToken(token: string): Promise<RefreshTokenPayloadDto> {
        try {
            const payload = await this.jwtService.verifyAsync<RefreshTokenPayloadDto>(token, {
                secret: REFRESH_TOKEN_SECRET,
            });

            const dbToken = await this.tokensRepository.findRefreshTokenByJti(payload.jti);

            if (!dbToken || dbToken.revoked || !(await verifyHashedValue(token, dbToken.tokenHash))) {
                throw new AuthenticationException(
                    'Refresh token failed',
                    ErrorType.INVALID_TOKEN,
                    'The provided refresh token is invalid or has been revoked',
                );
            }

            return payload;
        } catch (error) {
            if (error instanceof AuthenticationException) {
                throw error;
            }
            throw new AuthenticationException(
                'Refresh token failed',
                ErrorType.INVALID_TOKEN,
                'The provided refresh token is invalid or expired',
            );
        }
    }

    async deleteExpiredRefreshTokens(): Promise<void> {
        await this.tokensRepository.deleteRevokedOrExpiredTokens();
    }
}
