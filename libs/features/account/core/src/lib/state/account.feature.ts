import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { AccountActions } from './account.actions';
import { UserProfileDetails } from '@royal-code/shared/domain';
import { StructuredError } from '@royal-code/shared/domain';

export interface AccountState {
  profileDetails: UserProfileDetails | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: StructuredError | null;
}

export const initialAccountState: AccountState = {
  profileDetails: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const accountFeature = createFeature({
  name: 'account',
  reducer: createReducer(
    initialAccountState,
    on(AccountActions.myProfilePageOpened, AccountActions.loadProfileDetails, (state) => ({ ...state, isLoading: true, error: null })),
    on(AccountActions.loadProfileDetailsSuccess, (state, { profile }) => ({ ...state, isLoading: false, profileDetails: profile })),
    on(AccountActions.loadProfileDetailsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(AccountActions.updateProfileSubmitted, AccountActions.updateAvatarSubmitted, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(AccountActions.updateProfileSuccess, (state, { profile }) => ({ ...state, isSubmitting: false, profileDetails: profile })),
    on(AccountActions.updateAvatarSuccess, (state, { updatedProfile }) => ({ ...state, isSubmitting: false, profileDetails: updatedProfile })),
    on(AccountActions.updateProfileFailure, AccountActions.updateAvatarFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),
  ),
  extraSelectors: ({ selectProfileDetails, selectIsLoading, selectIsSubmitting, selectError }) => ({
    selectViewModel: createSelector(
      selectProfileDetails,
      selectIsLoading,
      selectIsSubmitting,
      selectError,
      (profileDetails, isLoading, isSubmitting, error) => ({
        profileDetails,
        isLoading,
        isSubmitting,
        error
      })
    )
  })
});

export const {
  selectProfileDetails,
  selectIsLoading,
  selectIsSubmitting,
  selectError,
  selectViewModel
} = accountFeature;