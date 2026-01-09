export interface EmailDto {
    id: string;
    userId: string;
    email: string;
    isPrimary: boolean;
    isVerified: boolean;
}