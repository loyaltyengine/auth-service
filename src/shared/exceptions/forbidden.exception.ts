import { ErrorType } from '@loyalty-engine/auth';
import { ApiException } from './api.exception';

export class ForbiddenException extends ApiException {
    constructor(message: string, error: ErrorType, description: string) {
        super(403, message, error, description);
    }
}