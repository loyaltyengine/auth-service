import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { ApiKeysRepository } from './api-keys-repository.interface';
import { ApiKeyModel } from '../models/api-key.model';
import { CreateApiKeyData } from './types/create-api-key.data';
import { UpdateApiKeyData } from './types/update-api-key.data';

@Injectable()
export class ApiKeysPrismaRepository implements ApiKeysRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async createApiKey(apiKey: CreateApiKeyData): Promise<ApiKeyModel> {
        const newApiKey = await this.prismaService.apiKey.create({
            data: apiKey,
        });
        return newApiKey;
    }

    async findApiKeyByKey(fingerprint: string): Promise<ApiKeyModel | null> {
        const apiKey = await this.prismaService.apiKey.findUnique({
            where: { keyFingerprint: fingerprint },
        });
        return apiKey;
    }

    async updateApiKey(fingerprint: string, updates: UpdateApiKeyData): Promise<void> {
        await this.prismaService.apiKey.update({
            where: { keyFingerprint: fingerprint },
            data: updates,
        });
    }
}
