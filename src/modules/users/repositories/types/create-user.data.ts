export type CreateUserData = {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    profilePictureUrl?: string;
    isEmailVerified?: boolean;
    isEmailPrimary?: boolean;
};