import { EmailModel, UserModel as PrismaUser } from 'src/database/gen/models';

export interface UserModel extends PrismaUser {
    emails: EmailModel[];
};
