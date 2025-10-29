import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
    DomainException,
    InvalidValueObjectException,
    EntityNotFoundException,
    DuplicateEntityException,
} from '@domain/exceptions/domain.exceptions';

/**
 * Global Exception Filter
 * 
 * Convierte excepciones de dominio a responses HTTP apropiadas.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
    catch(exception: DomainException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.BAD_REQUEST;
        let error = 'Bad Request';

        if (exception instanceof EntityNotFoundException) {
            status = HttpStatus.NOT_FOUND;
            error = 'Not Found';
        } else if (exception instanceof DuplicateEntityException) {
            status = HttpStatus.CONFLICT;
            error = 'Conflict';
        } else if (exception instanceof InvalidValueObjectException) {
            status = HttpStatus.BAD_REQUEST;
            error = 'Validation Error';
        }

        response.status(status).json({
            statusCode: status,
            error,
            message: exception.message,
            timestamp: new Date().toISOString(),
        });
    }
}

