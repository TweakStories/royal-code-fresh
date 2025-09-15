import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, timer } from 'rxjs';
import { catchError, map, switchMap, concatMap, tap, withLatestFrom, mergeMap } from 'rxjs/operators';
import { UserActions } from './user.actions';
import { AuthActions } from '@royal-code/store/auth';
import { AbstractAccountApiService } from '@royal-code/features/account/core';
import { NotificationService } from '@royal-code/ui/notifications';
import { LoggerService } from '@royal-code/core/core-logging';
import { Address, ApplicationSettings, Profile } from '@royal-code/shared/domain';
import { userFeature } from './user.feature';
import { Store } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly accountService = inject(AbstractAccountApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly store = inject(Store);
  private readonly LOG_PREFIX = '[UserEffects]';
  private readonly refreshAttempted = new Set<string>();

  loadDataOnLogin$ = createEffect(() =>
    this.actions$.pipe(ofType(AuthActions.loginSuccess, AuthActions.sessionRestored), map(() => UserActions.contextInitialized()))
  );

  triggerInitialLoads$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.contextInitialized),
      switchMap(() => [
        UserActions.loadProfileRequested(),
        UserActions.loadSettingsRequested(),
        UserActions.loadAddressesRequested()
      ])
    )
  );

   loadUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadProfileRequested),
      switchMap(() => {
        const attemptKey = 'profile';
        
        return this.accountService.getProfileDetails().pipe(
          map(profileDetails => {
            this.refreshAttempted.delete(attemptKey);
            const profile: Profile = {
              id: profileDetails.id,
              displayName: profileDetails.displayName,
            };
            return UserActions.loadProfileSuccess({ profile });
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !this.refreshAttempted.has(attemptKey)) {
              // Markeer dat we een refresh proberen
              this.refreshAttempted.add(attemptKey);
              this.logger.info('[UserEffects] 401 ontvangen, probeer token te vernieuwen...');
              
              // Dispatch refresh en probeer opnieuw
              return of(AuthActions.refreshTokenRequested()).pipe(
                mergeMap(() => timer(1000)), // Wacht even op refresh
                mergeMap(() => of(UserActions.loadProfileRequested()))
              );
            }
            
            this.refreshAttempted.delete(attemptKey);
            
            if (error.status === 401) {
              // Tweede 401 = echt uitloggen
              return of(AuthActions.logoutButtonClicked());
            }
            
            return of(UserActions.loadProfileFailure({ 
              error: 'errors.user.profileLoadFailed' 
            }));
          })
        );
      })
    )
  );

loadSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadSettingsRequested),
      switchMap(() =>
        this.accountService.getUserSettings().pipe(
          map((settings: ApplicationSettings) =>
            UserActions.loadSettingsSuccess({ settings })
          ),
          catchError((err: HttpErrorResponse) => {
            this.logger.error(`${this.LOG_PREFIX} Failed to load settings from API.`, err);
            if (err.status === 401) return of(AuthActions.logoutButtonClicked()); // <-- ADDED: Handle 401 Unauthorized
            return of(UserActions.loadSettingsFailure({ error: 'Failed to load settings.' }));
          })
        )
      )
    )
  );


  loadAddresses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadAddressesRequested),
      switchMap(() => {
        this.logger.debug(`${this.LOG_PREFIX} Requesting addresses from API.`);
        return this.accountService.getAddresses().pipe(
          map((addresses: Address[]) => {
            this.logger.info(`${this.LOG_PREFIX} API returned addresses. Count: ${addresses.length}. Data:`, addresses);
            return UserActions.loadAddressesSuccess({ addresses });
          }),
          catchError((err: HttpErrorResponse) => {
            this.logger.error(`${this.LOG_PREFIX} Failed to load addresses from API.`, err);
            if (err.status === 401) return of(AuthActions.logoutButtonClicked()); // <-- ADDED: Handle 401 Unauthorized
            return of(UserActions.loadAddressesFailure({ error: 'Failed to load addresses.' }));
          })
        );
      })
    )
  );


  
  createAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createAddressSubmitted),
      concatMap(({ payload, tempId }) =>
        this.accountService.createAddress(payload).pipe(
          map(address => {
            this.notificationService.showSuccess('Adres toegevoegd!');
            return UserActions.createAddressSuccess({ address, tempId });
          }),
          catchError((err: HttpErrorResponse) => {
            const error = err.message || 'Failed to create address.';
            return of(UserActions.createAddressFailure({ error, tempId }));
          })
        )
      )
    )
  );

updateAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateAddressSubmitted),
      concatMap(({ id, payload }) =>
        // <<< FIX: Payload hoeft niet meer gecast te worden, omdat de abstracte service nu UpdateAddressPayload verwacht. >>>
        // De service retourneert nu een complete Address, wat past bij Update<UserAddress>.
        this.accountService.updateAddress(id, payload).pipe(
          map(updatedAddress => {
            this.notificationService.showSuccess('Adres bijgewerkt!');
            // 'changes' verwacht Partial<UserAddress>, en updatedAddress is een volledige Address.
            // Dit is compatibel, dus een simpele toewijzing is prima.
            return UserActions.updateAddressSuccess({ addressUpdate: { id, changes: updatedAddress } });
          }),
          catchError(() => of(UserActions.updateAddressFailure({ error: 'Failed to update address.', id })))
        )
      )
    )
  );


  deleteAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteAddressSubmitted),
      withLatestFrom(this.store.select(userFeature.selectAddressEntities)),
      concatMap(([{ id }, entities]) => {
        const originalAddress = entities[id] ?? null;
        return this.accountService.deleteAddress(id).pipe(
          map(() => {
            this.notificationService.showSuccess('Adres verwijderd.');
            return UserActions.deleteAddressSuccess({ id });
          }),
          catchError(() => {
            const errorMessage = "Verwijderen mislukt. Adres is hersteld.";
            this.notificationService.showError(errorMessage);
            return of(UserActions.deleteAddressFailure({ error: errorMessage, id, originalAddress }));
          })
        )
      })
    )
  );

  reloadAddressesAfterModification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UserActions.createAddressSuccess,
        UserActions.updateAddressSuccess,
        UserActions.deleteAddressSuccess
      ),
      tap(action => this.logger.info(`[UserEffects] Address list modified via ${action.type}. Triggering reload.`)),
      map(() => UserActions.loadAddressesRequested())
    )
  );
}