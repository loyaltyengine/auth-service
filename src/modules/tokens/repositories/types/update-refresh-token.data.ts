export interface UpdateRefreshTokenData {
    revoked?: boolean;
    revokedAt?: Date | string;
    expiresAt?: Date | string;
}