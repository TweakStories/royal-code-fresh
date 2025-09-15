# Royal-Code Monorepo App: Logboek voor Complexe Problemen

Dit document dient als een kennisbank voor diepgaande analyses ("post-mortems") van complexe, hardnekkige of architectonisch significante problemen die tijdens de ontwikkeling zijn opgelost. Het doel is om herhaling te voorkomen, het team te onderwijzen en toekomstige debugging te versnellen.

Alle besproken oplossingen en preventiestrategieën zijn in lijn met de principes die zijn vastgelegd in het hoofddocument: **[STRATEGY_PLAN.md](STRATEGY_PLAN.md)**.

---

## Inhoudsopgave

1.  [Forms: De `FormArray` Desynchronisatie Bug (Variant Combinatie Case Study)](#the-formarray-desynchronization-bug-variant-combination-case-study)
2.  [Forms: Input - NG0200, NG0203 & Recursion Hell](#forms)
3.  [Rendering: Angular Image Loading Race Condition (Cross-Browser)](#angular-image-loading-race-condition-cross-browser-compatibility-issue)
4.  [State Management: NgRx Signal Store Hydration Hell (Lazy Loading vs LocalStorage Sync)](#ngrx-signal-store-hydration-hell-lazy-loading-vs-localstorage-sync)
5.  [Performance: The Phantom Zone API Call (Cache Invalidation Cascade)](#the-phantom-zone-api-call-cache-invalidation-cascade)
6.  [Performance: The Observable Memory Leak Apocalypse](#the-observable-memory-leak-apocalypse)
7.  [Change Detection: The Signals vs OnPush Change Detection Paradox](#the-signals-vs-onpush-change-detection-paradox)
8.  [Styling: The Tailwind CSS Custom Properties Death Spiral](#the-tailwind-css-custom-properties-death-spiral)
9.  [Deployment: Tailwind CSS v4 CI/CD Pipeline Failure - The False Error Assumption](#tailwind-css-v4-cicd-pipeline-failure-the-false-error-assumption)
10. [Backend: EF Core `DbUpdateConcurrencyException` bij Correcte Domeinlogica](#backend)

---

## Forms

### Input

**1. Het Initiale Probleem: NG0200: Circulaire Afhankelijkheid (`InjectionToken NgValueAccessor`)**

*   **Symptoom:** `ERROR Error: NG0200: Circular dependency detected for _UiInputComponent...`
*   **Kern van het Probleem:** Een `ControlValueAccessor` (CVA) component die `NgControl` injecteert in zijn constructor creëert een synchrone afhankelijkheidslus. `NgControl` heeft de `NG_VALUE_ACCESSOR` provider nodig, die door de component zelf wordt geleverd, maar de component heeft `NgControl` nodig om te kunnen initialiseren.

**2. Het Tweede Probleem: NG0203: `effect()` buiten Injection Context**

*   **Symptoom:** `ERROR Error: NG0203: effect() can only be used within an injection context...`
*   **Kern van het Probleem:** `effect()` en `computed()` vereisen een injection context, die standaard alleen beschikbaar is in de `constructor` en in `field initializers`. Het verplaatsen van de `NgControl`-injectie naar `ngOnInit` (om de NG0200-fout op te lossen) verplaatste ook `effect()`-aanroepen naar een onveilige context.

**3. Het Derde Probleem: `InternalError: too much recursion`**

*   **Symptoom:** Browser crash met een `too much recursion` fout in de `setValue` -> `writeValue` keten.
*   **Kern van het Probleem:** Een klassieke CVA-implementatiefout. `writeValue` (model -> view) triggert `valueChanges`, die `onChange` aanroept (view -> model), wat opnieuw `writeValue` triggert. Zonder een mechanisme om deze lus te doorbreken, ontstaat een oneindige recursie.

**4. De Definitieve Oplossing**

*   **Fix voor NG0200:** Injecteer `NgControl` asynchroon in `ngOnInit` met `Promise.resolve().then(() => this.injector.get(NgControl))`. Dit stelt de injectie uit tot na de initiële DI-cyclus.
*   **Fix voor NG0203:** Plaats alle `effect()`-aanroepen **altijd** in de `constructor` om de injection context te garanderen.
*   **Fix voor Recursie:** Gebruik een private vlag (`_isCvaWritingValue`) en de `{ emitEvent: false }` optie. In `writeValue`, zet de vlag op `true` en gebruik `setValue(..., { emitEvent: false })`. In de `valueChanges` subscription, controleer of de vlag `false` is voordat `onChange()` wordt aangeroepen.

---

### The FormArray Desynchronization Bug (Variant Combination Case Study)

#### 🚨 **Het Probleem**

**Symptomen:**
- UI-updates in een `FormArray` (bv. een dropdown in een rij) worden niet onmiddellijk weerspiegeld in afgeleide data (zoals een SKU in een andere kolom van dezelfde rij).
- Er ontstaat een race condition waarbij de `valueChanges` van de parent `FormArray` wordt verwerkt *voordat* de `patchValue` operatie, getriggerd door een kind-control, volledig is doorgevoerd.
- Het gebruik van een tussenliggende `computed` laag voor de weergave van de tabel verergert dit door een extra asynchrone "tick" te introduceren.

#### ✅ **De Oplossing**

**Architectonisch Principe: Directe Binding aan de Single Source of Truth.**
1.  **Template Fix:** Bind de `@for` loop in de template **direct** aan de `.controls` van de `FormArray` (`@for (combo of variantCombinations.controls; ...)`). Vermijd een tussenliggende `computed` transformatielaag voor de weergave van de `FormArray` data.
2.  **TypeScript Fix:** Zorg dat alle data-derivaties (zoals SKU-generatie) **deterministisch** zijn en de visuele volgorde van de `FormArray`-controls respecteren.

#### 🔍 **Root Cause Analysis**
- **Indirecte Data Binding:** De `computed` tussenlaag zorgde voor desynchronisatie.
- **Race Condition:** Parent `valueChanges` vuurde te vroeg.

#### 🛡️ **Preventie Strategieën**
- **Regel 1:** Maak de `FormArray.value` altijd zichtbaar met `| json` tijdens het debuggen (ADDP).
- **Regel 2:** Bind UI-iteraties direct aan de `FormArray.controls`.
- **Regel 3:** Garandeer dat generatielogica deterministisch is en de UI-volgorde volgt.

---

## Angular Image Loading Race Condition (Cross-Browser Compatibility Issue)

### 🚨 **Het Probleem**
**Symptomen:**
- Afbeeldingen laden correct in Firefox, maar falen in Chromium-browsers (Chrome, Edge) met een 404, ook al bestaat het bestand.
- De `src` van een `<img>`-tag wordt in de eerste render-cyclus gebonden aan `undefined` omdat de data nog niet beschikbaar is.
- **Chromium-browsers cachen de 404-respons voor de "undefined" URL agressief.** Wanneer de correcte URL arriveert, gebruikt de browser de gecachte 404 en laadt de afbeelding niet. Firefox is hier toleranter en doet een nieuwe poging.

### ✅ **De Oplossing**
**Architectonisch Principe: Race Condition Bescherming via Template Guards.**
Bind de `src` van een `<img>`-tag nooit direct aan een potentieel asynchrone waarde. Render het `<img>`-element pas als de data gegarandeerd aanwezig is.

```html
<!-- ✅ SAFE PATTERN: -->
@if (imageData(); as data) {
  <img [src]="data.url" />
}

<!-- ❌ RACE CONDITION RISK: -->
<img [src]="imageData()?.url" />
```

### 🛡️ **Preventie Strategieën**
- **Verplicht:** Gebruik altijd `@if (signal(); as value)` guards voor het binden van asynchrone data aan "native" browser-attributen zoals `src` en `href`.
- **Verplicht:** Test UI-componenten die media laden altijd in zowel Firefox als een Chromium-browser.

---

## NgRx Signal Store Hydration Hell (Lazy Loading vs LocalStorage Sync)

### 🚨 **Het Probleem**

**Symptomen:**
- Data verdwijnt bij page refresh in lazy-loaded features.
- `LocalStorage` sync werkt niet bij directe navigatie naar lazy routes.
- InitialState overschrijft gehydrateerde data.
- Inconsistente state tussen authenticated/anonymous users.
- Dubbele API calls: één voor initial load, één voor hydration.

**Technische Details:**```typescript
// PROBLEMATISCHE VOLGORDE:
1. User navigates direct to /products/123
2. Lazy route loads → provideState(productsFeature, { initialState: {} })
3. LocalStorage sync runs → attempts to rehydrate
4. BUT initialState={} overwrites rehydrated data
5. Component loads → sees empty state → triggers API call
6. User sees loading spinner instead of cached data
```

### ✅ **De Oplossing**

**1. Hydration-Aware Initial State:**
```typescript
// products.feature.ts
export const productsFeature = createFeature({
  name: 'products',
  reducer: createReducer(
    // GEEN static initialState hier!
    // Wordt dynamisch bepaald door hydration
    {} as ProductsState,
    // ... reducers
  )
});

// products.effects.ts
@Injectable()
export class ProductsEffects {
  // Hydration effect die ALLEEN runt als state leeg is
  rehydrateOnInit$ = createEffect(() =>
    this.actions$.pipe(
      ofType('@ngrx/store/init'),
      withLatestFrom(
        this.store.select(productsFeature.selectAll),
        this.store.select(selectIsAuthenticated)
      ),
      filter(([, products, isAuth]) => products.length === 0), // Only if empty
      switchMap(([, , isAuth]) =>
        isAuth
          ? this.syncFromServer()
          : this.syncFromStorage()
      ),
      catchError(() => of({ type: 'hydration/failed' }))
    )
  );
}
```

**2. Smart LocalStorage Sync:**
```typescript
// app.config.ts - Conditional Storage Sync
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(rootReducer, {
      metaReducers: [
        localStorageSync({
          keys: [
            {
              key: 'products',
              syncCondition: (state) => !state.auth?.isAuthenticated
            },
            {
              key: 'userPreferences',
              syncCondition: () => true // Always sync
            }
          ],
          rehydrate: true,
          restoreDates: false,
          mergeReducer: (state, rehydratedState, action) => {
            // Custom merge logic om conflicts te voorkomen
            if (action.type === '@ngrx/store/update-reducers') {
              return { ...rehydratedState, ...state };
            }
            return state;
          }
        })
      ]
    })
  ]
};
```

**3. Hydration Guard Pattern:**
```typescript
// Hydration-aware component loading
@Component({...})
export class ProductListComponent {
  private readonly store = inject(Store);
  private readonly facade = inject(ProductsFacade);

  // Smart loading: alleen laden als echt nodig
  readonly isHydrating = this.facade.isInitializing;
  readonly shouldShowLoader = computed(() =>
    this.facade.isLoading() && !this.isHydrating()
  );

  ngOnInit() {
    // Alleen dispatchen als state echt leeg is
    if (this.facade.isEmpty()) {
      this.facade.loadProducts();
    }
  }
}
```

### 🔍 **Root Cause Analysis**

**Het Hydration Timing Dilemma:**
1.  **Lazy Loading**: `provideState()` runt bij route activation.
2.  **LocalStorage Sync**: Probeert data te herstellen.
3.  **Timing Conflict**: `InitialState` kan rehydrated data overschrijven.
4.  **Auth Complexity**: Anonymous vs authenticated users hebben verschillende sync strategieën.

**Fundamenteel Architectuur Probleem:**
NgRx gaat uit van een statische initiële state, maar moderne apps hebben een dynamische initiële state gebaseerd op persisted data.

### 🛡️ **Preventie Strategieën**

**1. Hydration-First Architecture:**
```typescript
// Feature state design pattern
interface FeatureState {
  entities: EntityState<T>;
  isHydrated: boolean;    // Track hydration status
  isInitializing: boolean; // Distinguish from regular loading
  lastSyncTimestamp?: number;
}

// Always check hydration before loading
readonly isEmpty = computed(() =>
  !this.isHydrated() || this.entities().length === 0
);
```

**2. Conditional Sync Strategies:**
```typescript
// Auth-aware persistence
const syncConfig = {
  keys: [
    {
      key: 'publicData',
      syncCondition: () => true
    },
    {
      key: 'privateData',
      syncCondition: (state) => state.auth?.isAuthenticated,
      transform: {
        out: (state) => encryptSensitiveData(state),
        in: (state) => decryptSensitiveData(state)
      }
    }
  ]
};
```

**3. Graceful Degradation:**
```typescript
// Fallback strategies voor hydration failures
rehydrateWithFallback$ = createEffect(() =>
  this.actions$.pipe(
    ofType(FeatureActions.initializeFeature),
    exhaustMap(() =>
      this.tryLocalStorage().pipe(
        timeout(2000), // Don't wait forever
        catchError(() => this.tryServerSync()),
        catchError(() => of(this.getMinimalState()))
      )
    )
  )
);
```

### 📋 **Debugging Checklist**

**Hydration Issues:**
- [ ] **localStorage inspection**: Check browser devtools Application tab.
- [ ] **Redux DevTools**: Verify action sequence and state transitions.
- [ ] **Network Tab**: Look for unnecessary duplicate API calls.
- [ ] **Timing logs**: Add console.logs voor hydration sequence.
- [ ] **Auth state**: Verify authentication status during hydration.
- [ ] **Route timing**: Check provideState() vs hydration timing.

**Red Flags:**
```typescript
// ❌ Static initialState in lazy features
// ❌ Immediate API calls in ngOnInit zonder state check
// ❌ No auth-aware sync strategies
// ❌ Missing hydration status tracking

// ✅ Dynamic initial state based on hydration
// ✅ Conditional loading based on isEmpty()
// ✅ Auth-aware persistence strategies
// ✅ Graceful fallbacks for hydration failures
```

---

## The Phantom Zone API Call (Cache Invalidation Cascade)

### 🚨 **Het Probleem**

**Symptomen:**
- API endpoints worden dubbel/driedubbel aangeroepen.
- Infinite loading states.
- "Flashing" content tijdens navigatie.
- Cache lijkt te werken, maar hapert willekeurig.
- Network tab toont mysterieuze herhaalde calls met seconden ertussen.

**Technische Details:**
```typescript
// PROBLEMATISCHE CASCADE:
1. Component A calls API endpoint /users
2. Data loads → cached in NgRx
3. User navigates to Component B
4. Component B also needs /users data
5. Cache hit → data shows immediately ✓
6. BUT Component B's ngOnInit still triggers another API call
7. Component A (still in DOM due to router-outlet) reacts to store update
8. Component A re-renders → triggers another call
9. Infinite loop of "optimization" attempts
```

### ✅ **De Oplossing**

**1. Smart Caching with Staleness Detection:**
```typescript
// cache-aware.service.ts
@Injectable()
export class CacheAwareService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);

  getUsers(options: { force?: boolean; maxAge?: number } = {}) {
    return this.store.select(selectUsersState).pipe(
      take(1),
      switchMap(state => {
        const isStale = this.isDataStale(state.lastFetched, options.maxAge);
        const shouldFetch = options.force || !state.entities.length || isStale;

        if (!shouldFetch) {
          return of(state.entities); // Return cached data
        }

        // Only fetch if really needed
        return this.http.get<User[]>('/users').pipe(
          tap(users => this.store.dispatch(UsersActions.loadSuccess({ users }))),
          startWith(state.entities) // Return cached while loading
        );
      })
    );
  }

  private isDataStale(lastFetched: number | null, maxAge = 5 * 60 * 1000): boolean {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > maxAge;
  }
}
```

**2. Request Deduplication:**
```typescript
// request-deduplication.interceptor.ts
@Injectable()
export class RequestDeduplicationInterceptor implements HttpInterceptor {
  private pendingRequests = new Map<string, Observable<HttpEvent<any>>>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only deduplicate GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const key = this.getRequestKey(req);

    if (this.pendingRequests.has(key)) {
      // Return existing observable
      return this.pendingRequests.get(key)!;
    }

    const response$ = next.handle(req).pipe(
      finalize(() => this.pendingRequests.delete(key)),
      share() // Important: share the observable
    );

    this.pendingRequests.set(key, response$);
    return response$;
  }

  private getRequestKey(req: HttpRequest<any>): string {
    return `${req.method}:${req.urlWithParams}`;
  }
}
```

**3. Component-Level Request Guards:**
```typescript
// Smart component data loading
@Component({...})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly facade = inject(UsersFacade);
  private readonly destroy$ = new Subject<void>();

  // Track if THIS component initiated the load
  private hasInitiatedLoad = false;

  ngOnInit() {
    // Only load if data is actually missing or stale
    combineLatest([
      this.facade.users$,
      this.facade.lastFetched$,
      this.facade.isLoading$
    ]).pipe(
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(([users, lastFetched, isLoading]) => {
      const isEmpty = users.length === 0;
      const isStale = this.isDataStale(lastFetched);
      const shouldLoad = (isEmpty || isStale) && !isLoading;

      if (shouldLoad && !this.hasInitiatedLoad) {
        this.hasInitiatedLoad = true;
        this.facade.loadUsers();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isDataStale(lastFetched: number | null): boolean {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > 5 * 60 * 1000; // 5 minutes
  }
}
```

### 🔍 **Root Cause Analysis**

**The Perfect Storm:**
1.  **Eager Components**: Elke component wil data onmiddellijk in `ngOnInit`.
2.  **Cache Miss Logic**: Slechte cache-validatie logica.
3.  **Reactive Chains**: Store updates triggeren component re-evaluaties.
4.  **Router Lifecycle**: Componenten ruimen subscriptions niet correct op.
5.  **Optimistic Updates**: "Laad het gewoon opnieuw om zeker te zijn" mentaliteit.

**Fundamentele Architectuur Fout:**
Reactive programming + Imperatieve gedachten = Cascade storingen.

### 🛡️ **Preventie Strategieën**

**1. Cache-First Architecture:**
```typescript
// Always check cache first, load second
interface CacheableState<T> {
  entities: T[];
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
}

// Facade pattern voor intelligent caching
@Injectable()
export class SmartFacade {
  readonly data$ = this.store.select(selectData);
  readonly isStale$ = this.store.select(selectIsStale);
  readonly shouldLoad$ = combineLatest([
    this.data$,
    this.isStale$,
    this.store.select(selectIsLoading)
  ]).pipe(
    map(([data, isStale, isLoading]) =>
      (data.length === 0 || isStale) && !isLoading
    )
  );

  loadIfNeeded() {
    this.shouldLoad$.pipe(
      take(1),
      filter(should => should)
    ).subscribe(() => {
      this.store.dispatch(DataActions.load());
    });
  }
}
```

**2. Component Lifecycle Discipline:**
```typescript
// Base class voor data-loading components
export abstract class DataLoadingComponent implements OnInit, OnDestroy {
  protected readonly destroy$ = new Subject<void>();
  protected hasLoadedData = false;

  ngOnInit() {
    this.loadDataIfNeeded();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected abstract loadDataIfNeeded(): void;
}
```

**3. Global Request State Management:**
```typescript
// Track global request state
interface GlobalRequestState {
  pendingRequests: Record<string, number>; // URL → timestamp
  lastRequests: Record<string, number>;    // URL → last completed
}

// Effect to prevent duplicate requests
preventDuplicateRequests$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ApiActions.request),
    groupBy(action => action.url),
    mergeMap(group$ =>
      group$.pipe(
        throttleTime(1000), // Max 1 request per second per URL
        map(action => ApiActions.execute(action))
      )
    )
  )
);
```

---

## The Observable Memory Leak Apocalypse

### 🚨 **Het Probleem**

**Symptomen:**
- App wordt geleidelijk trager.
- Geheugengebruik neemt continu toe.
- Browser tabs crashen na langdurig gebruik.
- Componenten reageren op events waarop ze niet zouden moeten reageren.
- Meerdere subscriptions op dezelfde observable.

**Technische Details:**
```typescript
// MEMORY LEAK GENERATORS:
@Component({...})
export class LeakyComponent implements OnInit {
  ngOnInit() {
    // 🔥 LEAK 1: No unsubscription
    this.dataService.getData().subscribe(data => {
      this.processData(data);
    });

    // 🔥 LEAK 2: Event listeners not cleaned up
    fromEvent(window, 'resize').subscribe(event => {
      this.handleResize();
    });

    // 🔥 LEAK 3: Interval not cleared
    interval(1000).subscribe(() => {
      this.updateClock();
    });

    // 🔥 LEAK 4: Manual DOM manipulation
    document.addEventListener('click', this.handleClick.bind(this));
  }

  // Component destroyed but subscriptions live forever
}
```

### ✅ **De Oplossing**

**1. Comprehensive Cleanup Strategy:**
```typescript
@Component({...})
export class ProperComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    // ✅ Auto-cleanup with takeUntil
    this.dataService.getData().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.processData(data);
    });

    // ✅ Event listeners with cleanup
    fromEvent(window, 'resize').pipe(
      debounceTime(250),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.handleResize();
    });

    // ✅ Intervals with cleanup
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateClock();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**2. Signal-Based Cleanup (Angular 16+):**
```typescript
@Component({...})
export class ModernComponent {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    // ✅ Automatic cleanup with DestroyRef
    this.dataService.getData().subscribe(data => {
      this.processData(data);
    }).add(
      this.destroyRef.onDestroy(() => {
        // Any additional cleanup
      })
    );

    // ✅ Or use takeUntilDestroyed
    this.dataService.getData().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      this.processData(data);
    });
  }
}
```

**3. Memory Leak Detection Service:**
```typescript
@Injectable({ providedIn: 'root' })
export class MemoryLeakDetectionService {
  private subscriptionCount = 0;
  private componentSubscriptions = new WeakMap<any, number>();

  trackSubscription(component: any, subscription: Subscription) {
    this.subscriptionCount++;
    const current = this.componentSubscriptions.get(component) || 0;
    this.componentSubscriptions.set(component, current + 1);

    if (this.subscriptionCount > 1000) {
      console.warn('🚨 Potential memory leak: Too many active subscriptions', {
        total: this.subscriptionCount,
        component: component.constructor.name
      });
    }

    return subscription.add(() => {
      this.subscriptionCount--;
      const remaining = this.componentSubscriptions.get(component)! - 1;
      this.componentSubscriptions.set(component, remaining);
    });
  }
}
```

### 🔍 **Root Cause Analysis**

**De Observable Fout-Mindset:**
1.  **"Set and Forget"**: Ontwikkelaars denken dat observables zichzelf opruimen.
2.  **Framework Vertrouwen**: Aanname dat Angular alles automatisch doet.
3.  **Async Complexity**: Moeilijk te debuggen omdat effecten pas later zichtbaar zijn.
4.  **Testing Gaps**: Memory leaks zijn niet zichtbaar in unit tests.

### 🛡️ **Preventie Strategieën**

**1. ESLint Rules voor Subscription Management:**
```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "rxjs/no-unbound-methods": "error",
    "rxjs/no-subscribe-handlers": "error",
    "custom/require-takeuntil": "error"
  }
}```

**2. Base Classes met Cleanup:**
```typescript
// Reusable base class
export abstract class UnsubscribeOnDestroyComponent implements OnDestroy {
  protected readonly destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected addSubscription(observable: Observable<any>) {
    return observable.pipe(takeUntil(this.destroy$));
  }
}
```

**3. Development Mode Leak Detection:**
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // Memory leak detection in development
    environment.production ? [] : [
      {
        provide: ErrorHandler,
        useClass: MemoryLeakAwareErrorHandler
      }
    ]
  ]
};
```

---

## The Signals vs OnPush Change Detection Paradox

### 🚨 **Het Probleem**

**Symptomen:**
- Componenten met OnPush worden niet bijgewerkt wanneer signals veranderen.
- Overal handmatige `cdr.detectChanges()` calls.
- Inconsistente rendering tussen verschillende delen van de app.
- Signal updates werken in sommige componenten, maar niet in andere.
- Template toont verouderde data ondanks dat het signal de juiste waarde heeft.

**Technische Details:**
```typescript
// PROBLEMATISCHE MIXING:
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush enabled
  template: `
    <div>{{ mySignal() }}</div>  <!-- ✅ Works: signals trigger change detection -->
    <div>{{ myObservable$ | async }}</div>  <!-- ❌ Broken: needs manual trigger -->
    <child [data]="computedValue()"></child>  <!-- ⚠️ Inconsistent -->
  `
})
export class MixedComponent {
  mySignal = signal('test');
  myObservable$ = this.service.getData(); // Traditional observable

  // This computed depends on both signal and observable
  computedValue = computed(() => {
    const signalVal = this.mySignal();
    const obsVal = this.lastObservableValue; // Stale!
    return `${signalVal}-${obsVal}`;
  });
}
```

### ✅ **De Oplossing**

**1. Full Signal Migration Strategy:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>{{ mySignal() }}</div>
    <div>{{ myData() ?? 'Loading...' }}</div>  <!-- toSignal conversion -->
    <child [data]="computedValue()"></child>
  `
})
export class ConsistentComponent {
  private readonly service = inject(DataService);

  // ✅ Convert observables to signals
  readonly mySignal = signal('test');
  readonly myData = toSignal(this.service.getData(), { initialValue: null });

  // ✅ Pure signal computation
  readonly computedValue = computed(() => {
    const signalVal = this.mySignal();
    const dataVal = this.myData();
    if (!dataVal) return 'loading';
    return `${signalVal}-${dataVal}`;
  });

  // ✅ Signal-based event handlers
  updateData() {
    this.mySignal.set('updated');
    // No manual change detection needed!
  }
}
```

**2. Hybrid Approach met Explicit Triggers:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HybridComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly mySignal = signal('test');
  observableData: any = null;

  ngOnInit() {
    // ✅ Explicit change detection voor observables
    this.service.getData().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.observableData = data;
      this.cdr.markForCheck(); // Explicit trigger
    });

    // ✅ Or convert to signal immediately
    this.dataSignal = toSignal(this.service.getData().pipe(
      takeUntil(this.destroy$)
    ), { initialValue: null });
  }
}
```

**3. Signal-First Architecture Pattern:**
```typescript
// Modern component design
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (viewModel(); as vm) {
      <div>{{ vm.title }}</div>
      <div>{{ vm.status }}</div>
      @for (item of vm.items; track item.id) {
        <item-card [item]="item" />
      }
    }
  `
})
export class ModernComponent {
  private readonly facade = inject(FeatureFacade);

  // ✅ Single view model signal
  readonly viewModel = computed(() => {
    const items = this.facade.items();
    const loading = this.facade.isLoading();
    const error = this.facade.error();

    if (loading) return { title: 'Loading...', status: 'loading', items: [] };
    if (error) return { title: 'Error', status: 'error', items: [] };

    return {
      title: `Found ${items.length} items`,
      status: 'success',
      items
    };
  });
}
```

### 🔍 **Root Cause Analysis**

**Change Detection Mismatch:**
1.  **OnPush Assumption**: `OnPush` gaat uit van immutable data patronen.
2.  **Signal Integration**: Signals hebben ingebouwde change detection integratie.
3.  **Observable Gap**: Traditionele observables hebben handmatige triggers nodig met `OnPush`.
4.  **Mixed Patterns**: Het combineren van signals met observables creëert inconsistentie.

**Framework Evolution Conflict:**
Angular's evolutie van Zone.js → OnPush → Signals creëert migratie-uitdagingen.

### 🛡️ **Preventie Strategieën**

**1. Signal-First Architecture:**
```typescript
// Facade pattern: observables internally, signals externally
@Injectable()
export class ModernFacade {
  private readonly store = inject(Store);

  // Internal: traditional NgRx observables
  private readonly data$ = this.store.select(selectData);
  private readonly loading$ = this.store.select(selectLoading);

  // External: signal API voor components
  readonly data = toSignal(this.data$, { initialValue: [] });
  readonly isLoading = toSignal(this.loading$, { initialValue: false });

  // Computed signals voor derived state
  readonly isEmpty = computed(() => this.data().length === 0);
  readonly hasData = computed(() => !this.isEmpty() && !this.isLoading());
}
```

**2. Migration Guidelines:**
```typescript
// Step-by-step migration approach
class ComponentMigration {
  // Phase 1: Convert inputs to signals
  readonly input1 = input<string>();
  readonly input2 = input.required<number>();

  // Phase 2: Convert internal state to signals
  private readonly localState = signal({ count: 0, status: 'idle' });

  // Phase 3: Convert service data to signals
  readonly serviceData = toSignal(this.service.getData());

  // Phase 4: Create computed derived state
  readonly viewModel = computed(() => ({
    display: this.input1() + this.localState().count,
    isReady: this.serviceData() !== null
  }));

  // Phase 5: Remove all manual change detection
  // No more cdr.markForCheck() calls needed!
}
```

### 📋 **Migration Checklist**

**Component Audit:**
- [ ] Alle inputs geconverteerd naar `input()` signals.
- [ ] Alle outputs geconverteerd naar `output()` signals.
- [ ] Service data geconverteerd via `toSignal()`.
- [ ] Lokale state geconverteerd naar `signal()`.
- [ ] Afgeleide state gebruikt `computed()`.
- [ ] Geen handmatige `cdr.markForCheck()` calls.
- [ ] OnPush strategie ingeschakeld.
- [ ] Geen `async` pipe gebruikt (vervangen door signals).

---

## The Tailwind CSS Custom Properties Death Spiral

### 🚨 **Het Probleem**

**Symptomen:**
- Dark mode schakelt, maar sommige elementen blijven licht.
- CSS custom properties worden niet bijgewerkt.
- Inconsistente theming tussen componenten.
- Styles werken in ontwikkeling, maar breken in productie.
- Complexe CSS selector wars in browser devtools.

**Technische Details:**
```scss
// PROBLEMATISCHE THEMING:
// styles.scss
:root {
  --primary: #3b82f6;    // Blue
  --background: #ffffff;  // White
}

html.dark {
  --primary: #60a5fa;    // Light blue
  --background: #1f2937; // Dark gray
}

// Component styles - BROKEN!
.my-component {
  background: var(--background);
  // ❌ Works in light mode
  // ❌ Breaks in dark mode due to specificity issues
}

// Tailwind config - INCONSISTENT!
module.exports = {
  theme: {
    colors: {
      primary: 'rgb(var(--primary))', // ❌ Wrong format
      background: 'var(--background)' // ❌ Missing fallback
    }
  }
}
```

### ✅ **De Oplossing**

**1. Systematic CSS Custom Properties Architecture:**
```scss
// styles.scss - DEFINITIVE THEMING SYSTEM
:root {
  // Base color palette (HSL for better manipulation)
  --color-primary-h: 221;
  --color-primary-s: 83%;
  --color-primary-l: 53%;
  --color-primary: hsl(var(--color-primary-h) var(--color-primary-s) var(--color-primary-l));

  // Semantic color tokens
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222 84% 5%);
  --color-muted: hsl(210 40% 98%);
  --color-border: hsl(214 32% 91%);

  // Component-specific tokens
  --color-card-background: var(--color-background);
  --color-button-primary: var(--color-primary);
}

html.dark {
  --color-background: hsl(222 84% 5%);
  --color-foreground: hsl(210 40% 98%);
  --color-muted: hsl(222 84% 11%);
  --color-border: hsl(217 32% 17%);

  --color-card-background: hsl(222 84% 8%);
}

// Skin variants (beyond dark/light)
html[data-skin="neon"] {
  --color-primary-h: 280;
  --color-primary-s: 100%;
  --color-primary-l: 70%;
}
```

**2. Tailwind Integration (tailwind.config.js):**
```javascript
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ✅ Proper CSS custom properties integration
        primary: {
          DEFAULT: 'hsl(var(--color-primary-h) var(--color-primary-s) var(--color-primary-l))',
          50: 'hsl(var(--color-primary-h) var(--color-primary-s) 95%)',
          100: 'hsl(var(--color-primary-h) var(--color-primary-s) 90%)',
          500: 'hsl(var(--color-primary-h) var(--color-primary-s) var(--color-primary-l))',
          900: 'hsl(var(--color-primary-h) var(--color-primary-s) 20%)'
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)'
        },
        border: 'var(--color-border)',
        card: {
          DEFAULT: 'var(--color-card-background)',
          foreground: 'var(--color-foreground)'
        }
      },
      // ✅ Spacing and sizing using CSS custom properties
      spacing: {
        'header': 'var(--height-header, 4rem)',
        'sidebar': 'var(--width-sidebar, 16rem)'
      }
    }
  },
  plugins: [
    // ✅ Plugin to generate color variations
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.theme-transition': {
          'transition': 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
        }
      }
      addUtilities(newUtilities)
    }
  ]
}
```

**3. TypeScript Theme Service Integration:**
```typescript
// theme.service.ts - ROBUST THEME MANAGEMENT
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  // Available themes
  readonly themes = {
    light: { name: 'Light', class: '' },
    dark: { name: 'Dark', class: 'dark' },
  } as const;

  readonly skins = {
    default: { name: 'Default', attribute: '' },
    neon: { name: 'Neon', attribute: 'neon' },
    minimal: { name: 'Minimal', attribute: 'minimal' }
  } as const;

  private readonly currentTheme = signal<keyof typeof this.themes>('light');
  private readonly currentSkin = signal<keyof typeof this.skins>('default');

  // Public API
  readonly theme = this.currentTheme.asReadonly();
  readonly skin = this.currentSkin.asReadonly();

  setTheme(theme: keyof typeof this.themes) {
    // Remove all theme classes
    Object.values(this.themes).forEach(t => {
      if (t.class) {
        this.renderer.removeClass(this.document.documentElement, t.class);
      }
    });

    // Apply new theme
    const themeConfig = this.themes[theme];
    if (themeConfig.class) {
      this.renderer.addClass(this.document.documentElement, themeConfig.class);
    }

    this.currentTheme.set(theme);
    this.persistTheme(theme);
  }

  setSkin(skin: keyof typeof this.skins) {
    // Remove all skin attributes
    Object.values(this.skins).forEach(s => {
      if (s.attribute) {
        this.renderer.removeAttribute(this.document.documentElement, 'data-skin');
      }
    });

    // Apply new skin
    const skinConfig = this.skins[skin];
    if (skinConfig.attribute) {
      this.renderer.setAttribute(
        this.document.documentElement,
        'data-skin',
        skinConfig.attribute
      );
    }

    this.currentSkin.set(skin);
    this.persistSkin(skin);
  }

  // ✅ CSS custom property manipulation
  setCustomProperty(property: string, value: string) {
    this.document.documentElement.style.setProperty(`--${property}`, value);
  }

  // ✅ Dynamic color generation
  generateColorVariations(baseColor: string) {
    const hsl = this.hexToHsl(baseColor);

    // Generate lighter and darker variations
    for (let i = 1; i <= 9; i++) {
      const lightness = i <= 5
        ? hsl.l + (50 - hsl.l) * (i / 5)  // Lighter
        : hsl.l - hsl.l * ((i - 5) / 4);  // Darker

      this.setCustomProperty(
        `color-primary-${i}00`,
        `hsl(${hsl.h} ${hsl.s}% ${lightness}%)`
      );
    }
  }

  private persistTheme(theme: string) {
    localStorage.setItem('app-theme', theme);
  }

  private persistSkin(skin: string) {
    localStorage.setItem('app-skin', skin);
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    // Implementation for color conversion
    // ... color conversion logic
    return { h: 0, s: 0, l: 0 };
  }
}
```

### 🔍 **Root Cause Analysis**

**CSS Specificity Wars:**
1.  **Cascade Conflicts**: Meerdere CSS-bronnen strijden om specificiteit.
2.  **Custom Property Scope**: CSS custom properties erven niet correct over.
3.  **Tailwind Purging**: Productie-builds verwijderen "ongebruikte" CSS.
4.  **Runtime Manipulation**: JavaScript theme-switching doorbreekt CSS-aannames.

### 🛡️ **Preventie Strategieën**

**1. Design Token System:**
```scss
// design-tokens.scss - SINGLE SOURCE OF TRUTH
$tokens: (
  'space': (
    'xs': '0.25rem',
    'sm': '0.5rem',
    'md': '1rem',
    'lg': '1.5rem',
    'xl': '2rem'
  ),
  'colors': (
    'primary': (
      'light': 'hsl(221 83% 53%)',
      'dark': 'hsl(221 83% 65%)'
    )
  )
);

// Generate CSS custom properties from tokens
:root {
  @each $category, $values in $tokens {
    @each $key, $value in $values {
      @if type-of($value) == 'map' {
        @each $variant, $color in $value {
          --#{$category}-#{$key}-#{$variant}: #{$color};
        }
      } @else {
        --#{$category}-#{$key}: #{$value};
      }
    }
  }
}
```

**2. Component Theme Isolation:**
```typescript
// Themed component pattern
@Component({
  selector: 'themed-card',
  template: `
    <div class="card theme-transition" [attr.data-theme]="theme()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card {
      background: var(--color-card-background);
      border: 1px solid var(--color-border);
      color: var(--color-foreground);

      // ✅ Scoped theme overrides
      &[data-theme="accent"] {
        --color-card-background: var(--color-accent);
        --color-foreground: var(--color-accent-foreground);
      }
    }
  `]
})
export class ThemedCardComponent {
  readonly theme = input<'default' | 'accent'>('default');
}
```

---

## Backend
Een robuuste applicatie vereist een strikte controle over hoe en wanneer data wordt opgeslagen. De interactie tussen de rijke logica in onze domein-entiteiten (Aggregate Roots) en de "Unit of Work" van Entity Framework Core (`DbContext`) kan leiden tot subtiele bugs, zoals de `DbUpdateConcurrencyException` die we tegenkwamen bij het liken van een review.

**Probleem:** Een `DbUpdateConcurrencyException` trad op bij het toevoegen van een `ReviewHelpfulVote` aan een `Review`. De oorzaak was dat de `Review`-entiteit zelf een nieuwe `ReviewHelpfulVote` aanmaakte en aan zijn interne collectie toevoegde. EF Core's Change Tracker raakte hierdoor in de war over de staat van de `Review`-entiteit, wat leidde tot een mislukte `UPDATE` statement.

**Principe (`Fix at Source`):** De verantwoordelijkheid voor het *orkestreren* van de Unit of Work ligt in de **Application Layer** (de CommandHandler). De **Domain Layer** is verantwoordelijk voor het *uitvoeren* van de business logic op de staat die het krijgt.

---

### De Foute Aanpak (VERBODEN): Domein-entiteit creëert zelf kind-entiteiten

```csharp
// --- IN DE REVIEW DOMEIN-ENTITEIT (FOUT!) ---
public void AddHelpfulVote(Guid userId, bool isHelpful)
{
    // PROBLEEM: De domein-entiteit creëert hier een nieuwe entiteit.
    // De DbContext weet hier niets van, wat leidt tot tracking-conflicten.
    var newVote = new ReviewHelpfulVote(this.Id, userId, isHelpful);
    _helpfulVotes.Add(newVote);
    RecalculateHelpfulScores();
}
```

---

## Tailwind CSS v4 CI/CD Pipeline Failure - The False Error Assumption

**Datum incident:** 2025-09-13
**Duur:** ~4 uur
**Impact:** CV deployment volledig geblokkeerd
**Complexiteit:** Medium (misleidende foutmeldingen)
**Status:** ✅ **RESOLVED**

### Het Probleem

GitHub Actions build faalde voor CV deployment naar Azure Static Web Apps. Tailwind CSS v4 leek incompatibel met de Nx monorepo architectuur, met aanvankelijk lockfile problemen en later PostCSS plugin conflicten.

### Foutmeldingen

**Initiële symptomen:**
```bash
ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY for '/errno/0.1.8'
```

**Misleidende Tailwind v4 errors:**
```bash
Error: Cannot apply unknown utility class `px-4`. Are you using CSS modules or similar and missing `@reference`?
Error: Cannot apply unknown utility class `text-lg`. Are you using CSS modules or similar and missing `@reference`?
Error: Cannot apply unknown utility class `font-mono`. Are you using CSS modules or similar and missing `@reference`?
```

**Build hangs:**
```bash
pnpm nx serve cv -> Building... [HANGS INDEFINITELY]
```

### Root Cause Analysis - The Critical Mistake ❌

**Foutieve assumptie:** De Tailwind utility class errors werden geïnterpreteerd als blocking build failures.

**Reality check:** Deze errors waren **non-blocking warnings** die ook in werkende builds voorkwamen.

**Het bewijs:** GitHub Actions logs van 3 weken geleden toonden:
```scss
libs/shared/styles/src/lib/theme.scss:11:8:
  11 │ @import "tailwindcss";
```
- **Zelfde errors aanwezig** ✓
- **Build succesvol** ✓
- **Deployment werkend** ✓
- **Tailwind CSS functioneel** ✓

### Failed Approaches (4 uur verspilling)

#### 1. Lockfile Engineering ❌
```bash
# Pogingen tot lockfile reparatie
pnpm install --frozen-lockfile=false
pnpm install errno@0.1.8
# Result: Symptomen behandelen, geen root cause fix
```

#### 2. PostCSS Configuration Overengineering ❌
```json
// .postcssrc.json - Complex configuration attempts
{
  "plugins": {
    "@tailwindcss/postcss": {},
    "autoprefixer": {}
  }
}
```

#### 3. CSS-First Architecture Experiments ❌
```css
/* apps/cv/src/tailwind.css - Separate file approach */
@import "tailwindcss";
```
```json
// project.json - Adding CSS to build
"styles": [
  "apps/cv/src/tailwind.css",
  "apps/cv/src/styles.scss",
  "libs/shared/styles/src/lib/theme.scss"
]
```

#### 4. Dependency Cascade Manipulation ❌
```json
// Removing build dependencies to avoid ng-packagr conflicts
{
  "dependsOn": [] // Instead of ["^build"]
}
```

**Alle approaches faalden omdat de onderliggende assumptie fout was.**

### The Breakthrough Moment 🎯

**User insight:**
> "dat is onzin want deze build slaagde ook 3 weken geleden met tailwind 4"

**Evidence provided:** Historical GitHub Actions logs proving working state.

**Realization:** The `@import "tailwindcss"` was **disabled** in our current code, but **enabled** in the working version.

### The Simple Solution ✅

**Single line fix:**
```scss
// libs/shared/styles/src/lib/theme.scss
@use "sass:list";
@import "tailwindcss";  // ← This line was commented out!
@import "@ctrl/ngx-emoji-mart/picker";
```

**Verification results:**
- **Local serve:** ✅ Working with hot reload
- **Style generation:** ✅ 50KB → 259KB → 231KB CSS size changes
- **Production build:** ✅ Completed successfully with warnings
- **Deployment:** ✅ GitHub Actions deployed successfully
- **Final result:** ✅ https://kind-water-0ee96b003.2.azurestaticapps.net

### Key Learnings & Prevention

#### What Went Wrong
1. **Assumption-Based Debugging:** Treating warnings as blocking errors
2. **Historical Ignorance:** Not checking previous working states first
3. **Over-Engineering:** Complex solutions for simple problems
4. **Symptom Treatment:** Fixing lockfiles instead of root cause

#### Success Factors
1. **User Domain Knowledge:** Knew previous working state existed
2. **Historical Evidence:** GitHub Actions logs as proof
3. **Evidence-Based Resolution:** Used actual build artifacts
4. **Systematic Verification:** Tested each step thoroughly

#### Prevention Strategy
```markdown
Before complex debugging:
1. ✅ Check git history for recent working states
2. ✅ Distinguish warnings vs blocking errors
3. ✅ Use actual logs/artifacts as evidence
4. ✅ Trust user domain knowledge
5. ✅ Test simplest solution first
```

### Technical Implementation Details

**Working configuration:**
```json
// package.json
{
  "tailwindcss": "^4.1.11",
  "@tailwindcss/postcss": "^4.1.11"
}
```

```json
// .postcssrc.json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

```json
// apps/cv/project.json
{
  "dependsOn": [] // Prevents ng-packagr conflicts
}
```

**Build success indicators:**
- ✅ Bundle generation completes (even with warnings)
- ✅ CSS file size increases significantly (50KB+ → 250KB+)
- ✅ No build process hanging
- ✅ Azure deployment succeeds

### Impact & Resolution

**Resolution time:** 4 hours (could have been 10 minutes with proper approach)
**User satisfaction:** "het werkt man, holy fuck, eindelijk ben trots op jouw"
**Deployment status:** ✅ Live with full Tailwind CSS v4 functionality
**Long-term value:** Documentation prevents future similar issues

**Prevention ROI:** Dit incident documenteren bespaart waarschijnlijk 4+ uur voor toekomstige Tailwind deployment issues.
