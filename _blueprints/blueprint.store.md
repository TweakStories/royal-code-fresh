---

## 🛡️ **Global Error Interceptor Setup**

Voor enterprise-level error handling plaats je dit **één keer** in je monorepo:

### 📁 `libs/core/http/src/lib/interceptors/global-error.interceptor.ts`

```typescript
/**
 * @file global-error.interceptor.ts
 * @Description Production-ready global HTTP error interceptor voor hele monorepo.
 */
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { ErrorActions } from '@royal-code/store/error';

interface ErrorContext {
  feature: string;
  operation: string;
  method: string;
}

function getErrorContext(request: HttpRequest<any>): ErrorContext {
  const url = request.url;
  const method = request.method.toUpperCase();
  const apiMatch = url.match(/\/api\/([^\/]+)(?:\/([^\/\?]+))?/);

  if (!apiMatch) {
    return { feature: 'Unknown', operation: `${method} request to ${url}`, method };
  }

  const [, feature, resource] = apiMatch;
  return {
    feature: capitalize(feature),
    operation: getOperationDescription(method, resource),
    method,
  };
}

function getOperationDescription(method: string, resource?: string): string {
  const resourceName = translateResource(resource);
  switch (method) {
    case 'GET': return `ophalen van ${resourceName}`;
    case 'POST': return `aanmaken van ${resourceName}`;
    case 'PUT': case 'PATCH': return `bijwerken van ${resourceName}`;
    case 'DELETE': return `verwijderen van ${resourceName}`;
    default: return `${method} actie op ${resourceName}`;
  }
}

function translateResource(resource: string = 'data'): string {
  const translations: Record<string, string> = {
    items: 'items', products: 'producten', cart: 'winkelwagen',
    orders: 'bestellingen', users: 'gebruikers', reviews: 'beoordelingen',
  };
  return translations[resource] || resource;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getUserMessage(status: number, operation: string): string {
  const messages: Record<number, string> = {
    400: `Ongeldige gegevens voor ${operation}. Controleer uw invoer.`,
    401: 'U bent niet geautoriseerd voor deze actie.',
    403: 'U heeft geen rechten om deze actie uit te voeren.',
    404: `Het gevraagde item voor ${operation} kon niet worden gevonden.`,
    409: `Er is een conflict opgetreden bij ${operation}. De data is mogelijk gewijzigd.`,
    422: `De ingevoerde gegevens voor ${operation} konden niet worden verwerkt.`,
    429: 'Te veel verzoeken. Probeer het over een moment opnieuw.',
    500: `Er is een serverfout opgetreden bij ${operation}. Probeer het later opnieuw.`,
    502: 'De service is tijdelijk niet bereikbaar. Probeer het later opnieuw.',
    503: 'De service is tijdelijk niet beschikbaar. Probeer het later opnieuw.',
    504: 'De verbinding duurde te lang. Controleer uw netwerk en probeer het opnieuw.',
  };
  return messages[status] || `Er is een onverwachte fout opgetreden bij ${operation}.`;
}

function getSeverity(status: number): 'error' | 'warning' | 'info' {
  if (status >= 500) return 'error';
  if (status === 429 || status === 503 || status === 408 || status === 504) return 'warning';
  return 'error';
}

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // Skip assets/config errors
        if (error.status === 404 && (req.url.includes('/assets/') || req.url.includes('.json'))) {
           return throwError(() => error);
        }

        const context = getErrorContext(req);
        const appError = {
          messageKeyOrText: getUserMessage(error.status, context.operation),
          source: `[${context.feature} API]`,
          severity: getSeverity(error.status),
          isPersistent: getSeverity(error.status) === 'error',
          context: {
            httpStatus: error.status,
            operation: context.operation,
            method: context.method,
            url: error.url,
          },
        };

        store.dispatch(ErrorActions.reportError({ error: appError }));
      }
      return throwError(() => error);
    })
  );
};
```

