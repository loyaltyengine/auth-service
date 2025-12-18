import { ApiKeyDto } from '../dto/api-key.dto';

export interface IApiKeyService {
    createApiKey(propertyId: string, userId: string): Promise<ApiKeyDto>;
    verifyApiKey(key: string | null): Promise<void>;
}
