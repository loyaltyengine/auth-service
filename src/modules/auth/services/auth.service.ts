import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthService } from './auth-service.interface';
import { LoginUserDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginResultDto } from '../dto/login-result.dto';
import type { UsersService } from 'src/modules/users/services/users-service.interface';
import { createJti, verifyHashedValue } from 'src/shared/utils';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';
import { RegisterResultDto } from '../dto/register-result.dto';
import { ErrorType } from '@loyaltyengine/auth-client';
import { RefreshResultDto } from '../dto/refresh-result.dto';
import type { TokensService } from 'src/modules/tokens/services/tokens-service.interface';

@Injectable()
export class AuthServiceImpl implements AuthService {
    private readonly logger = new Logger(AuthServiceImpl.name);
    constructor(
        @Inject('UsersService')
        private readonly usersService: UsersService,
        @Inject('TokensService')
        private readonly tokensService: TokensService,
    ) {}

    async login(loginInfo: LoginUserDto): Promise<LoginResultDto> {
        this.logger.log('Login attempt for user: ' + loginInfo.email);
        const passwordUser = await this.usersService.findUserByEmailWithPassword(loginInfo.email);
        if (!passwordUser?.password || !(await verifyHashedValue(loginInfo.password, passwordUser.password))) {
            throw new AuthenticationException(
                'Authentication failed',
                ErrorType.InvalidCredentials,
                'The provided email or password is incorrect',
            );
        }
        const { password, ...user } = passwordUser;

        const accessToken = await this.tokensService.signAccessToken({
            userId: user.id,
            email: user.primaryEmail,
            jti: createJti(),
        });
        const refreshToken = await this.tokensService.signRefreshToken({
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
        this.logger.log('Register attempt for user: ' + registerInfo.email);
        const createdUser = await this.usersService.createUser({
            email: registerInfo.email,
            isEmailPrimary: true,
            firstName: registerInfo.firstName,
            lastName: registerInfo.lastName,
            password: registerInfo.password,
        });

        return {
            user: createdUser,
        };
    }

    async logout(accessToken: string, refreshToken: string): Promise<void> {
        this.logger.log('Logout attempt for user: ' + accessToken);
        await this.tokensService.revokeAccessToken(accessToken);
        await this.tokensService.revokeRefreshToken(refreshToken);
    }

    async refreshToken(refreshToken: string): Promise<RefreshResultDto> {
        this.logger.log('Refresh token attempt for user: ' + refreshToken);
        const payload = await this.tokensService.verifyRefreshToken(refreshToken);
        const user = await this.usersService.getActiveUserById(payload.userId);

        const newRefreshToken = await this.tokensService.rotateRefreshToken(payload);
        const newAccessToken = await this.tokensService.signAccessToken({
            userId: user.id,
            email: user.primaryEmail,
            jti: createJti(),
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}