### 📁 `app.config.ts` (Register interceptor)

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { globalErrorInterceptor } from '@royal-code/core/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([globalErrorInterceptor])),
    // ... other providers
  ],
};
```

---

## 📁 `libs/features/[feature]/src/lib/data-access/[feature]-api.service.ts`

```typescript
/**
 * @file [feature]-api.service.ts
 * @Version 3.0.0 (Ultimate Blueprint: Zero-Boilerplate)
 * @Description
 *   Ultra-lean, enterprise-grade data-access service voor [Feature] operations.
 *   Deze service bevat GEEN error-handling logica; alle HTTP-fouten worden
 *   centraal en consistent afgehandeld door de `globalErrorInterceptor`.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { APP_CONFIG } from '@royal-code/core/config';
import { LoggerService } from '@royal-code/core/logging';
import { 
  [Item], 
  [Item]Filters, 
  Create[Item]Payload, 
  Update[Item]Payload 
} from '../state/[feature].types';

/**
 * @interface [Feature]ApiResponse
 * @description Type-safe response structuur voor gepagineerde API endpoints.
 */
export interface [Feature]ApiResponse {
  items: [Item][];
  totalCount: number;
  hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class [Feature]ApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly logger = inject(LoggerService);
  private readonly apiUrl = `${this.config.apiUrl}/[feature]s`; // e.g., /api/products
  private readonly logPrefix = '[[Feature]ApiService]';

  /**
   * @method get[Item]s
   * @description Haalt een gepagineerde en gefilterde lijst van [items] op.
   */
  get[Item]s(filters: [Item]Filters): Observable<[Feature]ApiResponse> {
    const params = new HttpParams({ fromObject: { ...filters } });
    this.logger.debug(`${this.logPrefix} Loading [items]`, { filters });

    return this.http.get<[Feature]ApiResponse>(this.apiUrl, { params }).pipe(
      tap(response => this.logger.debug(`${this.logPrefix} [Items] loaded`, { count: response.items.length }))
    );
  }

  /**
   * @method create[Item]
   * @description Creëert een nieuw [item].
   */
  create[Item](payload: Create[Item]Payload): Observable<[Item]> {
    this.logger.debug(`${this.logPrefix} Creating [item]`, { payload });
    return this.http.post<[Item]>(this.apiUrl, payload).pipe(
      tap(item => this.logger.info(`${this.logPrefix} [Item] created`, { id: item.id }))
    );
  }

  /**
   * @method update[Item]
   * @description Werkt een bestaand [item] bij.
   */
  update[Item](id: string, payload: Update[Item]Payload): Observable<[Item]> {
    this.logger.debug(`${this.logPrefix} Updating [item]`, { id, payload });
    return this.http.patch<[Item]>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(item => this.logger.info(`${this.logPrefix} [Item] updated`, { id: item.id }))
    );
  }

  /**
   * @method delete[Item]
   * @description Verwijdert een [item].
   */
  delete[Item](id: string): Observable<void> {
    this.logger.debug(`${this.logPrefix} Deleting [item]`, { id });
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.logger.info(`${this.logPrefix} [Item] deleted`, { id }))
    );
  }
}
```

---

# 🏆 Ultimate NgRx Feature Store Blueprint - Enterprise Edition v2.0

Dit document dient als de definitieve, "gouden standaard" blauwdruk voor het creëren van nieuwe, robuuste feature stores binnen de Royal-Code monorepo.

**Filosofie:** Deze blauwdruk combineert de modernste NgRx-syntax (Angular v19+, NgRx v19.2.1, `createFeature`) met essentiële enterprise concepten zoals optimistische updates, signal integration, en een flexibele facade-laag.

**Nieuwe Features v2.0:**
- 🎯 **Enhanced Type Safety** - Generieke interfaces voor herbruikbaarheid
- ⚡ **Signal Optimizations** - Angular 19 signals met computed properties
- 🔄 **Smart Caching** - Basis cache management met stale detection
- 🛡️ **Global Error Interceptor** - Zero-boilerplate error handling across monorepo
- 📊 **Bulk Operations** - Support voor bulk acties
- 📄 **Pagination** - Built-in pagination support
- 🚀 **Ultra-Clean APIs** - 1-line API methods zonder error handling

**Instructies voor Gebruik:**

1.  Creëer een nieuwe feature library (bv. `nx g @nx/angular:lib features/my-new-feature`).
2.  Maak een `state` directory binnen de `libs/features/my-new-feature/src/lib/` map.
3.  Gebruik de onderstaande bestanden als templates en plaats ze in de `state` directory.
4.  Voer een "Zoek & Vervang" uit op de volgende placeholders:
    *   `[feature]` -> De naam van de feature in `camelCase` (bv. `order`, `product`)
    *   `[Feature]` -> De naam van de feature in `PascalCase` (bv. `Order`, `Product`)
    *   `[FEATURE]` -> De naam van de feature in `UPPERCASE` (bv. `ORDER`, `PRODUCT`)
    *   `[item]` -> De naam van de entiteit in `camelCase` (bv. `order`, `product`)
    *   `[Item]` -> De naam van de entiteit in `PascalCase` (bv. `Order`, `Product`)

---

## 📁 `libs/features/[feature]/src/lib/state/[feature].types.ts`

```typescript
/**
 * @file [feature].types.ts
 * @Description TypeScript interfaces en types voor de [Feature] domain.
 */

