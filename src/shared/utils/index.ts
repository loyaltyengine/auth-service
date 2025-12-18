import { HASH_SALT_ROUNDS } from '../constants';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import { randomBytes } from 'node:crypto';

export const hashValue = async (value: string): Promise<string> => {
    return bcrypt.hash(value, HASH_SALT_ROUNDS);
};

export const verifyHashedValue = async (value: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(value, hash);
};

export const createJti = (): string => {
    return randomBytes(16).toString('hex');
};

export const extractTokenFromHeader = (request: Request): string | undefined => {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
};
