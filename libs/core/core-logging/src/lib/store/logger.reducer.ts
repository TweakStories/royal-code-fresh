/**
 * @file logger.reducer.ts
 * @Version 1.1.0 // Toegevoegd JSDoc en consistentie
 * @Author User // (Uw naam/team)
 * @Date 2025-05-28 // (Huidige datum)
 * @Description Definieert de NgRx reducer, state interface, en initiële state voor de logger feature.
 */
import { createReducer, on, Action } from '@ngrx/store';
import * as LoggerActions from './logger.actions'; // Import alle actions
import { LogEntry, LoggerState } from './logger.models';

// Re-export types for backward compatibility
export type { LogEntry, LoggerState } from './logger.models';

/**
 * @const initialLoggerState
 * @description De initiële staat voor de logger feature.
 */
export const initialLoggerState: LoggerState = {
  logs: [],
  error: null,
};

const _loggerReducer = createReducer(
  initialLoggerState,
  on(LoggerActions.addLog, (state, { level, message, data, createdAt }): LoggerState => {
    // De 'context' wordt hier niet direct meegegeven door de action,
    // maar kan door de LoggerService in de 'data' gestopt worden of is onderdeel van de message.
    // Of, de LoggerService dispatcht een payload die direct LogEntry is (minus id).
    // Voor nu houden we de reducer simpel, aannemend dat de LoggerService de juiste data aanlevert
    // voor de action, en het Effect/de Reducer de uiteindelijke LogEntry construeert.
    // Echter, uw effect lijkt 'addLog' niet te gebruiken om state te updaten, maar direct 'addLogSuccess'.
    // We passen de reducer aan om de 'LogEntry' te verwachten die het effect zal construeren.
    // De 'addLog' action is dan meer een trigger voor het effect.
    // De logica hieronder voor 'addLog' is hoe het ZOU zijn als addLog direct state updatet.
    // Gezien uw effect, is deze on(LoggerActions.addLog) mogelijk niet eens nodig,
    // of de log wordt pas toegevoegd bij addLogSuccess. Ik laat hem staan voor nu.
    const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Langere random ID
        level,
        message,
        data,
        createdAt: createdAt,
        // context: data && (data as any).context ? (data as any).context : 'Application' // Voorbeeld als context in data zit
    };
    return {
      ...state,
      logs: [...state.logs, newLog],
      error: null, // Reset error bij een nieuwe logpoging
    };
  }),

  on(LoggerActions.addLogSuccess, (state, { log }): LoggerState => ({
    ...state,
    // Als de log al in de state zit via de on(LoggerActions.addLog) hierboven, dan updaten.
    // Als de log alleen via het effect en addLogSuccess in de state komt, dan toevoegen.
    // Uitgaande van uw effect, komt de log via addLogSuccess, dus we hoeven niet te mappen/updaten,
    // maar voegen toe als het nog niet bestaat (hoewel het effect het ID al zou moeten hebben).
    // Voor de eenvoud en robuustheid, als de log al bestaat met hetzelfde ID, update het, anders voeg toe.
    logs: state.logs.find(l => l.id === log.id)
        ? state.logs.map(l => l.id === log.id ? log : l)
        : [...state.logs, log],
    error: null,
  })),

  on(LoggerActions.addLogFailure, (state, { error }): LoggerState => ({
    ...state,
    error: error,
  })),

  on(LoggerActions.clearLogs, (state): LoggerState => ({
    ...state,
    logs: [],
    error: null,
  }))
);

export function loggerReducer(state: LoggerState | undefined, action: Action): LoggerState {
  return _loggerReducer(state, action);
}
