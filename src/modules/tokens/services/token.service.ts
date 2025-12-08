import { Inject, Injectable } from '@nestjs/common';
import { ITokenService } from './token-service.interface';
import { AccessTokenDto } from '../dto/access-token.dto';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from 'src/shared/constants';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { ITokensRepository } from '../repositories/tokens-repository.interface';
import { hashValue } from 'src/shared/utils';

@Injectable()
export class TokenService implements ITokenService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @Inject('ITokensRepository') private readonly tokensRepository: ITokensRepository,
    ) {}

    async signAccessToken(payload: JwtPayloadDto): Promise<AccessTokenDto> {
        return {
            token: await this.jwtService.signAsync(payload, {
                expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            }),
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        };
    }
}
