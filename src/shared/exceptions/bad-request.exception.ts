import {ErrorDetail, ErrorType } from '@loyaltyengine/auth-client';
import { ApiException} from './api.exception';

export class BadRequestException extends ApiException {
    constructor(message: string, error: ErrorType, description: string, details?: ErrorDetail[]) {
        super(400, message, error, description, details);
    }
}
