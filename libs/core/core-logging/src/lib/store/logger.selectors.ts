/**
 * @file logger.selectors.ts
 * @Version 1.1.0 // Toegevoegd JSDoc
 * @Author User // (Uw naam/team)
 * @Date 2025-05-28 // (Huidige datum)
 * @Description Definieert NgRx selectors voor het ophalen van data uit de logger state.
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoggerState, LogEntry } from './logger.reducer'; // Import LogEntry
import { LogLevel } from '../logger.config'; // Import LogLevel

/**
 * @const LOGGER_FEATURE_KEY
 * @description De feature key voor de logger state. Moet overeenkomen met hoe het in de root store is geregistreerd.
 */
export const LOGGER_FEATURE_KEY = 'logger'; // Zorg dat dit de key is waaronder de logger state is geregistreerd

/**
 * @const selectLoggerState
 * @description Feature selector voor de `LoggerState`.
 */
export const selectLoggerState = createFeatureSelector<LoggerState>(LOGGER_FEATURE_KEY);

/**
 * @const selectAllLogs
 * @description Selecteert alle opgeslagen logberichten.
 * @returns {LogEntry[]} Een array van alle logberichten.
 */
export const selectAllLogs = createSelector(
  selectLoggerState,
  (state: LoggerState): LogEntry[] => state.logs
);

/**
 * @const selectErrorLogs
 * @description Selecteert alleen de logberichten met het level 'error'.
 * @returns {LogEntry[]} Een array van error logberichten.
 */
export const selectErrorLogs = createSelector(
  selectAllLogs, // Baseert zich op selectAllLogs voor efficiëntie
  (logs: LogEntry[]): LogEntry[] => logs.filter(log => log.level === LogLevel.ERROR) // Gebruik LogLevel enum
);

/**
 * @const selectLoggerError
 * @description Selecteert de eventuele fout die is opgetreden tijdens het loggen zelf.
 * @returns {unknown | null | undefined} De fout, of null/undefined als er geen fout is.
 */
export const selectLoggerError = createSelector(
  selectLoggerState,
  (state: LoggerState): unknown | null | undefined => state.error
);
