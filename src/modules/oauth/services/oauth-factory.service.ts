import { Injectable } from '@nestjs/common';
import { GithubOauthStrategy } from '../strategies/github-oauth.strategy';
import { GoogleOauthStrategy } from '../strategies/google-oauth.strategy';
import { BadRequestException } from 'src/shared/exceptions/bad-request.exception';
import { ErrorType } from '@loyaltyengine/auth-client';

@Injectable()
export class OauthFactoryService {
    constructor(
        private readonly googleOauthStrategy: GoogleOauthStrategy,
        private readonly githubOauthStrategy: GithubOauthStrategy,
    ) {}

    getStrategy(provider: string) {
        switch (provider) {
            case 'google':
                return this.googleOauthStrategy;
            case 'github':
                return this.githubOauthStrategy;
            default:
                throw new BadRequestException(
                    'Unsupported OAuth provider: ' + provider,
                    ErrorType.InvalidRequest,
                    'The specified OAuth provider is not supported.',
                );
        }
    }
}
