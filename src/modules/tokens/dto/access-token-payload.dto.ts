export class AccessTokenPayloadDto {
    userId: string;
    email: string;
    jti: string;
    exp?: number;
    iat?: number;
}
