import { PropertiesService } from 'src/modules/properties/services/properties.service';
import { ApiKeyDto } from '../dto/api-key.dto';
import { ApiKeysService } from './api-keys-service.interface';
import { ErrorType } from '@loyalty-engine/auth-v1-types';
import type { ApiKeysRepository } from '../repositories/api-keys-repository.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { hashValue, verifyHashedValue, createFingerprint } from 'src/shared/utils';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';
import { ForbiddenException } from 'src/shared/exceptions/forbidden.exception';
import { ConflictException } from 'src/shared/exceptions/conflict.exception';

@Injectable()
export class ApiKeysServiceImpl implements ApiKeysService {
    private readonly logger = new Logger(ApiKeysServiceImpl.name);

    constructor(
        private readonly propertiesService: PropertiesService,
        @Inject('ApiKeysRepository')
        private readonly apiKeysRepository: ApiKeysRepository,
    ) {}

    async createApiKey(propertyId: string, userId: string, name?: string): Promise<ApiKeyDto> {
        this.logger.log('Creating API key for property: ' + propertyId + ' by user: ' + userId);
        // Verify that the user owns the property
        const ownsProperty = await this.propertiesService.validatePropertyOwnership(propertyId, userId);
        if (!ownsProperty) {
            throw new ForbiddenException(
                `User with ID ${userId} does not own property with ID ${propertyId}`,
                ErrorType.ForbiddenError,
                'Cannot create API key for property not owned by user.',
            );
        }
        // Generate key and store hashed value
        // Retry for collision safety although unlikely
        const MAX_ATTEMPTS = 5;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const plainKey = this.generateApiKey();
            const keyHash = await hashValue(plainKey);
            const fingerprint = createFingerprint(plainKey);

            try {
                const apiKey = await this.apiKeysRepository.createApiKey({
                    key: keyHash,
                    keyFingerprint: fingerprint,
                    propertyId: propertyId,
                    name: name,
                });

                // Return plain key
                return {
                    id: apiKey.id,
                    key: plainKey,
                    propertyId: propertyId,
                };
            } catch (err: any) {
                // See: https://www.prisma.io/docs/orm/reference/error-reference
                if (err?.code === 'P2002' && attempt < MAX_ATTEMPTS) {
                    this.logger.log(`Collision detected on attempt ${attempt}, retrying...`);
                    console.log(`Collision detected on attempt ${attempt}, retrying...`);
                    continue;
                }
                throw err;
            }
        }

        throw new ConflictException(
            `Failed to create unique API key after ${MAX_ATTEMPTS} attempts`,
            ErrorType.ConflictError,
            'Could not generate a unique API key. Please try again later.',
        );
    }

    async verifyApiKey(key: string): Promise<void> {
        const fingerprint = createFingerprint(key);
        const apiKey = await this.apiKeysRepository.findApiKeyByKey(fingerprint);
        if (!apiKey || !apiKey.isActive || !(await verifyHashedValue(key, apiKey.key))) {
            throw new AuthenticationException(
                'API key authentication failed: Invalid API key',
                ErrorType.InvalidApiKey,
                'The provided API key is invalid',
            );
        }
    }

    async deactivateApiKey(key: string): Promise<void> {
        const fingerprint = createFingerprint(key);
        const apiKey = await this.apiKeysRepository.findApiKeyByKey(fingerprint);
        if (!apiKey) {
            throw new AuthenticationException(
                'Cannot deactivate API key: Key not found',
                ErrorType.InvalidApiKey,
                'The provided API key does not exist',
            );
        }
        await this.apiKeysRepository.updateApiKey(fingerprint, { isActive: false });
    }

    private generateApiKey(): string {
        const prefix = 'sk_v1_';
        const bytes = 32;
        return `${prefix}${crypto.randomBytes(bytes).toString('hex')}`;
    }
}
