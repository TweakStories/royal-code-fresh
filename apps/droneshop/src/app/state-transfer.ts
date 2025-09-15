// --- VERVANG VOLLEDIG BESTAND: apps/droneshop/src/app/state-transfer.ts ---
import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { ActionReducer, MetaReducer } from '@ngrx/store';

export const NGRX_STATE_SK = makeStateKey<any>('NGRX_STATE');

// DE FIX: Conformeer de type-parameter 'State' expliciet.
// Deze MetaReducer is een hogere-orde functie die injects bevat, dus de 'inject' calls
// moeten direct in de factory-functie plaatsvinden, niet in de innerlijke reducer.
export const transferStateMetaReducer: MetaReducer<any> = (reducer) => {
  const platformId = inject(PLATFORM_ID);
  const transferState = inject(TransferState);
  const isServer = isPlatformServer(platformId);

  return function (state, action) {
    if (isServer) {
      // Server-side: Na elke actie, slaan we de nieuwe state op in TransferState.
      const newState = reducer(state, action);
      transferState.set(NGRX_STATE_SK, newState);
      return newState;
    }

    // Client-side: Bij de allereerste initialisatie, rehydrateren we de state.
    // De '@ngrx/store/init' actie is de eerste actie die door de store wordt gedispatched.
    // Dit is het moment om de overgedragen state te controleren en toe te passen.
    if (action.type === '@ngrx/store/init' && transferState.hasKey(NGRX_STATE_SK)) {
      const transferredState = transferState.get(NGRX_STATE_SK, null);
      transferState.remove(NGRX_STATE_SK); // Verwijder de key na gebruik om dubbele rehydratie te voorkomen.
      // Merge de overgedragen state met de initiële client-state.
      // De 'state' hier is de *initiële* client-side state.
      return { ...(state as object), ...transferredState } as any; // Pragmatische cast naar any
    }

    return reducer(state, action);
  };
};