/**
 * @file logger.effects.ts
 * @Version 1.1.0 // Toegevoegd JSDoc
 * @Author User // (Uw naam/team)
 * @Date 2025-05-28 // (Huidige datum)
 * @Description Definieert NgRx effects voor de logger feature, met name voor het asynchroon
 *              versturen van logberichten naar een externe API service.
 */
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as LoggerActions from './logger.actions'; // Import alle actions
import { mergeMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

import { LoggerApiService } from '../logger-api.service';
import { LogEntry, LoggerState } from './logger.reducer'; // Import LogEntry
import { LoggerConfig  } from '../logger.config'; // Import config
import { LOGGER_CONFIG } from '../logger.token';

@Injectable() // Injectable was niet providedIn: 'root', maar wordt via provideEffects() geregistreerd
export class LoggerEffects {
  private actions$ = inject(Actions);
  private loggerApiService = inject(LoggerApiService);
  private store = inject(Store<LoggerState>); // Voor eventuele state access
  private config = inject<LoggerConfig>(LOGGER_CONFIG); // Voor appName als context

  /**
   * @effect sendLog$
   * @description Effect dat luistert naar de `addLog` action. Wanneer deze action wordt gedispatcht,
   *              construeert het een `LogEntry` (met een nieuwe ID en context) en probeert deze
   *              via `LoggerApiService` naar een backend te sturen.
   *              Dispatcht `addLogSuccess` of `addLogFailure` op basis van het resultaat.
   * @listens LoggerActions.addLog
   * @dispatches LoggerActions.addLogSuccess
   * @dispatches LoggerActions.addLogFailure
   */
  sendLog$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LoggerActions.addLog), // Luistert naar de initiële 'Add Log' action
      map(action => {
        // Construeer de volledige LogEntry hier, inclusief ID en context
        const logEntryToApi: LogEntry = {
          id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Langere random ID
          level: action.level,
          message: action.message,
          data: action.data,
          createdAt: action.timestamp,
          context: this.config.appName || 'Application', // Voeg context toe
        };
        return logEntryToApi;
      }),
      mergeMap((logEntry: LogEntry) => // Nu hebben we de volledige LogEntry
        this.loggerApiService.sendLog(logEntry).pipe(
          map((apiResponseLog: LogEntry) => LoggerActions.addLogSuccess({ log: apiResponseLog })), // API retourneert mogelijk de opgeslagen log
          catchError(error => of(LoggerActions.addLogFailure({ error })))
        )
      )
    );
  });
}
