/**
 * @file logger.config.ts
 * @Version 1.1.0 // Toegevoegd appName
 * @Author User // (Uw naam/team)
 * @Date 2025-05-28 // (Huidige datum)
 * @Description Definieert de configuratie-interface, log levels, en externe logger interface
 *              voor de LoggerService.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  NONE = 'none', // Geen logs tonen of versturen
}

export interface ExternalLogger {
  /**
   * @method log
   * @description Methode die door de externe logger geïmplementeerd moet worden om logs te verwerken.
   * @param {LogLevel} level - Het niveau van het logbericht.
   * @param {string} message - Het logbericht.
   * @param {unknown[]} [data] - Optionele extra data.
   */
  log: (level: LogLevel, message: string, data?: unknown[]) => void;
}

export interface LoggerConfig {
  /** @description Het minimale log level dat verwerkt moet worden. */
  level: LogLevel;
  /** @description Optionele naam van de applicatie, gebruikt voor context in logs. */
  appName?: string; // << HIER TOEGEVOEGD
  /** @description Of logging naar een externe service ingeschakeld is. */
  enableExternalLogging: boolean;
  /** @description Optionele instantie van een externe logger. */
  externalLogger?: ExternalLogger;
}
