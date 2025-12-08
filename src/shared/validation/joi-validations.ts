import Joi from 'joi';
import { PASSWORD_PATTERN } from 'src/shared/constants';

export const PASSWORD_VALIDATION = Joi.string().min(8).pattern(PASSWORD_PATTERN).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    'any.required': 'Password is required',
});

export const EMAIL_VALIDATION = Joi.string().email().min(5).max(100).required().messages({
    'string.email': 'Email must be a valid email address',
    'string.min': 'Email must be at least 5 characters long',
    'string.max': 'Email must not exceed 100 characters',
    'any.required': 'Email is required',
});

export const FIRST_NAME_VALIDATION = Joi.string().min(2).max(100).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must not exceed 100 characters',
    'any.required': 'First name is required',
});

export const LAST_NAME_VALIDATION = Joi.string().min(2).max(100).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must not exceed 100 characters',
    'any.required': 'Last name is required',
});
