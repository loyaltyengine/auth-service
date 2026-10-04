import { OauthService } from './oauth-service.interface';
import { OauthFactoryService } from './oauth-factory.service';
import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { OauthRepository } from '../repositories/oauth-repository.interface';
import { LoginResultDto } from 'src/modules/auth/dto/login-result.dto';
import { createJti } from 'src/shared/utils';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';
import { ErrorType } from '@loyaltyengine/auth-client';
import { UserDto } from 'src/modules/users/dto/user.dto';
import type { UsersService } from 'src/modules/users/services/users-service.interface';
import type { TokensService } from 'src/modules/tokens/services/tokens-service.interface';

@Injectable()
export class OauthServiceImpl implements OauthService {
    constructor(
        private readonly oauthFactoryService: OauthFactoryService,
        @Inject('UsersService')
        private readonly usersService: UsersService,
        @Inject('TokensService')
        private readonly tokensService: TokensService,
        @Inject('OauthRepository')
        private readonly oauthRepository: OauthRepository,
    ) { }

    async oauthCallback(provider: string, code: string): Promise<LoginResultDto> {
        try {
            const strategy = this.oauthFactoryService.getStrategy(provider);
            const { oauthAccessToken, refreshToken } = await strategy.exchangeCodeForTokens(code);
            // Get user profile from the OAuth provider
            const userProfile = await strategy.getUserProfile(oauthAccessToken);
            const oauthAccount = await this.oauthRepository.findAccountByProviderId(provider, userProfile.providerId);

            let user: UserDto;

            if (oauthAccount) {
                user = await this.usersService.getActiveUserById(oauthAccount.userId);
            } else {
                const existingEmail = await this.usersService.findEmail(userProfile.email);

                if (existingEmail) {
                    user = await this.usersService.getActiveUserById(existingEmail.userId);
                    await this.createOauthAccount(provider, userProfile.providerId, user.id);
                } else {
                    // Both OAuth account and email do not exist, create new user
                    user = await this.usersService.createUser({
                        email: userProfile.email,
                        isEmailPrimary: true,
                        firstName: userProfile.firstName,
                        lastName: userProfile.lastName,
                        isEmailVerified: userProfile.isEmailVerified,
                    });

                    await this.createOauthAccount(provider, userProfile.providerId, user.id);
                }
            }

            // Generate application tokens
            const accessToken = await this.tokensService.signAccessToken({
                userId: user.id,
                email: user.primaryEmail,
                jti: createJti(),
            });
            const refreshTokenResult = await this.tokensService.signRefreshToken({
                userId: user.id,
                jti: createJti(),
            });

            return {
                user: user,
                accessToken: accessToken,
                refreshToken: refreshTokenResult,
            };
        } catch (error) {
            console.error('OAuth callback error:', error);
            throw error;
        }
    }

    getProviderAuthUrl(provider: string): string {
        const strategy = this.oauthFactoryService.getStrategy(provider);
        const state = randomBytes(16).toString('hex');
        return strategy.getProviderAuthUrl(state);
    }

    async createOauthAccount(provider: string, providerId: string, userId: string): Promise<void> {
        try {
            await this.oauthRepository.createOauthAccount({
                provider: provider,
                providerId: providerId,
                userId: userId,
            });
        } catch (error) {
            // idempotency: if the account already exists, we can ignore the error
            if (error.code === 'P2002') {
                return;
            }
            throw error;
        }
    }
}
