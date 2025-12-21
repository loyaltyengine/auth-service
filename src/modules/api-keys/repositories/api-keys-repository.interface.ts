import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { UpdateApiKeyDto } from '../dto/update-api-key.dto';
import { ApiKeyModel } from '../models/api-key.model';

export interface IApiKeysRepository {
    createApiKey(apiKey: CreateApiKeyDto): Promise<ApiKeyModel>;
    updateApiKey(fingerprint: string, updates: UpdateApiKeyDto): Promise<void>;
    findApiKeyByKey(key: string): Promise<ApiKeyModel | null>;
}
