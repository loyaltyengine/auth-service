import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { IApiRepository } from './api-keys-repository.interface';
import { ApiKeyModel } from '../models/api-key.model';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';

@Injectable()
export class ApiKeysPrismaRepository implements IApiRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async createApiKey(apiKey: CreateApiKeyDto): Promise<ApiKeyModel> {
        const newApiKey = await this.prismaService.apiKey.create({
            data: apiKey,
        });
        return newApiKey;
    }

    async findApiKeyByKey(key: string): Promise<ApiKeyModel | null> {
        const apiKey = await this.prismaService.apiKey.findUnique({
            where: { keyFingerprint: key },
        });
        return apiKey;
    }
}
