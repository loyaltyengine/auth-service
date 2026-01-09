
import { UserModel } from '../models/user.model';
import { CreateUserData } from './types/create-user.data';
import { EmailModel } from '../models/email.model';
import { UpdateEmailData } from './types/update-email.data';
import { UpdateUserData } from './types/update-user.data';

export interface UsersRepository {
    findByEmail(email: string): Promise<UserModel | null>;
    findById(id: string): Promise<UserModel | null>;
    create(data: CreateUserData): Promise<UserModel>;
    updateUser(userId: string, data: UpdateUserData): Promise<UserModel>;
    emailExists(email: string): Promise<boolean>;
    findEmailByAddress(email: string): Promise<EmailModel | null>;
    findEmailByAddressAndUserId(email: string, userId: string): Promise<EmailModel | null>;
    findEmailByIdAndUserId(emailId: string, userId: string): Promise<EmailModel | null>;
    findPrimaryEmailByUserId(userId: string): Promise<EmailModel | null>;
    deactivateUserById(id: string): Promise<void>;
    activateUserById(id: string): Promise<void>;
    deleteUserById(id: string): Promise<void>;
    updateEmail(email: string, data: UpdateEmailData): Promise<void>;
    createEmail(userId: string, email: string): Promise<EmailModel>;
    deleteEmailById(userId: string, emailId: string): Promise<void>;
    retrieveEmailsByUserId(userId: string): Promise<EmailModel[]>;
}