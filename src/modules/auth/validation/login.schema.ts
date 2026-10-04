import Joi from 'joi';
import { LoginRequest } from '@loyaltyengine/auth-client';
import { EMAIL_VALIDATION, PASSWORD_VALIDATION } from 'src/shared/validation/joi-validations';

export const loginRequestSchema = Joi.object<LoginRequest>({
    email: EMAIL_VALIDATION,
    password: PASSWORD_VALIDATION,
});
