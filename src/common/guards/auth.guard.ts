import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AccessTokenPayload } from 'src/modules/tokens/payloads/access-token.payload';
import type { TokensService } from 'src/modules/tokens/services/tokens-service.interface';
import type { UsersService } from 'src/modules/users/services/users-service.interface';
import { extractTokenFromHeader } from 'src/shared/utils';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly REACTIVATE_PATH = 'me/reactivate';

    constructor(
        @Inject('TokensService')
        private readonly tokensService: TokensService,
        @Inject('UsersService') private readonly usersService: UsersService
    ) { }


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        // The extractTokenFromHeader function will throw if token is missing
        const token = extractTokenFromHeader(request);
        // verify token
        const payload = await this.tokensService.verifyAccessToken(token);

        // Skip active user check for reactivate endpoint
        const path = request.path || request.url;
        if (!path.includes(this.REACTIVATE_PATH)) {
            // To make sure the user still exists or active
            await this.usersService.getActiveUserById(payload.userId);
        }
        // Attach user data and the actual token to request object
        request['user'] = { userId: payload.userId, email: payload.email };
        request['accessToken'] = token;

        return true;
    }
}
