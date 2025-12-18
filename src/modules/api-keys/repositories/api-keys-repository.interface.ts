import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { ApiKeyModel } from '../models/api-key.model';

export interface IApiRepository {
    createApiKey(apiKey: CreateApiKeyDto): Promise<ApiKeyModel>;
    findApiKeyByKey(key: string): Promise<ApiKeyModel | null>;
}
