import { LoginResultDto } from "src/modules/auth/dto/login-result.dto";

export interface IOauthService {
    oauthCallback(provider: string, code: string): Promise<LoginResultDto>;
    getProviderAuthUrl(provider: string): string;
    createOauthAccount(provider: string, providerId: string, userId: string): Promise<void>;
}
