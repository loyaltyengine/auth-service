import { ApiKeyDto } from '../dto/api-key.dto';

export interface ApiKeyService {
    createApiKey(propertyId: string, userId: string, name?: string): Promise<ApiKeyDto>;
    verifyApiKey(key: string): Promise<void>;
    deactivateApiKey(key: string): Promise<void>;
}
