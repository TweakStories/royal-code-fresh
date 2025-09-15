import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, exhaustMap, tap } from 'rxjs';
import { AccountActions } from './account.actions';
import { AbstractAccountApiService } from '../data-access/abstract-account-api.service';
import { NotificationService } from '@royal-code/ui/notifications';
import { StructuredError } from '@royal-code/shared/domain';
import { AuthActions } from '@royal-code/store/auth'; 

@Injectable()
export class AccountEffects {
  private actions$ = inject(Actions);
  private accountApiService = inject(AbstractAccountApiService);
  private notificationService = inject(NotificationService);

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.myProfilePageOpened),
      exhaustMap(() => this.accountApiService.getProfileDetails().pipe(
        map((profile) => AccountActions.loadProfileDetailsSuccess({ profile })),
        catchError((error) => {
            const structuredError: StructuredError = { message: 'Het laden van je profiel is mislukt.', code: 'ACC_PROF_LOAD_FAIL', context: { error }, timestamp: Date.now(), severity: 'error' };
            return of(AccountActions.loadProfileDetailsFailure({ error: structuredError }));
        })
      ))
    )
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.updateProfileSubmitted),
      switchMap(({ payload }) => this.accountApiService.updateProfileDetails(payload).pipe(
        tap(() => this.notificationService.showSuccess('Profiel succesvol bijgewerkt!')),
        map((profile) => AccountActions.updateProfileSuccess({ profile })),
        catchError((error) => {
            const structuredError: StructuredError = { message: 'Het bijwerken van je profiel is mislukt.', code: 'ACC_PROF_UPDATE_FAIL', context: { error }, timestamp: Date.now(), severity: 'error' };
            return of(AccountActions.updateProfileFailure({ error: structuredError }));
        })
      ))
    )
  );
  
  updateAvatar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.updateAvatarSubmitted),
      switchMap(({ payload }) => this.accountApiService.updateAvatar(payload).pipe(
          // Na een succesvolle avatar update, moeten we het profiel opnieuw laden om de nieuwe avatarMediaId te krijgen.
          switchMap(() => this.accountApiService.getProfileDetails()),
          tap(() => this.notificationService.showSuccess('Avatar succesvol bijgewerkt!')),
          map((updatedProfile) => AccountActions.updateAvatarSuccess({ updatedProfile })),
          catchError((error) => {
              const structuredError: StructuredError = { message: 'Het bijwerken van je avatar is mislukt.', code: 'ACC_AVATAR_UPDATE_FAIL', context: { error }, timestamp: Date.now(), severity: 'error' };
              return of(AccountActions.updateAvatarFailure({ error: structuredError }));
          })
      ))
    )
  );

    changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.changePasswordSubmitted),
      switchMap(({ payload }) => this.accountApiService.changePassword(payload).pipe(
        tap(() => this.notificationService.showSuccess('Wachtwoord succesvol gewijzigd!')),
        map(() => AccountActions.changePasswordSuccess()),
        catchError((error) => {
            const userMessage = error.status === 400 ? 'Huidige wachtwoord is onjuist.' : 'Het wijzigen van je wachtwoord is mislukt.';
            const structuredError: StructuredError = { message: userMessage, code: 'ACC_PWD_CHANGE_FAIL', context: { status: error.status }, timestamp: Date.now(), severity: 'error' };
            this.notificationService.showError(userMessage); // Toon de fout direct aan de gebruiker
            return of(AccountActions.changePasswordFailure({ error: structuredError }));
        })
      ))
    )
  );
  
  deleteAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.deleteAccountSubmitted),
      switchMap(({ payload }) => this.accountApiService.deleteAccount(payload).pipe(
        tap(() => this.notificationService.showInfo('Je account is succesvol verwijderd.')),
        // Na een succesvolle verwijdering, loggen we de gebruiker uit.
        switchMap(() => of(AccountActions.deleteAccountSuccess(), AuthActions.logoutButtonClicked())),
        catchError((error) => {
            const userMessage = error.status === 400 ? 'Wachtwoord is onjuist.' : 'Het verwijderen van je account is mislukt.';
            const structuredError: StructuredError = { message: userMessage, code: 'ACC_DELETE_FAIL', context: { status: error.status }, timestamp: Date.now(), severity: 'error' };
            this.notificationService.showError(userMessage);
            return of(AccountActions.deleteAccountFailure({ error: structuredError }));
        })
      ))
    )
  );
}