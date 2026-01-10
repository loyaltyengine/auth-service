export interface CreateRefreshTokenData {
    jti: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date | string;
    revoked?: boolean;
    revokedAt?: Date | string | null;
}