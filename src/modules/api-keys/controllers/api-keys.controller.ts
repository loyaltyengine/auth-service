import { Controller, Post, Req, UseGuards, Param, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiKeysService } from '../services/api-keys.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { Response as ApiResponse, CreateApiKeyRequest, CreateApiKeyResponse } from 'src/generated/loyaltyengine/auth/v1';
import { extractApiKeyFromHeader } from 'src/shared/utils';

@Controller('auth/v1/')
export class ApiKeysController {
    constructor(private readonly apiKeysService: ApiKeysService) {}

    @Post('properties/:propertyId/api-keys')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createApiKey(@Req() request: any, @Body() requestBody: CreateApiKeyRequest, @Param('propertyId') propertyId: string): Promise<CreateApiKeyResponse> {
        const userId = request.user.userId;
        const apiKey = await this.apiKeysService.createApiKey(propertyId, userId, requestBody.name);
        return {
            status: { code: 201, message: 'API key created successfully' },
            apiKey: apiKey.key,
            propertyId: apiKey.propertyId,
        };
    }

    @Post('properties/:propertyId/api-keys/verify')
    @HttpCode(HttpStatus.OK)
    async verifyApiKey(@Req() request: any, @Param('propertyId') propertyId: string): Promise<ApiResponse> {
        // The extractApiKeyFromHeader function will throw if key is missing
        const key = extractApiKeyFromHeader(request);
        await this.apiKeysService.verifyApiKey(key);
        return {
            status: { code: 200, message: 'API key is valid' },
        };
    }

    @Post('properties/:propertyId/api-keys/deactivate')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async deactivateApiKey(@Req() request: any, @Param('propertyId') propertyId: string): Promise<ApiResponse> {
        const key = extractApiKeyFromHeader(request);
        await this.apiKeysService.deactivateApiKey(key);
        return {
            status: { code: 200, message: 'API key has been deactivated' },
        };
    }

}
