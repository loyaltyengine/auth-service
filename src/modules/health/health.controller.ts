import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService, } from '@nestjs/terminus';
import { DbHealthIndicator } from './db.health';

@Controller('auth/health')
export class HealthController {

    constructor(
        private health: HealthCheckService,
        private db: DbHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    check(): Promise<HealthCheckResult> {
        return this.health.check([() => this.db.isHealthy('database')]);
    }
}
