import { EmailModel, UserModel as PrismaUser } from 'src/generated/prisma/models';

export interface UserModel extends PrismaUser {
    emails: EmailModel[];
};
