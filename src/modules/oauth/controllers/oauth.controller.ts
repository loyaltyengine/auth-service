import { Controller, Get, Inject, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LoginResponse } from '@loyalty-engine/auth-v1-types';
import { AuthMapper } from 'src/modules/auth/mappers/auth.mapper';
import type { OauthService } from '../services/oauth-service.interface';

@Controller('auth/v1/oauth/')
export class OauthController {
    constructor( @Inject('OauthService') private readonly oauthService: OauthService) { }

    @Get(':provider/login')
    async oauthLogin(@Param('provider') provider: string, @Res() res: Response): Promise<void> {
        const authUrl = this.oauthService.getProviderAuthUrl(provider);
        res.redirect(authUrl);
    }

    @Get(':provider/callback')
    async oauthCallback(
        @Param('provider') provider: string,
        @Query('code') code: string,
        @Query('state') state: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LoginResponse> {
        const result = await this.oauthService.oauthCallback(provider, code);

        // Set refresh token cookie (same as regular login)
        res.cookie('refreshToken', result.refreshToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });

        return AuthMapper.toLoginResponse({
            code: 200, message: 'OAuth login successful',
        }, result);
    }
}
