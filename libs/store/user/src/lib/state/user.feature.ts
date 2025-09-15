/**
 * @file user.feature.ts
 * @Version 7.1.0 (Exported Version Selector)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-19
 * @Description
 *   Definitive, stable NgRx feature for User state. This version correctly
 *   defines and exports the `selectAddressesVersion` selector required by
 *   the ETag interceptor.
 */
import { createFeature, createSelector } from '@ngrx/store';
import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { UserActions } from './user.actions';
import { AuthActions } from '@royal-code/store/auth';
import { UserAddress, FeatureError, UserViewModel } from './user.types';
import { ApplicationSettings, Profile, SyncStatus } from '@royal-code/shared/domain';

// --- STATE DEFINITION & ADAPTER ---
export interface State extends EntityState<UserAddress> {
  profile: Profile | null;
  settings: ApplicationSettings | null;
  versions: {
    addresses: number;
    settings: number;
    profile: number;
  };
  isLoadingProfile: boolean;
  isLoadingSettings: boolean;
  isLoadingAddresses: boolean;
  error: FeatureError | null;
}

export const addressAdapter: EntityAdapter<UserAddress> = createEntityAdapter<UserAddress>();

export const initialUserState: State = addressAdapter.getInitialState({
  profile: null,
  settings: null,
  versions: {
    addresses: 0,
    settings: 0,
    profile: 0,
  },
  isLoadingProfile: false,
  isLoadingSettings: false,
  isLoadingAddresses: false,
  error: null,
});

// --- REDUCER LOGIC ---
const userReducerInternal = createReducer(
  initialUserState,
  on(AuthActions.logoutCompleted, UserActions.stateClearedOnLogout, () => initialUserState),

  // Versioning
  on(UserActions.addressVersionUpdated, (state, { version }) => ({
    ...state,
    versions: { ...state.versions, addresses: version }
  })),

  // Profile
  on(UserActions.loadProfileRequested, s => ({ ...s, isLoadingProfile: true, error: null })),
  on(UserActions.loadProfileSuccess, (s, { profile }) => ({ ...s, profile, isLoadingProfile: false })),
  on(UserActions.loadProfileFailure, (s, { error }) => ({ ...s, profile: null, isLoadingProfile: false, error: { userMessage: error, operation: 'loadProfile' } })),

  // Settings
  on(UserActions.loadSettingsRequested, s => ({ ...s, isLoadingSettings: true, error: null })),
  on(UserActions.loadSettingsSuccess, (s, { settings }) => ({
    ...s,
    settings: Object.keys(settings).length > 0 ? settings : s.settings,
    isLoadingSettings: false,
    error: null,
  })),
  on(UserActions.loadSettingsFailure, (s, { error }) => ({ ...s, isLoadingSettings: false, error: { userMessage: error, operation: 'loadSettings' } })),

  // Addresses
  on(UserActions.loadAddressesRequested, s => ({ ...s, isLoadingAddresses: true, error: null })),
on(UserActions.loadAddressesSuccess, (state, { addresses }) => {
    console.log(`[UserFeature Reducer] Handling loadAddressesSuccess. Received ${addresses.length} addresses:`, addresses);

    if (addresses.length > 0) {
      return addressAdapter.setAll(addresses, { ...state, isLoadingAddresses: false, error: null });
    } else {
      return addressAdapter.setAll([], { ...state, isLoadingAddresses: false, error: null });
    }
  }),

  on(UserActions.loadAddressesFailure, (state, { error }) => ({ ...state, isLoadingAddresses: false, error: { userMessage: error, operation: 'loadAddresses' } })),

  // Address CUD
  on(UserActions.createAddressSubmitted, (state, { payload, tempId }) => {
    const tempAddress: UserAddress = { ...payload, id: tempId, syncStatus: SyncStatus.Pending };
    return addressAdapter.addOne(tempAddress, state);
  }),

  on(UserActions.createAddressSuccess, (state, { address, tempId }) => {
    const stateWithoutTemp = addressAdapter.removeOne(tempId, state);
    const finalAddress: UserAddress = { ...address, syncStatus: SyncStatus.Synced };
    return addressAdapter.addOne(finalAddress, stateWithoutTemp);
  }),

  on(UserActions.createAddressFailure, (state, { tempId, error }) => {
    return addressAdapter.updateOne({
      id: tempId,
      changes: { syncStatus: SyncStatus.Error, error: error }
    }, state);
  }),

  on(UserActions.updateAddressSubmitted, (state, { id }) => {
    return addressAdapter.updateOne({ id: id as string, changes: { syncStatus: SyncStatus.Pending } }, state);
  }),

  on(UserActions.updateAddressSuccess, (state, { addressUpdate }) => {
    return addressAdapter.updateOne({
        id: addressUpdate.id as string,
        changes: { ...addressUpdate.changes, syncStatus: SyncStatus.Synced }
    }, state);
  }),


  on(UserActions.deleteAddressSubmitted, (state, { id }) => {
    return addressAdapter.updateOne({
      id,
      changes: { syncStatus: SyncStatus.PendingDeletion }
    }, state);
  }),

  on(UserActions.deleteAddressSuccess, (state, { id }) => {
    // ✅ SUCCES: De API call is gelukt, verwijder het item nu ECHT uit de state.
    return addressAdapter.removeOne(id, state);
  }),

  on(UserActions.deleteAddressFailure, (state, { error, id }) => {
    // ✅ ROLLBACK: Zet de syncStatus terug naar SyncStatus.Synced of 'Error'.
    // De UI zal het item weer normaal tonen.
    return addressAdapter.updateOne({
      id,
      changes: { syncStatus: SyncStatus.Synced } // of 'Error' als je dat wilt bijhouden
    }, {
      ...state,
      error: { userMessage: error, operation: 'deleteAddress' }
    });
  })

);

