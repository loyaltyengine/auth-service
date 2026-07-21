import { ErrorType } from '@loyalty-engine/auth-v1-types';
import { ApiException } from './api.exception';

export class ConflictException extends ApiException {
    constructor(message: string, error: ErrorType, description: string) {
        super(409, message, error, description);
    }
}
