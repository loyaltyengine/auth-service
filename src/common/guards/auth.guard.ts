import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from 'src/modules/tokens/services/token.service';
import { ErrorType } from 'src/shared/enums/error-type.enum';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';
import { extractTokenFromHeader } from 'src/shared/utils';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = extractTokenFromHeader(request);
        if (!token) {
            throw new AuthenticationException(
                'Authentication failed: No token provided',
                ErrorType.EMPTY_TOKEN,
                'No token provided in the Authorization header',
            );
        }

        const payload = await this.tokenService.verifyAccessToken(token);

        request['user'] = payload;
        request['token'] = token;
        return true;
    }
}
