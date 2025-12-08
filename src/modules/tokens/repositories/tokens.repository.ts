import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ITokensRepository } from './tokens-repository.interface';
import { CreateRefreshTokenDto } from '../dto/create-refresh-token.dto';
import { RefreshTokenModel } from '../models/refresh-token.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokensPrismaRepository implements ITokensRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createRefreshToken(refreshToken: CreateRefreshTokenDto): Promise<RefreshTokenModel> {
        const createdToken = await this.prisma.refreshToken.create({
            data: refreshToken,
        });
        return createdToken;
    }

    async findRefreshTokenByJti(jti: string): Promise<RefreshTokenModel | null> {
        const token = await this.prisma.refreshToken.findUnique({
            where: { jti },
        });
        return token;
    }
}
