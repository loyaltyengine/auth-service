import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => ({
                store: await redisStore({
                    socket: {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: Number.parseInt(process.env.REDIS_PORT || '6379'),
                    },
                    ttl: 60 * 1000,
                }),
            }),
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        TokensModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
