import { Global, Module } from '@nestjs/common';
import { TokenServiceImpl } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ACCESS_TOKEN_EXPIRES_IN, JWT_SECRET } from 'src/shared/constants';
import { PrismaTokensRepository } from './repositories/prisma-tokens.repository';

@Global()
@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: JWT_SECRET,
            signOptions: { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
        }),
    ],
    providers: [
        {
            provide: 'TokenService',
            useClass: TokenServiceImpl,
        },
        {
            provide: 'TokensRepository',
            useClass: PrismaTokensRepository,
        },
    ],
    exports: ['TokenService'],
})
export class TokensModule { }
