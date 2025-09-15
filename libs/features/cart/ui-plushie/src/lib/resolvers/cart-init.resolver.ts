
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { CartActions, CartFacade } from '@royal-code/features/cart/core';
import { filter, take, map, combineLatest } from 'rxjs';

/**
 * @resolver cartInitResolver
 * @description Zorgt ervoor dat de cart state volledig is geladen of gesynchroniseerd
 *              *voordat* de cart detail pagina wordt geactiveerd. Dit voorkomt de "hydration gap"
 *              en zorgt ervoor dat de UI direct de correcte, persistente staat toont.
 */
export const cartInitResolver: ResolveFn<boolean> = () => {
  const store = inject(Store);
  const cartFacade = inject(CartFacade);

  // Dispatch de actie die de initialisatielogica triggert (via effecten).
  store.dispatch(CartActions.cartInitialized());

  // Wacht tot de laad- en submit-statussen 'false' zijn.
  // Dit geeft aan dat de initialisatie (rehydratatie of server sync) is voltooid.
  return combineLatest([
    cartFacade.isLoading$,
    cartFacade.isSubmitting$
  ]).pipe(
    filter(([isLoading, isSubmitting]) => !isLoading && !isSubmitting),
    take(1),
    map(() => true) // Laat de route-activatie doorgaan.
  );
};