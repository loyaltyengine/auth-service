import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TokensRepository } from './tokens-repository.interface';
import { CreateRefreshTokenDto } from '../dto/create-refresh-token.dto';
import { RefreshTokenModel } from '../models/refresh-token.model';
import { Injectable } from '@nestjs/common';
import { UpdateRefreshTokenDto } from '../dto/update-refresh-token';

@Injectable()
export class PrismaTokensRepository implements TokensRepository {
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

    async updateRefreshToken(jti: string, updates: UpdateRefreshTokenDto): Promise<RefreshTokenModel> {
        const updatedToken = await this.prisma.refreshToken.update({
            where: { jti },
            data: updates,
        });
        return updatedToken;
    }

    async deleteRevokedOrExpiredTokens(): Promise<void> {
        const now = new Date();
        await this.prisma.refreshToken.deleteMany({
            where: {
                OR: [{ expiresAt: { lte: now } }, { revoked: true }],
            },
        });
    }
}
