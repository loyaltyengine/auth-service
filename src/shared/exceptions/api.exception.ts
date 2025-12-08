import { HttpException } from '@nestjs/common';
import { ErrorType } from '../enums/error-type.enum';

export abstract class ApiException extends HttpException {
    code: number;
    message: string;
    error: ErrorType;
    description: string;
    details?: ErrorDetails[];

    constructor(code: number, message: string, error: ErrorType, description: string, details?: ErrorDetails[]) {
        super(message, code);
        this.error = error;
        this.description = description;
        this.details = details;
        this.code = code;
        this.message = message;
    }
}

export interface ErrorDetails {
    field?: string;
    issue?: string;
}
