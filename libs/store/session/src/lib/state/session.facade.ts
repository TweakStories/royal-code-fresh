/**
 * @file session.facade.ts
 * @Description Session facade for components to interact with session state.
 */

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SessionActions } from './session.actions';
import { sessionFeature } from './session.feature';

@Injectable({
  providedIn: 'root'
})
export class SessionFacade {
  private readonly store = inject(Store);

  readonly isActive$: Observable<boolean> = this.store.select(sessionFeature.selectIsActive);
  readonly sessionId$: Observable<string | null> = this.store.select(sessionFeature.selectSessionId);
  readonly expiryTime$: Observable<Date | null> = this.store.select(sessionFeature.selectExpiryTime);

  startSession(sessionId: string, expiryTime: Date): void {
    this.store.dispatch(SessionActions.startSession({ sessionId, expiryTime }));
  }

  endSession(): void {
    this.store.dispatch(SessionActions.endSession());
  }

  checkSession(): void {
    this.store.dispatch(SessionActions.checkSession());
  }
}