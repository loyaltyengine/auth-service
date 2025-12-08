import { LoginResponse, RegisterResponse } from 'src/generated/loyaltyengine/auth/v1';
import { StatusDto } from 'src/shared/dto/status.dto';
import { LoginResultDto } from '../dto/login-result.dto';
import { RegisterResultDto } from '../dto/register-result.dto';

export class AuthMapper {
    static toLoginResponse(status: StatusDto, result: LoginResultDto): LoginResponse {
        return {
            status: {
                code: status.code,
                message: status.message,
            },
            accessToken: result.accessToken.token,
            expiresIn: 3600,
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
}
