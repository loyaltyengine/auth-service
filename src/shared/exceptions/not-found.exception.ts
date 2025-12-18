import { ErrorType } from '../enums/error-type.enum';
import { ApiException } from './api.exception';

export class NotFoundException extends ApiException {
    constructor(message: string, error: ErrorType, description: string) {
        super(404, message, error, description);
    }
}
