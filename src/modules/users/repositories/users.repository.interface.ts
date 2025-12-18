import { CreateUserDto } from '../dto/create-user.dto';
import { UserModel } from '../models/user.model';

export interface IUsersRepository {
    findByEmail(email: string): Promise<UserModel | null>;
    findById(id: string): Promise<UserModel | null>;
    create(user: CreateUserDto): Promise<UserModel>;
    emailExists(email: string): Promise<boolean>;
}
