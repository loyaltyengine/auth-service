import { API_KEY_HEADER_NAME, HASH_SALT_ROUNDS, KEY_LOOKUP_SECRET } from '../constants';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import { randomBytes, createHmac } from 'node:crypto';
import { AuthenticationException } from '../exceptions/authentication.exception';
import { ErrorType } from '@loyalty-engine/auth';

export const hashValue = async (value: string): Promise<string> => {
    return bcrypt.hash(value, HASH_SALT_ROUNDS);
};

export const verifyHashedValue = async (value: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(value, hash);
};

export const createJti = (): string => {
    return randomBytes(16).toString('hex');
};

export const createFingerprint = (value: string): string => {
    return createHmac('sha256', KEY_LOOKUP_SECRET).update(value).digest('hex');
};

export const extractTokenFromHeader = (request: Request): string => {
    const header = request.headers.authorization;
    if (!header) {
        throw new AuthenticationException(
            'Missing authorization token',
            ErrorType.EmptyToken,
            'Provide a Bearer token in the Authorization header',
        );
    }

    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
        throw new AuthenticationException(
            'Invalid authorization token',
            ErrorType.InvalidToken,
            'Provide a valid Bearer token in the Authorization header',
        );
    }

    return token;
};

export const extractApiKeyFromHeader = (request: Request): string => {
    const apiKey = request.headers[API_KEY_HEADER_NAME]?.toString();
    if (!apiKey) {
        throw new AuthenticationException(
            'Missing API key in header',
            ErrorType.MissingApiKey,
            `Provide API key in the ${API_KEY_HEADER_NAME} header`,
        );
    }

    return apiKey;
};
