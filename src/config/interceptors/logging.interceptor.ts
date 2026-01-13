import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    // biome-ignore lint/suspicious/noExplicitAny: We dont what will come
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || 'Unknown';

        const now = Date.now();

        // Log de request entrante
        this.logger.log(`📥 ${method} ${url} - ${ip} - ${userAgent}`);

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const duration = Date.now() - now;
                    const { statusCode } = response;

                    // Determinar el emoji basado en el status code
                    let statusEmoji = '✅';
                    if (statusCode >= 400 && statusCode < 500) {
                        statusEmoji = '⚠️';
                    } else if (statusCode >= 500) {
                        statusEmoji = '❌';
                    }

                    this.logger.log(`📤 ${statusEmoji} ${method} ${url} ${statusCode} - ${duration}ms`);
                },
                error: (error) => {
                    const duration = Date.now() - now;
                    const { statusCode } = response;
                    this.logger.error(
                        `💥 ${method} ${url} ${statusCode || 500} - ${duration}ms - Error: ${error.message}`,
                    );
                },
            }),
        );
    }
}
