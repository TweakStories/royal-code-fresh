/**
 * @file auth.facade.ts
 * @Version 3.1.0 (Complete Dual API - Signals & Observables)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   De publieke API voor de Auth-state. Deze facade is de enige interface die componenten
 *   en effects zouden moeten gebruiken. Het biedt nu een complete, duale API met zowel
 *   Signals (voor UI) als Observables (voor RxJS-stromen zoals in effects).
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs'; // <-- Importeer Observable
import { AuthActions } from './auth.actions';
import { selectIsAuthenticated, selectCurrentUser, selectAuthLoading, selectAuthError } from './auth.feature';
import { Profile } from '@royal-code/shared/domain';
import { LoginCredentials, RegisterCredentials } from '@royal-code/auth/domain';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(Store);

  // --- PUBLIC API: STATE SIGNALS (voor UI) ---

  /** @description Een signaal dat `true` is als de gebruiker geauthenticeerd is. */
  readonly isAuthenticated: Signal<boolean> = this.store.selectSignal(selectIsAuthenticated);

  /** @description Een signaal dat het profiel van de huidige gebruiker bevat, of `null` indien niet ingelogd. */
  readonly currentUser: Signal<Profile | null> = this.store.selectSignal(selectCurrentUser);

  /** @description Een signaal dat `true` is als er een authenticatie-operatie (login, refresh) bezig is. */
  readonly isLoading: Signal<boolean> = this.store.selectSignal(selectAuthLoading);

  /** @description Een signaal dat de laatste authenticatie-foutmelding bevat, of `null`. */
  readonly error: Signal<string | null> = this.store.selectSignal(selectAuthError);

  /** @description Een Observable-stream die `true` is als de gebruiker geauthenticeerd is. */
  readonly isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);

  /** @description Een Observable-stream die het profiel van de huidige gebruiker bevat. */
  readonly currentUser$: Observable<Profile | null> = this.store.select(selectCurrentUser);

  readonly currentUserId: Signal<string | null> = computed(() => this.currentUser()?.id ?? null);

  /** @description Een Observable-stream die `true` is als er een authenticatie-operatie bezig is. */
  readonly isLoading$: Observable<boolean> = this.store.select(selectAuthLoading);

  /** @description Een Observable-stream die de laatste authenticatie-foutmelding bevat. */
  readonly error$: Observable<string | null> = this.store.select(selectAuthError);

  // --- PUBLIC API: ACTION DISPATCHERS ---

  register(credentials: RegisterCredentials): void {
    this.store.dispatch(AuthActions.registerPageSubmitted({ credentials }));
  }

  /** @description Start het login-proces door een actie te dispatchen. */
  login(credentials: LoginCredentials): void {
    this.store.dispatch(AuthActions.loginPageSubmitted({ credentials }));
  }

  /** @description Start het uitlog-proces. */
  logout(): void {
    this.store.dispatch(AuthActions.logoutButtonClicked());
  }

  /** @description Vraagt een controle van de auth-status aan, meestal bij het opstarten van de app. */
  checkAuthStatus(): void {
    this.store.dispatch(AuthActions.checkAuthStatusOnAppInit());
  }

  /** @description Wist de huidige foutmelding uit de state. */
  clearAuthError(): void {
    this.store.dispatch(AuthActions.clearAuthError());
  }
}
