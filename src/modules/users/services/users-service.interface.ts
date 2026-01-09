import { MakePrimaryEmailResultDto } from '../dto/make-primary-email-result.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { EmailDto } from '../dto/email.dto';
import { PasswordUserDto } from '../dto/password-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';

export interface UsersService {
    createUser(user: CreateUserDto): Promise<UserDto>;
    updateUser(userId: string, updates: UpdateUserDto): Promise<UserDto>;
    getActiveUserById(id: string): Promise<UserDto>;
    getActiveUserByEmail(email: string): Promise<UserDto>;
    findUserByEmailWithPassword(email: string): Promise<PasswordUserDto | null>;
    findEmail(email: string): Promise<EmailDto | null>;
    deactivateUserById(id: string): Promise<void>;
    activateUserById(id: string): Promise<void>;
    deleteUserById(id: string): Promise<void>;
    makePrimaryEmail(userId: string, emailId: string): Promise<MakePrimaryEmailResultDto>;
    addEmailToUser(userId: string, email: string): Promise<EmailDto>;
    deleteEmailById(userId: string, emailId: string): Promise<void>;
    getEmailsByUserId(userId: string): Promise<EmailDto[]>;
}
