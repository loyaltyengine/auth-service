import { Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './auth-service.interface';
import { LoginUserDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginResultDto } from '../dto/login-result.dto';
import type { IUsersService } from 'src/modules/users/services/users.service.interface';
import { createJti, verifyHashedValue } from 'src/shared/utils';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';
import { RegisterResultDto } from '../dto/register-result.dto';
import { TokenService } from 'src/modules/tokens/services/token.service';
import { ErrorType } from 'src/shared/enums/error-type.enum';
import { RefreshResultDto } from '../dto/refresh-result.dto';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject('IUsersService')
        private readonly usersService: IUsersService,
        private readonly tokenService: TokenService,
    ) {}

    async login(loginInfo: LoginUserDto): Promise<LoginResultDto> {
        const passwordUser = await this.usersService.getUserByEmailWithPassword(loginInfo.email);
        if (!passwordUser || !(await verifyHashedValue(loginInfo.password, passwordUser.password))) {
            throw new AuthenticationException(
                'Authentication failed',
                ErrorType.INVALID_CREDENTIALS,
                'The provided email or password is incorrect',
            );
        }
        const { password, ...user } = passwordUser;

        const accessToken = await this.tokenService.signAccessToken({
            userId: user.id,
            email: user.email,
            jti: createJti(),
        });
        const refreshToken = await this.tokenService.signRefreshToken({
            userId: user.id,
            jti: createJti(),
        });

        return {
            user,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }

    async register(registerInfo: RegisterDto): Promise<RegisterResultDto> {
        const createdUser = await this.usersService.createUser({
            email: registerInfo.email,
            firstName: registerInfo.firstName,
            lastName: registerInfo.lastName,
            password: registerInfo.password,
        });

        return {
            user: createdUser,
            accessToken: 'accessToken',
        };
    }

    async refreshToken(refreshToken: string): Promise<RefreshResultDto> {
        if (!refreshToken) {
            throw new AuthenticationException(
                'Refresh token failed',
                ErrorType.EMPTY_TOKEN,
                'No refresh token provided. Please log in again.',
            );
        }

        const decoded = await this.tokenService.verifyRefreshToken(refreshToken);
        if (!decoded) {
            throw new AuthenticationException(
                'Refresh token failed',
                ErrorType.INVALID_TOKEN,
                'The provided refresh token is invalid',
            );
        }
        // Fetch fresh user data to ensure user still exists and is active
        const user = await this.usersService.getUserById(decoded.userId);
        // New tokens
        const newRefreshToken = await this.tokenService.rotateRefreshToken(decoded);
        const newAccessToken = await this.tokenService.signAccessToken({
            userId: user.id,
            email: user.email,
            jti: createJti(),
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}
