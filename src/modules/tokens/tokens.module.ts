import { Module } from '@nestjs/common';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ACCESS_TOKEN_EXPIRES_IN, JWT_SECRET } from 'src/shared/constants';
import { PrismaService } from '../prisma/prisma.service';
import { TokensPrismaRepository } from './repositories/tokens.repository';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: JWT_SECRET,
            signOptions: { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
        }),
    ],
    providers: [
        TokenService,
        {
            provide: 'ITokensRepository',
            useClass: TokensPrismaRepository,
        },
        PrismaService,
    ],
    exports: [TokenService],
})
export class TokensModule {}
