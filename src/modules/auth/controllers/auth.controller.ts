import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import type { Request, Response } from 'express';
import type {
    Response as ApiResponse,
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
} from '@loyalty-engine/auth';
import { AuthMapper } from '../mappers/auth.mapper';
import { JoiValidationPipe } from 'src/common/pipes/joi-validation.pipe';
import { loginRequestSchema } from '../validation/login.schema';
import { registerRequestSchema } from '../validation/register.schema';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
    REFRESH_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_PATH,
    REFRESH_TOKEN_COOKIE_OPTIONS,
} from 'src/shared/constants';
import { RefreshToken } from 'src/common/decorators/refresh-token.decorator';
import type { AuthService } from '../services/auth-service.interface';

@Controller('auth/v1')
export class AuthController {
    constructor(@Inject('AuthService') private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new JoiValidationPipe(loginRequestSchema))
    async loginUser(@Body() request: LoginRequest, @Res({ passthrough: true }) res: Response): Promise<LoginResponse> {
        const result = await this.authService.login({
            email: request.email,
            password: request.password,
        });
        // Set the refresh token cookie
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken.token, REFRESH_TOKEN_COOKIE_OPTIONS);
        return AuthMapper.toLoginResponse({ code: 200, message: 'Login successful' }, result);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new JoiValidationPipe(registerRequestSchema))
    async registerUser(@Body() request: RegisterRequest): Promise<RegisterResponse> {
        const result = await this.authService.register({
            email: request.email,
            password: request.password,
            firstName: request.firstName,
            lastName: request.lastName,
        });

        return AuthMapper.toRegisterResponse({ code: HttpStatus.CREATED, message: 'Registration successful' }, result);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @RefreshToken() token: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<RefreshResponse> {
        const result = await this.authService.refreshToken(token);
        // Set a new refresh token cookie
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken.token, REFRESH_TOKEN_COOKIE_OPTIONS);

        return AuthMapper.toRefreshResponse({ code: HttpStatus.OK, message: 'Token refreshed successfully' }, result);
    }

    @Post('logout')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() request: Request,
        @RefreshToken() refreshToken: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<ApiResponse> {
        const accessToken = request['accessToken'];
        await this.authService.logout(accessToken, refreshToken);
        // Clear the refresh token cookie
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
            path: REFRESH_TOKEN_COOKIE_PATH,
        });

        return { status: { code: HttpStatus.OK, message: 'Logout successful' } };
    }

    // For testing the AuthGuard
    @Get('protected')
    @UseGuards(AuthGuard)
    async protectedRoute(): Promise<string> {
        return 'Protected route';
    }
}
