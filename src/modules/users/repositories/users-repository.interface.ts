
import { UserModel } from '../models/user.model';
import { CreateUserData } from './types/create-user.data';
import { EmailModel } from '../models/email.model';

export interface UsersRepository {
    findByEmail(email: string): Promise<UserModel | null>;
    findById(id: string): Promise<UserModel | null>;
    create(data: CreateUserData): Promise<UserModel>;
    emailExists(email: string): Promise<boolean>;
    findEmailByAddress(email: string): Promise<EmailModel | null>;
}
