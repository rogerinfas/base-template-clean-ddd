import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

/**
 * Logger Service
 * 
 * Servicio simple de logging.
 * En producción, podrías reemplazar con Winston o Pino.
 */
@Injectable()
export class LoggerService implements NestLoggerService {
    log(message: string, context?: string) {
        console.log(`[${context || 'App'}] ${message}`);
    }

    error(message: string, trace?: string, context?: string) {
        console.error(`[${context || 'App'}] ${message}`, trace);
    }

    warn(message: string, context?: string) {
        console.warn(`[${context || 'App'}] ${message}`);
    }

    debug(message: string, context?: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEBUG] [${context || 'App'}] ${message}`);
        }
    }

    verbose(message: string, context?: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[VERBOSE] [${context || 'App'}] ${message}`);
        }
    }
}

