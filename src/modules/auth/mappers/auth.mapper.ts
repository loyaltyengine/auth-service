import { LoginResponse, RefreshResponse, RegisterResponse } from '@loyaltyengine/auth-client';
import { StatusDto } from 'src/shared/dto/status.dto';
import { LoginResultDto } from '../dto/login-result.dto';
import { RegisterResultDto } from '../dto/register-result.dto';
import { RefreshResultDto } from '../dto/refresh-result.dto';
import { UserMapper } from 'src/modules/users/mappers/user.mapper';

export class AuthMapper {
    static toLoginResponse(status: StatusDto, result: LoginResultDto): LoginResponse {
        return {
            status: {
                code: status.code,
                message: status.message,
            },
            accessToken: result.accessToken.token,
            expiresIn: result.accessToken.expiresIn,
            tokenType: result.accessToken.tokenType,
            user: UserMapper.toApiUser(result.user),
        };
    }

    static toRegisterResponse(status: StatusDto, result: RegisterResultDto): RegisterResponse {
        return {
            status: {
                code: status.code,
                message: status.message,
            },
            user: UserMapper.toApiUser(result.user),
        };
    }

    static toRefreshResponse(status: StatusDto, result: RefreshResultDto): RefreshResponse {
        return {
            status: {
                code: status.code,
                message: status.message,
            },
            accessToken: result.accessToken.token,
            expiresIn: result.accessToken.expiresIn,
            tokenType: result.accessToken.tokenType,
        };
    }
}
