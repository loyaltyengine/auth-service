import { API_KEY_HEADER_NAME, HASH_SALT_ROUNDS, KEY_LOOKUP_SECRET } from '../constants';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import { randomBytes, createHmac, createHash } from 'node:crypto';

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

export const extractTokenFromHeader = (request: Request): string | null => {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
};

export const extractApiKeyFromHeader = (request: Request): string | null => {
    const [type, apiKey] = request.headers[API_KEY_HEADER_NAME]?.toString().split(' ') ?? [];
    return type === 'ApiKey' ? apiKey : null;
};
