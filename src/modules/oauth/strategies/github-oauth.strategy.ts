import { Injectable } from '@nestjs/common';
import { IOauthStrategy } from './oauth-strategy.interface';
import { OauthUserDto } from '../dto/oauth-user.dto';

@Injectable()
export class GithubOauthStrategy implements IOauthStrategy {
    getProviderAuthUrl(state: string): string {
        throw new Error('Method not implemented.');
    }

    async exchangeCodeForTokens(code: string): Promise<{ oauthAccessToken: string; refreshToken: string }> {
        throw new Error('Method not implemented.');
    }

    async getUserProfile(accessToken: string): Promise<OauthUserDto> {
        throw new Error('Method not implemented.');
    }
}
