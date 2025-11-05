/**
 * Structured logging utility
 * Provides consistent logging across the application
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, any>;
  error?: string;
  stack?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(logLevel: LogLevel = 'info') {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.logLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp || new Date().toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;
    const context = entry.context ? ` [${entry.context}]` : '';

    let message = `${prefix}${context} ${entry.message}`;

    if (entry.data && Object.keys(entry.data).length > 0) {
      message += ` ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      message += `\nError: ${entry.error}`;
    }

    if (entry.stack) {
      message += `\nStack: ${entry.stack}`;
    }

    return message;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data: data?.data,
      error: data?.error instanceof Error ? data.error.message : undefined,
      stack: data?.error instanceof Error ? data.error.stack : undefined,
    };

    const formatted = this.formatEntry(entry);

    // Output to console based on level
    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }

    // In production, you could send to external logging service (Sentry, DataDog, etc.)
    // sendToLoggingService(entry);
  }

  debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, error?: Error | any, data?: any): void {
    this.log('error', message, context, { error, ...data });
  }
}

// Create singleton instance
const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
export const logger = new Logger(logLevel);

/**
 * Create a child logger with context
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, data?: any) => logger.debug(message, context, data),
    info: (message: string, data?: any) => logger.info(message, context, data),
    warn: (message: string, data?: any) => logger.warn(message, context, data),
    error: (message: string, error?: Error, data?: any) => logger.error(message, context, error, data),
  };
}
