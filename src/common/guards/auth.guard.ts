import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayloadDto } from 'src/modules/tokens/dto/jwt-payload.dto';
import { JWT_SECRET } from 'src/shared/constants';
import { ErrorType } from 'src/shared/enums/error-type.enum';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new AuthenticationException(
                'Authentication failed: No token provided',
                ErrorType.EMPTY_TOKEN,
                'No token provided in the Authorization header',
            );
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: JWT_SECRET,
            });

            request['user'] = payload as JwtPayloadDto;
        } catch {
            throw new AuthenticationException(
                'Authentication failed: Invalid token',
                ErrorType.INVALID_TOKEN,
                'The provided token is invalid',
            );
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
