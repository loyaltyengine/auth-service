import { PropertiesService } from 'src/modules/properties/services/properties.service';
import { ApiKeyDto } from '../dto/api-key.dto';
import { IApiKeyService } from './api-keys-service.interface';
import { BadRequestException } from 'src/shared/exceptions/bad-request.exception';
import { ErrorType } from 'src/shared/enums/error-type.enum';
import type { IApiRepository } from '../repositories/api-keys-repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { hashValue, verifyHashedValue, createFingerprint } from 'src/shared/utils';
import { AuthenticationException } from 'src/shared/exceptions/authentication.exception';
import { API_KEY_HEADER_NAME } from 'src/shared/constants';

@Injectable()
export class ApiKeysService implements IApiKeyService {
    constructor(
        private readonly propertiesService: PropertiesService,
        @Inject('IApiRepository')
        private readonly apiKeysRepository: IApiRepository,
    ) {}

    async createApiKey(propertyId: string, userId: string): Promise<ApiKeyDto> {
        // Verify that the user owns the property
        const ownsProperty = await this.propertiesService.validatePropertyOwnership(propertyId, userId);
        if (!ownsProperty) {
            throw new BadRequestException(
                `User with ID ${userId} does not own property with ID ${propertyId}`,
                ErrorType.VALIDATION_ERROR,
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
                    continue;
                }
                throw err;
            }
        }

        throw new BadRequestException(
            `Failed to create unique API key after ${MAX_ATTEMPTS} attempts`,
            ErrorType.CONFLICT_ERROR,
            'Could not generate a unique API key. Please try again later.',
        );
    }

    async verifyApiKey(key: string | null): Promise<void> {
        if (!key) {
            throw new AuthenticationException(
                'Missing API key in Authorization header',
                ErrorType.MISSING_API_KEY,
                `Provide API key in the ${API_KEY_HEADER_NAME} header`,
            );
        }
        // Verify key
        const fingerprint = createFingerprint(key);
        const apiKey = await this.apiKeysRepository.findApiKeyByKey(fingerprint);
        if (!apiKey || !(await verifyHashedValue(key, apiKey.key))) {
            throw new AuthenticationException(
                'API key authentication failed: Invalid API key',
                ErrorType.INVALID_API_KEY,
                'The provided API key is invalid',
            );
        }
    }

    private generateApiKey(): string {
        const prefix = 'sk_v1_';
        const bytes = 32;
        return `${prefix}${crypto.randomBytes(bytes).toString('hex')}`;
    }
}
