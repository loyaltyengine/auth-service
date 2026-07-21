import { ErrorType } from '@loyalty-engine/auth-v1-types';
import { ApiException } from './api.exception';

export class AuthenticationException extends ApiException {
    constructor(message: string, error: ErrorType, description: string) {
        super(401, message, error, description);
    }
}
