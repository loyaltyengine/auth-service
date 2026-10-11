import { Inject, Injectable, Logger } from '@nestjs/common';
import { TokensService } from './tokens-service.interface';
import { AccessTokenDto } from '../dto/access-token.dto';
import { AccessTokenPayload } from '../payloads/access-token.payload';
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
import type { TokensRepository } from '../repositories/tokens-repository.interface';
import { createJti, hashValue, verifyHashedValue } from 'src/shared/utils';
import { RefreshTokenPayload } from '../payloads/refresh-token.payload';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';

@Injectable()
export class TokensServiceImpl implements TokensService {
    private readonly logger = new Logger(TokensServiceImpl.name);

    constructor(
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @Inject('TokensRepository') private readonly tokensRepository: TokensRepository,
    ) { }

    async signAccessToken(payload: AccessTokenPayload): Promise<AccessTokenDto> {
        this.logger.log('Sign access token for user: ' + payload.email);
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

    async signRefreshToken(payload: RefreshTokenPayload): Promise<RefreshTokenDto> {
        this.logger.log('Sign refresh token for user: ' + payload.userId);
        // Sign the refresh token
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: REFRESH_TOKEN_SECRET,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        });

        // Store token in the database
        await this.tokensRepository.createRefreshToken({
            jti: payload.jti,
            tokenHash: await hashValue(refreshToken),
            userId: payload.userId,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * MILLISECONDS_PER_SECOND),
        });

        return {
            token: refreshToken,
            userId: payload.userId,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        };
    }

    async rotateRefreshToken(payload: RefreshTokenPayload): Promise<RefreshTokenDto> {
        this.logger.log('Rotate refresh token for user: ' + payload.userId);
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

    async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
        // Check if token is blacklisted
        const blacklistKey = `blacklist:${token}`;
        const isBlacklisted = await this.cacheManager.get(blacklistKey);

        if (isBlacklisted) {
            throw new AuthenticationException(
                'Authentication failed: Token has been revoked',
                'invalid_token',
                'The provided token has been revoked',
            );
        }

        try {
            // Verify the token
            const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
                secret: ACCESS_TOKEN_SECRET,
            });

            return payload;
        } catch {
            throw new AuthenticationException(
                'Authentication failed: Invalid token',
                'invalid_token',
                'The provided token is invalid or expired',
            );
        }
    }

    async revokeAccessToken(token: string): Promise<void> {
        try {
            // Already verified by the Auth guard
            const payload = this.jwtService.decode<AccessTokenPayload>(token);
            this.logger.log('Revoke access token for user: ' + payload.email);

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
            const payload = this.jwtService.decode<RefreshTokenPayload>(token);
            this.logger.log('Revoke refresh token for user: ' + payload.userId);
            // Revoke in database
            await this.tokensRepository.updateRefreshToken(payload.jti, {
                revoked: true,
                revokedAt: new Date(),
            });
        } catch {
            // Invalid token, ignore
        }
    }

    async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
        try {
            const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
                secret: REFRESH_TOKEN_SECRET,
            });

            const dbToken = await this.tokensRepository.findRefreshTokenByJti(payload.jti);

            if (!dbToken || dbToken.revoked || !(await verifyHashedValue(token, dbToken.tokenHash))) {
                throw new AuthenticationException(
                    'Refresh token failed',
                    'invalid_token',
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
                'invalid_token',
                'The provided refresh token is invalid or expired',
            );
        }
    }

    async deleteExpiredRefreshTokens(): Promise<void> {
        this.logger.log('Delete expired refresh tokens');
        await this.tokensRepository.deleteRevokedOrExpiredTokens();
    }
}
