/**
 * @file auth.guard.ts
 * @Version 2.1.0 (Modernized & Corrected Imports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-16
 * @Description
 *   Een functionele Angular route guard (`CanActivateFn`) die routes beschermt die
 *   authenticatie vereisen. Deze versie is bijgewerkt om te werken met de
 *   moderne, op `createFeature` gebaseerde NgRx store.
 *
 *   Strategie:
 *   De guard importeert de state en selectors direct uit het `auth.feature.ts`
 *   bestand om robuust te zijn en de publieke API van de library niet te vervuilen.
 *   Het wacht op een stabiele (niet-ladende) state alvorens een beslissing te nemen.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, take, tap } from 'rxjs/operators';
import { LoggerService } from '@royal-code/core/core-logging';
import { AuthState, selectAuthState } from '@royal-code/store/auth';

// ==============================================================================
// CORRECTE IMPORT: Rechtstreeks vanuit het feature-bestand.
// ==============================================================================

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const store = inject(Store);
  const router = inject(Router);
  const logger = inject(LoggerService);
  const LOG_PREFIX = '[AuthGuard]';

  logger.info(`${LOG_PREFIX} Activating for route: ${state.url}`);

  return store.select(selectAuthState).pipe(
    tap(authState => logger.debug(`${LOG_PREFIX} Observing auth state...`, { loading: authState.loading, authenticated: authState.isAuthenticated })),

    // Wacht tot de state stabiel is (niet aan het laden).
    filter((authState: AuthState) => {
      if (authState.loading) {
        logger.info(`${LOG_PREFIX} Auth state is 'loading'. Guard wacht op een stabiele state...`);
        return false;
      }
      return true;
    }),

    // Neem de eerste stabiele state en voltooi de stream.
    take(1),

    // Neem de definitieve beslissing.
    map((stableAuthState: AuthState) => {
      if (stableAuthState.isAuthenticated) {
        logger.info(`${LOG_PREFIX} Access GRANTED for route: ${state.url}.`);
        return true;
      }

      logger.warn(`${LOG_PREFIX} Access DENIED for route: ${state.url}. Redirecting to /login.`);
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }),

    // Veiligheidsnet.
    catchError(error => {
      logger.error(`${LOG_PREFIX} An unexpected error occurred in the auth guard pipe. Redirecting to login.`, error);
      router.navigate(['/login']);
      return of(false);
    })
  );
};
