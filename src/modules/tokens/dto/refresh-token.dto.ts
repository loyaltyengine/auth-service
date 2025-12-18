export interface RefreshTokenDto {
    token: string;
    userId: string;
    expiresIn: number;
}
