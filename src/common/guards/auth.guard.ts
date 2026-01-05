import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from 'src/modules/tokens/services/token.service';
import { extractTokenFromHeader } from 'src/shared/utils';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        // The extractTokenFromHeader function will throw if token is missing
        const token = extractTokenFromHeader(request);
        const payload = await this.tokenService.verifyAccessToken(token);

        request['user'] = payload;
        request['token'] = token;
        return true;
    }
}
