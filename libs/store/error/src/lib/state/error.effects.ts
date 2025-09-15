/**
 * @file error.effects.ts
 * @Version 5.0.0 (NgZone Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @description
 *   Handles global side effects related to error handling, now with NgZone integration
 *   to prevent "running outside NgZone" errors.
 */
import { Injectable, inject, NgZone } from '@angular/core'; // << NgZone toegevoegd
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { tap, filter, delay, switchMap } from 'rxjs/operators';
import { ErrorActions } from './error.actions';
import { LoggerService } from '@royal-code/core/core-logging';
import { NotificationService } from '@royal-code/ui/notifications';

@Injectable()
export class ErrorEffects {
  private readonly actions$ = inject(Actions);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly zone = inject(NgZone); // << NgZone geïnjecteerd
  private readonly logPrefix = '[ErrorEffects]';

  showErrorNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ErrorActions.reportError),
      tap(({ error: structuredError }) => {
        const message = structuredError.message;
        const severity = structuredError.severity ?? 'error';

        this.logger.error(`${this.logPrefix} An error was reported`, {
          source: structuredError.source,
          message,
          severity,
          context: structuredError.context,
        });

        switch (severity) {
          case 'error':
          case 'critical':
            this.notificationService.showError(message, { duration: 7000 });
            break;
          case 'warning':
            this.notificationService.showWarning(message);
            break;
          case 'info':
            this.notificationService.showInfo(message);
            break;
        }
      })
    ),
    { dispatch: false }
  );

  autoClearNonPersistentErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ErrorActions.reportError),
      filter(({ error: structuredError }) => {
        return structuredError.isPersistent !== true && (structuredError.severity === 'warning' || structuredError.severity === 'info');
      }),
      delay(5000),
      switchMap(() => this.zone.run(() => {
        this.logger.debug(`${this.logPrefix} Auto-clearing non-persistent error.`);
        return of(ErrorActions.clearCurrentError());
      }))
    )
  );
}