// Base interface voor alle entiteiten
export interface BaseEntity {
  readonly id: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

// TODO: Vervang met je echte [Item] interface
export interface [Item] extends BaseEntity {
  readonly name: string;
  readonly status: string;
}

// TODO: Vervang met je echte [Item]Filters interface  
export interface [Item]Filters {
  readonly status?: string;
  readonly search?: string;
  readonly sortBy?: keyof [Item];
  readonly sortDirection?: 'asc' | 'desc';
}

// Payload types voor CRUD operaties
export type Create[Item]Payload = Omit<[Item], 'id' | 'createdAt' | 'updatedAt'>;
export type Update[Item]Payload = Partial<Omit<[Item], 'id' | 'createdAt'>>;

// Simple error type voor local feature errors (global errors handled by interceptor)
export interface FeatureError {
  readonly userMessage: string;
  readonly operation?: string;
}
```

---

## 📁 `libs/features/[feature]/src/lib/state/[feature].actions.ts`

```typescript
/**
 * @file [feature].actions.ts
 * @Version 3.0.0 (Ultimate Blueprint)
 * @Description
 *   Definitieve, enterprise-ready NgRx actions voor de [Feature] feature.
 *   Volledig gebruik makend van `createActionGroup` en logisch gestructureerd
 *   rondom feature-events voor maximale leesbaarheid en onderhoudbaarheid.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { 
  [Item], 
  [Item]Filters, 
  Create[Item]Payload, 
  Update[Item]Payload 
} from './[feature].types';

export const [Feature]Actions = createActionGroup({
  source: '[Feature]',
  events: {
    // ==================================================================================
    // GROUP 1: Page Lifecycle & Context Actions
    // ==================================================================================
    /** @description Dispatched when the main component/page is initialized. Sets context and triggers initial load. */
    'Context Set': props<{ contextId?: string; forceRefresh?: boolean }>(),
    /** @description Dispatched when filter/sort settings change in the UI. Triggers a reload. */
    'Filters Updated': props<{ filters: Partial<[Item]Filters> }>(),
    /** @description Dispatched for pagination (e.g., infinite scroll). */
    'Next Page Loaded': emptyProps(),
    /** @description Dispatched for explicit data refresh (e.g., pull-to-refresh). */
    'Data Refreshed': emptyProps(),
    /** @description Dispatched when the component/page is destroyed to clean up the state. */
    'State Reset': emptyProps(),

    // ==================================================================================
    // GROUP 2: Data Loading API Actions
    // ==================================================================================
    'Load [Item]s': emptyProps(),
    'Load [Item]s Success': props<{ items: [Item][]; totalCount: number; hasMore: boolean }>(),
    'Load [Item]s Failure': props<{ error: string }>(), // Simple error message for internal state

