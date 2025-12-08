import { Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './auth.service.interface';
import { LoginUserDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginResultDto } from '../dto/login-result.dto';
import type { IUsersService } from 'src/modules/users/services/users.service.interface';
import { verifyHashedValue } from 'src/shared/utils';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';
import { RegisterResultDto } from '../dto/register-result.dto';
import { TokenService } from 'src/modules/tokens/services/token.service';
import { ErrorType } from 'src/shared/enums/error-type.enum';

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

        const accessToken = await this.tokenService.signAccessToken({ userId: user.id, email: user.email });

        return {
            user,
            accessToken: accessToken,
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
}
