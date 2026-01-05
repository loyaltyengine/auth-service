import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { IApiKeysRepository } from './api-keys-repository.interface';
import { ApiKeyModel } from '../models/api-key.model';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { UpdateApiKeyDto } from '../dto/update-api-key.dto';

@Injectable()
export class ApiKeysPrismaRepository implements IApiKeysRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async createApiKey(apiKey: CreateApiKeyDto): Promise<ApiKeyModel> {
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

    async updateApiKey(fingerprint: string, updates: UpdateApiKeyDto): Promise<void> {
        await this.prismaService.apiKey.update({
            where: { keyFingerprint: fingerprint },
            data: updates,
        });
    }
}