    // ==================================================================================
    // GROUP 3: CUD (Create, Update, Delete) Actions
    // ==================================================================================
    'Create [Item] Submitted': props<{ payload: Create[Item]Payload; tempId: string }>(),
    'Create [Item] Success': props<{ item: [Item]; tempId: string }>(), 
    'Create [Item] Failure': props<{ error: string; tempId: string }>(),  

    'Update [Item] Submitted': props<{ id: string; payload: Update[Item]Payload }>(),
    'Update [Item] Success': props<{ itemUpdate: Update<[Item]> }>(),
    'Update [Item] Failure': props<{ error: string; id: string }>(),

    'Delete [Item] Confirmed': props<{ id: string }>(),
    'Delete [Item] Success': props<{ id: string }>(),
    'Delete [Item] Failure': props<{ error: string; id: string }>(),

    // ==================================================================================
    // GROUP 4: UI State Management Actions
    // ==================================================================================
    '[Item] Selected': props<{ id: string | null }>(),
    'Error Cleared': emptyProps(),
  },
});

```

---

## 📁 `libs/features/[feature]/src/lib/state/[feature].feature.ts`

```typescript
/**
 * @file [feature].feature.ts
 * @Version 3.0.0 (Ultimate Blueprint)
 * @Description
 *   Definitieve NgRx feature-definitie voor de [Feature] domain. Gebruikt `createFeature`
 *   om state, reducer, ViewModels en selectors te co-lokaliseren in een enkele,
 *   cohesieve en type-safe unit, wat de enterprise-standaard is.
 */
