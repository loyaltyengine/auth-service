import { HASH_SALT_ROUNDS } from '../constants';
import bcrypt from 'bcrypt';

export const hashValue = async (value: string): Promise<string> => {
    return bcrypt.hash(value, HASH_SALT_ROUNDS);
};

export const verifyHashedValue = async (value: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(value, hash);
};
