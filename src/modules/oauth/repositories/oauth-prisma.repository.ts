import { PrismaService } from "src/modules/prisma/prisma.service";
import { OauthRepository } from "./oauth-repository.interface";
import { OauthAccountModel } from "../models/oauth-account.model";

import { Injectable } from "@nestjs/common";
import { CreateOauthAccountData } from "./types/create-oauth-account.data";

@Injectable()
export class OauthPrismaRepository implements OauthRepository {
    constructor(private readonly prisma: PrismaService) {}
    async findAccountByProviderId(provider: string, providerId: string): Promise<OauthAccountModel | null> {
        const oauthAccount = await this.prisma.oauthAccount.findUnique({
            where: {
                provider_providerId: {
                    provider,
                    providerId,
                },
            },
        });
        return oauthAccount;
    }

    async createOauthAccount(data: CreateOauthAccountData): Promise<OauthAccountModel> {
        const oauthAccount = await this.prisma.oauthAccount.create({
            data: {
                provider: data.provider,
                providerId: data.providerId,
                user: {
                    connect: {
                        id: data.userId,
                    },
                },
            },
        });
        return oauthAccount;
    }
}