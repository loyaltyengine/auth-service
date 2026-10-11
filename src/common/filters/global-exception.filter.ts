import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { DetailsErrorResponse, ErrorDetail, ErrorResponse, ErrorType } from '@loyaltyengine/auth-client';
import { ApiException } from 'src/shared/exceptions/api.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof ApiException) {
            const status = exception.getStatus();
            const { message, error, description, details } = exception;
            this.logger.error(`An error occurred: ${description || message}`);
            response.status(status).json(this.buildResponse(status, message, error, description, details));
            return;
        }

        const errorDescription = `${exception instanceof HttpException ? exception.message : 'An unexpected error occurred'}`;
        this.logger.error(`Internal server error: ${errorDescription}`);
        response
            .status(500)
            .json(
                this.buildResponse(
                    500,
                    'Internal server error',
                    'internal_server_error',
                    errorDescription,
                ),
            );
    }

    private buildResponse(
        status: number,
        message: string,
        error: ErrorType,
        description?: string,
        details?: ErrorDetail[],
    ): ErrorResponse | DetailsErrorResponse {
        const response: ErrorResponse = {
            status: {
                code: status,
                message: message,
            },
            error: error,
            description: description,
        };

        if (details && details.length > 0) {
            return {
                ...response,
                details: details,
            };
        }
        return response;
    }
}
