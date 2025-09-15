/**
 * @file index.ts
 * @Version 3.1.0 (Modern NgRx Feature Exports - Corrected)
 * @Description
 *   De publieke API surface voor de @royal-code/store/auth library.
 *   Deze file exporteert de essentiële elementen die andere delen van de
 *   applicatie nodig hebben, zoals de Facade, de Actions, de providers-functie,
 *   en de benodigde state-interface en selectors voor guards.
 */

// Publieke interface om met de store te interageren
export * from './lib/state/auth.facade';

// Acties die mogelijk door andere features (of interceptors) worden gedispatcht
export * from './lib/state/auth.actions';

// De functie om de feature te registreren in de applicatie
export * from './lib/auth.providers';

export type { AuthState } from './lib/state/auth.feature';
export { selectAuthState, selectIsAuthenticated, selectCurrentUser, selectAuthLoading, selectAuthError, selectAccessToken, authReducer, AUTH_FEATURE_KEY, authFeature } from './lib/state/auth.feature';
