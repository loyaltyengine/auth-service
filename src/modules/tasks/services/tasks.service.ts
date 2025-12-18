import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenService } from 'src/modules/tokens/services/token.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    constructor(private readonly tokenService: TokenService) {}
    @Cron(CronExpression.EVERY_HOUR)
    @Cron(CronExpression.EVERY_30_SECONDS)
    async cleanupExpiredTokens(): Promise<void> {
        this.logger.log('Cleaning up expired tokens...');
        await this.tokenService.deleteExpiredRefreshTokens();
    }
}
