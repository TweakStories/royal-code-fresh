/**
 * @file user.facade.ts
 * @Version 3.0.0 (Definitive Blueprint)
 * @Description Public API voor de User state, met een hybride Signal/Observable aanpak en backwards compatibility.
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserActions } from './user.actions';
import {
  selectProfile,
  selectSettings,
  selectAllAddresses,
  selectDefaultShippingAddress,
  selectIsLoading,
  selectError,
  selectUserViewModel,
} from './user.feature';
import {
  UserAddress,
  UserViewModel,
  FeatureError,
} from './user.types';
import { ApplicationSettings, CreateAddressPayload, UpdateAddressPayload, UserProfile } from '@royal-code/shared/domain';
import { Image } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class UserFacade {
  private readonly store = inject(Store);

  // --- ViewModel (Primary API) ---
  readonly viewModel$: Observable<UserViewModel> = this.store.select(selectUserViewModel);
  readonly viewModel: Signal<UserViewModel> = toSignal(this.viewModel$, {
    initialValue: { profile: null, settings: null, addresses: [], defaultShippingAddress: undefined, defaultBillingAddress: undefined, isLoading: true, error: null }
  });

  // --- Granular State Accessors ---
  readonly profile$: Observable<UserProfile | null> = this.store.select(selectProfile);
  readonly profile: Signal<UserProfile | null> = toSignal(this.profile$, { initialValue: null });
  readonly settings$: Observable<ApplicationSettings | null> = this.store.select(selectSettings);
  readonly settings: Signal<ApplicationSettings | null> = toSignal(this.settings$, { initialValue: null });
  readonly addresses$: Observable<UserAddress[]> = this.store.select(selectAllAddresses);
  readonly addresses: Signal<UserAddress[]> = toSignal(this.addresses$, { initialValue: [] });
  readonly defaultShippingAddress$: Observable<UserAddress | undefined> = this.store.select(selectDefaultShippingAddress);
  readonly defaultShippingAddress: Signal<UserAddress | undefined> = toSignal(this.defaultShippingAddress$, { initialValue: undefined });
  readonly isLoading$: Observable<boolean> = this.store.select(selectIsLoading);
  readonly isLoading: Signal<boolean> = toSignal(this.isLoading$, { initialValue: true });
  readonly error$: Observable<FeatureError | null> = this.store.select(selectError);
  readonly error: Signal<FeatureError | null> = toSignal(this.error$, { initialValue: null });
  readonly isLoggedIn = computed(() => !!this.profile());

  // --- BACKWARDS COMPATIBILITY LAYER ---
  readonly avatar$: Observable<Image | null | undefined> = this.profile$.pipe(map(p => p?.avatar));
  readonly isMapViewSelected$: Observable<boolean> = this.settings$.pipe(map(s => !!s?.mapViewSelected));
  readonly isLoadingProfile$ = this.isLoading$;
  readonly isLoadingSettings$ = this.isLoading$;

  selectIsBookmarked(entityId: string | null | undefined): Observable<boolean> {
    if (!entityId) return of(false);
    // TODO: Deze logica moet worden geïmplementeerd met echte bookmark-data in de state.
    // Voorbeeld: return this.store.select(selectIsEntityBookmarkedInProfile(entityId));
    return of(false);
  }

  // --- ACTION DISPATCHERS ---
  updateSetting(setting: Partial<ApplicationSettings>): void {
    this.store.dispatch(UserActions.updateSettingsSubmitted({ payload: setting }));
  }

  clearProfileAndSettings(): void {
    this.store.dispatch(UserActions.stateClearedOnLogout());
  }


  createAddress(payload: CreateAddressPayload): void {
    const tempId = `temp-addr-${Date.now()}`;
    this.store.dispatch(UserActions.createAddressSubmitted({ payload, tempId }));
  }

    updateAddress(id: string, payload: UpdateAddressPayload): void {
    this.store.dispatch(UserActions.updateAddressSubmitted({ id, payload }));
  }

  deleteAddress(id: string): void {
    this.store.dispatch(UserActions.deleteAddressSubmitted({ id }));
  }
}
