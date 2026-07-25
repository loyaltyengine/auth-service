import { ApiKeyModel } from '../models/api-key.model';
import { CreateApiKeyData } from './types/create-api-key.data';
import { UpdateApiKeyData } from './types/update-api-key.data';

export interface ApiKeysRepository {
    createApiKey(apiKey: CreateApiKeyData): Promise<ApiKeyModel>;
    updateApiKey(fingerprint: string, updates: UpdateApiKeyData): Promise<void>;
    findApiKeyByKey(key: string): Promise<ApiKeyModel | null>;
}
