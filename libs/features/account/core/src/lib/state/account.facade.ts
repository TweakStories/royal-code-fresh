import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { accountFeature } from './account.feature';
import { AccountActions } from './account.actions';
import { UpdateUserProfilePayload, UpdateUserAvatarPayload, ChangePasswordPayload, DeleteAccountPayload } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class AccountFacade {
  private readonly store = inject(Store);

  readonly viewModel = toSignal(this.store.select(accountFeature.selectViewModel), {
    initialValue: {
      profileDetails: null,
      isLoading: true,
      isSubmitting: false,
      error: null
    }
  });

  loadProfile(): void {
    this.store.dispatch(AccountActions.myProfilePageOpened());
  }

  updateProfile(payload: UpdateUserProfilePayload): void {
    this.store.dispatch(AccountActions.updateProfileSubmitted({ payload }));
  }

  updateAvatar(payload: UpdateUserAvatarPayload): void {
    this.store.dispatch(AccountActions.updateAvatarSubmitted({ payload }));
  }

    changePassword(payload: ChangePasswordPayload): void {
    this.store.dispatch(AccountActions.changePasswordSubmitted({ payload }));
  }

  deleteAccount(payload: DeleteAccountPayload): void {
    this.store.dispatch(AccountActions.deleteAccountSubmitted({ payload }));
  }
}