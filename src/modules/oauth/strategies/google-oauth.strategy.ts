import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OauthStrategy } from './oauth-strategy.interface';
import { OauthUserDto } from '../dto/oauth-user.dto';

@Injectable()
export class GoogleOauthStrategy implements OauthStrategy {
    private readonly oauth2Client;

    constructor(private readonly configService: ConfigService) {
        this.oauth2Client = new google.auth.OAuth2(
            this.configService.get<string>('GOOGLE_CLIENT_ID'),
            this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
            this.configService.get<string>('GOOGLE_REDIRECT_URI'),
        );
    }

    getProviderAuthUrl(state: string): string {

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
            state: state,
        });
    }

    async exchangeCodeForTokens(code: string): Promise<{ oauthAccessToken: string; refreshToken: string }> {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        return {
            oauthAccessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || null,
        };
    }

    async getUserProfile(accessToken: string): Promise<OauthUserDto> {
        this.oauth2Client.setCredentials({ access_token: accessToken });

        const oauth2 = google.oauth2({
            auth: this.oauth2Client,
            version: 'v2',
        });

        const { data } = await oauth2.userinfo.get();

        return {
            providerId: data.id!,
            email: data.email!,
            firstName: data.given_name || '',
            lastName: data.family_name || '',
            profilePictureUrl: data.picture || '',
            isEmailVerified: data.verified_email || false,
        };
    }
}
