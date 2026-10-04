import { UserModel } from '../models/user.model';
import { UserDto } from '../dto/user.dto';
import { PasswordUserDto } from '../dto/password-user.dto';
import { Email, EmailListResponse, EmailResponse, User as ApiUser, UserResponse } from '@loyaltyengine/auth-client';
import { StatusDto } from 'src/shared/dto/status.dto';
import { EmailModel } from '../models/email.model';
import { EmailDto } from '../dto/email.dto';

export class UserMapper {
    static toDto(user: UserModel): UserDto {
        return {
            id: user.id,
            primaryEmail: user.emails?.find(email => email.isPrimary)?.email || '',
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
        };
    }

    static toPasswordDto(user: UserModel): PasswordUserDto {
        return {
            id: user.id,
            primaryEmail: user.emails?.find(email => email.isPrimary)?.email || '',
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password ? user.password : undefined,
            isActive: user.isActive,
        };
    }

    static toEmailDto(email: EmailModel): EmailDto {
        return {
            id: email.id,
            userId: email.userId,
            email: email.email,
            isPrimary: email.isPrimary,
            isVerified: email.isVerified,
        };
    }

    static toUserResponse(status: StatusDto, user: UserDto): UserResponse {
        return {
            status: {
                code: status.code,
                message: status.message
            },
            user: this.toApiUser(user)
        };
    }

    static toApiUser(user: UserDto): ApiUser {
        return {
            id: user.id,
            primaryEmail: user.primaryEmail,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
        };
    }

    static toEmailResponse(status: StatusDto, email: EmailDto): EmailResponse {
        return {
            status: {
                code: status.code,
                message: status.message
            },
            email: this.toApiEmail(email)
        };
    }

    static toEmailsResponse(status: StatusDto, emails: EmailDto[]): EmailListResponse {
        return {
            status: {
                code: status.code,
                message: status.message
            },
            emails: emails.map(email => this.toApiEmail(email))
        };
    }

    static toApiEmail(email: EmailDto) : Email {
        return {
            id: email.id,
            email: email.email,
            isPrimary: email.isPrimary,
            isVerified: email.isVerified,
        };
    }

}