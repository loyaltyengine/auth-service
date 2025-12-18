import { LoginResponse, RefreshResponse, RegisterResponse } from 'src/generated/loyaltyengine/auth/v1';
import { StatusDto } from 'src/shared/dto/status.dto';
import { LoginResultDto } from '../dto/login-result.dto';
import { RegisterResultDto } from '../dto/register-result.dto';
import { RefreshResultDto } from '../dto/refresh-result.dto';

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
            user: {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
            },
        };
    }

    static toRegisterResponse(status: StatusDto, result: RegisterResultDto): RegisterResponse {
        return {
            status: {
                code: status.code,
                message: status.message,
            },
            user: {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
            },
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