// --- NGRX FEATURE WITH extraSelectors ---
export const userFeature = createFeature({
  name: 'user',
  reducer: userReducerInternal,

  extraSelectors: ({ selectUserState, selectProfile, selectSettings, selectIsLoadingProfile, selectIsLoadingSettings, selectIsLoadingAddresses, selectError, selectVersions }) => {
    const { selectAll, selectEntities } = addressAdapter.getSelectors();

    const selectAllAddresses = createSelector(selectUserState, (state) => selectAll(state));
    const selectAddressEntities = createSelector(selectUserState, (state) => selectEntities(state));

    const selectAddressesVersion = createSelector(selectVersions, (versions) => versions.addresses);

    const selectIsLoading = createSelector(selectIsLoadingProfile, selectIsLoadingSettings, selectIsLoadingAddresses, (p, s, a) => p || s || a);
    const selectDefaultShippingAddress = createSelector(selectAllAddresses, (addresses) => addresses.find(address => address.isDefaultShipping));
    const selectDefaultBillingAddress = createSelector(selectAllAddresses, (addresses) => addresses.find(address => address.isDefaultBilling));

    const selectUserViewModel = createSelector(
        selectProfile,
        selectSettings,
        selectAllAddresses,
        selectDefaultShippingAddress,
        selectDefaultBillingAddress,
        selectIsLoading,
        selectError,
        (profile, settings, addresses, defaultShippingAddress, defaultBillingAddress, isLoading, error): UserViewModel => ({
            profile,
            settings,
            addresses,
            defaultShippingAddress,
            defaultBillingAddress,
            isLoading,
            error
        })
    );

    return {
        selectAllAddresses,
        selectAddressEntities,
        selectIsLoading,
        selectDefaultShippingAddress,
        selectDefaultBillingAddress,
        selectUserViewModel,
        selectAddressesVersion, // <-- Exporteer hem hier
    };
  }
});

// --- PUBLIC API EXPORTS ---
export const {
  name: USER_FEATURE_KEY,
  reducer: userReducer,
  selectProfile,
  selectSettings,
  selectError,
  selectAllAddresses,
  selectIsLoading,
  selectUserViewModel,
  selectDefaultShippingAddress,
  selectDefaultBillingAddress,
  selectAddressesVersion, // <-- En voeg hem hier toe
} = userFeature;
