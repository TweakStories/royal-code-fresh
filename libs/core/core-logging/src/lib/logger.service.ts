/**
 * @file logger.service.ts
 * @Version 1.2.0 // Finale aanpassingen voor consistentie met store
 * @Author User // (Uw naam/team)
 * @Date 2025-05-28 // (Huidige datum)
 * @Description Service voor applicatie-brede logging. Dispatcht log entries naar de NgRx store
 *              en voert de dispatch uit binnen NgZone voor compatibiliteit met runtime checks.
 */
import { Injectable, Inject, Optional, inject, NgZone } from '@angular/core';
import { LOGGER_CONFIG } from './logger.token';
import { LoggerConfig, LogLevel, ExternalLogger } from './logger.config';
import { Store } from '@ngrx/store';
import * as LoggerActions from './store/logger.actions'; // Import alle actions
// LogEntry is niet direct nodig hier, omdat de action payload de benodigde velden definieert
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly config: LoggerConfig;
  private readonly store = inject(Store);
  private readonly zone = inject(NgZone);

  // Prefer inject() over constructor parameter injection (Angular v16+ best practice)
  constructor() {
    const config = inject(LOGGER_CONFIG, { optional: true });
    this.config = config || {
      level: LogLevel.DEBUG,
      enableExternalLogging: false,
      appName: 'DefaultApp', // Default appName
    };
  }

  private getLogPrefix(level: LogLevel): string {
    const appNamePrefix = this.config.appName ? ` [${this.config.appName}]` : '';
    return `[${level.toUpperCase()}]${appNamePrefix}`;
  }

  public debug(message: string, ...data: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`${this.getLogPrefix(LogLevel.DEBUG)} ${message}`, ...data);
      this.dispatchToAction(LogLevel.DEBUG, message, data);
      this.externalLog(LogLevel.DEBUG, message, data);
    }
  }

  public info(message: string, ...data: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`${this.getLogPrefix(LogLevel.INFO)} ${message}`, ...data);
      this.dispatchToAction(LogLevel.INFO, message, data);
      this.externalLog(LogLevel.INFO, message, data);
    }
  }

  public warn(message: string, ...data: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`${this.getLogPrefix(LogLevel.WARN)} ${message}`, ...data);
      this.dispatchToAction(LogLevel.WARN, message, data);
      this.externalLog(LogLevel.WARN, message, data);
    }
  }

  public error(message: string, errorObj?: unknown, ...additionalData: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = `${message}: ${this.formatError(errorObj)}`;
      const consoleMessage = `${this.getLogPrefix(LogLevel.ERROR)} ${message} - Error Details:`;

      console.error(consoleMessage, errorObj ?? '', ...additionalData);
      // Voor de action sturen we de geformatteerde message en de originele error objecten in 'data'
      this.dispatchToAction(LogLevel.ERROR, formattedMessage, [errorObj, ...additionalData].filter(d => d !== undefined));
      this.externalLog(LogLevel.ERROR, formattedMessage, [errorObj, ...additionalData].filter(d => d !== undefined));
    }
  }

  public formatError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      let errMsg = `HTTP Error ${error.status} (${error.statusText || 'Unknown Status'}) on ${error.url || 'unknown URL'}`;
      if (error.error) {
        if (typeof error.error === 'string') {
          errMsg += `: ${error.error}`;
        } else if (error.error.message && typeof error.error.message === 'string') {
          errMsg += `: ${error.error.message}`;
        } else if (error.error.error && typeof error.error.error === 'string') {
          errMsg += `: ${error.error.error}`;
        } else {
          try {
            errMsg += ` - Body: ${JSON.stringify(error.error).substring(0, 150)}...`;
          } catch {
            errMsg += ` - (Unstringifiable error body)`;
          }
        }
      }
      return errMsg;
    } else if (error instanceof Error) {
      return `${error.name}: ${error.message}${error.stack ? `\nStack: ${error.stack.substring(0, 200)}...` : ''}`;
    } else if (typeof error === 'string') {
      return error;
    } else {
      try {
        return `Unknown error: ${JSON.stringify(error)}`;
      } catch {
        return 'Unknown error occurred (cannot stringify)';
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const order = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.NONE];
    const currentIndex = order.indexOf(level);
    const configIndex = order.indexOf(this.config.level);
    return currentIndex !== -1 && configIndex !== -1 && currentIndex >= configIndex;
  }

  /**
   * @method dispatchToAction
   * @description Construeert de payload voor de `addLog` action en dispatcht deze.
   */
  private dispatchToAction(level: LogLevel, message: string, data: unknown[]): void {
    // De payload voor de 'addLog' action, zoals gedefinieerd in logger.actions.ts
    const actionPayload = {
      level,
      message,
      data: data && data.length > 0 ? (data.length === 1 && data[0] !== undefined ? data[0] : data) : undefined,
      createdAt: Date.now(), // timestamp als number
    };

    this.zone.run(() => {
      this.store.dispatch(LoggerActions.addLog(actionPayload));
    });
  }

  private externalLog(level: LogLevel, message: string, data: unknown[]): void {
    if (this.config.enableExternalLogging && this.config.externalLogger) {
      try {
        this.config.externalLogger.log(level, message, data);
      } catch (e) {
        const logPrefix = this.getLogPrefix(LogLevel.ERROR);
        console.error(`${logPrefix} [LoggerService] Failed to send log to external logger.`, e);
        this.zone.run(() => {
            this.store.dispatch(LoggerActions.addLog({
                level: LogLevel.ERROR,
                message: 'Failed to send log to external logger.',
                data: { originalMessage: message, externalLoggerError: this.formatError(e) },
                createdAt: Date.now(),
            }));
        });
      }
    }
  }
}
