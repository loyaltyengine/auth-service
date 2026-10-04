import { UserDto } from '../../src/modules/users/dto/user.dto';
import { RegisterResultDto } from '../../src/modules/auth/dto/register-result.dto';
import type { RegisterRequest } from '@loyaltyengine/auth-client';
import { RegisterDto } from '../../src/modules/auth/dto/register.dto';
import { PasswordUserDto } from '../../src/modules/users/dto/password-user.dto';
import { AccessTokenDto } from '../../src/modules/tokens/dto/access-token.dto';
import { RefreshTokenDto } from '../../src/modules/tokens/dto/refresh-token.dto';

export const buildTestUserDto = (number: number): UserDto => {
    return {
        id: `test-user-id-${number}`,
        primaryEmail: `test-${number}@example.com`,
        firstName: `test-first-name-${number}`,
        lastName: `test-last-name-${number}`,
        isActive: true,
    };
};

export const buildTestPasswordUserDto = (number: number): PasswordUserDto => {
    return {
        ...buildTestUserDto(number),
        password: `@TestPassword${number}`,
    };
};

export const buildTestRegisterRequest = (number: number): RegisterRequest => {
    return {
        email: `test-${number}@example.com`,
        password: `@TestPassword${number}`,
        firstName: `test-first-name-${number}`,
        lastName: `test-last-name-${number}`,
    };
};

export const buildTestRegisterResultDto = (number: number): RegisterResultDto => {
    return {
        user: buildTestUserDto(number),
    };
};

export const buildTestRegisterDto = (number: number): RegisterDto => {
    return {
        email: `test-${number}@example.com`,
        password: `TestPassword${number}!`,
        firstName: `test-first-name-${number}`,
        lastName: `test-last-name-${number}`,
    };
};

export const buildTestAccessTokenDto = (number: number): AccessTokenDto => {
    return {
        token: `test-access-token-${number}`,
        expiresIn: 3600,
        tokenType: 'Bearer',
    };
};

export const buildTestRefreshTokenDto = (number: number): RefreshTokenDto => {
    return {
        token: `test-refresh-token-${number}`,
        userId: `test-user-id-${number}`,
        expiresIn: 86400,
    };
};
