/**
 * @file logger.actions.ts
 * @Version 1.1.0 // Toegevoegd JSDoc en consistentie
 * @Author User // (Uw naam/team)
 * @Date 2025-05-28 // (Huidige datum)
 * @Description Definieert NgRx actions voor de logger feature.
 */
import { createAction, props } from '@ngrx/store';
import { LogLevel } from '../logger.config';
import { LogEntry } from './logger.models'; // Nodig voor addLogSuccess payload

/**
 * @const addLog
 * @description Action om een nieuw logbericht toe te voegen aan de state.
 *              Deze action wordt gedispatcht door de `LoggerService`.
 *              De payload komt overeen met de `LogEntry` structuur, minus de `id`.
 * @property {LogLevel} level - Het niveau van het logbericht.
 * @property {string} message - Het logbericht.
 * @property {unknown} [data] - Optionele extra data.
 * @property {number} timestamp - Het tijdstip van het logbericht (milliseconds since epoch).
 */
export const addLog = createAction(
  '[Logger] Add Log',
  props<{ level: LogLevel; message: string; data?: unknown; createdAt: number }>()
  // Payload is hier iets anders dan LogEntry (mist id en context),
  // Reducer en Effect zullen LogEntry construeren.
);

/**
 * @const addLogSuccess
 * @description Action die gedispatcht wordt nadat een logbericht succesvol
 *              naar een externe service is verstuurd (indien van toepassing).
 * @property {LogEntry} log - Het volledige logbericht object zoals het is opgeslagen of verstuurd.
 */
export const addLogSuccess = createAction(
  '[Logger] Add Log Success',
  props<{ log: LogEntry }>() // Aangepast naar LogEntry voor type consistentie
);

/**
 * @const addLogFailure
 * @description Action die gedispatcht wordt als het versturen van een logbericht
 *              naar een externe service mislukt (indien van toepassing).
 * @property {unknown} error - Het foutobject.
 */
export const addLogFailure = createAction(
  '[Logger] Add Log Failure',
  props<{ error: unknown }>()
);

/**
 * @const clearLogs
 * @description Action om alle opgeslagen logberichten uit de state te verwijderen.
 */
export const clearLogs = createAction('[Logger] Clear Logs');
