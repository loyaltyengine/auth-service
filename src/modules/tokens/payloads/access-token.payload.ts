export class AccessTokenPayload {
    userId: string;
    email: string;
    jti: string;
    exp?: number;
    iat?: number;
}
