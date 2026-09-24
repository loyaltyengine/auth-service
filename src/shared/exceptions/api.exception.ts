import { HttpException } from '@nestjs/common';
import {ErrorDetail, ErrorType } from '@loyalty-engine/auth';

export abstract class ApiException extends HttpException {
    code: number;
    message: string;
    error: ErrorType;
    description: string;
    details?: ErrorDetail[];

    constructor(code: number, message: string, error: ErrorType, description: string, details?: ErrorDetail[]) {
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
