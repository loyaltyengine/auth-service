import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse, ErrorType, ErrorDetail } from '@loyalty-engine/auth';
import { ApiException } from 'src/shared/exceptions/api.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof ApiException) {
            const status = exception.getStatus();
            const { message, error, description, details } = exception;
            response.status(status).json(this.buildResponse(status, message, error, description, details));
            return;
        }
        // if (exception instanceof HttpException) {
        //     const status = exception.getStatus();
        //     const { message} = exception;
        //     response.status(status).json(this.buildResponse(status, message,undefined,null));
        //     return;
        // }
        // Otherwise
        console.error(exception);
        response
            .status(500)
            .json(
                this.buildResponse(
                    500,
                    'Internal server error',
                    ErrorType.InternalServerError,
                    `${exception instanceof HttpException ? exception.message : 'An unexpected error occurred'}`,
                ),
            );
    }

    private buildResponse(
        status: number,
        message: string,
        error: ErrorType,
        description?: string,
        details?: ErrorDetail[],
    ): ErrorResponse {
        return {
            status: {
                code: status,
                message: message,
            },
            error: error,
            description: description,
            details: details,
        };
    }
}
