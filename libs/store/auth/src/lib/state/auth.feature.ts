/**
 * @file auth.feature.ts
 * @Version 3.0.0 (Modern Signal Store Feature)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-16
 * @Description
 *   Definieert de volledige "feature slice" voor authenticatie met behulp van NgRx `createFeature`.
 *   Deze aanpak centraliseert de state-interface, de reducer-logica en de selectors in één bestand.
 *   De reducer-logica is een exacte vertaling van de bewezen-werkende flow om race-condities
 *   te voorkomen en een stabiele interactie met de router guard te garanderen.
 */
import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { Profile } from '@royal-code/shared/domain';

// ==================================================================================
// 1. STATE DEFINITIE
// ==================================================================================

export interface AuthState {
  isAuthenticated: boolean;
  user: Profile | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};


// ==================================================================================
// 2. NGRX FEATURE CREATIE (REDUCER + SELECTORS)
// ==================================================================================

export const authFeature = createFeature({
  name: 'auth', // Dit wordt de key in de globale store state
  reducer: createReducer(
    initialAuthState,

    // --- Login Flow ---
    on(AuthActions.loginPageSubmitted, (state): AuthState => ({
      ...state,
      loading: true,
      error: null
    })),

    // Zet loading op false na de login API call, zoals in de originele werkende versie.
    on(AuthActions.loginSuccess, (state, { response }): AuthState => ({
      ...state,
      isAuthenticated: true,
      user: response.user ?? null,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? null,
      loading: false,
      error: null
    })),

    on(AuthActions.loginFailure, (state, { error }): AuthState => ({
      ...initialAuthState,
      error: error
    })),

    on(AuthActions.sessionRestored, (state, { accessToken, refreshToken, decodedUser }): AuthState => ({
      ...state,
      isAuthenticated: true,
      accessToken,
      refreshToken: refreshToken ?? null,
      user: decodedUser,
      loading: false,
      error: null,
    })),

    // --- Refresh Token Flow ---
    on(AuthActions.refreshTokenRequested, (state): AuthState => ({
      ...state,
      loading: true,
      error: null
    })),

    on(AuthActions.refreshTokenSuccess, (state, { response }): AuthState => ({
      ...state,
      isAuthenticated: true,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? state.refreshToken,
      loading: false,
      error: null
    })),

    on(AuthActions.refreshTokenFailure, (state, { error }): AuthState => ({
      ...initialAuthState,
      error: error
    })),

    // --- Logout Flow ---
    on(AuthActions.logoutButtonClicked, (state): AuthState => ({
      ...state,
      loading: true,
    })),

    on(AuthActions.logoutCompleted, (): AuthState => ({
      ...initialAuthState
    })),

        on(AuthActions.registerPageSubmitted, (state): AuthState => ({
      ...state,
      loading: true,
      error: null
    })),

    on(AuthActions.registerSuccess, (state, { response }): AuthState => ({
      ...state,
      isAuthenticated: true,
      user: response.user ?? null,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? null,
      loading: false,
      error: null
    })),

    on(AuthActions.registerFailure, (state, { error }): AuthState => ({
      ...initialAuthState,
      error: error
    })),



    // --- Clear Error ---
    on(AuthActions.clearAuthError, (state): AuthState => ({
      ...state,
      error: null
    }))
  ),
});

// ==================================================================================
// 3. EXPORTEER DE GEGENEREERDE SELECTORS MET ALIASING
// ==================================================================================
export const {
  name: AUTH_FEATURE_KEY,
  reducer: authReducer,

  selectAuthState,
  selectIsAuthenticated,
  selectAccessToken,

  // Hernoem de automatisch gegenereerde selectors voor externe consistentie
  selectUser: selectCurrentUser,
  selectLoading: selectAuthLoading,
  selectError: selectAuthError,

} = authFeature;
