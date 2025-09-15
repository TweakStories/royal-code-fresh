/**
 * @file checkout-state.initializer.ts
 * @Version 2.0.0 (Full State Rehydration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-08
 * @Description
 *   Application initializer to rehydrate the entire checkout state from sessionStorage
 *   at application startup, allowing users to seamlessly continue their checkout process
 *   after a page refresh.
 */
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { StorageService } from '@royal-code/core/storage';
import { SerializableCheckoutState } from '../state/checkout.feature';
import { CheckoutActions } from '../state/checkout.actions';

/**
 * @function initializeCheckoutState
 * @description
 *   Factory function for an APP_INITIALIZER that checks sessionStorage for a saved
 *   checkout state and dispatches an action to rehydrate the store if found.
 * @returns {() => void} A function that performs the initialization.
 */
export function initializeCheckoutState(): () => void {
  const storageService = inject(StorageService);
  const store = inject(Store);
  const CHECKOUT_STORAGE_KEY = 'royal-code-checkout';

  return () => {
    const savedState = storageService.getItem<SerializableCheckoutState>(CHECKOUT_STORAGE_KEY, 'session');

    // Herstel de state alleen als er iets zinnigs in staat (bv. een verzendadres is ingevuld)
    // Dit voorkomt dat een lege/initiële checkout state wordt hersteld.
    if (savedState && savedState.shippingAddress) {
      store.dispatch(CheckoutActions.stateRehydrated({ persistedState: savedState }));
    }
  };
}
