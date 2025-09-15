/**
 * @file entity-selector.utils.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Description
 *   Utility functies voor het veilig maken van NgRx Entity selectors.
 *   Voorkomt de "ids is undefined" runtime errors die optreden tijdens
 *   state initialisatie race conditions.
 */
import { createSelector, MemoizedSelector } from '@ngrx/store';
import { EntityAdapter, EntityState } from '@ngrx/entity';

/**
 * Maakt veilige entity selectors die beschermd zijn tegen undefined state
 */
export function createSafeEntitySelectors<T extends { id: string | number }, S extends EntityState<T>>(
  adapter: EntityAdapter<T>,
  stateSelector: MemoizedSelector<any, S | undefined>
) {
  const adapterSelectors = adapter.getSelectors();

  /**
   * Helper functie voor het maken van veilige entity selectors
   */
  function createSafeSelector<R>(
    adapterSelector: (state: EntityState<T>) => R,
    fallbackValue: R,
    selectorName?: string
  ) {
    return createSelector(
      stateSelector,
      (state: S | undefined): R => {
        // Controleer of state bestaat en correct geïnitialiseerd is
        if (!state) {
          console.debug(`[EntitySelector] State is undefined for ${selectorName || 'unknown selector'}, returning fallback`);
          return fallbackValue;
        }

        // Controleer of de EntityState correct geïnitialiseerd is
        if (!state.ids || state.ids === undefined) {
          console.debug(`[EntitySelector] EntityState.ids is undefined for ${selectorName || 'unknown selector'}, returning fallback`);
          return fallbackValue;
        }

        // Extra veiligheid: try-catch voor onverwachte errors
        try {
          return adapterSelector(state);
        } catch (error) {
          console.warn(`[EntitySelector] Selector ${selectorName || 'unknown'} failed:`, error);
          return fallbackValue;
        }
      }
    );
  }

  return {
    selectAll: createSafeSelector(
      adapterSelectors.selectAll,
      [] as T[],
      'selectAll'
    ),
    selectEntities: createSafeSelector(
      adapterSelectors.selectEntities,
      {} as Record<string | number, T>,
      'selectEntities'
    ),
    selectIds: createSafeSelector(
      adapterSelectors.selectIds,
      [] as (string | number)[],
      'selectIds'
    ),
    selectTotal: createSafeSelector(
      adapterSelectors.selectTotal,
      0,
      'selectTotal'
    ),

    /**
     * Veilige selector voor het ophalen van een specifieke entity
     */
    selectById: (id: string | number) => createSelector(
      createSafeSelector(
        adapterSelectors.selectEntities,
        {} as Record<string | number, T>,
        'selectEntities'
      ),
      (entities) => entities[id] || null
    ),

    /**
     * Veilige selector die checkt of een entity bestaat
     */
    selectExists: (id: string | number) => createSelector(
      createSafeSelector(
        adapterSelectors.selectIds,
        [] as (string | number)[],
        'selectIds'
      ),
      (ids) => ids.includes(id)
    )
  };
}

/**
 * Utility functie voor het valideren van EntityState
 */
export function isValidEntityState<T>(state: EntityState<T> | undefined): state is EntityState<T> {
  return !!(state && state.ids !== undefined && Array.isArray(state.ids));
}

/**
 * Decorator functie voor het toevoegen van extra bescherming aan bestaande selectors
 */
export function withEntityStateGuard<T, R>(
  selector: (state: EntityState<T>) => R,
  fallbackValue: R
) {
  return (state: EntityState<T> | undefined): R => {
    if (!isValidEntityState(state)) {
      return fallbackValue;
    }
    try {
      return selector(state);
    } catch (error) {
      console.warn('[EntityStateGuard] Selector failed:', error);
      return fallbackValue;
    }
  };
}
