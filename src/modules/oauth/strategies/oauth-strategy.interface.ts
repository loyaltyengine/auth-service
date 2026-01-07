import { OauthUserDto } from '../dto/oauth-user.dto';

export interface IOauthStrategy {
    getProviderAuthUrl(state: string): string;
    exchangeCodeForTokens(code: string): Promise<{ oauthAccessToken: string; refreshToken: string }>;
    getUserProfile(accessToken: string): Promise<OauthUserDto>;
}
