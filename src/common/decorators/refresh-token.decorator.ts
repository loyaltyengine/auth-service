import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REFRESH_TOKEN_COOKIE_NAME } from 'src/shared/constants';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';

export const RefreshToken = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
        throw new AuthenticationException(
            'Refresh token required',
            'empty_token',
            'No refresh token provided in cookie',
        );
    }

    return refreshToken;
});
