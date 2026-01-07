import { Module } from '@nestjs/common';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';
import { GithubOauthStrategy } from './strategies/github-oauth.strategy';
import { OauthPrismaRepository } from './repositories/oauth-prisma.repository';
import { OauthFactoryService } from './services/oauth-factory.service';
import { OauthController } from './controllers/oauth.controller';
import { UsersModule } from '../users/users.module';
import { OauthService } from './services/oauth.service';

@Module({
  imports: [UsersModule],
  controllers: [OauthController],
  providers: [
    OauthService,
    OauthFactoryService,
    GoogleOauthStrategy,
    GithubOauthStrategy,
    { provide: 'IOauthRepository', useClass: OauthPrismaRepository },
  ],
  exports: [OauthService, OauthFactoryService],
})
export class OauthModule {}
