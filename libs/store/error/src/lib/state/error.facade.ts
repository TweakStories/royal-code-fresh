/**
 * @file error.facade.ts
 * @version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-16
 * @description
 *   Provides a clean, 'Signal-First' API for UI components to interact with the
 *   global error state. It abstracts NgRx complexity, exposing simple signals for
 *   observing errors and methods for reporting or clearing them.
 */
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ErrorActions } from './error.actions';
import { selectCurrentError, selectHasActiveError } from './error.feature';

@Injectable({ providedIn: 'root' })
export class ErrorFacade {
  private readonly store = inject(Store);

  /**
   * @description A signal that holds the most recently reported `AppError` object,
   *              or `null` if there is no active error.
   */
  public readonly currentError = toSignal(this.store.select(selectCurrentError));

  /**
   * @description A computed signal that emits `true` if there is an active error,
   *              and `false` otherwise.
   */
  public readonly hasActiveError = toSignal(this.store.select(selectHasActiveError));

  /**
   * @function clearCurrentError
   * @description Dispatches an action to clear the currently active error from the state.
   */
  public clearCurrentError(): void {
    this.store.dispatch(ErrorActions.clearCurrentError());
  }
}
