import { OauthUserDto } from '../dto/oauth-user.dto';

export interface OauthStrategy {
    getProviderAuthUrl(state: string): string;
    exchangeCodeForTokens(code: string): Promise<{ oauthAccessToken: string; refreshToken: string }>;
    getUserProfile(accessToken: string): Promise<OauthUserDto>;
}
