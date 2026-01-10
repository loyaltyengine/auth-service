import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TokensRepository } from './tokens-repository.interface';
import { RefreshTokenModel } from '../models/refresh-token.model';
import { Injectable } from '@nestjs/common';
import { CreateRefreshTokenData } from './types/create-refresh-token.data';
import { UpdateRefreshTokenData } from './types/update-refresh-token.data';

@Injectable()
export class PrismaTokensRepository implements TokensRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshTokenModel> {
        const createdToken = await this.prisma.refreshToken.create({
            data: {
                jti: data.jti,
                tokenHash: data.tokenHash,
                expiresAt: data.expiresAt,
                revoked: data.revoked,
                revokedAt: data.revokedAt,
                user: {
                    connect: {
                        id: data.userId
                    }
                }
            },
        });
        return createdToken;
    }

    async findRefreshTokenByJti(jti: string): Promise<RefreshTokenModel | null> {
        const token = await this.prisma.refreshToken.findUnique({
            where: { jti },
        });
        return token;
    }

    async updateRefreshToken(jti: string, updates: UpdateRefreshTokenData): Promise<RefreshTokenModel> {
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
