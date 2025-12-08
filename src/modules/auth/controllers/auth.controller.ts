import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, UsePipes } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from 'src/generated/loyaltyengine/auth/v1';
import { AuthMapper } from '../mappers/auth.mapper';
import { JoiValidationPipe } from 'src/common/pipes/joi-validation.pipe';
import { loginRequestSchema } from '../validation/login.schema';
import { registerRequestSchema } from '../validation/register.schema';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('auth/v1')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new JoiValidationPipe(loginRequestSchema))
    async loginUser(@Body() request: LoginRequest): Promise<LoginResponse> {
        const result = await this.authService.login({
            email: request.email,
            password: request.password,
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

    // For testing the AuthGuard
    @Get('protected')
    @UseGuards(AuthGuard)
    async protectedRoute(): Promise<string> {
        return 'Protected route';
    }
}
