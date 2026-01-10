import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { TokensService } from 'src/modules/tokens/services/tokens-service.interface';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(@Inject('TokensService') private readonly tokensService: TokensService) {}

    @Cron(CronExpression.EVERY_HOUR)
    async cleanupExpiredTokens(): Promise<void> {
        this.logger.log('Cleaning up expired tokens...');
        await this.tokensService.deleteExpiredRefreshTokens();
    }
}