import { createFeature, createSelector, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { [Feature]Actions } from './[feature].actions';
import { [Item], [Item]Filters } from './[feature].types';

// ==================================================================================
// 1. VIEWMODEL INTERFACES
// ==================================================================================
/** @description Comprehensive view model for the main [Feature] list component. */
export interface [Feature]ListViewModel {
  readonly items: readonly [Item][];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly filters: [Item]Filters;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly pagination: {
    readonly currentPage: number;
    readonly pageSize: number;
    readonly loadedCount: number;
    readonly showingFrom: number;
    readonly showingTo: number;
  };
}

// ==================================================================================
// 2. STATE DEFINITION & ADAPTER
// ==================================================================================
export interface State extends EntityState<[Item]> {
  readonly selected[Item]Id: string | null;
  readonly filters: [Item]Filters;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly lastContextId?: string;
}

export const [feature]Adapter: EntityAdapter<[Item]> = createEntityAdapter<[Item]>();

export const initial[Feature]State: State = [feature]Adapter.getInitialState({
  selected[Item]Id: null,
  filters: { page: 1, pageSize: 20, sortBy: 'createdAt', sortDirection: 'desc' },
  isLoading: false,
  isSubmitting: false,
  error: null,
  totalCount: 0,
  hasMore: false,
});

// ==================================================================================
// 3. NGRX FEATURE CREATION (`createFeature`)
// ==================================================================================
export const [feature]Feature = createFeature({
  name: '[feature]',
  reducer: createReducer(
    initial[Feature]State,
    // Lifecycle
    on([Feature]Actions.contextSet, (state, { contextId }) => ({ ...initial[Feature]State, lastContextId: contextId })),
    on([Feature]Actions.stateReset, () => initial[Feature]State),
    on([Feature]Actions.filtersUpdated, (state, { filters }) => ({ ...state, filters: { ...state.filters, ...filters, page: 1 }, error: null })),
    on([Feature]Actions.nextPageLoaded, (state) => !state.hasMore || state.isLoading ? state : { ...state, isLoading: true, error: null, filters: { ...state.filters, page: (state.filters.page ?? 1) + 1 } }),
    on([Feature]Actions.dataRefreshed, (state) => ({ ...state, error: null })),
    
    // Data Loading
    on([Feature]Actions.load[Item]s, (state) => ({ ...state, isLoading: true, error: null })),
    on([Feature]Actions.load[Item]sSuccess, (state, { items, totalCount, hasMore }) => {
      const updateFn = (state.filters.page ?? 1) === 1 ? [feature]Adapter.setAll : [feature]Adapter.addMany;
      return updateFn(items, { ...state, isLoading: false, totalCount, hasMore });
    }),
    on([Feature]Actions.load[Item]sFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on([Feature]Actions.create[Item]Submitted, (state, { payload, tempId }) =>
      [feature]Adapter.addOne(
        { ...payload, id: tempId, status: 'pending' } as [Item],
        { ...state, isSubmitting: true }
      )
    ),
    on([Feature]Actions.create[Item]Success, (state, { item, tempId }) => {
      const stateWithoutTemp = [feature]Adapter.removeOne(tempId, state);
      return [feature]Adapter.addOne(
        { ...item, status: 'sync' }, 
        { ...stateWithoutTemp, isSubmitting: false }
      );
    }),
    on([Feature]Actions.update[Item]Success, (state, { itemUpdate }) => [feature]Adapter.updateOne(itemUpdate, { ...state, isSubmitting: false })),
    on([Feature]Actions.delete[Item]Success, (state, { id }) => [feature]Adapter.removeOne(id, { ...state, isSubmitting: false, totalCount: state.totalCount - 1 })),
    on([Feature]Actions.create[Item]Failure, (state, { error, tempId }) =>
      [feature]Adapter.removeOne(tempId, {
        ...state,
        isSubmitting: false,
        error,
      })
    ),

    // UI State
    on([Feature]Actions.[item]Selected, (state, { id }) => ({ ...state, selected[Item]Id: id })),
    on([Feature]Actions.errorCleared, (state) => ({ ...state, error: null })),
  ),

  extraSelectors: ({ select[Feature]State, selectEntities, selectSelected[Item]Id, selectIsLoading, selectError, selectTotalCount, selectHasMore, selectFilters, selectIsSubmitting }) => {
    const { selectAll } = [feature]Adapter.getSelectors();
    
    const selectSelected[Item] = createSelector(selectEntities, selectSelected[Item]Id, (entities, id) => id ? entities[id] : undefined);
    
    const selectPaginationInfo = createSelector(select[Feature]State, selectAll,
        (state, items) => {
            const { totalCount, filters } = state;
            const { page = 1, pageSize = 20 } = filters;
            return {
                loadedCount: items.length,
                currentPage: page,
                pageSize,
                showingFrom: totalCount > 0 ? (page - 1) * pageSize + 1 : 0,
                showingTo: Math.min(page * pageSize, totalCount),
            };
        }
    );

    const select[Feature]ListViewModel = createSelector(
        selectAll, selectIsLoading, selectError, selectFilters, selectTotalCount, selectHasMore, selectPaginationInfo,
        (items, isLoading, error, filters, totalCount, hasMore, pagination): [Feature]ListViewModel => ({
            items, isLoading, error, filters, totalCount, hasMore, pagination
        })
    );

    return { selectAll, selectSelected[Item], selectPaginationInfo, select[Feature]ListViewModel };
  }
});

// ==================================================================================
// 4. PUBLIC API EXPORTS
// ==================================================================================
export const {
  name: [FEATURE]_FEATURE_KEY,
  reducer: [feature]Reducer,
  selectIsLoading,
  selectIsSubmitting,
  selectError,
  selectFilters,
  selectTotalCount,
  selectHasMore,
  selectAll: selectAll[Item]s,
  selectSelected[Item],
  select[Feature]ListViewModel,
} = [feature]Feature;
```

---

## 📁 `libs/features/[feature]/src/lib/state/[feature].effects.ts`

```typescript
/**
 * @file [feature].effects.ts
 * @Version 3.0.0 (Ultimate Blueprint)
 * @Description
 *   Handles all asynchronous side effects for the [Feature] feature. Orchestrates
 *   API calls via `[Feature]ApiService` and dispatches success/failure actions.
 *   Error handling for user feedback is managed by the `globalErrorInterceptor`,
 *   keeping this file clean and focused on state flow.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, switchMap, withLatestFrom, tap, concatMap } from 'rxjs/operators';
import { [Feature]Actions } from './[feature].actions';
import { [Feature]ApiService } from '../data-access/[feature]-api.service';
import { NotificationService } from '@royal-code/ui/notifications';
import { selectFilters, selectSelected[Item] } from './[feature].feature';

@Injectable()
export class [Feature]Effects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly apiService = inject([Feature]ApiService);
  private readonly notificationService = inject(NotificationService);

  // --- DATA LOADING FLOW ---
  
  triggerLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType([Feature]Actions.contextSet, [Feature]Actions.filtersUpdated, [Feature]Actions.dataRefreshed),
      map(() => [Feature]Actions.load[Item]s())
    )
  );

  load[Item]s$ = createEffect(() =>
    this.actions$.pipe(
      ofType([Feature]Actions.load[Item]s, [Feature]Actions.nextPageLoaded),
      withLatestFrom(this.store.select(selectFilters)),
      exhaustMap(([action, filters]) =>
        this.apiService.get[Item]s(filters).pipe(
          map(response => [Feature]Actions.load[Item]sSuccess(response)),
          catchError(() => of([Feature]Actions.load[Item]sFailure({ error: 'Failed to load [items].' })))
        )
      )
    )
  );

  // --- CUD FLOWS ---

  create[Item]$ = createEffect(() =>
    this.actions$.pipe(
      ofType([Feature]Actions.create[Item]Submitted),
      concatMap(({ payload }) =>
        this.apiService.create[Item](payload).pipe(
          map(item => {
            this.notificationService.showSuccess('[Item] created successfully!');
            return [Feature]Actions.create[Item]Success({ item });
          }),
          catchError(() => of([Feature]Actions.create[Item]Failure({ error: 'Failed to create [item].', payload })))
        )
      )
    )
  );

  update[Item]$ = createEffect(() =>
    this.actions$.pipe(
      ofType([Feature]Actions.update[Item]Submitted),
      concatMap(({ id, payload }) =>
        this.apiService.update[Item](id, payload).pipe(
          map(updatedItem => {
            this.notificationService.showSuccess('[Item] updated successfully!');
            return [Feature]Actions.update[Item]Success({ itemUpdate: { id, changes: updatedItem } });
          }),
          catchError(() => of([Feature]Actions.update[Item]Failure({ error: 'Failed to update [item].', id })))
        )
      )
    )
  );

  delete[Item]$ = createEffect(() =>
    this.actions$.pipe(
      ofType([Feature]Actions.delete[Item]Confirmed),
      concatMap(({ id }) =>
        this.apiService.delete[Item](id).pipe(
          map(() => {
            this.notificationService.showSuccess('[Item] deleted successfully!');
            return [Feature]Actions.delete[Item]Success({ id });
          }),
          catchError(() => of([Feature]Actions.delete[Item]Failure({ error: 'Failed to delete [item].', id })))
        )
      )
    )
  );
  
  // --- NOTIFICATION & REFRESH SIDE-EFFECTS ---
  
  refreshAfterCUDSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        [Feature]Actions.create[Item]Success, 
        [Feature]Actions.update[Item]Success,
        [Feature]Actions.delete[Item]Success
      ),
      withLatestFrom(this.store.select(selectFilters)),
      map(([action, filters]) => [Feature]Actions.filtersUpdated({ filters: { ...filters, page: 1 } }))
    )
  );
}
```

---

## 📁 `libs/features/[feature]/src/lib/state/[feature].facade.ts`

```typescript
/**
 * @file [feature].facade.ts
 * @Version 3.0.0 (Hybrid API Blueprint)
 * @Description
 *   Provides a comprehensive, public-facing API for the [Feature] state, based on a
 *   definitive hybrid blueprint. This facade offers both a traditional Observable-based
 *   API (for legacy/RxJS-heavy components) and a modern, Signal-based API (for new,
 *   performance-optimized components), ensuring maximum flexibility and maintainability.
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { [Feature]Actions } from './[feature].actions';
import {
  initial[Feature]State,
  selectIsLoading,
  selectIsSubmitting,
  selectError,
  selectAll[Item]s,
  selectSelected[Item],
  select[Feature]ViewModel,
} from './[feature].feature';
import {
  [Item],
  [Item]Filters,
  Create[Item]Payload,
  Update[Item]Payload,
  [Feature]ViewModel,
} from './[feature].types';

@Injectable({ providedIn: 'root' })
export class [Feature]Facade {
  private readonly store = inject(Store);

  // ==================================================================================
  // OBSERVABLE-BASED API (TRADITIONAL / RXJS-HEAVY SUPPORT)
  // ==================================================================================

  /** @description Observable stream for the loading state of read operations. */
  readonly isLoading$: Observable<boolean> = this.store.select(selectIsLoading);

  /** @description Observable stream for the submission state of write operations. */
  readonly isSubmitting$: Observable<boolean> = this.store.select(selectIsSubmitting);

  /** @description Observable stream for the current feature-specific error. */
  readonly error$: Observable<FeatureError | null> = this.store.select(selectError);

  /** @description Observable stream for all loaded [item] entities. */
  readonly allItems$: Observable<readonly [Item][]> = this.store.select(selectAll[Item]s);

  /** @description Observable stream for the currently selected [item]. */
  readonly selectedItem$: Observable<[Item] | undefined> = this.store.select(selectSelected[Item]);

  // ==================================================================================
  // SIGNAL-BASED API (MODERN / PERFORMANCE-OPTIMIZED SUPPORT)
  // ==================================================================================

  /** @description Signal for the loading state. */
  readonly isLoading: Signal<boolean> = toSignal(this.isLoading$, { initialValue: initial[Feature]State.isLoading });

  /** @description Signal for the submission state. */
  readonly isSubmitting: Signal<boolean> = toSignal(this.isSubmitting$, { initialValue: initial[Feature]State.isSubmitting });

  /** @description Signal for the current feature-specific error. */
  readonly error: Signal<FeatureError | null> = toSignal(this.error$, { initialValue: initial[Feature]State.error });

  /** @description Signal for all loaded [item] entities. */
  readonly allItems: Signal<readonly [Item][]> = toSignal(this.allItems$, { initialValue: [] });

  /** @description Signal for the currently selected [item]. */
  readonly selectedItem: Signal<[Item] | undefined> = toSignal(this.selectedItem$, { initialValue: undefined });

  /** @description Computed signal indicating if any items are currently loaded. */
  readonly hasItems = computed(() => this.allItems().length > 0);

  /** @description Computed signal indicating if an error state exists. */
  readonly hasError = computed(() => this.error() !== null);

  /** @description Computed signal indicating if any operation (read or write) is in progress. */
  readonly isBusy = computed(() => this.isLoading() || this.isSubmitting());

  // ==================================================================================
  // VIEWMODEL OBSERVABLES & SIGNALS (COMPLEX COMPONENT SUPPORT)
  // ==================================================================================

  /** @description Comprehensive ViewModel for the feature as an Observable. */
  readonly viewModel$: Observable<[Feature]ViewModel> = this.store.select(select[Feature]ViewModel);

  /** @description Signal-based ViewModel, optimized for Signal-first architectures. */
  readonly viewModel: Signal<[Feature]ViewModel> = toSignal(this.viewModel$, {
    initialValue: this.createInitialViewModel(),
  });

  // ==================================================================================
  // ACTION DISPATCHERS
  // ==================================================================================

  /** @description Initializes the feature state, typically on component/page entry. */
  openPage(options?: {
    forceRefresh?: boolean;
    initialFilters?: Partial<[Item]Filters>;
  }): void {
    this.store.dispatch([Feature]Actions.pageOpened({
      forceRefresh: options?.forceRefresh ?? false,
      initialFilters: options?.initialFilters,
    }));
  }

  /** @description Resets the feature state to its initial values, typically on component/page exit. */
  closePage(): void {
    this.store.dispatch([Feature]Actions.pageClosed());
  }

  /** @description Updates the filtering configuration and triggers a data reload. */
  updateFilters(filters: Partial<[Item]Filters>): void {
    this.store.dispatch([Feature]Actions.filtersChanged({ filters }));
  }

  /** @description Manually triggers a reload of the current page of items. */
  loadItems(page?: number): void {
    this.store.dispatch([Feature]Actions.load[Item]s({ page }));
  }

  /** @description Initiates the creation of a new [item]. Returns a temporary ID for optimistic UI updates. */
  createItem(payload: Create[Item]Payload): string {
    const tempId = `temp_${Date.now()}`;
    this.store.dispatch([Feature]Actions.create[Item]Submitted({ payload, tempId }));
    return tempId;
  }

  /** @description Initiates an update for an existing [item]. */
  updateItem(id: string, payload: Update[Item]Payload): void {
    this.store.dispatch([Feature]Actions.update[Item]Submitted({ id, payload }));
  }

  /** @description Initiates the deletion of a single [item]. */
  deleteItem(id: string): void {
    this.store.dispatch([Feature]Actions.delete[Item]Submitted({ id }));
  }

  /** @description Initiates the bulk deletion of multiple [items]. */
  deleteItems(ids: readonly string[]): void {
    this.store.dispatch([Feature]Actions.bulkDelete[Item]sSubmitted({ ids }));
  }

  /** @description Sets the currently selected [item] in the state. */
  selectItem(id: string | null): void {
    this.store.dispatch([Feature]Actions.[item]Selected({ id }));
  }

  /** @description Clears any current error message from the feature state. */
  clearError(): void {
    this.store.dispatch([Feature]Actions.errorCleared());
  }

  // ==================================================================================
  // PRIVATE HELPERS
  // ==================================================================================

  /**
   * Creates a safe, empty initial value for the ViewModel. This prevents
   * 'undefined' errors in components before the store has initialized.
   */
  private createInitialViewModel(): [Feature]ViewModel {
    return {
      items: [],
      selectedItem: undefined,
      isLoading: true,
      isSubmitting: false,
      error: null,
      hasItems: false,
      isEmpty: true,
      filters: {},
      totalCount: 0,
      hasMore: false,
      currentPage: 1,
      totalPages: 0,
      lastFetched: null,
      isStale: true,
    };
  }
}
```

## 📁 `libs/features/[feature]/src/lib/state/[feature].providers.ts`
```typescript
/**
 * @file [feature].providers.ts
 * @Version 3.0.0 (Ultimate Blueprint)
 * @Description
 *   Provides the complete [Feature] feature configuration using modern, standalone
 *   Angular providers. This is the single-entry point for registering the feature
 *   (state and effects), typically within a lazy-loaded route configuration.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { [feature]Feature } from './[feature].feature';
import { [Feature]Effects } from './[feature].effects';

export function provide[Feature]Feature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState([feature]Feature),
    provideEffects([Feature]Effects)
  ]);
}
```
---

## 📚 **Implementatie Voorbeeld**

```typescript
// order.types.ts
export interface Order extends BaseEntity {
  readonly orderNumber: string;
  readonly customerId: string;
  readonly status: 'pending' | 'confirmed' | 'shipped' | 'Delivered';
  readonly total: number;
}

export interface OrderFilters {
  readonly status?: Order['status'];
  readonly customerId?: string;
  readonly search?: string;
}

// Gebruik de blueprint door placeholders te vervangen:
// [feature] -> order
// [Feature] -> Order  
// [Item] -> Order
// etc.
```

---

## 🎯 **Key Benefits v2.0**

✅ **Type Safety** - Volledig type-safe met generieke interfaces  
✅ **Performance** - Angular 19 signals en computed properties  
✅ **Ultra-Clean APIs** - 1-line API methods zonder error boilerplate  
✅ **Zero Error Duplication** - Global interceptor handles alle HTTP errors  
✅ **Monorepo Scale** - Consistent error handling across 3+ apps  
✅ **Developer Experience** - Impossible to forget error handling  
✅ **Maintainability** - Change error logic in 1 place voor hele monorepo  
✅ **Production Ready** - Enterprise-level patterns met Nederlandse UX  

Deze streamlined blueprint met global error interceptor is **perfect voor grote monorepos** met meerdere apps en honderden API calls! 🚀
