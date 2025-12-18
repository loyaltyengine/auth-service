import { Controller, Post, Req, UseGuards, Param } from '@nestjs/common';
import { ApiKeysService } from '../services/api-keys.service';
import { ApiKeyDto } from '../dto/api-key.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Response as ApiResponse } from 'src/generated/loyaltyengine/auth/v1';
import { extractApiKeyFromHeader, extractTokenFromHeader } from 'src/shared/utils';
import { BadRequestException } from 'src/shared/exceptions/bad-request.exception';
import { ErrorType } from 'src/shared/enums/error-type.enum';

@Controller('auth/v1/')
export class ApiKeysController {
    constructor(private readonly apiKeysService: ApiKeysService) {}

    @Post('properties/:propertyId/api-keys')
    @UseGuards(AuthGuard)
    async createApiKey(@Req() request: any, @Param('propertyId') propertyId: string): Promise<ApiKeyDto> {
        const userId = request.user.id;
        return this.apiKeysService.createApiKey(propertyId, userId);
    }

    @Post('properties/:propertyId/api-keys/verify')
    async verifyApiKey(@Req() request: any, @Param('propertyId') propertyId: string): Promise<ApiResponse> {
        const key = extractApiKeyFromHeader(request);

        await this.apiKeysService.verifyApiKey(key);
        return {
            status: { code: 200, message: 'API key is valid' },
        };
    }
}
