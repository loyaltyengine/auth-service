export const HASH_SALT_ROUNDS = process.env.HASH_SALT_ROUNDS ? Number.parseInt(process.env.HASH_SALT_ROUNDS, 10) : 12;

// Validation patterns
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

// JWT Constants
export const JWT_SECRET = process.env.JWT_SECRET || 'my_jwt_secret_key';
export const ACCESS_TOKEN_SECRET =
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'my_access_token_secret';
export const ACCESS_TOKEN_TYPE = 'Bearer';
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'my_refresh_token_secret';
export const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN
    ? Number.parseInt(process.env.JWT_EXPIRES_IN, 10)
    : 3600;
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN
    ? Number.parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN, 10)
    : 604800;
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const REFRESH_TOKEN_COOKIE_PATH = '/auth/v1/refresh';
