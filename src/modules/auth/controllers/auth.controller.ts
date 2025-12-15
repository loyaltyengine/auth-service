import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import type {
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
} from 'src/generated/loyaltyengine/auth/v1';
import { AuthMapper } from '../mappers/auth.mapper';
import { JoiValidationPipe } from 'src/common/pipes/joi-validation.pipe';
import { loginRequestSchema } from '../validation/login.schema';
import { registerRequestSchema } from '../validation/register.schema';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_PATH } from 'src/shared/constants';

@Controller('auth/v1')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new JoiValidationPipe(loginRequestSchema))
    async loginUser(@Body() request: LoginRequest, @Res({ passthrough: true }) res: Response): Promise<LoginResponse> {
        const result = await this.authService.login({
            email: request.email,
            password: request.password,
        });

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: result.refreshToken.expiresIn * 1000,
            path: REFRESH_TOKEN_COOKIE_PATH,
        });

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
    async refreshToken(@Req() request: Request, @Res({ passthrough: true }) res: Response): Promise<RefreshResponse> {
        const token = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

        const result = await this.authService.refreshToken(token);

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: result.refreshToken.expiresIn * 1000,
            path: REFRESH_TOKEN_COOKIE_PATH,
        });

        return AuthMapper.toRefreshResponse({ code: HttpStatus.OK, message: 'Token refreshed successfully' }, result);
    }

    // For testing the AuthGuard
    @Get('protected')
    @UseGuards(AuthGuard)
    async protectedRoute(): Promise<string> {
        return 'Protected route';
    }
}
