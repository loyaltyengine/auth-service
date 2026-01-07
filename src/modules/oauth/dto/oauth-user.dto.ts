export interface OauthUserDto {
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    isEmailVerified: boolean;
}
