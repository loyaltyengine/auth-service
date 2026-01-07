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
        const passwordUser = await this.usersService.findUserByEmailWithPassword(loginInfo.email);
        if (!passwordUser || !passwordUser.password || !(await verifyHashedValue(loginInfo.password, passwordUser.password))) {
            throw new AuthenticationException(
                'Authentication failed',
                ErrorType.INVALID_CREDENTIALS,
                'The provided email or password is incorrect',
            );
        }
        const { password, ...user } = passwordUser;

        const accessToken = await this.tokenService.signAccessToken({
            userId: user.id,
            email: user.primaryEmail,
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
            isEmailPrimary: true,
            firstName: registerInfo.firstName,
            lastName: registerInfo.lastName,
            password: registerInfo.password,
        });

        return {
            user: createdUser,
            accessToken: 'accessToken',
        };
    }

    async logout(accessToken: string, refreshToken: string): Promise<void> {
        await this.tokenService.revokeAccessToken(accessToken);
        await this.tokenService.revokeRefreshToken(refreshToken);
    }

    async refreshToken(refreshToken: string): Promise<RefreshResultDto> {
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        const user = await this.usersService.getActiveUserById(payload.userId);

        const newRefreshToken = await this.tokenService.rotateRefreshToken(payload);
        const newAccessToken = await this.tokenService.signAccessToken({
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
