// src/services/loggingService.ts
import winston from 'winston';
import { env_var } from '../config/env/env';
// import config from '../config/app';

const { format, transports } = winston;

export class Logger {
    private logger: winston.Logger;
    readonly env = env_var.NODE_ENV || 'development';

    constructor(context: string) {
        this.logger = winston.createLogger({
            // level: this.level(),
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.errors({ stack: true }),
                format.splat(),
                format.json()
            ),
            defaultMeta: { context },
            transports: [
                // Write all logs to console
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.printf(({ timestamp, level, message, context, ...meta }) => {
                            return `${timestamp} [${context}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                        })
                    )
                })
            ]
        });
    }

    log(level: string, message: string, meta: object = {}): void {
        this.logger.log(level, message, meta);
    }

    error(message: string, meta: object = {}): void {
        this.log('error', message, meta);
    }

    warn(message: string, meta: object = {}): void {
        this.log('warn', message, meta);
    }

    info(message: string, meta: object = {}): void {
        this.log('info', message, meta);
    }
}