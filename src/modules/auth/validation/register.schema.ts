import Joi from 'joi';
import { RegisterRequest } from '@loyalty-engine/auth-v1-types';
import {
    EMAIL_VALIDATION,
    FIRST_NAME_VALIDATION,
    LAST_NAME_VALIDATION,
    PASSWORD_VALIDATION,
} from 'src/shared/validation/joi-validations';

export const registerRequestSchema = Joi.object<RegisterRequest>({
    email: EMAIL_VALIDATION,
    password: PASSWORD_VALIDATION,
    firstName: FIRST_NAME_VALIDATION,
    lastName: LAST_NAME_VALIDATION,
});
