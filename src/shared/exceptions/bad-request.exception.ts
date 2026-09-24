import {ErrorDetail, ErrorType } from '@loyalty-engine/auth';
import { ApiException} from './api.exception';

export class BadRequestException extends ApiException {
    constructor(message: string, error: ErrorType, description: string, details?: ErrorDetail[]) {
        super(400, message, error, description, details);
    }
}
