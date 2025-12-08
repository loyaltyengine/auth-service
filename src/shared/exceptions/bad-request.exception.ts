import { ErrorType } from '../enums/error-type.enum';
import { ApiException, ErrorDetails } from './api.exception';

export class BadRequestException extends ApiException {
    constructor(message: string, error: ErrorType, description: string, details?: ErrorDetails[]) {
        super(400, message, error, description, details);
    }
}
