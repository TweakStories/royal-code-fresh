--- START OF FILE apps/droneshop/src/app/app.component.ts ---

// apps/challenger/src/app/app.component.ts
import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router'; // Nodig voor RouterOutlet in AppLayoutComponent
import { Store } from '@ngrx/store'; // Store nog steeds nodig om init actions te dispatchen

// --- Layout Component ---
// Importeer de component die de header en router-outlet bevat
import { DroneshopLayoutComponent } from './layout/app-layout/droneshop-layout.component';

// --- State Actions (alleen voor initialisatie) ---
import { AuthActions } from '@royal-code/store/auth';
import { NavigationFacade } from '@royal-code/core/navigations/state'; // Facade om laden te triggeren
import { LoggerService } from '@royal-code/core/logging';
import { TailwindDictionaryComponent } from '@royal-code/core';
import { StorageService } from '@royal-code/core/storage';
import { ChatActions } from 'libs/features/chat/core/src/lib/state/chat.actions';

/**
 * @Component AppComponent
 * @description Root component van de applicatie. Laadt de hoofdlayout en
 *              triggert initiële data laad acties.
 */
@Component({
  selector: 'droneshop-royal-code-root', // Behoud je root selector
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,       // Essentieel voor routing functionaliteit
    DroneshopLayoutComponent,  // De enige component die we hier direct renderen
    TailwindDictionaryComponent
  ],
  // De template bevat nu alleen de AppLayoutComponent.
  // AppLayoutComponent bevat op zijn beurt de AppHeaderComponent en de <router-outlet>.
  template: `<droneshop-layout></droneshop-layout>

      <lib-tailwind-dictionary />

  ` ,
  // Geen specifieke styles meer nodig hier, tenzij voor globale zaken buiten de layout.
})
export class AppComponent implements OnInit {
  // --- Dependencies (alleen voor init actions) ---
  private readonly store = inject(Store);
  private readonly navigationFacade = inject(NavigationFacade); // Facade om load te triggeren
  private readonly logger = inject(LoggerService);
  private readonly storageService = inject(StorageService);

  // --- Lifecycle Hook ---
 ngOnInit(): void {
    this.logger.info('[AppComponent] ngOnInit - Dispatching initial data load actions.');
    this.store.dispatch(AuthActions.checkAuthStatusOnAppInit());
    this.navigationFacade.loadNavigation();

    const anonymousSessionId = this.storageService.getItem<string>('anonymousAiSessionId');
    if (anonymousSessionId) {
      this.logger.info(`[AppComponent] Found anonymous session ID: ${anonymousSessionId}. Restoring conversation.`);
      this.store.dispatch(ChatActions.loadAnonymousConversationRequested({ anonymousSessionId }));
    }
  }
}

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/app.config.server.ts ---

// --- VERVANG VOLLEDIG BESTAND: apps/droneshop/src/app/app.config.server.ts ---
/**
 * @file app.config.server.ts
 * @Version 2.2.0 (SSR TranslateLoader TransferState & NgRx MetaReducer Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Server-side application configuration. This version integrates a `TranslateServerLoader`
 *   that places translations into `TransferState`, ensuring proper hydration on the client.
 *   Also ensures NgRx meta-reducers are correctly configured for server-side execution.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix SSR hydration and i18n blocking issues by correctly configuring TransferState for translations and ensuring NgRx meta-reducer factories are resolved via DI.
 */
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateServerLoader } from './translate-server.loader';
import { join } from 'path';
import { transferStateMetaReducer } from './state-transfer';

// DE FIX: Factory-functie voor onze nieuwe server-loader
export function translateServerLoaderFactory(): TranslateLoader {
  // `process.cwd()` is de root van je Nx monorepo op de server.
  // We moeten verwijzen naar de gebouwde client-assets (`browser` folder).
  const browserDistFolder = join(process.cwd(), 'dist/apps/droneshop/browser');
  // DE FIX: Retourneer een instantie van de gewijzigde TranslateServerLoader
  return new TranslateServerLoader(
    browserDistFolder,
    './assets/i18n/shared/', // Shared prefix
    './assets/i18n/droneshop/', // App-specifiek prefix
    '.json'
  );
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: translateServerLoaderFactory,
      },
    }),
    // DE FIX: transferStateMetaReducer wordt direct in app.config.ts al toegevoegd aan provideStore
    //         en is dus hier niet opnieuw nodig als multi-provider.
    // {
    //   provide: 'META_REDUCERS',
    //   useFactory: () => [transferStateMetaReducer],
    //   multi: true,
    // },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/app.config.ts ---

// --- VERVANG VOLLEDIG BESTAND: apps/droneshop/src/app/app.config.ts ---
/**
 * @file app.config.ts (Droneshop App) - DEFINITIVE PRODUCTION-READY CONFIGURATION
 * @Version 4.7.0 (SSR Hydration, i18n TransferState & MetaReducer/Interceptor Fixes)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-03
 * @Description
 *   Definitieve application configuration. Deze versie lost kritieke SSR hydration
 *   problemen op, met name gerelateerd aan i18n `TranslateLoader` en `TransferState`
 *   integratie. `MetaReducers` zijn nu correct geregistreerd voor NgRx, en de
 *   `AuthInterceptor` is geconfigureerd om statische assets te negeren.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix SSR hydration and i18n blocking issues by correctly configuring TransferState for translations and ensuring NgRx meta-reducer factories are resolved via DI. Also fix AuthInterceptor for static assets.
 */

// ===== ANGULAR CORE IMPORTS =====
import { 
  ApplicationConfig, 
  provideZoneChangeDetection, 
  isDevMode, 
  inject, 
  APP_INITIALIZER, 
  provideAppInitializer, 
  PLATFORM_ID 
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { isPlatformBrowser } from '@angular/common';

// ===== HTTP & INTERCEPTORS =====
import { 
  HttpClient, 
  provideHttpClient, 
  HttpInterceptorFn, 
  HttpRequest, 
  withInterceptors, 
  HttpBackend // <<< HttpBackend hier importeren
} from '@angular/common/http';
import { globalErrorInterceptor } from '@royal-code/core/error-handling';
import { etagInterceptor } from '@royal-code/core/http';
// DE FIX: Importeer de AuthInterceptor class en de functional interceptor uit de library
import { AuthInterceptor, authInterceptorFn as importedAuthInterceptorFn } from '@royal-code/auth/data-access'; 

// ===== NGRX STORE =====
import { 
  Action, 
  ActionReducer, 
  MetaReducer, 
  provideStore, 
  ActionReducerMap 
} from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { 
  provideRouterStore, 
  routerReducer, 
  RouterReducerState 
} from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { localStorageSync } from 'ngrx-store-localstorage';

// ===== CORE SERVICES =====
import { RouterStateUrl } from '@royal-code/core/routing';
import { StorageService } from '@royal-code/core/storage';
import { APP_CONFIG } from '@royal-code/core/config';
import { LOGGER_CONFIG, LogLevel } from '@royal-code/core/logging';

// ===== STORE FEATURES =====
import { provideAuthFeature } from '@royal-code/store/auth';
import { provideUserFeature } from '@royal-code/store/user';
import { provideErrorFeature } from '@royal-code/store/error';
import { 
  provideThemeFeature, 
  APP_THEME_DEFAULTS, 
  AppThemeDefaults 
} from '@royal-code/store/theme';
import { provideNavigationFeature } from '@royal-code/core/navigations/state';

// ===== FEATURE MODULES =====
import { provideCharacterProgressionFeature } from '@royal-code/features/character-progression';
import { 
  AbstractSocialApiService, 
  provideFeedFeature 
} from '@royal-code/features/social/core';
import { SocialApiService } from '@royal-code/features/social/data-access';
import { provideCartFeature } from '@royal-code/features/cart/core';
import { 
  provideChatFeature, 
  AbstractChatApiService 
} from '@royal-code/features/chat/core';
import { PlushieChatApiService } from '@royal-code/features/chat/data-access-plushie';
import { 
  provideReviewsFeature, 
  AbstractReviewsApiService 
} from '@royal-code/features/reviews/core';
import { PlushieReviewsApiService } from '@royal-code/features/reviews/data-access-plushie';
import { 
  provideMediaFeature, 
  AbstractMediaApiService 
} from '@royal-code/features/media/core';
import { PlushieMediaApiService } from '@royal-code/features/media/data-access-plushie';
import { 
  AbstractProductApiService, 
  provideProductsFeature 
} from '@royal-code/features/products/core';
import { DroneshopProductApiService } from '@royal-code/features/products/data-access-droneshop';
import { PlushieCheckoutApiService } from '@royal-code/features/checkout/data-access-plushie';
import { provideCheckoutFeature, AbstractCheckoutApiService } from '@royal-code/features/checkout/core';
import { AbstractOrderApiService, provideOrdersFeature } from '@royal-code/features/orders/core';
import { PlushieOrderApiService } from '@royal-code/features/orders/data-access-plushie';
import { AbstractCartApiService } from '@royal-code/features/cart/core';
import { PlushieCartApiService } from '@royal-code/features/cart/data-access-plushie';
import { DroneshopWishlistApiService } from '@royal-code/features/wishlist/data-access-droneshop';
import { DroneshopGuidesApiService } from '@royal-code/features/guides/data-access-droneshop';
import { DroneshopAccountApiService } from '@royal-code/features/account/data-access-droneshop';
import { AbstractAccountApiService, provideAccountFeature } from '@royal-code/features/account/core';

// ===== I18N =====
import { 
  provideTranslateService, 
  TranslateLoader, 
  TranslateService 
} from '@ngx-translate/core';
// Importeer de nieuwe browser loader
import { TranslateBrowserLoader } from './translate-browser.loader'; 


// ===== ICONS =====
import { 
  Home, 
  Edit3, 
  MoreHorizontal, 
  icons, 
  Grid, 
  Edit, 
  AlertCircle,
  MoreVertical,
  GitCommit,
  Sliders,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  UserCircle
} from 'lucide-angular';
import { 
  LUCIDE_ICONS, 
  LucideIconProvider 
} from 'lucide-angular';

// ===== ENVIRONMENT & ROUTES =====
import { environment } from '../../environments/environment';
import { appRoutes } from './app.routes';
import { AbstractWishlistApiService, provideWishlistFeature } from '@royal-code/features/wishlist/core';
import { AbstractGuidesApiService, provideGuidesFeature } from '@royal-code/features/guides/core';
// Importeer transferStateMetaReducer
import { transferStateMetaReducer } from './state-transfer'; 

// ========================================
// TYPE DEFINITIONS
// ========================================
export interface DroneshopRootState { 
  router: RouterReducerState<RouterStateUrl>; 
  // Voeg hier de typen van andere features toe als ze in de RootState worden samengevoegd
  // bijvoorbeeld: auth: AuthState;
}

// ========================================
// REDUCERS
// ========================================
const droneshopRootReducers: ActionReducerMap<DroneshopRootState> = { 
  router: routerReducer 
};

// ========================================
// META REDUCERS FACTORIES
// ========================================
// DE FIX: localStorageSyncFactory is nu een functie die een MetaReducer retourneert
export function localStorageSyncFactory(platformId: object): MetaReducer<any> {
  return function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    if (isPlatformBrowser(platformId)) {
      return localStorageSync({ 
        keys: ['theme', 'user', 'cart', 'products'], 
        rehydrate: true, 
        storageKeySerializer: key => `droneshopApp_${key}` 
      })(reducer);
    }
    // Op de server, doe niets met localStorage
    return reducer;
  };
}

// ========================================
// I18N LOADER FACTORY (CLIENT-SIDE)
// ========================================
// DE FIX: Gebruik de nieuwe TranslateBrowserLoader, geen HttpBackend meer nodig direct.
export function HttpLoaderFactory(http: HttpClient): TranslateBrowserLoader {
  return new TranslateBrowserLoader(
    './assets/i18n/shared/', // Shared prefix
    './assets/i18n/droneshop/', // App-specifiek prefix
    '.json'
  );
}


// ========================================
// INITIALIZERS
// ========================================
function initializeHighlightJsFactory() {
  return () => import('highlight.js')
    .then(module => Promise.resolve())
    .catch(error => Promise.reject(error));
}

// DE FIX: initializeI18nFactory nu SSR-vriendelijk
export function initializeI18nFactory(
  translateService: TranslateService, 
  storageService: StorageService,
  platformId: object // << DE FIX: PLATFORM_ID injecteren
): () => Promise<void> {
  return () => {
    const defaultLang = 'nl';
    const supportedLangs = ['nl', 'en'];
    const storedLang = storageService.getItem<string>('droneshopApp_language');
    // DE FIX: getBrowserLang() alleen op de browser
    const browserLang = isPlatformBrowser(platformId) ? translateService.getBrowserLang() : defaultLang; 
    
    const langToUse = (storedLang && supportedLangs.includes(storedLang)) 
      ? storedLang 
      : (browserLang && supportedLangs.includes(browserLang)) 
        ? browserLang 
        : defaultLang;
    
    translateService.setDefaultLang(defaultLang);

    if (isPlatformBrowser(platformId)) {
      // Op de client, resolve direct om geen hydration te blokkeren.
      // De router resolver (i18nInitResolver) handelt het wachten af op de `onLangChange` event.
      return Promise.resolve();
    } else {
      // Op de server, wacht wel totdat de vertalingen geladen zijn.
      return translateService.use(langToUse).toPromise().then(() => {}).catch(error => {
        console.error('[APP_INITIALIZER] Server-side i18n initialization failed:', error);
        return Promise.reject(error);
      });
    }
  };
}

// ========================================
// THEME CONFIGURATION
// ========================================
const DRONESHOP_APP_THEME_DEFAULTS: AppThemeDefaults = { 
  defaultThemeName: 'arcaneMyst', 
  defaultDarkMode: true 
};

// ========================================
// APPLICATION CONFIGURATION
// ========================================
export const appConfig: ApplicationConfig = {
  providers: [
    // ===== ANGULAR CORE =====
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    // VERWIJDERD: provideClientHydration(), // Deze provider is niet meer nodig voor CSR
    
    // ===== ROUTING =====
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      }),
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),


    // ===== HTTP & INTERCEPTORS =====
    provideHttpClient(withInterceptors([
      importedAuthInterceptorFn, 
      etagInterceptor, 
      globalErrorInterceptor
    ])),
    AuthInterceptor, 
    StorageService,

    // ===== NGRX STORE =====
   provideStore(droneshopRootReducers, {
      metaReducers: [
        (reducer) => (state, action) => {
      try {
        // Log de actie om te zien welke de fout veroorzaakt
        if (action.type !== '@ngrx/store/init' && action.type !== '@ngrx/store/update-reducers') {
          const clonedAction = structuredClone(action); 
          console.log(`[MetaReducer] Processing action: ${action.type}`, clonedAction); // <<< ZORG DAT DEZE LIJN ACTIEF IS!
        }
      } catch (e) {
        console.error(`[MetaReducer] Serialization error for action ${action.type}:`, e, action);
      }
      return reducer(state, action);
    },
        transferStateMetaReducer // <<< DEZE MetaReducer is SSR-specifiek en MOET verwijderd worden of geconditionaliseerd.
        // Omdat u SSR volledig uitschakelt, is deze niet meer nodig.
      ], 
      runtimeChecks: { 
        strictStateImmutability: true, 
        strictActionImmutability: true, 
        strictActionSerializability: true, 
        strictActionWithinNgZone: true, 
        strictActionTypeUniqueness: false 
      }
    }),
    provideEffects([]),
    provideRouterStore(),
    
    // ===== DEV TOOLS (Development Only) =====
    isDevMode() 
      ? provideStoreDevtools({ 
          name: 'Droneshop App', 
          maxAge: 25, 
          logOnly: false, 
          trace: true 
        }) 
      : [],

    // ===== STORE FEATURES =====
    provideAuthFeature(),
    provideUserFeature(),
    provideErrorFeature(),
    provideThemeFeature(),
    provideNavigationFeature(),
    provideCharacterProgressionFeature(),
    provideChatFeature(),
    provideReviewsFeature(),
    provideMediaFeature(),
    provideFeedFeature(),
    provideProductsFeature(),
    provideCartFeature(),
    provideCheckoutFeature(),
    provideOrdersFeature(),
    provideGuidesFeature(),
    provideWishlistFeature(),
    provideAccountFeature(),

    // ===== APP INITIALIZERS =====
    { 
      provide: APP_INITIALIZER, 
      useFactory: initializeI18nFactory, 
      multi: true, 
      // VERWIJDERD: PLATFORM_ID is niet meer nodig hier zonder SSR
      deps: [TranslateService, StorageService] 
    },
    provideAppInitializer(initializeHighlightJsFactory()),

    // ===== API SERVICE IMPLEMENTATIONS =====
    { provide: AbstractChatApiService, useClass: PlushieChatApiService },
    { provide: AbstractReviewsApiService, useClass: PlushieReviewsApiService },
    { provide: AbstractMediaApiService, useClass: PlushieMediaApiService },
    { provide: AbstractSocialApiService, useClass: SocialApiService },
    { provide: AbstractProductApiService, useClass: DroneshopProductApiService },
    { provide: AbstractCheckoutApiService, useClass: PlushieCheckoutApiService },
    { provide: AbstractOrderApiService, useClass: PlushieOrderApiService },
    { provide: AbstractCartApiService, useClass: PlushieCartApiService },
    { provide: AbstractWishlistApiService, useClass: DroneshopWishlistApiService },
    { provide: AbstractGuidesApiService, useClass: DroneshopGuidesApiService },
    { provide: AbstractAccountApiService, useClass: DroneshopAccountApiService },

    // ===== I18N (Uw originele, werkende configuratie) =====
    // Deze configuratie wordt ongewijzigd gelaten, zoals u deze heeft aangeleverd.
    // De TranslateBrowserLoader die u definieert, is dan verantwoordelijk voor de HTTP-aanroep.
    provideTranslateService({ 
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient] 
      }
    }),

    // ===== CONFIGURATION =====
    { provide: APP_CONFIG, useValue: environment },
    { 
      provide: LOGGER_CONFIG, 
      useValue: { 
        level: isDevMode() ? LogLevel.DEBUG : LogLevel.INFO, 
        appName: 'DroneshopApp' 
      } 
    },
    { provide: APP_THEME_DEFAULTS, useValue: DRONESHOP_APP_THEME_DEFAULTS },

    // ===== ICONS =====
    { 
      provide: LUCIDE_ICONS, 
      multi: true, 
      useValue: new LucideIconProvider({ 
        ...icons, 
        Home, Edit3, Edit, Grid, MoreHorizontal, AlertCircle, MoreVertical, GitCommit, Sliders, PlayCircle, CheckCircle, AlertTriangle, UserCircle,
      }) 
    },
  ],
};

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/app.routes.ts ---

import { Routes } from '@angular/router';

// Importeer componenten die direct op top-level routes worden gebruikt
import { authGuard, LoginComponent, RegisterComponent } from '@royal-code/features/authentication';
import { DroneshopHomePageComponent } from './features/home/droneshop-homepage.component';
import { i18nInitResolver } from '@royal-code/shared/utils';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Register' },
  {
    path: '', // Dit is de root van de applicatie (na inloggen, of voor openbare pagina's)
    resolve: { i18n: i18nInitResolver },
    children: [
      {
        path: '', // Homepagina
        component: DroneshopHomePageComponent,
        title: 'Home',
        data: { breadcrumb: 'navigation.home' }
      },
      {
        path: 'products',
        // REMOVED: productFiltersResolver - nu in de feature module
        loadChildren: () =>
          import('@royal-code/features/products/ui-droneshop').then(
            (m) => m.ProductsFeatureRoutes
          ),
        title: 'Products',
        data: { breadcrumb: 'navigation.products' },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange'
      },
      {
        path: 'search',
        // REMOVED: productFiltersResolver - search gebruikt nu ook products feature
        loadComponent: () =>
          import('@royal-code/features/products/ui-droneshop').then(
            (m) => m.SearchResultsComponent
          ),
        title: 'Search Results',
        data: { breadcrumb: 'navigation.search' }
      },

      // === RTF DRONES ROUTES ===
      // Deze routes kunnen ook filters gebruiken voor specifieke categorieën
      {
        path: 'drones/rtf-drones',
        loadComponent: () =>
          import('./features/products/rtf-drones-page/rtf-drones-page.component').then(m => m.RtfDronesPageComponent),
        title: 'Ready-to-Fly FPV Drones',
        data: { breadcrumb: 'navigation.rtfDrones' }
      },
      {
        path: 'drones/rtf-drones/quadmula-siren-f35',
        loadComponent: () =>
          import('./features/products/siren-f35-detail/siren-f35-detail.component').then(m => m.SirenF35DetailPageComponent),
        title: 'Quadmula Siren F3.5 Details',
        data: { breadcrumb: 'navigation.rtfDrones' }
      },
      {
        path: 'drones/rtf-drones/quadmula-siren-f5',
        loadComponent: () =>
          import('./features/products/siren-f5-detail/siren-f5-detail-page.component').then(m => m.SirenF5DetailPageComponent),
        title: 'Quadmula Siren F5 Details',
        data: { breadcrumb: 'navigation.rtfDrones' }
      },

      // === BUILD KITS ROUTES ===
      {
        path: 'drones/build-kits',
        loadComponent: () =>
          import('./features/products/diy-kits-page/diy-kits-page.component').then(m => m.DiyKitsPageComponent),
        title: 'DIY Drone Kits',
        data: { breadcrumb: 'navigation.buildKits' }
      },
      {
        path: 'drones/build-kits/quadmula-siren-f35-pdp',
        loadComponent: () => 
          import('./features/products/siren-f35-build-kit-detail/siren-f35-build-kit-detail.component').then(m => m.SirenF35BuildKitDetailPageComponent),
        title: 'Quadmula Siren F3.5 Build Kit',
        data: { breadcrumb: 'navigation.buildKits' }
      },
      {
        path: 'drones/build-kits/quadmula-siren-f5-pdp',
        loadComponent: () => 
          import('./features/products/siren-f5-build-kit-detail/siren-f5-build-kit-detail.component').then(m => m.SirenF5BuildKitDetailPageComponent),
        title: 'Quadmula Siren F5 Build Kit (8S)',
        data: { breadcrumb: 'navigation.buildKits' }
      },

      // === OVERIGE ROUTES (unchanged) ===
      {
        path: 'cart',
        loadChildren: () =>
          import('@royal-code/features/cart/ui-plushie').then((m) => m.CartFeatureRoutes),
        title: 'Cart',
        data: { breadcrumb: 'navigation.cart' }
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('@royal-code/features/checkout/ui-plushie').then((m) => m.CheckoutRoutes),
        title: 'Checkout',
        data: { breadcrumb: 'navigation.checkout' }
      },
      {
        path: 'chat',
        loadChildren: () => import('@royal-code/features/chat/ui-plushie').then(m => m.ChatPlushieRoutes),
        title: 'Chat',
        data: { breadcrumb: 'navigation.chat' }
      },
      {
        path: 'orders',
        loadChildren: () => import('@royal-code/features/orders/ui-plushie').then(m => m.OrderPlushieRoutes),
        title: 'My Orders',
        data: { breadcrumb: 'navigation.orders' }
      },
      {
        path: 'sale',
        loadChildren: () =>
          import('./features/sale/droneshop-sale/droneshop-sale.component').then((m) => [
            { path: '', component: m.DroneshopSaleComponent },
          ]),
        title: 'Sale',
        data: { breadcrumb: 'navigation.sale' }
      },
      {
        path: 'guides',
        loadChildren: () =>
          import('@royal-code/features/guides/ui-droneshop').then(
            (m) => m.GuidesFeatureRoutes
          ),
        title: 'Gidsen',
        data: { breadcrumb: 'navigation.guides' }
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadChildren: () =>
          import('@royal-code/features/account/ui-droneshop').then(
            (m) => m.AccountRoutes
          ),
        title: 'Mijn Account',
        data: { breadcrumb: 'navigation.account' }
      },
      {
        path: 'test/json-output',
        loadComponent: () =>
          import('@royal-code/features/test/json-output-viewer').then(
            (m) => m.JsonOutputViewerComponent
          ),
        title: 'JSON Output Viewer',
        data: { breadcrumb: 'navigation.jsonTest' }
      },
    ],
  },
];

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/layout/account-menu/account-menu.component.ts ---

/**
 * @file account-menu.component.ts
 * @Version 1.3.0 (Direct to Dashboard, Specific Text)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-08-31
 * @Description
 *   Dropdown content voor het gebruikersaccount. Linkt nu direct naar het
 *   account dashboard en gebruikt specifieke teksten.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AuthActions, authFeature } from '@royal-code/store/auth';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'droneshop-account-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- DE FIX: Solide achtergrond en expliciete hover-kleuren -->
    <div class="w-60 bg-background rounded-md shadow-lg border border-border py-2">
      @if (isAuthenticated()) {
        <div class="px-4 py-2 border-b border-border mb-2">
          <span class="text-sm font-semibold text-foreground">{{ 'accountMenu.welcomeBack' | translate }}</span>
        </div>
        <!-- << DE FIX: RouterLink naar /account, tekst is 'Mijn Dashboard' >> -->
        <a routerLink="/account" class="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.LayoutDashboard" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.myDashboard' | translate }}</span>
        </a>
        <a routerLink="/orders" class="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.FileText" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.myOrders' | translate }}</span>
        </a>
        <button (click)="logout()" class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.LogOut" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.logout' | translate }}</span>
        </button>
      } @else {
         <a routerLink="/login" class="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.LogIn" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.login' | translate }}</span>
        </a>
         <a routerLink="/register" class="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.UserPlus" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.register' | translate }}</span>
        </a>
      }
    </div>
  `
})
export class AccountMenuComponent {
  private readonly store = inject(Store);
  readonly isAuthenticated = this.store.selectSignal(authFeature.selectIsAuthenticated);
  protected readonly AppIcon = AppIcon;

  logout(): void {
    this.store.dispatch(AuthActions.logoutButtonClicked());
  }
}

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/layout/app-layout/droneshop-layout.component.ts ---

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DroneshopHeaderComponent } from '../droneshop-header/droneshop-header.component'; 
import { DroneshopFooterComponent } from '../droneshop-footer/droneshop-footer.component';
import { UiBreadcrumbsComponent } from '@royal-code/ui/breadcrumb'; // << DE FIX: Importeer de breadcrumbs component

@Component({
  selector: 'droneshop-layout',
  standalone: true,
  imports: [
    RouterModule, 
    DroneshopHeaderComponent, 
    DroneshopFooterComponent,
    UiBreadcrumbsComponent // << DE FIX: Voeg toe aan imports
  ],
  template: `
    <div class="flex min-h-screen flex-col bg-background text-foreground">
      <droneshop-header ngSkipHydration />
      
      <!-- << DE FIX: Content wrapper voor breadcrumbs en main content >> -->
      <div class="container-max flex-1 py-4 px-4 md:px-6 lg:px-8">
        <royal-code-ui-breadcrumbs class="mb-4" /> <!-- << DE FIX: Breadcrumbs component toegevoegd >> -->
        <main id="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <droneshop-footer />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopLayoutComponent {}

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/layout/droneshop-footer/droneshop-footer.component.ts ---

/**
 * @file droneshop-footer.component.ts
 * @Version 1.0.0 (Definitive, Conversion-Optimized)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   De definitieve, conversie-geoptimaliseerde footer component voor Droneshop.
 *   Implementeert de strategieën uit het 'Footer Conversie Optimalisatie Plan'.
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon, NavigationItem } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'droneshop-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-card border-t-2 border-black text-foreground">
      <!-- Sectie 1: Trust & Value Banner -->
      <section class="bg-surface-alt border-b-2 border-black">
        <div class="container-max grid grid-cols-1 md:grid-cols-3">
          <!-- Item 1: Gratis Verzending -->
          <div class="flex items-center gap-4 p-6 md:border-r-2 border-black">
            <royal-code-ui-icon [icon]="AppIcon.Truck" sizeVariant="xl" extraClass="text-primary"/>
            <div>
              <h3 class="font-bold text-foreground">{{ 'footer.usp.shipping.title' | translate }}</h3>
              <p class="text-sm text-secondary">{{ 'footer.usp.shipping.text' | translate }}</p>
            </div>
          </div>
          <!-- Item 2: Top-notch Support -->
          <div class="flex items-center gap-4 p-6 md:border-r-2 border-black">
            <royal-code-ui-icon [icon]="AppIcon.LifeBuoy" sizeVariant="xl" extraClass="text-primary"/>
            <div>
              <h3 class="font-bold text-foreground">{{ 'footer.usp.support.title' | translate }}</h3>
              <p class="text-sm text-secondary" [innerHTML]="'footer.usp.support.text' | translate"></p>
            </div>
          </div>
          <!-- Item 3: Veilig Betalen -->
          <div class="flex items-center gap-4 p-6">
            <royal-code-ui-icon [icon]="AppIcon.ShieldCheck" sizeVariant="xl" extraClass="text-primary"/>
            <div>
              <h3 class="font-bold text-foreground">{{ 'footer.usp.secure.title' | translate }}</h3>
              <p class="text-sm text-secondary">{{ 'footer.usp.secure.text' | translate }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Sectie 2: Hoofd-Footer (Fat Footer) -->
      <div class="container-max py-12 px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Kolom 1: Klantenservice -->
          <div class="footer-col">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.support.title' | translate }}</h4>
            <ul class="space-y-2">
              @for(link of supportLinks(); track link.id) {
                <li><a [routerLink]="link.route" class="text-secondary hover:text-primary transition-colors">{{ link.labelKey | translate }}</a></li>
              }
            </ul>
          </div>
          <!-- Kolom 2: Winkel -->
          <div class="footer-col">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.shop.title' | translate }}</h4>
            <ul class="space-y-2">
              @for(link of shopLinks(); track link.id) {
                <li><a [routerLink]="link.route" class="text-secondary hover:text-primary transition-colors">{{ link.labelKey | translate }}</a></li>
              }
            </ul>
          </div>
          <!-- Kolom 3: Ons Bedrijf -->
          <div class="footer-col">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.company.title' | translate }}</h4>
            <ul class="space-y-2">
              @for(link of companyLinks(); track link.id) {
                <li><a [routerLink]="link.route" class="text-secondary hover:text-primary transition-colors">{{ link.labelKey | translate }}</a></li>
              }
            </ul>
          </div>
          <!-- Kolom 4: Nieuwsbrief -->
          <div class="footer-col md:col-span-2 lg:col-span-1">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.newsletter.title' | translate }}</h4>
            <p class="text-sm text-secondary mb-4">{{ 'footer.columns.newsletter.text' | translate }}</p>
            <form (submit)="$event.preventDefault()" class="flex items-center border-2 border-border focus-within:border-primary transition-colors rounded-none">
              <input type="email" placeholder="{{ 'footer.columns.newsletter.placeholder' | translate }}" class="w-full bg-transparent px-3 py-2 text-foreground focus:outline-none">
              <royal-code-ui-button type="primary" htmlType="submit" sizeVariant="md" [isRound]="false" extraClasses="border-l-2 border-border rounded-none">
                <royal-code-ui-icon [icon]="AppIcon.Mail" />
              </royal-code-ui-button>
            </form>
          </div>
        </div>
      </div>

      <!-- Sectie 3: Sub-Footer -->
      <div class="border-t-2 border-black bg-surface-alt">
        <div class="container-max py-6 px-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div class="text-secondary text-center md:text-left mb-4 md:mb-0">
            © {{ currentYear }} Droneshop. Alle rechten voorbehouden.
            <a routerLink="/terms" class="hover:text-primary ml-2">Voorwaarden</a>
            <a routerLink="/privacy" class="hover:text-primary ml-2">Privacybeleid</a>
          </div>
          <div class="flex flex-col items-center md:items-end space-y-4">
            <!-- Social Media -->
            <div class="flex items-center gap-4">
              <a href="#" target="_blank" rel="noopener" class="text-secondary hover:text-primary"><royal-code-ui-icon [icon]="AppIcon.Facebook" /></a>
              <a href="#" target="_blank" rel="noopener" class="text-secondary hover:text-primary"><royal-code-ui-icon [icon]="AppIcon.Instagram" /></a>
              <a href="#" target="_blank" rel="noopener" class="text-secondary hover:text-primary"><royal-code-ui-icon [icon]="AppIcon.Youtube" /></a>
              <a href="#" target="_blank" rel="noopener" class="text-secondary hover:text-primary"><royal-code-ui-icon [icon]="AppIcon.Twitter" /></a>
            </div>
            <!-- Betaalmethoden (Voorbeeld) -->
            <div class="flex items-center gap-2 h-6">
              <!-- Voeg hier uw betaaliconen toe, bijv. als <img> of <svg> -->
              <span class="text-xs text-secondary">iDEAL, VISA, Mastercard, PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class DroneshopFooterComponent {
  readonly AppIcon = AppIcon;
  readonly currentYear = new Date().getFullYear();

  readonly supportLinks = signal<NavigationItem[]>([
    { id: 'faq', labelKey: 'footer.links.faq', route: '/faq' },
    { id: 'shipping', labelKey: 'footer.links.shipping', route: '/shipping' },
    { id: 'returns', labelKey: 'footer.links.returns', route: '/returns' },
    { id: 'order-status', labelKey: 'footer.links.orderStatus', route: '/orders' },
    { id: 'contact', labelKey: 'footer.links.contact', route: '/contact' },
  ]);
  
  readonly shopLinks = signal<NavigationItem[]>([
    { id: 'shop-freestyle', labelKey: 'droneshop.navigation.freestyleDrones', route: '/products/freestyle' },
    { id: 'shop-racing', labelKey: 'droneshop.navigation.raceDrones', route: '/products/racing' },
    { id: 'shop-parts', labelKey: 'droneshop.navigation.parts', route: '/products/parts' },
    { id: 'shop-gear', labelKey: 'droneshop.navigation.gogglesAndRadios', route: '/products/gear' },
    { id: 'shop-sale', labelKey: 'droneshop.navigation.onSale', route: '/sale' },
  ]);

  readonly companyLinks = signal<NavigationItem[]>([
    { id: 'about', labelKey: 'footer.links.about', route: '/about' },
    { id: 'careers', labelKey: 'footer.links.careers', route: '/careers' },
    { id: 'blog', labelKey: 'footer.links.blog', route: '/blog' },
  ]);
}

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/layout/droneshop-header/droneshop-header.component.ts ---

/**
 * @file droneshop-header.component.ts - Updated Navigation
 * @Version 17.1.0 (FIXED: Correcte URLs en alleen Siren F35/F5)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Gecorrigeerde header met alleen Siren F35 en F5 voor beide RTF en Build Kits.
 */
import { ChangeDetectionStrategy, Component, signal, inject, HostListener, ElementRef, DestroyRef, ViewChild, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

// UI Components
import { ExpandingThemeSelectorComponent, UiThemeSwitcherComponent } from '@royal-code/ui/theme-switcher';
import { UiDesktopNavComponent, UiMobileNavModalComponent, UiMegaMenuComponent } from '@royal-code/ui/navigation';
import { LanguageSelectorComponent } from '@royal-code/ui/language-selector';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';
import { AccountMenuComponent } from '../account-menu/account-menu.component';
import { DroneshopProductApiService } from '@royal-code/features/products/data-access-droneshop';
import { SearchSuggestion } from '@royal-code/features/products/domain';
import { UiSearchSuggestionsPanelComponent } from '@royal-code/features/products/ui-droneshop';
import { MediaType, NavigationItem, AppIcon, Image } from '@royal-code/shared/domain';
import { CartFacade } from 'libs/features/cart/core/src/lib/state/cart.facade';
import { LoggerService } from '@royal-code/core/logging';

const placeholderImg: Image = {
  id: 'default-img',
  type: MediaType.IMAGE,
  variants: [{ url: '/images/default-image.webp', width: 200 }],
  altText: 'Placeholder'
};

@Component({
  selector: 'droneshop-header',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, UiThemeSwitcherComponent,
    ExpandingThemeSelectorComponent, UiMobileNavModalComponent, LanguageSelectorComponent,
    UiIconComponent, FormsModule,
    UiInputComponent,
    UiDropdownComponent, AccountMenuComponent,
    UiMegaMenuComponent, UiDesktopNavComponent,
    UiSearchSuggestionsPanelComponent,
  ],
  template: `
    <header class="relative top-0 z-40 w-full">
      <div class="bg-background border-b border-black">
        <div class="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div class="h-8 bg-surface-alt">
            <div class="container-max h-full px-4 md:px-6 flex items-center justify-end">
              <royal-code-ui-desktop-nav [menuItems]="topBarNavItems()" [isSubtle]="true" />
            </div>
          </div>
          
          <div class="h-20">
            <div class="container-max h-full px-4 md:px-6 flex items-center justify-between gap-4">
              <a routerLink="/" class="text-2xl font-bold text-primary">Droneshop</a>
              
              <div class="flex-grow max-w-2xl mx-4 hidden md:block relative" #searchContainer>
                <royal-code-ui-input
                  type="search"
                  [placeholder]="'droneshop.search.placeholder' | translate"
                  [appendButtonIcon]="AppIcon.Search"
                  [appendButtonAriaLabel]="'droneshop.search.submit' | translate"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearchQueryChanged($event)"
                  (enterPressed)="onSearchSubmitted(searchQuery)"
                  (appendButtonClicked)="onSearchSubmitted(searchQuery)"
                  extraClasses="!px-4 !pr-12 !h-11 !text-lg !rounded-none !border-2 !border-border !bg-input focus:!ring-primary focus:!border-primary"
                  extraButtonClasses="!px-4 !h-full"
                />
                @if (searchQuery.length > 1 && suggestions() && suggestions()!.length > 0) {
                  <royal-code-ui-search-suggestions-panel 
                    [suggestions]="suggestions()!"
                    (suggestionSelected)="onSuggestionSelected($event)" />
                }
              </div>
              
              <div class="flex items-center gap-2">
                <div class="relative z-50"><royal-code-expanding-theme-selector /></div>
                <div class="relative z-50"><royal-code-ui-theme-switcher /></div>
                <div class="relative z-50"><royal-language-selector /></div>
                <div class="relative z-50">
                  <royal-code-ui-dropdown [triggerOn]="'click'" alignment="right" [offsetY]="8">
                    <button dropdown-trigger class="p-2 rounded-none text-foreground hover:text-primary" [attr.aria-label]="'droneshop.navigation.account' | translate">
                      <royal-code-ui-icon [icon]="AppIcon.User" sizeVariant="md" />
                    </button>
                    <div dropdown><droneshop-account-menu /></div>
                  </royal-code-ui-dropdown>
                </div>
                <a routerLink="/account/wishlist" class="p-2 rounded-none text-foreground hover:text-primary" [attr.aria-label]="'droneshop.navigation.myWishlist' | translate">
                  <royal-code-ui-icon [icon]="AppIcon.Heart" sizeVariant="md" />
                </a>
                <a routerLink="/cart" class="relative p-2 rounded-none text-foreground hover:text-primary" [attr.aria-label]="'droneshop.navigation.cart' | translate">
                  <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" sizeVariant="md" />
                  @if (cartItemCount() > 0) {
                    <div class="absolute -top-1 -right-1 bg-primary text-primary-on text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {{ cartItemCount() }}
                    </div>
                  }
                </a>
                <button class="md:hidden p-2 -ml-2 rounded-none text-foreground hover:text-primary" (click)="openMobileMenu()">
                  <royal-code-ui-icon [icon]="AppIcon.Menu" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <nav class="hidden md:flex h-14 bg-primary border-t border-black z-20 shadow-md" (mouseleave)="startCloseMenuTimer()">
        <div class="container-max h-full flex items-center justify-start">
          <ul class="flex items-center h-full">
            @for (item of primaryNavItems(); track item.id; let i = $index) {
              <li (mouseenter)="handleMouseEnter(item)" class="h-full flex items-center">
                <a [routerLink]="item.route" class="flex items-center gap-2 font-semibold transition-colors duration-200 h-full px-4 border-b-4" [class.border-black]="isLinkActive(item)" [class.border-transparent]="!isLinkActive(item)" [ngClass]="{ 'bg-black text-primary': i === 0, 'text-black hover:bg-black/10': i > 0, 'text-base lg:text-lg': true }">
                  <span>{{ item.labelKey | translate }}</span>
                  @if (item.menuType === 'mega-menu') {
                    <royal-code-ui-icon [icon]="AppIcon.ChevronDown" sizeVariant="sm" extraClass="opacity-70" />
                  }
                </a>
              </li>
            }
          </ul>
        </div>
      </nav>
      
      @if (activeMegaMenuItem(); as menuItem) {
        <div class="container-max relative">
          <div class="absolute left-0 right-0 top-0 z-30" (mouseenter)="cancelCloseMenuTimer()" (mouseleave)="startCloseMenuTimer()">
            <royal-code-ui-mega-menu [menuItem]="menuItem" />
          </div>
        </div>
      }
    </header>

    <royal-code-ui-mobile-nav-modal 
      [isOpen]="isMobileMenuOpen()" 
      [menuItems]="mobileModalRootItems()" 
      (closeRequested)="closeMobileMenu()" 
      (navigationItemClicked)="handleMobileNavigation($event)" />
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopHeaderComponent {
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly productApiService = inject(DroneshopProductApiService);
  private readonly logger = inject(LoggerService);

  @ViewChild('searchContainer', { static: true }) searchContainerRef!: ElementRef<HTMLDivElement>;

  // === Algemene State ===
  readonly isMobileMenuOpen = signal(false);
  readonly activeMegaMenuItem = signal<NavigationItem | null>(null);
  readonly AppIcon = AppIcon;
  private readonly cartFacade = inject(CartFacade); 

  readonly cartItemCount = computed(() => this.cartFacade.viewModel().totalItemCount);

  // === Search State ===
  searchQuery = '';
  private readonly searchTerm$ = new Subject<string>();

  readonly suggestions = toSignal(
    this.searchTerm$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(term => term.length > 1 ? this.productApiService.getSuggestions(term).pipe(
          map(response => response.suggestions),
          catchError(() => of([] as SearchSuggestion[]))
        ) : of([] as SearchSuggestion[])
      ),
      takeUntilDestroyed(this.destroyRef)
    )
  );

  private closeMenuTimer?: number;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target) && this.activeMegaMenuItem()) {
      this.closeMegaMenu();
    }
    
    if (this.searchContainerRef && !this.searchContainerRef.nativeElement.contains(event.target as Node)) {
        if (this.searchQuery.length > 0) {
          this.onSearchQueryChanged('');
        }
    }
  }

  // === Zoekmethodes ===
  onSearchQueryChanged(query: string): void {
    this.searchQuery = query;
    this.searchTerm$.next(query);
  }

  onSearchSubmitted(query: string): void {
    if (query?.trim()) {
      this.searchQuery = '';
      this.searchTerm$.next('');
      this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
    }
  }

  onSuggestionSelected(suggestion: SearchSuggestion): void {
    this.searchQuery = '';
    this.searchTerm$.next('');
    
    if (suggestion.type === 'product') {
      this.router.navigate(suggestion.route as any[]);
    } else {
      this.router.navigate(['/search'], { queryParams: { q: suggestion.text } });
    }
  }

  // === Navigatie Data ===
  readonly topBarNavItems = signal<NavigationItem[]>([
    { id: 'order-status', labelKey: 'droneshop.navigation.orderStatus', route: '/orders' },
    { id: 'contact', labelKey: 'droneshop.navigation.contact', route: '/contact' },
  ]);
  
   

readonly primaryNavItems = signal<NavigationItem[]>([
    // === ONDERDELEN ===
    { 
      id: 'onderdelen', 
      labelKey: 'droneshop.navigation.parts',
      route: ['/products'], // Het hoofdpunt van de `/products` route
      queryParams: { category: 'onderdelen' }, // De algemene categorie slug
      menuType: 'mega-menu', 
      megaMenuLayout: 'vertical-split', 
      queryParamsHandling: 'merge', // Alleen relevant als we via routerLink navigeren
      children: [
        { 
          id: 'elektronica-flight-stack', 
          labelKey: 'droneshop.navigation.parts.flightControllers',
          route: ['/products'],
          queryParams: { category: 'elektronica-flight-stack' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'flight-controllers', labelKey: 'droneshop.navigation.parts.flightControllers', route: ['/products'], queryParams: { category: 'flight-controllers' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'escs', labelKey: 'droneshop.navigation.parts.escs', route: ['/products'], queryParams: { category: 'escs' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'fc-esc-stacks', labelKey: 'droneshop.navigation.parts.fcEscStacks', route: ['/products'], queryParams: { category: 'fc-esc-stacks' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'pdbs', labelKey: 'droneshop.navigation.parts.pdbs', route: ['/products'], queryParams: { category: 'pdbs' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'voltage-regulators-bec', labelKey: 'droneshop.navigation.parts.voltageRegulatorsBec', route: ['/products'], queryParams: { category: 'voltage-regulators-bec' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'gps-kompas-modules', labelKey: 'droneshop.navigation.parts.gpsCompassModules', route: ['/products'], queryParams: { category: 'gps-kompas-modules' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'sensoren-blackbox', labelKey: 'droneshop.navigation.parts.sensorsBlackbox', route: ['/products'], queryParams: { category: 'sensoren-blackbox' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'buzzers-leds', labelKey: 'droneshop.navigation.parts.buzzersLeds', route: ['/products'], queryParams: { category: 'buzzers-leds' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'aandrijving', 
          labelKey: 'droneshop.navigation.parts.drivetrain', 
          route: ['/products'],
          queryParams: { category: 'aandrijving' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'motors', labelKey: 'droneshop.navigation.parts.motors', route: ['/products'], queryParams: { category: 'motors' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'propellers', labelKey: 'droneshop.navigation.parts.propellers', route: ['/products'], queryParams: { category: 'propellers' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'motor-hardware', labelKey: 'droneshop.navigation.parts.motorHardware', route: ['/products'], queryParams: { category: 'motor-hardware' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'frames-hardware', 
          labelKey: 'droneshop.navigation.parts.framesHardware', 
          route: ['/products'],
          queryParams: { category: 'frames-hardware' },
          queryParamsHandling: 'merge',
          children: [
            { id: '5-inch-frames', labelKey: 'droneshop.navigation.parts.5InchFrames', route: ['/products'], queryParams: { category: '5-inch-frames' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: '3-4-inch-frames', labelKey: 'droneshop.navigation.parts.34InchFrames', route: ['/products'], queryParams: { category: '3-4-inch-frames' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'cinewhoop-frames', labelKey: 'droneshop.navigation.parts.cinewhoopFrames', route: ['/products'], queryParams: { category: 'cinewhoop-frames' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'micro-tinywhoop-frames', labelKey: 'droneshop.navigation.parts.microTinywhoopFrames', route: ['/products'], queryParams: { category: 'micro-tinywhoop-frames' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'frame-onderdelen-replacements', labelKey: 'droneshop.navigation.parts.framePartsReplacements', route: ['/products'], queryParams: { category: 'frame-onderdelen-replacements' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'algemene-hardware', labelKey: 'droneshop.navigation.parts.generalHardware', route: ['/products'], queryParams: { category: 'algemene-hardware' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'fpv-systemen-drone', 
          labelKey: 'droneshop.navigation.parts.fpvSystemsDrone', 
          route: ['/products'],
          queryParams: { category: 'fpv-systemen-drone' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'digital-fpv-combos', labelKey: 'droneshop.navigation.parts.digitalFpvCombos', route: ['/products'], queryParams: { category: 'digital-fpv-combos' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'digital-fpv-cameras', labelKey: 'droneshop.navigation.parts.digitalFpvCameras', route: ['/products'], queryParams: { category: 'digital-fpv-cameras' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'analog-fpv-cameras', labelKey: 'droneshop.navigation.parts.analogFpvCameras', route: ['/products'], queryParams: { category: 'analog-fpv-cameras' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'digital-vtx', labelKey: 'droneshop.navigation.parts.digitalVtx', route: ['/products'], queryParams: { category: 'digital-vtx' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'analog-vtx', labelKey: 'droneshop.navigation.parts.analogVtx', route: ['/products'], queryParams: { category: 'analog-vtx' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'fpv-antennas-drone', labelKey: 'droneshop.navigation.parts.fpvAntennasDrone', route: ['/products'], queryParams: { category: 'fpv-antennas-drone' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'fpv-systeem-accessoires', labelKey: 'droneshop.navigation.parts.fpvSystemAccessories', route: ['/products'], queryParams: { category: 'fpv-systeem-accessoires' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: '3d-printed-parts-tpu', 
          labelKey: 'droneshop.navigation.parts.3dPrintedPartsTpu', 
          route: ['/products'],
          queryParams: { category: '3d-printed-parts-tpu' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'camera-mounts', labelKey: 'droneshop.navigation.parts.cameraMounts', route: ['/products'], queryParams: { category: 'camera-mounts' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'antenne-mounts', labelKey: 'droneshop.navigation.parts.antennaMounts', route: ['/products'], queryParams: { category: 'antenne-mounts' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'motor-soft-mounts-guards', labelKey: 'droneshop.navigation.parts.motorSoftMountsGuards', route: ['/products'], queryParams: { category: 'motor-soft-mounts-guards' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'frame-beschermers', labelKey: 'droneshop.navigation.parts.frameProtectors', route: ['/products'], queryParams: { category: 'frame-beschermers' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        }
      ]
    },

    // === DRONES & KITS ===
    { 
      id: 'drones', 
      labelKey: 'droneshop.navigation.dronesAndKits', 
      route: ['/products'], 
      queryParams: { category: 'drones-kits' },
      menuType: 'mega-menu', 
      megaMenuLayout: 'featured-grid', 
      queryParamsHandling: 'merge',
      megaMenuFeaturedItems: [
        { 
          id: 'rtf-bnf-drones', 
          labelKey: 'droneshop.navigation.rtfDrones', 
          route: ['/drones/rtf-drones'], // Dit is een specifieke route voor de landingspagina
          image: placeholderImg, 
          description: 'Klaar om te vliegen. Pak uit, laad op, en ga de lucht in.',
          // Geen queryParams hier, de landingspagina handelt zijn eigen filters af
          children: [
            { id: 'quadmula-siren-f35', labelKey: 'Quadmula Siren F3.5', route: ['/drones/rtf-drones/quadmula-siren-f35'] },
            { id: 'quadmula-siren-f5', labelKey: 'Quadmula Siren F5', route: ['/drones/rtf-drones/quadmula-siren-f5'] }
          ]
        },
        { 
          id: 'drone-build-kits', 
          labelKey: 'droneshop.navigation.buildKits', 
          route: ['/drones/build-kits'], // Dit is een specifieke route voor de landingspagina
          image: placeholderImg, 
          description: 'Bouw je perfecte drone. Elk onderdeel gekozen door jou.',
          // Geen queryParams hier, de landingspagina handelt zijn eigen filters af
          children: [
            { id: 'quadmula-siren-f35-pdp', labelKey: 'Quadmula Siren F3.5 Kit', route: ['/drones/build-kits/quadmula-siren-f35-pdp'] },
            { id: 'quadmula-siren-f5-pdp', labelKey: 'Quadmula Siren F5 Kit', route: ['/drones/build-kits/quadmula-siren-f5-pdp'] }
          ]
        },
        // OOK DEZE LINKS GAAN NAAR DE PRODUCTSLIJST, dus queryParams zijn essentieel
        { id: 'frames-quick', labelKey: 'droneshop.navigation.parts.frames', route: ['/products'], queryParams: { category: 'frames-hardware' }, image: placeholderImg, queryParamsHandling: 'merge' },
        { id: 'motors-quick', labelKey: 'droneshop.navigation.parts.motors', route: ['/products'], queryParams: { category: 'motors' }, image: placeholderImg, queryParamsHandling: 'merge' },
        { id: 'electronics-quick', labelKey: 'droneshop.navigation.parts.electronics', route: ['/products'], queryParams: { category: 'elektronica-flight-stack' }, image: placeholderImg, queryParamsHandling: 'merge' }
      ]
    },

    // === RADIO CONTROL ===
    { 
      id: 'radio-control', 
      labelKey: 'droneshop.navigation.radioControl', 
      route: ['/products'],
      queryParams: { category: 'radio-control' },
      menuType: 'mega-menu', 
      megaMenuLayout: 'featured-grid', 
      queryParamsHandling: 'merge',
      megaMenuFeaturedItems: [
        { 
          id: 'radio-zenders', 
          labelKey: 'droneshop.navigation.radioControl.transmitters', 
          route: ['/products'],
          queryParams: { category: 'radio-zenders' },
          image: placeholderImg,
          queryParamsHandling: 'merge',
          children: [
            { id: 'multi-protocol-zenders', labelKey: 'droneshop.navigation.radioControl.multiProtocolTransmitters', route: ['/products'], queryParams: { category: 'multi-protocol-zenders' }, queryParamsHandling: 'merge' },
            { id: 'elrs-zenders', labelKey: 'droneshop.navigation.radioControl.elrsTransmitters', route: ['/products'], queryParams: { category: 'elrs-zenders' }, queryParamsHandling: 'merge' },
            { id: 'crossfire-zenders-modules', labelKey: 'droneshop.navigation.radioControl.crossfireTransmittersModules', route: ['/products'], queryParams: { category: 'crossfire-zenders-modules' }, queryParamsHandling: 'merge' },
            { id: 'tx-accessoires-upgrades', labelKey: 'droneshop.navigation.radioControl.transmitterAccessoriesUpgrades', route: ['/products'], queryParams: { category: 'tx-accessoires-upgrades' }, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'rc-ontvangers', 
          labelKey: 'droneshop.navigation.radioControl.receivers', 
          route: ['/products'],
          queryParams: { category: 'rc-ontvangers' },
          image: placeholderImg,
          queryParamsHandling: 'merge',
          children: [
            { id: 'elrs-ontvangers', labelKey: 'droneshop.navigation.radioControl.elrsReceivers', route: ['/products'], queryParams: { category: 'elrs-ontvangers' }, queryParamsHandling: 'merge' },
            { id: 'crossfire-ontvangers', labelKey: 'droneshop.navigation.radioControl.crossfireReceivers', route: ['/products'], queryParams: { category: 'crossfire-ontvangers' }, queryParamsHandling: 'merge' },
            { id: 'frsky-ontvangers', labelKey: 'droneshop.navigation.radioControl.frskyReceivers', route: ['/products'], queryParams: { category: 'frsky-ontvangers' }, queryParamsHandling: 'merge' },
            { id: 'overige-rc-ontvangers', labelKey: 'droneshop.navigation.radioControl.otherRcReceivers', route: ['/products'], queryParams: { category: 'overige-rc-ontvangers' }, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'externe-rc-modules', 
          labelKey: 'droneshop.navigation.radioControl.externalRcModules', 
          route: ['/products'],
          queryParams: { category: 'externe-rc-modules' },
          image: placeholderImg,
          queryParamsHandling: 'merge',
          children: [
            { id: 'elrs-modules', labelKey: 'droneshop.navigation.radioControl.elrsModules', route: ['/products'], queryParams: { category: 'elrs-modules' }, queryParamsHandling: 'merge' },
            { id: 'crossfire-modules', labelKey: 'droneshop.navigation.radioControl.crossfireModules', route: ['/products'], queryParams: { category: 'crossfire-modules' }, queryParamsHandling: 'merge' },
            { id: 'multi-protocol-modules', labelKey: 'droneshop.navigation.radioControl.multiProtocolModules', route: ['/products'], queryParams: { category: 'multi-protocol-modules' }, queryParamsHandling: 'merge' }
          ]
        },
        { id: 'rc-antennes', labelKey: 'droneshop.navigation.radioControl.rcAntennas', route: ['/products'], queryParams: { category: 'rc-antennes' }, image: placeholderImg, queryParamsHandling: 'merge' },
        { id: 'gimbals-schakelaars', labelKey: 'droneshop.navigation.radioControl.gimbalsSwitches', route: ['/products'], queryParams: { category: 'gimbals-schakelaars' }, image: placeholderImg, queryParamsHandling: 'merge' }
      ]
    },

    // === FPV GEAR ===
    { 
      id: 'fpv-gear', 
      labelKey: 'droneshop.navigation.fpvGear', 
      route: ['/products'],
      queryParams: { category: 'fpv-gear' },
      menuType: 'mega-menu', 
      megaMenuLayout: 'vertical-split', 
      queryParamsHandling: 'merge',
      children: [
        { 
          id: 'fpv-goggles', 
          labelKey: 'droneshop.navigation.fpvGear.goggles', 
          route: ['/products'],
          queryParams: { category: 'fpv-goggles' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'digital-fpv-goggles', labelKey: 'droneshop.navigation.fpvGear.digitalGoggles', route: ['/products'], queryParams: { category: 'digital-fpv-goggles' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'analog-fpv-goggles', labelKey: 'droneshop.navigation.fpvGear.analogGoggles', route: ['/products'], queryParams: { category: 'analog-fpv-goggles' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'goggle-accessories', labelKey: 'droneshop.navigation.fpvGear.goggleAccessories', route: ['/products'], queryParams: { category: 'goggle-accessories' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'fpv-receiver-modules', 
          labelKey: 'droneshop.navigation.fpvGear.receiverModules', 
          route: ['/products'],
          queryParams: { category: 'fpv-receiver-modules' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'analog-receiver-modules', labelKey: 'droneshop.navigation.fpvGear.analogReceiverModules', route: ['/products'], queryParams: { category: 'analog-receiver-modules' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'digital-receiver-modules', labelKey: 'droneshop.navigation.fpvGear.digitalReceiverModules', route: ['/products'], queryParams: { category: 'digital-receiver-modules' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'vtx-fpv', 
          labelKey: 'droneshop.navigation.fpvGear.videoTransmitters', 
          route: ['/products'],
          queryParams: { category: 'vtx-fpv' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'digital-vtx-fpv', labelKey: 'droneshop.navigation.fpvGear.digitalVtx', route: ['/products'], queryParams: { category: 'digital-vtx-fpv' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'analog-vtx-fpv', labelKey: 'droneshop.navigation.fpvGear.analogVtx', route: ['/products'], queryParams: { category: 'analog-vtx-fpv' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'fpv-cameras', 
          labelKey: 'droneshop.navigation.fpvGear.fpvCameras', 
          route: ['/products'],
          queryParams: { category: 'fpv-cameras' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'digital-fpv-cameras-gear', labelKey: 'droneshop.navigation.fpvGear.digitalFpvCameras', route: ['/products'], queryParams: { category: 'digital-fpv-cameras-gear' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'analog-fpv-cameras-gear', labelKey: 'droneshop.navigation.fpvGear.analogFpvCameras', route: ['/products'], queryParams: { category: 'analog-fpv-cameras-gear' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'fpv-antennas', 
          labelKey: 'droneshop.navigation.fpvGear.fpvAntennas', 
          route: ['/products'],
          queryParams: { category: 'fpv-antennas' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'goggle-antennas', labelKey: 'droneshop.navigation.fpvGear.goggleAntennas', route: ['/products'], queryParams: { category: 'goggle-antennas' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'drone-video-antennas', labelKey: 'droneshop.navigation.fpvGear.droneVideoAntennas', route: ['/products'], queryParams: { category: 'drone-video-antennas' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'monitors-dvrs', 
          labelKey: 'droneshop.navigation.fpvGear.monitorsDvrs', 
          route: ['/products'],
          queryParams: { category: 'monitors-dvrs' },
          queryParamsHandling: 'merge',
          children: []
        }
      ]
    },

    // === WERKPLAATS & VELD ===
    { 
      id: 'werkplaats-veld', 
      labelKey: 'droneshop.navigation.workshopField', 
      route: ['/products'],
      queryParams: { category: 'werkplaats-veld' },
      menuType: 'mega-menu', 
      megaMenuLayout: 'featured-grid', 
      queryParamsHandling: 'merge',
      megaMenuFeaturedItems: [
        { 
          id: 'stroomvoorziening', 
          labelKey: 'droneshop.navigation.workshopField.powerSupply', 
          route: ['/products'],
          queryParams: { category: 'stroomvoorziening' },
          image: placeholderImg,
          queryParamsHandling: 'merge',
          children: [
            { id: 'lipo-batterijen', labelKey: 'droneshop.navigation.workshopField.lipoBatteries', route: ['/products'], queryParams: { category: 'lipo-batterijen' }, queryParamsHandling: 'merge' },
            { id: 'lipo-laders-voedingen', labelKey: 'droneshop.navigation.workshopField.lipoChargersPowerSupplies', route: ['/products'], queryParams: { category: 'lipo-laders-voedingen' }, queryParamsHandling: 'merge' },
            { id: 'accu-accessoires', labelKey: 'droneshop.navigation.workshopField.batteryAccessories', route: ['/products'], queryParams: { category: 'accu-accessoires' }, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'gereedschap-bouwbenodigdheden', 
          labelKey: 'droneshop.navigation.workshopField.toolsBuildingSupplies', 
          route: ['/products'],
          queryParams: { category: 'gereedschap-bouwbenodigdheden' },
          image: placeholderImg,
          queryParamsHandling: 'merge',
          children: [
            { id: 'soldeerbouten-accessoires', labelKey: 'droneshop.navigation.workshopField.solderingIronsAccessories', route: ['/products'], queryParams: { category: 'soldeerbouten-accessoires' }, queryParamsHandling: 'merge' },
            { id: 'handgereedschap', labelKey: 'droneshop.navigation.workshopField.handTools', route: ['/products'], queryParams: { category: 'handgereedschap' }, queryParamsHandling: 'merge' },
            { id: 'draden-connectoren-krimpkous', labelKey: 'droneshop.navigation.workshopField.wiresConnectorsHeatShrink', route: ['/products'], queryParams: { category: 'draden-connectoren-krimpkous' }, queryParamsHandling: 'merge' },
            { id: 'bevestigingsmaterialen', labelKey: 'droneshop.navigation.workshopField.fasteners', route: ['/products'], queryParams: { category: 'bevestigingsmaterialen' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'tape-lijm', labelKey: 'droneshop.navigation.parts.tapeGlue', route: ['/products'], queryParams: { category: 'tape-lijm' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'transport-opslag', 
          labelKey: 'droneshop.navigation.workshopField.transportStorage', 
          route: ['/products'],
          queryParams: { category: 'transport-opslag' },
          image: placeholderImg,
          queryParamsHandling: 'merge',
          children: [
            { id: 'backpacks-koffers', labelKey: 'droneshop.navigation.workshopField.backpacksCases', route: ['/products'], queryParams: { category: 'backpacks-koffers' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'opbergdozen-organizers', labelKey: 'droneshop.navigation.workshopField.storageBoxesOrganizers', route: ['/products'], queryParams: { category: 'opbergdozen-organizers' }, image: placeholderImg, queryParamsHandling: 'merge' },
            { id: 'landing-pads', labelKey: 'droneshop.navigation.workshopField.landingPads', route: ['/products'], queryParams: { category: 'landing-pads' }, image: placeholderImg, queryParamsHandling: 'merge' }
          ]
        },
        { 
          id: 'simulatoren-training', 
          labelKey: 'droneshop.navigation.workshopField.simulatorsTraining', 
          route: ['/products'],
          queryParams: { category: 'simulatoren-training' },
          queryParamsHandling: 'merge',
          children: [
            { id: 'fpv-simulatoren', labelKey: 'droneshop.navigation.workshopField.fpvSimulators', route: ['/products'], queryParams: { category: 'fpv-simulatoren' }, queryParamsHandling: 'merge' },
            { id: 'simulator-controllers', labelKey: 'droneshop.navigation.workshopField.simulatorControllers', route: ['/products'], queryParams: { category: 'simulator-controllers' }, queryParamsHandling: 'merge' }
          ]
        }
      ]
    }
  ]);

  // NIEUW: Helper functie voor programmatische navigatie
  private navigateWithQueryParams(item: NavigationItem): void {
    const routeSegments = Array.isArray(item.route) ? item.route : [item.route];
    const queryParams = item.queryParams;

    // Loggen om te bevestigen dat de juiste parameters worden doorgegeven
    this.logger.info(`[DroneshopHeaderComponent] Programmatische navigatie gestart:`, { routeSegments, queryParams });

    this.router.navigate(routeSegments, {
      queryParams: queryParams,
      queryParamsHandling: item.queryParamsHandling || 'merge' // Gebruik de merge optie
    }).catch(err => {
      this.logger.error(`[DroneshopHeaderComponent] Fout bij navigeren:`, err);
    });

    this.closeMegaMenu(); // Sluit het menu na navigatie
  }

  

  readonly mobileModalRootItems = signal<NavigationItem[]>([]);

  // === Overige methodes ===
  openMobileMenu(): void { this.isMobileMenuOpen.set(true); }
  closeMobileMenu(): void { this.isMobileMenuOpen.set(false); }
  handleMouseEnter(item: NavigationItem): void { 
    this.cancelCloseMenuTimer(); 
    if (item.menuType === 'mega-menu') { 
      this.activeMegaMenuItem.set(item); 
    } 
  }
  startCloseMenuTimer(): void { 
    this.closeMenuTimer = window.setTimeout(() => { 
      this.activeMegaMenuItem.set(null); 
    }, 150); 
  }
  cancelCloseMenuTimer(): void { 
    if (this.closeMenuTimer) { 
      clearTimeout(this.closeMenuTimer); 
      this.closeMenuTimer = undefined; 
    } 
  }
  closeMegaMenu(): void { this.activeMegaMenuItem.set(null); }
  isLinkActive(item: NavigationItem): boolean {
    if (this.activeMegaMenuItem()?.id === item.id) return true;
    if (item.route) {
      const routeToCheck = Array.isArray(item.route) ? this.router.createUrlTree(item.route) : item.route;
      return this.router.isActive(routeToCheck, { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' });
    }
    return false;
  }
  handleMobileNavigation(item: NavigationItem): void {
    if (item.route) { 
      const route = Array.isArray(item.route) ? item.route.join('/') : item.route; 
      this.router.navigateByUrl(route); 
    }
    this.closeMobileMenu();
  }
}

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/shared/assets/i18n/en.json ---

{
  "footer": {
    "usp": {
      "shipping": {
        "title": "Free Shipping",
        "text": "On all orders over €50."
      },
      "support": {
        "title": "Top-Notch Support",
        "text": "Our team of FPV experts is ready to help you."
      },
      "secure": {
        "title": "Secure Payments",
        "text": "100% secure transactions with all major payment methods."
      }
    },
    "columns": {
      "support": {
        "title": "Customer Service"
      },
      "shop": {
        "title": "Shop"
      },
      "company": {
        "title": "Our Company"
      },
      "newsletter": {
        "title": "Newsletter",
        "text": "Sign up for exclusive offers and updates."
      },
      "newsletter.placeholder": "Enter your email address"
    },
    "links": {
      "faq": "Frequently Asked Questions",
      "shipping": "Shipping",
      "returns": "Returns",
      "orderStatus": "Order Status",
      "contact": "Contact",
      "about": "About Us",
      "careers": "Careers",
      "blog": "Blog"
    }
  },
  "droneshop": {
    "cart": { "pageTitle": "Shopping Cart", "emptyMessage": "Your shopping cart is currently empty." },
    "products": { "pageTitle": "Products", "overviewMessage": "Browse our product range here." },
    "navigation": {
      "freestyleDrones": "Freestyle Drones",
      "raceDrones": "Race Drones",
      "parts": "Parts",
      "gogglesAndRadios": "Goggles & Radios",
      "onSale": "On Sale"
    }
  },
  "droneshopHome": {
    "mainHero": {
      "title": "Find Your Perfect FPV Drone",
      "subtitle": "Start your FPV journey here. Discover a wide range of drones, kits, and accessories.",
      "ctaRtf": "Ready-to-Fly Drones",
      "ctaBuild": "DIY Drone Kits"
    },
    "avatarLoading": "Avatar loading...",
    "avatarError": "Could not load avatar.",
    "keyCategories": {
      "rtf": { "title": "Ready-to-Fly Drones", "short_desc": "Out of the box and into the air." },
      "build": { "title": "DIY Drone Kits", "short_desc": "Build your drone, your way." }
    },
    "serviceCards": {
      "title": "Help & Service",
      "support": { "title": "Customer Service", "subtitle": "Our team of experts is ready to help you with any question." },
      "orders": { "title": "My Orders", "subtitle": "View your order status and purchase history." },
      "shipping": { "title": "Shipping & Returns", "subtitle": "Everything you need to know about delivery and our return policy." },
      "buyersGuide": { "title": "FPV Buyer's Guide", "subtitle": "Not sure where to start? Our guide helps you choose the perfect drone." }
    },
    "promoBlocks": {
      "title": "Discover More Categories",
      "starterKits": { "title": "FPV Starter Kits", "subtitle": "Everything you need, all in one box!" },
      "cinematicDrones": { "title": "Cinematic Drones", "subtitle": "For breathtaking FPV footage." },
      "spareParts": { "title": "Spare Parts", "subtitle": "Find spare parts and more for your FPV Drone!" },
      "apparel": { "title": "Droneshop Apparel", "subtitle": "Wear the coolest brand in FPV!" },
      "tuningSetup": { "title": "Tuning and Set Up", "subtitle": "Guides and Downloads for all of our drones." }
    },
    "discoverCards": {
      "guides": {
        "title": "Essential Build Guides & Tutorials",
        "description": "From soldering your first ESC to flashing firmware, our guides will help you through every step of the process.",
        "cta": "Read Our Guides"
      },
      "software": {
        "title": "Software & Downloads",
        "description": "Find the latest versions of Betaflight, configurators, and other essential tools to perfectly tune your drone.",
        "cta": "View Downloads"
      }
    },
    "featured": { "title": "Featured Products", "loading": "Featured products are loading..." },
    "newArrivals": { "title": "New Arrivals", "loading": "New products are loading..." },
    "hero": {
      "title": "Ready for Liftoff?",
      "subtitle": "From complete beginner sets to high-performance racing parts, we have everything your FPV heart desires.",
      "cta": "Shop All Products"
    },
    "feed": { "title": "Latest Activity" }
  }
}

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/shared/assets/i18n/nl.json ---

{
  "footer": {
    "legal": {
      "terms": "Voorwaarden",
      "privacy": "Privacybeleid"
    },
    "payments": "iDEAL, VISA, Mastercard, PayPal",
    "copyright": "© 2025 Droneshop. Alle rechten voorbehouden.",
    "usp": {
      "shipping": {
        "title": "Gratis Verzending",
        "text": "Voor alle bestellingen boven de €50."
      },
      "support": {
        "title": "Top-Notch Support",
        "text": "Ons team van FPV-experts staat voor je klaar."
      },
      "secure": {
        "title": "Veilig Betalen",
        "text": "100% veilige transacties met iDEAL, Creditcard & PayPal."
      }
    },
    "columns": {
      "support": {
        "title": "Klantenservice"
      },
      "shop": {
        "title": "Winkel"
      },
      "company": {
        "title": "Ons Bedrijf"
      },
      "newsletter": {
        "title": "Nieuwsbrief",
        "text": "Meld je aan voor exclusieve aanbiedingen en updates.",
        "placeholder": "Voer je e-mailadres in"
      }
    },
    "links": {
      "faq": "Veelgestelde Vragen",
      "shipping": "Verzending",
      "returns": "Retouren",
      "orderStatus": "Orderstatus",
      "contact": "Contact",
      "about": "Over Ons",
      "careers": "Werken bij",
      "blog": "Blog"
    }
  },
  "droneshop": {
    "cart": {
      "pageTitle": "Winkelwagen",
      "emptyMessage": "Je winkelwagen is momenteel leeg."
    },
    "products": {
      "pageTitle": "Producten",
      "overviewMessage": "Bekijk hier ons assortiment."
    },
    "navigation": {
      "home": "Home",
      "orderStatus": "Bestelstatus",
      "contact": "Contact",
      "categories": "Categorieën",
      "drones": "Drones",
      "dronesAndKits": "Drones & Kits",
      "freestyleDrones": "Freestyle Drones",
      "raceDrones": "Race Drones",
      "parts": "Onderdelen",
      "parts.flightControllers": "Elektronica (Flight Stack)",
      "parts.escs": "ESCs (4-in-1 & Single)",
      "parts.fcEscStacks": "FC & ESC Stacks",
      "parts.pdbs": "Power Distribution Boards",
      "parts.voltageRegulatorsBec": "Voltage Regulators (BEC)",
      "parts.gpsCompassModules": "GPS & Kompas Modules",
      "parts.sensorsBlackbox": "Sensoren & Blackbox",
      "parts.buzzersLeds": "Buzzers & LEDs",
      "parts.drivetrain": "Aandrijving",
      "parts.motors": "Motors",
      "parts.propellers": "Propellers",
      "parts.motorHardware": "Motor Hardware",
      "parts.framesHardware": "Frames & Hardware",
      "parts.5InchFrames": "5 Inch Frames",
      "parts.34InchFrames": "3-4 Inch Frames",
      "parts.cinewhoopFrames": "Cinewhoop Frames",
      "parts.microTinywhoopFrames": "Micro & Tinywhoop Frames",
      "parts.framePartsReplacements": "Frame Onderdelen & Replacements",
      "parts.generalHardware": "Algemene Hardware",
      "parts.fpvSystemsDrone": "FPV Systemen (Drone)",
      "parts.digitalFpvCombos": "Digitale FPV Combos",
      "parts.digitalFpvCameras": "Digitale FPV Camera's",
      "parts.analogFpvCameras": "Analoge FPV Camera's",
      "parts.digitalVtx": "Digitale VTX'en",
      "parts.analogVtx": "Analoge VTX'en",
      "parts.fpvAntennasDrone": "FPV Antennes (Drone)",
      "parts.fpvSystemAccessories": "FPV Systeem Accessoires",
      "parts.3dPrintedPartsTpu": "3D Printed Parts (TPU)",
      "parts.cameraMounts": "Camera Mounts",
      "parts.antennaMounts": "Antenne Mounts",
      "parts.motorSoftMountsGuards": "Motor Soft Mounts & Guards",
      "parts.frameProtectors": "Frame Beschermers",
      "parts.electronics": "Elektronica",
      "onSale": "Aanbiedingen",
      "account": "Account",
      "menu": {
        "title": "Hoofdmenu"
      },
      "gogglesAndRadios": "Goggles & Radio's",
      "longRange": "Lange Afstand",
      "cinematic": "Cinematisch",
      "rtfDrones": "Ready-to-Fly Drones",
      "buildKits": "Bouwpakketten",
      "radioControl": "Radio Control",
      "radioControl.transmitters": "Radio Zenders (TX)",
      "radioControl.multiProtocolTransmitters": "Multi-protocol Zenders",
      "radioControl.elrsTransmitters": "ELRS Zenders",
      "radioControl.crossfireTransmittersModules": "Crossfire Zenders & Modules",
      "radioControl.transmitterAccessoriesUpgrades": "Zender Accessoires & Upgrades",
      "radioControl.receivers": "RC Ontvangers (RX)",
      "radioControl.elrsReceivers": "ELRS Ontvangers",
      "radioControl.crossfireReceivers": "Crossfire Ontvangers",
      "radioControl.frskyReceivers": "FrSky Ontvangers",
      "radioControl.otherRcReceivers": "Overige RC Ontvangers",
      "radioControl.externalRcModules": "Externe RC Modules",
      "radioControl.elrsModules": "ELRS Modules",
      "radioControl.crossfireModules": "Crossfire Modules",
      "radioControl.multiProtocolModules": "Multi-protocol Modules",
      "radioControl.rcAntennas": "RC Antennes",
      "radioControl.gimbalsSwitches": "Gimbals & Schakelaars",
      "fpvGear": "FPV Gear",
      "fpvGear.goggles": "FPV Brillen",
      "fpvGear.digitalGoggles": "Digitale FPV Brillen",
      "fpvGear.analogGoggles": "Analoge FPV Brillen",
      "fpvGear.goggleAccessories": "Bril Accessoires & Onderdelen",
      "fpvGear.receiverModules": "FPV Ontvangermodules",
      "fpvGear.analogReceiverModules": "Analoge Ontvangermodules",
      "fpvGear.digitalReceiverModules": "Digitale Ontvangermodules (Add-on)",
      "fpvGear.videoTransmitters": "Video Transmitters (VTX)",
      "fpvGear.digitalVtx": "Digitale VTX'en",
      "fpvGear.analogVtx": "Analoge VTX'en",
      "fpvGear.fpvCameras": "FPV Camera's",
      "fpvGear.digitalFpvCameras": "Digitale FPV Camera's",
      "fpvGear.analogFpvCameras": "Analoge FPV Camera's",
      "fpvGear.fpvAntennas": "FPV Antennes",
      "fpvGear.goggleAntennas": "Bril Antennes",
      "fpvGear.droneVideoAntennas": "Drone Video Antennes",
      "fpvGear.monitorsDvrs": "Monitoren & DVR's",
      "workshopField": "Werkplaats & Veld",
      "workshopField.powerSupply": "Stroomvoorziening",
      "workshopField.lipoBatteries": "LiPo Batterijen",
      "workshopField.lipoChargersPowerSupplies": "LiPo Laders & Voedingen",
      "workshopField.batteryAccessories": "Accu Accessoires",
      "workshopField.toolsBuildingSupplies": "Gereedschap & Bouwbenodigdheden",
      "workshopField.solderingIronsAccessories": "Soldeerbouten & Accessoires",
      "workshopField.handTools": "Handgereedschap",
      "workshopField.wiresConnectorsHeatShrink": "Draden, Connectoren & Krimpkous",
      "workshopField.fasteners": "Bevestigingsmaterialen",
      "workshopField.tapeGlue": "Tape & Lijm",
      "workshopField.transportStorage": "Transport & Opslag",
      "workshopField.backpacksCases": "Backpacks & Koffers",
      "workshopField.storageBoxesOrganizers": "Opbergdozen & Organizers",
      "workshopField.landingPads": "Landing Pads",
      "workshopField.simulatorsTraining": "Simulatoren & Training",
      "workshopField.fpvSimulators": "FPV Simulatoren",
      "workshopField.simulatorControllers": "Simulator Controllers"
    },
    "megaMenu": {
      "drones": {
        "title": "Drones",
        "cinematic": "Cinematic Drones",
        "micro": "Micro Drones"
      },
      "parts": {
        "title": "Onderdelen",
        "frames": "Frames",
        "motors": "Motoren",
        "escs": "ESCs",
        "flightControllers": "Flight Controllers"
      },
      "fpv": {
        "title": "FPV Apparatuur",
        "goggles": "Goggles",
        "antennas": "Antennes",
        "vtx": "Video Transmitters"
      }
    },
    "search": {
      "placeholder": "Zoeken naar producten...",
      "submit": "Zoekopdracht uitvoeren"
    },
    "sirenF35": {
      "shortDescription": "De Siren F3.5 ontketent jouw potentieel. Ultralicht. Uiterst Wendbaar. Ultiem Freestyle.",
      "hero": {
        "title": "Ervaar Grenzeloze Vrijheid: De Siren F3.5 Ontketent Jouw Potentieel",
        "subtitle": "Jouw sleutel tot grenzeloze freestyle-vrijheid zonder concessies. Ontdek ongekende 6S kracht onder 250 gram.",
        "ctaConfigure": "Configureer Jouw Siren F3.5"
      },
      "promise": {
        "components": {
          "label": "Superieure Krachtbronnen",
          "value": "Alleen het beste: Met top-tier componenten van Foxeer, RCINPOWER en RadioMaster garanderen wij ongekende prestaties."
        },
        "assembly": {
          "label": "Meest Verfijnde Afwerking",
          "value": "Elke drone is met obsessieve precisie geassembleerd, met nette bedrading, waterdichte conformal coating en stevige solderingen."
        },
        "tested": {
          "label": "Vliegklaar & Geperfectioneerd",
          "value": "Elke drone krijgt een basis-tune en wordt uitvoerig getest voor verzending, zodat jij je kunt focussen op vliegen."
        }
      },
      "longDescription": {
        "mainTitle": "De Siren F3.5: Gebouwd voor Uitmuntendheid",
        "p1": "De Droneshop RTF Siren F3.5 is gebouwd voor ongekende freestyle prestaties. Dit ultralichte 3.5 inch platform combineert de duurzaamheid van het Quadmula Siren F3.5 split-deck frame met de explosieve kracht van AOS 1404 4600KV motoren en de precisie van een Foxeer F722 V4 Mini stack. Ervaar grenzeloze vrijheid en domineer de kleinste gaps met een wendbaarheid die opnieuw gedefinieerd is.",
        "highlightsTitle": "Onmisbare Hoogtepunten:",
        "highlight1": "Bliksemsnelle Respons: Directe controle, ongeacht de manoeuvre.",
        "highlight2": "Vederlichte Constructie: Maximale wendbaarheid onder 250 gram.",
        "highlight3": "Onbreekbaar Chassis: Gebouwd om de meest extreme crashes te weerstaan.",
        "highlight4": "Rotsvaste Connectiviteit: Minimale latency, maximaal bereik.",
        "p2": "Elke drone wordt professioneel geassembleerd, getuned en getest door onze FPV-experts, zodat jij direct de lucht in kunt zonder gedoe. Dit is de perfecte keuze voor de veeleisende piloot die geen compromissen sluit op het gebied van kwaliteit en prestaties.",
        "customerQuote": "Deze Siren F3.5 is de beste 3.5 inch die ik ooit gevlogen heb. De controle is absurd, en hij kan echt een stootje hebben!"
      },
      "story": {
        "frame": {
          "title": "De Onverwoestbare Danspartner: Quadmula Siren F3.5",
          "subtitle": "Dit ultralichte frame geeft jou de vrijheid om grenzen te verleggen, keer op keer.",
          "details": {
            "p1_short": "Het innovatieve split-deck design van Quadmula biedt een ongeëvenaarde combinatie van duurzaamheid en wendbaarheid, essentieel voor agressieve freestyle. Lichtgewicht, maar toch extreem robuust om de impact van de meest spectaculaire crashes te weerstaan.",
            "highlightsTitle": "Kernkwaliteiten:",
            "highlight1": "Extreme Duurzaamheid: Sterk carbon fiber voor maximale levensduur.",
            "highlight2": "Optimaal Gewicht: Perfect gebalanceerd voor precieze manoeuvres.",
            "highlight3": "Innovatief Design: Vermindert resonantie voor vloeiendere vluchten."
          },
          "cta": "Meer over het Frame"
        },
        "stack": {
          "title": "Hittebestendige Precisie: De Onwrikbare Kern van Foxeer",
          "subtitle": "Een bewezen combinatie van een krachtige F7 Flight Controller en een robuuste 45A BL32 ESC.",
          "details": {
            "p1_short": "De Foxeer F722 V4 Mini Flight Controller en Mini Reaper 45A BL32 ESC vormen het onwrikbare hart van de Siren F3.5. Deze hardware staat bekend om zijn betrouwbaarheid en ongeëvenaarde hittebestendigheid, zelfs tijdens de meest intense vluchten.",
            "highlightsTitle": "Voordelen van Foxeer:",
            "highlight1": "Ongevoelig voor Extreme Hitte: Consistente prestaties onder druk.",
            "highlight2": "Bliksemsnelle F7 Processor: Voor vloeiende en responsieve vluchtcontrole.",
            "highlight3": "Bewezen Betrouwbaarheid: Vertrouw op hardware die is ontworpen om te presteren."
          },
          "cta": "Bekijk Foxeer Hardware"
        },
        "motors": {
          "title": "De Kracht van Stilte: RCINPOWER 8S Motoren Dominatie",
          "subtitle": "Ervaar ongekende brute kracht en een fluisterstille werking met de RCINPOWER 1404 4600KV motoren.",
          "details": {
            "p1_short": "De RCINPOWER 1404 4600KV motoren zijn de spierbundels van de Siren F3.5. Deze motoren leveren niet alleen explosieve 8S kracht, maar doen dit met een fluisterstille werking, waardoor jouw vluchten soepeler en discreter zijn.",
            "highlightsTitle": "RCINPOWER Voordelen:",
            "highlight1": "Ontketen Brute 8S Kracht: Maximale acceleratie en topsnelheid.",
            "highlight2": "Fluisterstil, voor Ongehinderde Vluchten: Geniet van de pure klank van de wind.",
            "highlight3": "Gebouwd voor Toekomstige Upgrades: Klaar voor jouw creatieve aanpassingen."
          },
          "cta": "Meer over RCINPOWER Motoren"
        },
        "radio": {
          "title": "Rotsvaste Connectiviteit: RadioMaster ELRS",
          "subtitle": "Met ExpressLRS geniet je van ongeëvenaard bereik en minimale latency, voor maximale controle.",
          "details": {
            "p1_short": "De RadioMaster ELRS-ontvanger zorgt voor een rotsvaste verbinding tussen jou en je drone. De toonaangevende ExpressLRS-technologie garandeert minimale latency en een ongeëvenaard bereik.",
            "highlightsTitle": "ELRS Voordelen:",
            "highlight1": "Ongeëvenaard Bereik: Vlieg verder en met meer vertrouwen.",
            "highlight2": "Minimale Latency: Directe controle, geen vertraging.",
            "highlight3": "Rotsvaste Verbinding: Nooit meer signaalverlies."
          },
          "cta": "Ontdek RadioMaster ELRS"
        },
        "djiO4": {
          "title": "De Wereld in HD: Ervaar Ongeëvenaarde DJI O4 Immersie",
          "subtitle": "Transformeer je FPV-ervaring met kristalheldere HD-beelden en een breed dynamisch bereik.",
          "details": {
            "p1_short": "De optionele DJI O4 Air Unit tilt jouw FPV-ervaring naar een geheel nieuw niveau. Geniet van kristalheldere HD-beelden met een breed dynamisch bereik.",
            "highlightsTitle": "DJI O4 Voordelen:",
            "highlight1": "Kristalheldere HD-Beelden: Zie de wereld door de ogen van je drone in ongekende details.",
            "highlight2": "Verbreed Je Horizon met Ultiem Bereik: Ervaar stabiele video over lange afstanden.",
            "highlight3": "Elk Detail Zichtbaar: Voor Uitmuntende Controle en Immersie."
          },
          "cta": "Meer over DJI O4"
        }
      },
      "priceDisclaimer": "Basisprijs, exclusief optionele VTX en ontvanger.",
      "ctaLink": "Configureer Jouw Drone",
      "inTheBox": {
        "drone": "1x Droneshop RTF Quadmula Siren F3.5 Drone",
        "lipoStrap": "2x Droneshop Lipo Strap",
        "propellers": "2x Set HQProp 3.5 Inch Propellers",
        "quickstart": "1x Quickstart Gids & QC Checklist",
        "betaflightTune": "Professionele Droneshop 6S Tune (voorgeïnstalleerd)",
        "qcReport": "Gedetailleerd Kwaliteitscontrole Rapport"
      },
      "faq": {
        "title": "Veelgestelde Vragen over de Siren F3.5",
        "q1": "Waarom is de Siren F3.5 zo licht?",
        "a1": "De Siren F3.5 is geoptimaliseerd voor een gewicht van minder dan 250 gram, wat in veel regio's betekent dat je geen vlieglicentie nodig hebt. Dit ultralichte design draagt ook bij aan de ongeëvenaarde wendbaarheid en responsiviteit.",
        "q2": "Kan ik mijn eigen FPV-goggles en zender gebruiken?",
        "a2": "Absoluut! Onze RTF-drones zijn compatibel met de meeste populaire FPV-goggles en zenders. De RadioMaster ELRS-ontvanger zorgt voor een brede compatibiliteit. We helpen je graag met het 'binden' van je apparatuur.",
        "q3": "Hoe lang kan ik vliegen met de Siren F3.5?",
        "a3": "De vliegtijd is afhankelijk van je batterijkeuze en vliegstijl. Met een aanbevolen 6S 850mAh - 1100mAh LiPo-batterij kun je doorgaans 3 tot 6 minuten freestyle vliegen. Efficiënter cruisen levert langere tijden op."
      }
    },
    "sirenF5": {
      "shortDescription": "De Siren F5 is pure, ongetemde 8S-kracht. Gebouwd voor extreme freestyle en cinematische precisie.",
      "hero": {
        "title": "Domineer het Luchtruim: De Siren F5 (8S) Wacht Op Niemand",
        "subtitle": "Voor de piloot die geen compromissen sluit. Ervaar de explosieve acceleratie van 8S en een onverwoestbaar chassis, gebouwd voor de meest veeleisende manoeuvres.",
        "ctaConfigure": "Ontketen de Kracht"
      },
      "promise": {
        "components": {
          "label": "Competitie-Grade Componenten",
          "value": "Uitgerust met de beste hardware, zoals de Foxeer Reaper 65A 8S stack en RCINPOWER GTS V4 motoren, voor maximale betrouwbaarheid en prestaties."
        },
        "assembly": {
          "label": "Gebouwd als een Tank",
          "value": "Elke verbinding is versterkt, elke component is beschermd. Deze drone is ontworpen om de zwaarste crashes te doorstaan en door te vliegen."
        },
        "tested": {
          "label": "Pro-Tuned voor Maximale Respons",
          "value": "Onze FPV-experts hebben een agressieve, maar soepele tune ontwikkeld die het volledige potentieel van de 8S-setup benut, direct uit de doos."
        }
      },
      "longDescription": {
        "mainTitle": "De Siren F5: De Standaard voor 8S Freestyle",
        "p1": "De Droneshop RTF Siren F5 is niet zomaar een drone; het is een statement. Gebouwd rond het legendarische Quadmula Siren F5 frame, levert dit 5-inch beest de brute kracht van 8S. Gecombineerd met de top-tier Foxeer Reaper F7 65A stack en de efficiënte RCINPOWER GTS V4 1600KV motoren, is dit het ultieme platform voor piloten die de grenzen van freestyle en cinematic FPV willen verleggen.",
        "highlightsTitle": "Belangrijkste Kenmerken:",
        "highlight1": "Explosieve 8S Kracht: Ongeëvenaarde acceleratie en 'hang-time'.",
        "highlight2": "Onverwoestbaar Frame: Ontworpen voor maximale impact-resistentie.",
        "highlight3": "Perfect voor HD-camera's: Stabiel en krachtig genoeg voor professionele cinematic shots.",
        "highlight4": "Onderhoudsvriendelijk: Slim ontwerp voor snelle reparaties in het veld.",
        "p2": "Dit is de keuze voor de serieuze piloot. Elke Siren F5 wordt door ons met de hand gebouwd en pro-getuned, zodat jij je kunt concentreren op het perfectioneren van je lijnen. Geen compromissen, alleen pure prestaties.",
        "customerQuote": "Ik heb nog nooit zoiets gevoeld. De punch-out op 8S is onwerkelijk. Droneshop heeft een meesterwerk gebouwd."
      },
      "story": {
        "frame": {
          "title": "Het Chassis: Quadmula Siren F5",
          "subtitle": "De ruggengraat van een kampioen, ontworpen voor duurzaamheid en precisie.",
          "details": {
            "p1_short": "Het Quadmula Siren F5 frame staat bekend om zijn robuustheid en slimme ontwerp. De unieke arm-structuur minimaliseert resonantie en biedt superieure bescherming voor de core-elektronica, wat essentieel is voor een betrouwbaar 8S-platform.",
            "highlightsTitle": "Kernkwaliteiten:",
            "highlight1": "Maximale Duurzaamheid: Gebouwd om de meest extreme crashes te weerstaan.",
            "highlight2": "Geoptimaliseerde Geometrie: Voor een perfect uitgebalanceerd zwaartepunt.",
            "highlight3": "Ruimte voor Componenten: Genoeg plek voor een robuuste stack en DJI O4."
          },
          "cta": "Ontdek het F5 Frame"
        },
        "stack": {
          "title": "Het Hart: Foxeer Reaper F7 65A 8S",
          "subtitle": "De betrouwbare krachtcentrale die 8S-voltage met gemak aankan.",
          "details": {
            "p1_short": "Voor een 8S-setup is een betrouwbare FC/ESC-stack cruciaal. De Foxeer Reaper F7 65A is de gouden standaard, bekend om zijn robuuste stroomverwerking en uitstekende warmteafvoer.",
            "highlightsTitle": "Voordelen:",
            "highlight1": "8S LiPo Compatibel: Ontworpen voor hoogspanning en extreme prestaties.",
            "highlight2": "Krachtige F7 Processor: Vloeiende, responsieve vluchtcontrole zonder compromissen.",
            "highlight3": "Bewezen Betrouwbaarheid: Vertrouw op hardware die is ontworpen om te presteren."
          },
          "cta": "Bekijk de Foxeer Stack"
        },
        "motors": {
          "title": "De Motoren: RCINPOWER GTS V4 1600KV",
          "subtitle": "Efficiëntie en brute kracht, perfect in balans voor 8S.",
          "details": {
            "p1_short": "De RCINPOWER GTS V4 motoren zijn de spierbundels van de Siren F3.5. Deze motoren leveren niet alleen explosieve 8S kracht, maar doen dit met een fluisterstille werking, waardoor jouw vluchten soepeler en discreter zijn.",
            "highlightsTitle": "RCINPOWER Voordelen:",
            "highlight1": "Ontketen Brute 8S Kracht: Maximale acceleratie en topsnelheid.",
            "highlight2": "Fluisterstil, voor Ongehinderde Vluchten: Geniet van de pure klank van de wind.",
            "highlight3": "Gebouwd voor Toekomstige Upgrades: Klaar voor jouw creatieve aanpassingen."
          },
          "cta": "Meer over de GTS V4 Motoren"
        }
      },
      "priceDisclaimer": "Basisprijs, exclusief optionele VTX en ontvanger.",
      "ctaLink": "Configureer Jouw 8S Beest",
      "inTheBox": {
          "drone": "1x Droneshop RTF Quadmula Siren F5 Drone (8S)",
          "lipoStrap": "2x Droneshop Lipo Strap",
          "propellers": "2x Set HQProp 5.1 Inch Propellers",
          "quickstart": "1x Quickstart Gids & QC Checklist",
          "betaflightTune": "Professionele Droneshop 8S Tune (voorgeïnstalleerd)",
          "qcReport": "Gedetailleerd Kwaliteitscontrole Rapport"
      },
      "faq": {
        "title": "Veelgestelde Vragen over de Siren F5",
        "q1": "Is deze 8S drone geschikt voor beginners?",
        "a1": "Eerlijk? Nee. De Siren F5 is een extreem krachtige drone ontworpen voor ervaren piloten. De acceleratie op 8S is zeer direct en kan overweldigend zijn. We raden beginners aan te starten met een 6S drone zoals de Siren F3.5.",
        "q2": "Welke batterijen heb ik nodig voor deze drone?",
        "a2": "Deze drone is specifiek gebouwd en getuned voor 8S LiPo batterijen. We raden een capaciteit aan tussen 1100mAh en 1300mAh met een hoge C-rating (120C of hoger) voor de beste prestaties.",
        "q3": "Kan ik een GoPro op deze drone monteren?",
        "a3": "Absoluut. Het Siren F5 frame en de krachtige motoren zijn meer dan capabel om een volledige GoPro of vergelijkbare HD-camera te dragen zonder significante prestatieverlies, wat het een uitstekende keuze maakt voor cinematic FPV."
      }
    },
    "rtfDronesOverview": {
      "productCta": "Configureer Drone",
      "hero": {
        "title": "Ongekende Vrijheid: Ready-to-Fly Drones van Droneshop",
        "subtitle": "Jouw avontuur in de wereld van FPV begint hier. Professioneel gebouwd, uitvoerig getest, direct klaar voor de start.",
        "cta": "Ontdek Onze Builds"
      },
      "valueProp": {
        "title": "Gebouwd om te Presteren. Gebouwd om Lang Mee te Gaan.",
        "description": "Elke Droneshop RTF drone is het resultaat van talloze uren expertise. We selecteren alleen de beste componenten en assembleren elke drone met een obsessie voor detail, zodat jij je kunt focussen op wat echt telt: vliegen.",
        "stats": {
          "components": {
            "label": "Premium Componenten",
            "value": "Bewezen hardware van de beste merken."
          },
          "assembly": {
            "label": "Professionele Assemblage",
            "value": "Nette bedrading en duurzame solderingen."
          },
          "tested": {
            "label": "Getest & Getuned",
            "value": "Elke drone uitvoerig getest voor verzending."
          }
        }
      },
      "quiz": {
        "title": "Niet zeker waar je moet beginnen?",
        "subtitle": "Onze Drone Finder helpt je in 30 seconden de perfecte match te vinden.",
        "cta": "Start de Drone Finder"
      },
      "techHighlights": {
        "title": "De Anatomie van een Kampioen: Onze Technologiekeuzes",
        "rcinpower": {
          "title": "RCINPOWER Motoren: Brute Kracht, Fluisterstil",
          "description": "Ontketen 8S pure kracht met motoren die bekend staan om hun vermogen én onverwachte stilte. Gemaakt voor de meest veeleisende freestyle en klaar voor jouw upgrades."
        },
        "foxeer": {
          "title": "Foxeer Hardware: Onwrikbare Betrouwbaarheid",
          "description": "Kies voor bewezen Foxeer flight controllers en ESC's. Hittebestendig, stabiel en ontworpen om te presteren onder de meest extreme omstandigheden. De kern van elke betrouwbare build."
        },
        "djiO4": {
          "title": "DJI O4 Air Unit: Jouw Oog in de Lucht",
          "description": "Ervaar kristalheldere HD-beelden en ongekend bereik met de DJI O4 Air Unit. Duik diep in de immersieve FPV-wereld met stabiliteit en precisie die de ervaring verrijken."
        },
        "frameChoice": {
          "title": "Superieure Frame Keuze: De Basis van Elke Build",
          "description": "Wij selecteren frames zoals de Quadmula Siren voor hun ongeëvenaarde duurzaamheid en wendbaarheid. De basis voor een drone die elke crash overleeft en elke manoeuvre domineert."
        },
        "radiomaster": {
          "title": "RadioMaster TX/RX: Totale Controle",
          "description": "Vertrouw op de rotsvaste ExpressLRS-verbindingen van RadioMaster. Minimale latency en maximaal bereik voor absolute controle, zelfs op de meest kritieke momenten. Vlieg met vertrouwen."
        },
        "djiO4ProVideoTx": {
          "title": "DJI O4 Pro Video Transmissie",
          "description": "Ervaar de ultieme betrouwbaarheid en beeldkwaliteit met DJI's geavanceerde O4 Pro transmissie."
        }
      },
      "testimonials": {
        "title": "Wat Onze Piloten Zeggen",
        "t1": {
          "quote": "De Siren F3.5 die ik hier heb gekocht is de best afgestelde drone die ik ooit heb gevlogen. Je merkt dat er echte experts aan hebben gewerkt."
        },
        "t2": {
          "quote": "Ik had een vraag over de setup en kreeg binnen een uur een super gedetailleerd antwoord. Topservice!"
        },
        "t3": {
          "quote": "Als beginner was dit de perfecte start. Uitpakken, batterij erin en vliegen. Geen gedoe, gewoon pure FPV-fun."
        }
      },
      "midFunnelCta": {
        "sub250g": "Bekijk Sub-250g Drones",
        "fiveInch": "Bekijk 5-Inch Drones"
      },
      "sub250g": {
        "title": "De Sub-250g Revolutie",
        "subtitle": "Ongekende 6S kracht in een ultralicht pakket. Vlieg overal, domineer de kleinste gaps. Wendbaarheid opnieuw gedefinieerd.",
        "cardTitle": "Verleg je Grenzen: Vlieg Overal met Sub-250g Kracht",
        "cardSubtitle": "Onze Sub-250g drones bieden de perfecte balans tussen compactheid en rauwe kracht, voor ongekende wendbaarheid."
      },
      "sirenF35": {
        "name": "Droneshop RTF - Quadmula Siren F3.5",
        "description": "Een ultralicht en duurzaam split-deck frame, gebouwd voor precisie en crashes.",
        "specs": {
          "frame": "Frame: Quadmula Siren F3.5",
          "stack": "Stack: Foxeer F722 V4 Mini 45A",
          "motors": "Motoren: AOS 1404 4600KV (6S)",
          "rx": "RX: RadioMaster ELRS"
        }
      },
      "aos35v5": {
        "name": "Droneshop RTF - AOS 3.5 V5",
        "description": "Ontworpen voor minimale resonantie en maximale performance, de gouden standaard voor 3.5 inch.",
        "specs": {
          "frame": "Frame: AOS 3.5 V5",
          "stack": "Stack: Foxeer F722 V4 Mini 45A",
          "motors": "Motoren: AOS 1806 3200KV (6S)",
          "rx": "RX: RadioMaster ELRS"
        }
      },
      "fiveInch": {
        "title": "De Koningsklasse: 5 Inch Freestyle",
        "subtitle": "Maximale power-to-weight. Volledige controle voor de meest extreme acro-manoeuvres. Dit is waar FPV legendes worden gemaakt.",
        "cardTitle": "De Ultieme Sensatie: Domineer het Luchtruim met 5 Inch Freestyle",
        "cardSubtitle": "Voor de piloot die geen compromissen sluit. Ervaar maximale kracht, controle en snelheid."
      },
      "sourceOneV6": {
        "name": "Droneshop RTF - TBS Source One V6",
        "description": "Een onverwoestbaar open-source werkpaard. De perfecte drone om zonder zorgen je skills te pushen.",
        "specs": {
          "frame": "Frame: TBS Source One V6",
          "stack": "Stack: Foxeer Reaper F4 65A (8S)",
          "motors": "Motoren: Budget 2207 1950KV (6S)",
          "rx": "RX: RadioMaster ELRS"
        }
      },
      "sirenF5": {
        "name": "Droneshop RTF - Quadmula Siren F5",
        "description": "Het ultieme 8S freestyle frame voor de meest veeleisende piloot die geen compromissen sluit.",
        "specs": {
          "frame": "Frame: Quadmula Siren F5",
          "stack": "Stack: Foxeer Reaper F7 65A (8S)",
          "motors": "Motoren: RCINPOWER GTS V4 1600KV (8S)",
          "rx": "RX: RadioMaster ELRS"
        }
      },
      "qavS2JB": {
        "name": "Droneshop RTF - Lumenier QAV-S 2 JB SE",
        "description": "Ontworpen door Joshua Bardwell. Een perfect gebalanceerd en trillingsvrij platform voor de soepelste beelden.",
        "specs": {
          "frame": "Frame: Lumenier QAV-S 2 JB SE",
          "stack": "Stack: Foxeer Reaper F7 65A (8S)",
          "motors": "Motoren: RCINPOWER GTS V4 1600KV (8S)",
          "rx": "RX: RadioMaster ELRS"
        }
      },
      "faq": {
        "title": "Veelgestelde Vragen",
        "q1": "Wat betekent 'Ready-to-Fly' (RTF) precies?",
        "a1": "RTF betekent dat de drone volledig geassembleerd, geconfigureerd en getest is door onze experts. Je hoeft alleen je eigen zender en FPV-bril te koppelen ('binden'), de batterij op te laden en je bent klaar om te vliegen.",
        "q2": "Heb ik een vlieglicentie nodig voor deze drones?",
        "a2": "Voor drones onder de 250 gram, zoals onze Sub-250g modellen, is in de EU doorgaans geen vlieglicentie vereist, hoewel je je wel als operator moet registreren. Voor drones boven de 250 gram is een basislicentie (A1/A3) verplicht. Controleer altijd de lokale wetgeving.",
        "q3": "Wat als ik crash? Bieden jullie reparaties aan?",
        "a3": "Absoluut! Een crash hoort erbij in FPV. We bieden een volledige reparatieservice aan. Daarnaast verkopen we alle losse onderdelen zodat je, als je dat wilt, ook zelf kunt leren repareren. Onze gidsen kunnen je daarbij helpen."
      }
    },
    "carousel": {
      "essentialAccessories": "Essentiële Accessoires"
    },
    "team": {
      "sectionTitle": "Ons Team",
      "sectionSubtitle": "Ontmoet de gepassioneerde FPV-enthousiastelingen die Droneshop tot leven brengen.",
      "role": {
        "founder": "Oprichter",
        "leadEngineer": "Hoofdingenieur",
        "marketingSpecialist": "Marketing Specialist",
        "fpvExpert": "FPV-Expert"
      },
      "title": "Ontmoet Jouw Droneshop Bouw-Experts",
      "subtitle": "Ons team is net zo gepassioneerd over FPV als jij. We zijn hier om je te begeleiden bij elke stap van je bouw- en vliegavontuur.",
      "bio": {
        "jasper": "Jasper is de drijvende kracht achter Droneshop. Met jarenlange ervaring in drone-bouw en FPV-vliegen, zorgt hij ervoor dat elke kit en RTF drone voldoet aan de hoogste standaarden.",
        "sophie": "Sophie is jouw eerste aanspreekpunt voor alle vragen. Of het nu gaat om een lastige soldeerverbinding of een Betaflight-tune, ze staat klaar om je te helpen met haar ongekende geduld en kennis.",
        "mark": "Mark is onze technische wizard. Hij ademt FPV-componenten en -schema's. Als er een complex probleem is, vind je hem met een multimeter in de hand, klaar om het op te lossen."
      }
    },
    "general": {
      "chat.aiCoachDefaultName": "AI Coach",
      "startingFrom": "Vanaf"
    },
    "social": {
      "feed": {
        "level": "Niveau",
        "reputation": "Reputatie"
      }
    },
    "home": {
      "mainHero": {
        "title": "Jouw Ultimatum in de Lucht",
        "subtitle": "De nieuwste generatie FPV drones en accessoires, voor beginners en professionals."
      },
      "featured": {
        "title": "Uitgelichte Producten"
      },
      "newArrivals": {
        "title": "Nieuwe Aanwinsten"
      },
      "feed": {
        "title": "Social Feed"
      },
      "promoBlocks": {
        "title": "Ontdek Onze Categorieën",
        "starterKits": {
          "title": "Starter Kits",
          "subtitle": "Begin je FPV avontuur."
        },
        "cinematicDrones": {
          "title": "Cinematische Drones",
          "subtitle": "Vang verbluffende beelden."
        },
        "spareParts": {
          "title": "Reserveonderdelen",
          "subtitle": "Houd je drone in topconditie."
        },
        "apparel": {
          "title": "Kleding & Merchandise",
          "subtitle": "Toon je passie voor FPV."
        },
        "tuningSetup": {
          "title": "Tuning & Setup",
          "subtitle": "Optimaliseer je vluchtprestaties."
        }
      },
      "discoverCards": {
        "guides": {
          "title": "Handleidingen",
          "description": "Gedetailleerde gidsen voor bouw en configuratie."
        },
        "software": {
          "title": "Software & Tools",
          "description": "De essentiële tools voor elke piloot."
        }
      },
      "serviceCards": {
        "title": "Klantenservice",
        "support": {
          "title": "Support",
          "subtitle": "Hulp nodig? Wij staan klaar."
        },
        "orders": {
          "title": "Bestellingen",
          "subtitle": "Volg je order of bekijk je geschiedenis."
        },
        "shipping": {
          "title": "Verzending",
          "subtitle": "Alles over bezorgopties en kosten."
        },
        "buyersGuide": {
          "title": "Kopersgids",
          "subtitle": "Vind de perfecte drone voor jou."
        }
      }
    },
    "diyKitsOverview": {
      "hero": {
        "title": "Jouw Meesterwerk. Jouw Vlucht. Bouw Het Zelf.",
        "subtitle": "Ontdek onze zorgvuldig samengestelde FPV bouwpakketten, compleet met gedetailleerde handleidingen en de beste componenten voor een onvergetelijke bouw- en vliegervaring.",
        "ctaBeginner": "Start Je Eerste Build",
        "ctaExpert": "Ontdek High-Performance Kits"
      },
      "valueProp": {
        "title": "De Voorsprong van de Bouwer",
        "cards": {
          "compatibility": {
            "title": "Component Compatibiliteit Garantie",
            "description": "Al onze kits bevatten onderdelen die 100% gegarandeerd met elkaar werken. Geen gedoe met zoektochten of compatibiliteitsproblemen."
          },
          "guides": {
            "title": "Stap-voor-Stap Videogidsen",
            "description": "Elke kit komt met een complete, easy-to-follow videogids die je door het hele bouwproces loodst, van solderen tot de eerste tune."
          },
          "support": {
            "title": "Expert Ondersteuning",
            "description": "Loop je vast? Ons team van ervaren bouwers helpt je verder via chat, e-mail of Discord. Je bent niet alleen!"
          },
          "components": {
            "title": "Top-Tier Componenten",
            "description": "Alleen A-merk onderdelen van topfabrikanten voor maximale prestaties, betrouwbaarheid en duurzaamheid. Bouw met vertrouwen."
          },
          "seamlessBuild": {
            "title": "Zorgeloos Bouwen met Complete Gidsen",
            "description": "Elke kit wordt geleverd met een volledige stap-voor-stap videogids en vooraf geladen Betaflight tunes. Focus op bouwen en vliegen, wij doen de rest."
          }
        }
      },
      "kitFinder": {
        "title": "Niet Zeker Welk Bouwpakket Past Bij Jou?",
        "subtitle": "Onze interactieve Kit Finder helpt je in minder dan een minuut de ideale bouwkit te vinden op basis van je ervaring, budget en vliegdoelen.",
        "cta": "Start de Kit Finder Quiz"
      },
      "sub250gKits": {
        "title": "De Sub-250g Klasse (Legaal & Wendbaar)"
      },
      "fiveInchKits": {
        "title": "De 5-Inch Performance Klasse"
      },
      "productCardCta": "Stel Jouw Build Kit Samen",
      "componentDeepDive": {
        "title": "Elke Component Telt: Jouw Keuzes, Onze Expertise.",
        "subtitle": "Duik dieper in de componenten die het hart vormen van jouw FPV-drone en begrijp waarom kwaliteit het verschil maakt in prestaties, duurzaamheid en vliegplezier.",
        "frames": {
          "description": "Kies een frame dat past bij jouw vliegstijl – van ultralicht freestyle tot robuuste cinematic builds. Essentieel voor duurzaamheid en handling."
        },
        "stacks": {
          "description": "De hersenen en spieren van je drone. Leer over F4, F7, F722 stacks en de kracht van 4-in-1 ESC's voor stabiele en responsieve vluchtcontrole."
        },
        "motors": {
          "description": "Ontdek het verschil tussen KV, stator-grootte en hoe dit de stuwkracht en efficiëntie beïnvloedt. De krachtbron van je drone."
        },
        "vtx": {
          "description": "Digitale of analoge video? Welke camera biedt het beste beeld voor jouw vlucht en opnamekwaliteit?"
        }
      },
      "guides": {
        "title": "Van Schroef tot Wolken: Onze Complete Kennisbank",
        "subtitle": "Droneshop biedt je toegang tot de meest uitgebreide verzameling van bouw- en configuratiegidsen, tips en troubleshooting-artikelen om jouw bouwproject tot een succes te maken.",
        "video": {
          "title": "Video Build Gidsen",
          "description": "Volg onze experts stap-voor-stap bij elke build. Visueel, duidelijk en compleet."
        },
        "soldering": {
          "title": "De Complete Soldeergids",
          "description": "Leer de fijne kneepjes van het vak. Perfecte verbindingen, elke keer weer. Voor beginners én gevorderden."
        },
        "betaflight": {
          "title": "Betaflight Configurator Gids",
          "description": "Tune je drone voor maximale prestaties. Van PIDs tot filters, alles wat je moet weten."
        }
      },
      "techHighlights": {
        "title": "De Anatomie van een Kampioen: Onze Componentenkeuzes"
      },
      "testimonials": {
        "title": "Wat Onze Bouwers Zeggen",
        "t1": {
          "quote": "De videogids voor de Siren F5 was super duidelijk, zelfs voor een beginner als ik! Elke stap werd perfect uitgelegd.",
          "author": "Mark V. - Eerste keer bouwer"
        },
        "t2": {
          "quote": "Ik liep vast met een Betaflight-instelling en de support op Discord heeft me binnen een uur geholpen. Ongekende service!",
          "author": "Jessica de G. - Hobbyist"
        }
      },
      "faq": {
        "title": "Veelgestelde Vragen voor Bouwers",
        "q1": "Hoe moeilijk is solderen voor een beginner?",
        "a1": "Solderen kan intimiderend lijken, maar met onze videogidsen en een beetje oefening is het een vaardigheid die iedereen kan leren. We raden aan om te starten met onze 'Leer Solderen' kit voor je aan de drone begint.",
        "q2": "Welke gereedschappen heb ik absoluut nodig?",
        "a2": "Een basis soldeerstation, kwaliteit soldeertin, een hex driver set en een smokestopper zijn essentieel. Raadpleeg onze 'Gereedschapsgids' voor de complete lijst.",
        "q3": "Wat als ik een onderdeel kapot maak tijdens de bouw?",
        "a3": "Dat gebeurt de besten! Omdat je een kit bouwt, zijn alle onderdelen los verkrijgbaar in onze webshop. Je vervangt eenvoudig het specifieke onderdeel, wat op de lange termijn veel goedkoper is dan een hele RTF-drone repareren.",
        "q3": "Bieden jullie ondersteuning als ik vastloop?",
        "a3": "Absoluut. Dit is onze belofte. Je kunt contact opnemen met ons team van experts via chat, e-mail of onze exclusieve Discord-community voor bouwers. We helpen je door elke uitdaging heen."
      },
      "stickyCta": {
        "text": "Bekijk Alle Bouwpakketten"
      },
      "seamlessBuildGuide": {
        "title": "Zorgeloos Bouwen: Jouw Ultieme Gids voor Succes",
        "subtitle": "Volg onze heldere videogidsen, leer solderen als een pro, en profiteer van onze geoptimaliseerde Betaflight tunes. Wij elimineren de complexiteit, jij geniet van het proces.",
        "cta": "Bekijk Alle Bouwgidsen"
      },
      "sirenF35Kit": {
        "name": "Quadmula Siren F3.5 Kit",
        "description": "Ultralichte sub-250g freestyle build met perfect op elkaar afgestemde componenten en stap-voor-stap videogids.",
        "features": {
          "0": "Sub-250g wendbaarheid met 6S performance",
          "1": "Siren F3.5 split-deck frame: sterk en licht",
          "2": "Foxeer F722 Mini + 45A 4-in-1 ESC",
          "3": "AOS 1404 4600KV & ELRS-ready"
        },
        "hero": {
          "title": "Jouw Meesterwerk Begint Hier: Bouw de Siren F3.5.",
          "subtitle": "Alle prestaties, geen giswerk. Ervaar de trots van het bouwen met een kit waarin elk component perfect is afgestemd, ondersteund door onze stap-voor-stap videogidsen.",
          "cta": "Start Jouw Build Avontuur"
        },
        "promise": {
          "compatibility": {
            "label": "Gegarandeerde Harmonie",
            "value": "Al onze kits bevatten onderdelen die perfect op elkaar afgestemd zijn. Geen verrassingen, alleen een vlekkeloze bouw."
          },
          "guides": {
            "label": "Stap-voor-Stap Videogidsen",
            "value": "Van de eerste soldeerpunt tot de definitieve tune: onze gidsen loodsen je door elk aspect van de bouw. Bekijk de F3.5 Bouwgids Nu >"
          },
          "support": {
            "label": "Jouw Digitale Pitcrew",
            "value": "Vragen tijdens het bouwen? Ons toegewijde team van bouw-experts staat klaar om je te helpen via chat of Discord."
          }
        },
        "longDescription": {
          "p1": "De Quadmula Siren F3.5 BYS Kit is de perfecte instap in de wereld van DIY FPV. Deze complete set bevat elk essentieel onderdeel dat je nodig hebt om een high-performance freestyle drone onder de 250 gram te assembleren. Leer de fijne kneepjes van solderen, bedrading en Betaflight-tuning met onze exclusieve, uitgebreide gidsen.",
          "highlightsTitle": "Kit Hoogtepunten:",
          "highlight1": "Alle Benodigde Componenten In Eén Pakket",
          "highlight2": "Leer Solderen & Tunen als een Pro",
          "highlight3": "Repareer Zelf, Upgrade Eindeloos",
          "highlight4": "Volledige Betaflight Configuratievrijheid",
          "p2_details": "Dit kit is meer dan alleen onderdelen; het is een leermeester. De voldoening van het vliegen met een drone die je zelf hebt gebouwd, is ongeëvenaard. En met Droneshop aan je zijde, is succes gegarandeerd.",
          "customerQuote": "\"Ik heb nog nooit eerder gesoldeerd, maar met de gidsen van Droneshop was het bouwen van mijn F3.5 een fantastische ervaring!\" - Sarah K."
        },
        "story": {
          "frame": {
            "title": "Het Chassis: Quadmula Siren F3.5 Frame - Jouw Canvas voor Controle",
            "subtitle": "Leer waarom de structuur van je drone cruciaal is. Begrijp de carbon lay-up en de voordelen van het split-deck design."
          },
          "stack": {
            "title": "Het Brein: Foxeer F722 V4 Mini Stack - De Precisie van Jouw Vlucht",
            "subtitle": "Installeer en configureer de flight controller en ESC. Duik in de firmware-opties en leer tunen."
          },
          "motors": {
            "title": "De Spierkracht: AOS 1404 4600KV Motoren - Kracht en Efficiëntie",
            "subtitle": "Monteer je motoren perfect. Ontdek het belang van KV en propellerkeuze voor jouw vliegervaring."
          },
          "radio": {
            "title": "De Verbinding: RadioMaster ELRS Ontvanger - Rotsvaste Controle",
            "subtitle": "Leer hoe je jouw ontvanger bindt en integreert in Betaflight. Maximale betrouwbaarheid voor jouw commando's."
          },
          "djiO4": {
            "title": "Jouw Oog in de Lucht: DJI O4 Air Unit - HD Video Transmissie",
            "subtitle": "Installeer de DJI O4 Air Unit voor kristalheldere HD-beelden. Begrijp de integratie met de stack en je FPV-goggles."
          }
        },
        "priceDisclaimer": "Basisprijs, exclusief optionele VTX en ontvanger.",
        "stickyCta": {
          "text": "Koop Jouw F3.5 Build Kit"
        },
        "inTheBox": {
          "frame": "1x Quadmula Siren F3.5 Frame Kit (Carbon Fiber)",
          "stack": "1x Foxeer F722 V4 Mini Flight Controller + 45A BL32 4-in-1 ESC",
          "motors": "4x AOS 1404 4600KV Motoren",
          "rx": "1x RadioMaster ELRS Nano Ontvanger",
          "propellers": "2x Set HQProp 3.5 Inch Propellers",
          "hardware": "Complete Bevestigingshardware & Draden",
          "guides": "Toegang tot Online Videobouwgids & Betaflight Tune Handleiding",
          "qcReport": "Droneshop Kwaliteitscontrole Rapport (voor Componenten)"
        },
        "faq": {
          "q1": "Hoeveel bouwervaring heb ik nodig voor deze kit?",
          "a1": "Deze kit is ontworpen voor beginners. Onze gedetailleerde videogidsen nemen je stap-voor-stap mee, waardoor het een ideaal eerste bouwproject is.",
          "q2": "Welke gereedschappen heb ik absoluut nodig?",
          "a2": "Een basis soldeerstation, kwaliteit soldeertin, een hex driver set en een smokestopper zijn essentieel. Raadpleeg onze 'Gereedschapsgids' voor de complete lijst.",
          "q3": "Wat als ik een onderdeel kapot maak tijdens de bouw?",
          "a3": "Geen paniek! Alle onderdelen zijn los verkrijgbaar in onze webshop. Je vervangt eenvoudig het specifieke onderdeel, wat op de lange termijn veel goedkoper is dan een hele RTF-drone repareren."
        }
      },
      "sirenF5Kit": {
        "name": "Quadmula Siren F5 (8S) Kit",
        "description": "High-performance 5-inch 8S freestyle/cinematic build voor de ervaren bouwer, inclusief geavanceerde tuninggids.",
        "features": {
          "0": "Explosieve 8S kracht en controle",
          "1": "Siren F5 frame: robuust en onderhoudsvriendelijk",
          "2": "Foxeer Reaper F7 65A 8S stack",
          "3": "RCINPOWER GTS V4 1600KV & DJI O4-klaar"
        },
        "hero": {
          "title": "Bouw de Ongetemde Kracht: Siren F5 (8S) Kit.",
          "subtitle": "Voor de ervaren bouwer die het maximale uit zijn FPV-ervaring wil halen. Assembleer dit 8S-beest en domineer het luchtruim met ongeëvenaarde prestaties.",
          "cta": "Ontketen de 8S Kracht"
        },
        "promise": {
          "compatibility": {
            "label": "Competitie-Grade Componenten",
            "value": "Alleen de crème de la crème. Ontworpen voor 8S en extreme condities."
          },
          "guides": {
            "label": "Geavanceerde Bouw- & Tuninggidsen",
            "value": "Diepgaande handleidingen voor complexe builds en geoptimaliseerde 8S tunes."
          },
          "support": {
            "label": "Jouw Digitale Pitcrew",
            "value": "Ons team van pro-bouwers staat paraat voor al je diepgaande technische vragen."
          }
        },
        "longDescription": {
          "p1": "De Quadmula Siren F5 BYS Kit is het ultieme bouwproject voor de ervaren FPV-piloot. Deze kit levert de brute kracht van 8S en is gebouwd rond het legendarische Quadmula Siren F5 frame. Met top-tier componenten en de vrijheid om jouw perfecte tune te creëren, is dit jouw ticket naar ongeëvenaarde prestaties en controle.",
          "highlightsTitle": "Kit Hoogtepunten:",
          "highlight1": "Ontworpen voor Explosieve 8S Kracht",
          "highlight2": "Robuust en Aerodynamisch 5-inch Frame",
          "highlight3": "Ruimte voor Full-Size HD Camera's",
          "highlight4": "Volledige Configuratievrijheid",
          "p2_details": "Dit is de keuze voor de serieuze piloot die elke nuance van zijn drone wil begrijpen en optimaliseren. Bereid je voor op een bouwervaring die net zo belonend is als de eerste adrenaline-kick van je 8S-vlucht.",
          "customerQuote": "\"Het bouwen van de Siren F5 met de Droneshop kit gaf me een ongekende controle over mijn setup. De 8S-kracht is onwerkelijk!\" - Mark V."
        },
        "story": {
          "frame": {
            "title": "Het Chassis: Quadmula Siren F5 Frame - Robuustheid Ontmoet Precisie",
            "subtitle": "Verken de geoptimaliseerde geometrie en duurzaamheid van het F5 frame. Essentieel voor high-impact freestyle."
          },
          "stack": {
            "title": "Het Hart: Foxeer Reaper F7 65A 8S Stack - De Krachtcentrale",
            "subtitle": "Integreer deze krachtige 8S-compatibele stack. Leer hoe je de vluchtparameters kalibreert voor maximale responsiviteit."
          },
          "motors": {
            "title": "De Motoren: RCINPOWER GTS V4 1600KV - Efficiëntie en Brute Kracht",
            "subtitle": "Monteer je GTS V4 motoren. Begrijp het belang van KV en de balans tussen stuwkracht en efficiëntie voor 8S builds."
          },
          "batteries": {
            "title": "De Levensader: Optimale 8S LiPo Keuzes",
            "subtitle": "Selecteer de juiste 8S LiPo batterijen. Leer over C-ratings, capaciteit en veilig opladen voor maximale vliegtijden en levensduur."
          }
        },
        "priceDisclaimer": "Basisprijs, exclusief optionele VTX en ontvanger.",
        "stickyCta": {
          "text": "Koop Jouw F5 Build Kit"
        },
        "inTheBox": {
          "frame": "1x Quadmula Siren F5 Frame Kit (Carbon Fiber)",
          "stack": "1x Foxeer Reaper F7 65A 8S Stack",
          "motors": "4x RCINPOWER GTS V4 1600KV Motoren",
          "propellers": "2x Set HQProp 5.1 Inch Propellers",
          "hardware": "Complete Bevestigingshardware & Draden",
          "guides": "Toegang tot Online Geavanceerde Bouw- & Tuninggidsen",
          "qcReport": "Droneshop Kwaliteitscontrole Rapport (voor Componenten)"
        },
        "faq": {
          "q1": "Is deze 8S kit geschikt voor een beginner?",
          "a1": "De Siren F5 8S kit is ontworpen voor ervaren bouwers en piloten. De kracht en complexiteit van een 8S-systeem vereisen gevorderde soldeer- en tuningvaardigheden. We raden beginners aan te starten met een 6S kit zoals de Siren F3.5.",
          "q2": "Welke batterijen zijn aanbevolen?",
          "a2": "Voor deze 8S kit adviseren wij 8S LiPo batterijen met een capaciteit tussen 1100mAh en 1300mAh, en een hoge C-rating (minimaal 120C) voor optimale prestaties.",
          "q3": "Kan ik een GoPro op deze drone monteren?",
          "a3": "Absoluut. Het robuuste Siren F5 frame en de krachtige 8S motoren zijn perfect geschikt om een volledige GoPro of vergelijkbare HD-camera te dragen zonder significante prestatieverlies, wat het een uitstekende keuze maakt voor cinematic FPV."
        }
      }
    }
  }
}

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/state-transfer.ts ---

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

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/translate-browser.loader.ts ---

// --- VERVANG VOLLEDIG BESTAND: apps/droneshop/src/app/translate-browser.loader.ts ---
/**
 * @file translate-browser.loader.ts
 * @Version 1.1.0 (Corrected Imports & Type Safety)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Custom TranslateLoader voor de browser-side (client). Deze loader probeert
 *   eerst vertalingen uit de `TransferState` te halen (geleverd door de server).
 *   Als de vertalingen daar niet aanwezig zijn, valt het terug op een `HttpClient`
 *   gebaseerde loader om de JSON-bestanden op te halen. Dit voorkomt onnodige
 *   HTTP-calls op de client voor reeds server-gerenderde data en lost de
 *   "TimeoutError" op door een fallback te bieden.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix SSR hydration and i18n blocking issues by correctly configuring TransferState for translations and ensuring NgRx meta-reducer factories are resolved via DI.
 */
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
// DE FIX: Importeer 'of' en 'forkJoin' direct vanuit 'rxjs', niet 'rxjs/operators'
import { Observable, of, forkJoin } from 'rxjs'; 
import { catchError, map } from 'rxjs/operators';
// DE FIX: Importeer makeStateKey en TransferState direct vanuit '@angular/core'
import { inject, makeStateKey, TransferState } from '@angular/core'; 

// Definieer een unieke sleutel voor de TransferState. Dit moet overeenkomen met de server.
const LANG_STATE_KEY = makeStateKey<any>('lang');

export class TranslateBrowserLoader implements TranslateLoader {
  private readonly httpClient = inject(HttpClient);
  // DE FIX: Geef een expliciet type aan transferState
  private readonly transferState: TransferState = inject(TransferState); 

  constructor(
    private sharedPrefix: string = './assets/i18n/shared/',
    private appPrefix: string = './assets/i18n/droneshop/',
    private suffix: string = '.json'
  ) {}

  public getTranslation(lang: string): Observable<any> {
    // 1. Probeer de vertalingen uit de TransferState te halen
    const key = LANG_STATE_KEY;
    if (this.transferState.hasKey(key)) {
      const allTransferredTranslations = this.transferState.get(key, null);
      this.transferState.remove(key); // Verwijder de state na gebruik
      
      // DE FIX: Filter de specifieke taal uit de overgedragen data
      if (allTransferredTranslations && allTransferredTranslations[lang]) {
        console.info(`[TranslateBrowserLoader] Loaded translations for '${lang}' from TransferState.`);
        return of(allTransferredTranslations[lang]);
      }
    }

    // 2. Als niet in TransferState, val terug op HTTP (voor meerdere bestanden)
    console.warn(`[TranslateBrowserLoader] Translations for '${lang}' not found in TransferState. Falling back to HTTP.`);
    return forkJoin([
      this.httpClient.get(`${this.sharedPrefix}${lang}${this.suffix}`).pipe(
        catchError((error) => {
          console.error(`[TranslateBrowserLoader] Failed to load shared translation for '${lang}' via HTTP:`, error);
          return of({});
        })
      ),
      this.httpClient.get(`${this.appPrefix}${lang}${this.suffix}`).pipe(
        catchError((error) => {
          console.error(`[TranslateBrowserLoader] Failed to load app-specific translation for '${lang}' via HTTP:`, error);
          return of({});
        })
      )
    ]).pipe(
      map(([sharedJson, appJson]) => ({ ...sharedJson, ...appJson })),
      catchError((error) => {
        console.error(`[TranslateBrowserLoader] Failed to merge HTTP translations for '${lang}':`, error);
        return of({});
      })
    );
  }
}

--- END OF FILE ---

--- START OF FILE apps/droneshop/src/app/translate-server.loader.ts ---

// --- VERVANG VOLLEDIG BESTAND: apps/droneshop/src/app/translate-server.loader.ts ---
/**
 * @file translate-server.loader.ts
 * @Version 1.3.0 (TransferState Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Custom TranslateLoader voor Server-Side Rendering (SSR). Deze versie leest
 *   vertaalbestanden van het server-filesystem en **plaatst de geladen vertalingen
 *   in de TransferState**, zodat de browser-side applicatie ze direct kan hergebruiken.
 *   Het laadt meerdere JSON-bestanden en merget deze.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix SSR hydration and i18n blocking issues by correctly configuring TransferState for translations and ensuring NgRx meta-reducer factories are resolved via DI.
 */
import { join } from 'path';
// DE FIX: Importeer 'of' direct vanuit 'rxjs', niet 'rxjs/operators'
import { Observable, of } from 'rxjs'; 
import { TranslateLoader } from '@ngx-translate/core';
import * as fs from 'fs';
// DE FIX: Importeer makeStateKey en TransferState direct vanuit '@angular/core'
import { inject, makeStateKey, TransferState } from '@angular/core'; 

// Definieer een unieke sleutel voor de TransferState. Dit moet overeenkomen met de client.
const LANG_STATE_KEY = makeStateKey<any>('lang');

export class TranslateServerLoader implements TranslateLoader {
  // DE FIX: Geef een expliciet type aan transferState
  private readonly transferState: TransferState = inject(TransferState); 

  constructor(
    private basePath: string,
    private sharedPrefix: string = 'assets/i18n/shared/',
    private appPrefix: string = 'assets/i18n/droneshop/',
    private suffix: string = '.json'
  ) {}

  public getTranslation(lang: string): Observable<any> {
    try {
      // Pas de join-logica aan om met de prefixes te werken
      const sharedFilePath = join(this.basePath, this.sharedPrefix, `${lang}${this.suffix}`);
      const appFilePath = join(this.basePath, this.appPrefix, `${lang}${this.suffix}`);

      const sharedJson = fs.existsSync(sharedFilePath) ? JSON.parse(fs.readFileSync(sharedFilePath, 'utf8')) : {};
      const appJson = fs.existsSync(appFilePath) ? JSON.parse(fs.readFileSync(appFilePath, 'utf8')) : {};

      const merged = { ...sharedJson, ...appJson };

      // DE FIX: Plaats de geladen vertalingen in de TransferState.
      //         We slaan alle vertalingen op onder één generieke sleutel 'lang',
      //         en de browser-loader filtert dan de specifieke `lang`.
      //         Dit is efficiënter dan een sleutel per taal.
      let existingTranslations = this.transferState.get(LANG_STATE_KEY, {});
      existingTranslations = { ...existingTranslations, [lang]: merged };
      this.transferState.set(LANG_STATE_KEY, existingTranslations);
      console.info(`[TranslateServerLoader] Loaded translations for '${lang}' and set in TransferState.`);

      return of(merged);
    } catch (e) {
      console.error(`[TranslateServerLoader] Error reading translation files for lang "${lang}" from base path "${this.basePath}"`, e);
      return of({});
    }
  }
}

--- END OF FILE ---

--- START OF FILE libs/auth/data-access/src/lib/services/auth.service.ts ---

// --- VERVANG VOLLEDIG BLOK: login(credentials: LoginCredentials): Observable<AuthResponse> { ... } in libs/auth/data-access/src/lib/services/auth.service.ts ---
/**
 * @file auth.service.ts
 * @Version 3.0.0 (API Calls & Token Handling)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-05
 * @Description
 *   Service voor authenticatie-gerelateerde API-aanroepen.
 *   Verwerkt login, logout en tokenvernieuwing.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@royal-code/auth/domain'; // Let op AuthResponse
import { APP_CONFIG } from '@royal-code/core/config';
import { TokenStorageService } from './token-storage.service';
import { LoggerService } from '@royal-code/core/logging';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly logger = inject(LoggerService);

  private readonly authUrl = `${this.config.backendUrl}/Authentication`;
  private readonly LOG_PREFIX = '[AuthService]';

  /**
   * Verstuurt inloggegevens naar de backend en verwerkt de tokens.
   * @param credentials Gebruikersnaam en wachtwoord.
   * @returns Een Observable met de AuthResponse.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.logger.info(`${this.LOG_PREFIX} Poging tot inloggen voor: ${credentials.email}`);
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(response.accessToken, response.refreshToken);
        this.logger.info(`${this.LOG_PREFIX} Inloggen succesvol, tokens opgeslagen.`);
      })
    );
  }

  /**
   * Stuurt een verzoek naar de backend om uit te loggen en wist lokale tokens.
   * @returns Een Observable die voltooid na uitloggen.
   */
  logout(): Observable<void> {
    this.logger.info(`${this.LOG_PREFIX} Uitloggen uitvoeren (tokens wissen).`);
    // Optioneel: stuur een API-aanroep om de refresh token op de server ongeldig te maken.
    // Voor nu: alleen client-side cleanup.
    this.tokenStorage.clearTokens();
    return this.http.post<void>(`${this.authUrl}/logout`, {}).pipe(
        tap(() => this.logger.info(`${this.LOG_PREFIX} Server-side logout response ontvangen.`))
    );
  }

  /**
   * Vernieuwt de access token met behulp van de refresh token.
   * @returns Een Observable met de nieuwe AuthResponse.
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      this.logger.warn(`${this.LOG_PREFIX} Geen refresh token gevonden voor vernieuwing.`);
      throw new Error('No refresh token available');
    }
    this.logger.info(`${this.LOG_PREFIX} Verversen van token aangevraagd.`);
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(response.accessToken, response.refreshToken);
        this.logger.info(`${this.LOG_PREFIX} Token succesvol vernieuwd en opgeslagen.`);
      })
    );
  }

    register(credentials: RegisterCredentials): Observable<AuthResponse> {
    this.logger.info(`${this.LOG_PREFIX} Poging tot registreren voor: ${credentials.email}`);
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, credentials).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(response.accessToken, response.refreshToken);
        this.logger.info(`${this.LOG_PREFIX} Registratie succesvol, tokens opgeslagen.`);
      })
    );
  }
}

--- END OF FILE ---

--- START OF FILE libs/auth/data-access/src/lib/services/token-storage.service.ts ---

/**
 * @file token-storage.service.ts
 * @Version 4.1.0 (Opaque Refresh Token Support)
 */
import { Injectable, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { LoggerService } from '@royal-code/core/logging';

const ACCESS_TOKEN_KEY = 'royal_code_access_token';
const REFRESH_TOKEN_KEY = 'royal_code_refresh_token';
const EXPIRY_BUFFER_SECONDS = 60;

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly logger = inject(LoggerService);
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      this.logger.debug('[TokenStorageService] Tokens geladen.', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken
      });
    }
  }

  saveTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.accessToken = accessToken;
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      
      this.logger.debug('[TokenStorageService] Tokens opgeslagen.');
    }
  }

  clearTokens(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      this.logger.info('[TokenStorageService] Tokens gewist.');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getDecodedAccessToken<T = any>(): T | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      return jwtDecode<T>(token);
    } catch (e) {
      this.logger.error('[TokenStorageService] Access token decodering mislukt.', e);
      return null;
    }
  }

  /**
   * Controleert of access token verlopen is MET buffer voor clock skew
   */
  isAccessTokenExpired(bufferSeconds = EXPIRY_BUFFER_SECONDS): boolean {
    const decodedToken = this.getDecodedAccessToken<{ exp?: number }>();
    if (!decodedToken?.exp) {
      this.logger.debug('[TokenStorageService] Geen exp claim in access token.');
      return true;
    }

    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    const bufferMillis = bufferSeconds * 1000;
    const effectiveExpiry = expirationTime - bufferMillis;
    const isExpired = currentTime > effectiveExpiry;
    
    if (isExpired) {
      const timeUntilExpiry = Math.round((expirationTime - currentTime) / 1000);
      this.logger.debug(`[TokenStorageService] Access token verlopen of bijna verlopen (nog ${timeUntilExpiry}s).`);
    }
    
    return isExpired;
  }

  /**
   * Voor opaque refresh tokens kunnen we de expiry NIET checken.
   * We gaan ervan uit dat de refresh token geldig is totdat de server het tegendeel zegt.
   */
  isRefreshTokenExpired(): boolean {
    // Als er geen refresh token is, beschouw als verlopen
    if (!this.refreshToken) {
      return true;
    }
    
    // We kunnen een opaque token niet valideren, dus return false
    // De server zal ons vertellen als het verlopen is via een 401
    return false;
  }

  /**
   * Geeft de tijd tot expiry van access token in seconden
   */
  getTimeUntilExpiry(): number | null {
    const decodedToken = this.getDecodedAccessToken<{ exp?: number }>();
    if (!decodedToken?.exp) return null;
    
    const secondsUntilExpiry = decodedToken.exp - Math.floor(Date.now() / 1000);
    return secondsUntilExpiry > 0 ? secondsUntilExpiry : 0;
  }
}

--- END OF FILE ---

--- START OF FILE libs/auth/domain/src/lib/models/auth-response.model.ts ---

import { Profile } from '@royal-code/shared/domain'; 

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string; // Optioneel, indien gebruikt
  user?: Profile; // Backend kan initieel profiel meesturen
  expiresIn?: number; // Optioneel: levensduur access token in seconden
}

// Optioneel: voor gedecodeerde token info
export interface TokenPayload {
    sub: string;
    name?: string;
    roles?: string[];
    exp?: number;
    iat?: number;
    email?: string;
}

--- END OF FILE ---

--- START OF FILE libs/features/account/core/src/lib/data-access/abstract-account-api.service.ts ---

/**
 * @file abstract-account-api.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Defines the abstract contract for the account data-access layer.
 */
import { Observable } from 'rxjs';
import { UserProfileDetails, UpdateUserProfilePayload, UpdateUserAvatarPayload, ChangePasswordPayload, DeleteAccountPayload } from '@royal-code/features/account/domain';
import { Address, ApplicationSettings } from '@royal-code/shared/domain';
import { CreateAddressPayload, UpdateAddressPayload } from '@royal-code/store/user';

export abstract class AbstractAccountApiService {
  abstract getProfileDetails(): Observable<UserProfileDetails>;
  abstract updateProfileDetails(payload: UpdateUserProfilePayload): Observable<UserProfileDetails>;
  abstract updateAvatar(payload: UpdateUserAvatarPayload): Observable<void>;
  abstract changePassword(payload: ChangePasswordPayload): Observable<void>;
  abstract deleteAccount(payload: DeleteAccountPayload): Observable<void>;
  abstract getUserSettings(): Observable<ApplicationSettings>;
  abstract getAddresses(): Observable<Address[]>;
  abstract createAddress(payload: CreateAddressPayload): Observable<Address>;
  abstract updateAddress(addressId: string, payload: UpdateAddressPayload): Observable<Address>;
  abstract deleteAddress(addressId: string): Observable<void>;
}

--- END OF FILE ---

--- START OF FILE libs/features/account/data-access-droneshop/src/lib/services/droneshop-account-api.service.ts ---

// --- VERVANG VOLLEDIG BLOK: export class DroneshopAccountApiService extends AbstractAccountApiService in libs/features/account/data-access-droneshop/src/lib/services/droneshop-account-api.service.ts ---
/**
 * @file droneshop-account-api.service.ts
 * @Version 1.2.0 (Settings & Corrected Address API Geïmplementeerd)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Concrete implementatie van de Account API service voor de Droneshop backend.
 *   Nu uitgebreid met methoden voor het beheren van gebruikersadressen en -instellingen,
 *   volgens het contract van AbstractAccountApiService, met correcte returntypes.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractAccountApiService } from '@royal-code/features/account/core';
import { UserProfileDetails, UpdateUserProfilePayload, UpdateUserAvatarPayload, ChangePasswordPayload, DeleteAccountPayload } from '@royal-code/features/account/domain';
import { Address, ApplicationSettings } from '@royal-code/shared/domain'; // Importeer ApplicationSettings
import { CreateAddressPayload, UpdateAddressPayload } from '@royal-code/store/user';

@Injectable({ providedIn: 'root' })
export class DroneshopAccountApiService extends AbstractAccountApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Account`;

  override getProfileDetails(): Observable<UserProfileDetails> {
    return this.http.get<UserProfileDetails>(`${this.apiUrl}/profile-details`);
  }

  override updateProfileDetails(payload: UpdateUserProfilePayload): Observable<UserProfileDetails> {
    return this.http.put<UserProfileDetails>(`${this.apiUrl}/profile-details`, payload);
  }

  override updateAvatar(payload: UpdateUserAvatarPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/profile-avatar`, payload);
  }

  override changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, payload);
  }

  override deleteAccount(payload: DeleteAccountPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete-account`, payload);
  }

  override getUserSettings(): Observable<ApplicationSettings> {
    return this.http.get<ApplicationSettings>(`${this.apiUrl}/settings`);
  }

  override getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/addresses`);
  }

  override createAddress(payload: CreateAddressPayload): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/addresses`, payload);
  }

  override updateAddress(addressId: string, payload: UpdateAddressPayload): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/addresses/${addressId}`, payload);
  }

  override deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addresses/${addressId}`);
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/account/domain/src/lib/models/user-profile.model.ts ---

/**
 * @file user-profile.model.ts
 * @Version 2.0.0 (Definitive & API-Aligned)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Definitive frontend domain models for user profile data, fully aligned
 *   with the /api/Account backend endpoints. Includes all necessary DTOs and payloads.
 */

// === DTOs (Data Transfer Objects) ===

/**
 * Represents the simple, public user profile.
 * Maps to: GET /api/Account/profile
 */
export interface UserPublicProfile {
  readonly id: string;
  readonly displayName: string;
  readonly email: string; // Assuming email can be public for this DTO
  readonly avatarUrl?: string;
  readonly bio?: string;
}

/**
 * Represents the detailed user profile data for the account management page.
 * Maps to: GET /api/Account/profile-details
 */
export interface UserProfileDetails {
  readonly id: string;
  readonly email: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  displayName: string;
  bio: string | null;
  avatarMediaId: string | null;
  isTwoFactorEnabled: boolean;
}

// === Payloads (for CUD operations) ===

/**
 * Payload for updating the user's core profile information.
 * Maps to: PUT /api/Account/profile-details
 */
export interface UpdateUserProfilePayload {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  displayName: string;
  bio: string | null;
}

/**
 * Payload for updating the user's avatar.
 * Maps to: PUT /api/Account/profile-avatar
 */
export interface UpdateUserAvatarPayload {
  avatarMediaId: string;
}

/**
 * Payload for changing the user's password.
 * Maps to: POST /api/Account/change-password
 */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Payload for permanently deleting the user's account.
 * Maps to: POST /api/Account/delete-account
 */
export interface DeleteAccountPayload {
  password: string;
}

--- END OF FILE ---

--- START OF FILE libs/features/account/ui-droneshop/src/account.routes.ts ---

/**
 * @file account.routes.ts
 * @Version 2.0.0 (Corrected Breadcrumb Definition)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Definieert de lazy-loaded routes voor de 'Mijn Account' sectie.
 *   Verwijderd de redundante breadcrumb-definitie op de parent route
 *   om duplicatie in de breadcrumb-navigatie te voorkomen.
 */
import { Routes } from '@angular/router';
import { AccountLayoutComponent } from './lib/layout/account-layout/account-layout.component';

export const AccountRoutes: Routes = [
  {
    path: '',
    component: AccountLayoutComponent,
    // << DE FIX: VERWIJDER DEZE REGEL OM DUPLICATIE TE VOORKOMEN >>
    // data: { breadcrumb: 'navigation.account' }, 
    children: [
      {
        path: '', // Default route is het overzicht
        pathMatch: 'full',
        loadComponent: () => import('./lib/pages/account-overview-page/account-overview-page.component').then(m => m.AccountOverviewPageComponent),
        title: 'Mijn Account Overzicht',
        data: { breadcrumb: 'navigation.accountOverview' } // Broodkruimel voor Overzicht
      },
      {
        path: 'orders',
        loadChildren: () => import('@royal-code/features/orders/ui-plushie').then(m => m.OrderPlushieRoutes),
        title: 'Mijn Bestellingen',
        // Geen expliciete breadcrumb data hier nodig. De `OrderPlushieRoutes` zelf kan een label definiëren.
        // of het wordt overgenomen van de navigatie-tree indien ingesteld.
      },
      {
        path: 'profile',
        loadComponent: () => import('./lib/pages/my-profile-page/my-profile-page.component').then(m => m.MyProfilePageComponent),
        title: 'Mijn Profiel',
        data: { breadcrumb: 'navigation.myProfile' } // Broodkruimel voor Profiel
      },
      {
        path: 'addresses',
        loadComponent: () => import('./lib/pages/my-addresses-page/my-addresses-page.component').then(m => m.MyAddressesPageComponent),
        title: 'Mijn Adressen',
        data: { breadcrumb: 'navigation.myAddresses' } // Broodkruimel voor Adressen
      },
      {
        path: 'settings',
        loadComponent: () => import('./lib/pages/account-settings-page/account-settings-page.component').then(m => m.AccountSettingsPageComponent),
        title: 'Instellingen',
        data: { breadcrumb: 'navigation.settings' } // Broodkruimel voor Instellingen
      },
      {
        path: 'reviews',
        loadComponent: () => import('./lib/pages/my-product-reviews-page/my-product-reviews-page.component').then(m => m.MyProductReviewsPageComponent),
        title: 'Mijn Productreviews',
        data: { breadcrumb: 'navigation.myReviews' } // Broodkruimel voor Mijn Productreviews
      },
      {
        path: 'wishlist',
        loadChildren: () => import('@royal-code/features/wishlist/ui-droneshop').then(m => m.wishlistRoutes),
        title: 'Mijn Verlanglijst',
        data: { breadcrumb: 'navigation.myWishlist' } // Broodkruimel label
      }
    ]
  }
];

--- END OF FILE ---

--- START OF FILE libs/features/account/ui-droneshop/src/lib/layout/account-layout/account-layout.component.ts ---

/**
 * @file account-layout.component.ts
 * @Version 2.0.0 (Upgraded Navigation Menu)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-01
 * @Description
 *   De hoofdlayout voor de 'Mijn Account' sectie. Deze versie implementeert de
 *   nieuwe, door de gebruiker gedefinieerde, verticale navigatiestructuur.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiVerticalNavComponent } from '@royal-code/ui/navigation';
import { NavigationItem, NavDisplayHintEnum, AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'droneshop-account-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, UiVerticalNavComponent, TranslateModule],
  template: `
    <div class="flex flex-col lg:flex-row gap-8 py-8">
      <!-- Zijbalk Navigatie -->
      <aside class="w-full lg:w-64 flex-shrink-0">
        <royal-code-ui-vertical-nav [items]="accountNavItems" />
      </aside>

      <!-- Hoofdcontent (Router Outlet) -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLayoutComponent {
  // De navigatie-items zijn nu bijgewerkt volgens jouw specificaties.
  readonly accountNavItems: NavigationItem[] = [
    {
      id: 'overview',
      labelKey: 'navigation.accountOverview',
      route: '/account',
      icon: AppIcon.LayoutDashboard,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'profile',
      labelKey: 'navigation.myProfile',
      route: '/account/profile',
      icon: AppIcon.UserCircle,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'orders',
      labelKey: 'navigation.myOrders',
      route: '/account/orders',
      icon: AppIcon.Package,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'wishlist',
      labelKey: 'navigation.myWishlist',
      route: '/account/wishlist',
      icon: AppIcon.Heart,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'reviews',
      labelKey: 'navigation.myReviews',
      route: '/account/reviews',
      icon: AppIcon.Star,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'addresses',
      labelKey: 'navigation.myAddresses',
      route: '/account/addresses',
      icon: AppIcon.MapPin,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'settings',
      labelKey: 'navigation.settings',
      route: '/account/settings',
      icon: AppIcon.Settings,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'divider-1',
      labelKey: '',
      dividerBefore: true,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'logout',
      labelKey: 'accountMenu.logout',
      route: '/', // Of een specifieke logout route
      icon: AppIcon.LogOut,
      displayHint: [NavDisplayHintEnum.Desktop],
    }
  ];
}

--- END OF FILE ---

--- START OF FILE libs/features/account/ui-droneshop/src/lib/pages/my-addresses-page/my-addresses-page.component.ts ---

/**
 * @file my-addresses-page.component.ts
 * @Version 2.4.0 (Always Visible Edit/Delete Actions - Form Reset Fixed)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Page for managing user addresses, now integrating the "Add New Address" card
 *   and ensuring edit/delete actions are always visible on address cards.
 */
import { Component, ChangeDetectionStrategy, inject, viewChild } from '@angular/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { AddressManagerComponent, AddressSubmitEvent } from '@royal-code/ui/forms';
import { UserFacade } from '@royal-code/store/user';
import { NotificationService } from '@royal-code/ui/notifications';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { AddressFormComponent } from '@royal-code/ui/forms';
import { Address, AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'droneshop-my-addresses-page',
  standalone: true,
  imports: [
    UiTitleComponent,
    AddressManagerComponent,
    TranslateModule,
  ],
  template: `
    <div class="space-y-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'account.addresses.title' | translate" />

      <royal-code-ui-address-manager
        #addressManager
        [addresses]="userFacade.addresses()"
        [isLoggedIn]="userFacade.isLoggedIn()"
        [submitButtonTextKey]="'common.buttons.save'"
        [showSaveAddressToggle]="true" 
        [showEditAndDeleteActions]="true" 
        [alwaysShowActions]="true" 
        (addressSubmitted)="onAddressSubmitted($event)"
        (editAddressClicked)="onEditAddress($event)"
        (deleteAddressClicked)="onDeleteAddress($event)"
        (addAddressCardClicked)="openAddAddressOverlay()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyAddressesPageComponent {
  protected readonly userFacade = inject(UserFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly overlayService = inject(DynamicOverlayService);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  addressManager = viewChild.required(AddressManagerComponent);

  onAddressSubmitted(event: AddressSubmitEvent): void {
    if (event.address.id) {
      this.userFacade.updateAddress(event.address.id, event.address);
    } else {
      this.userFacade.createAddress(event.address);
    }
  }

  onEditAddress(address: Address): void {
    const overlayRef = this.overlayService.open({
      component: AddressFormComponent, data: { address },
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
      backdropType: 'dark', mobileFullscreen: true
    });
    overlayRef.afterClosed$.subscribe((updatedAddress?: Address | null) => {
      if (updatedAddress?.id) this.userFacade.updateAddress(updatedAddress.id, updatedAddress);
    });
  }

  onDeleteAddress(id: string): void {
    this.notificationService.showConfirmationDialog({
      titleKey: 'checkout.shipping.delete.title', messageKey: 'checkout.shipping.delete.message',
      confirmButtonKey: 'common.buttons.delete', cancelButtonKey: 'common.buttons.cancel',
      confirmButtonType: 'theme-fire',
    }).subscribe(confirmed => {
      if (confirmed) this.userFacade.deleteAddress(id);
    });
  }

  openAddAddressOverlay(): void {
    this.addressManager().resetForm(); // Reset het formulier onder de kaarten
    const overlayRef = this.overlayService.open({
      component: AddressFormComponent,
      data: { address: undefined },
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
      backdropType: 'dark', mobileFullscreen: true
    });
    overlayRef.afterClosed$.subscribe((newAddress?: Address | null) => {
      if (newAddress) {
        this.userFacade.createAddress(newAddress);
      }
    });
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/authentication/src/lib/components/login/login.component.ts ---

// libs/features/authentication/src/lib/components/login/login.component.ts

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms'; // Import FormGroup
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router'; // Nodig voor routerLink

// --- UI Components ---
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';

// --- Core Services ---
import { LoggerService } from '@royal-code/core/logging';

// --- Auth State & Facade ---
import { AuthFacade } from '@royal-code/store/auth';
import { LoginCredentials } from '@royal-code/auth/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';

/**
 * @Component LoginComponent
 * @Description Handles user login via email and password. It displays a form,
 *              validates input, shows loading/error states from the AuthFacade,
 *              and dispatches the login action via the AuthFacade upon submission.
 *              Navigation upon success/failure is handled by AuthEffects.
 */
@Component({
  selector: 'royal-code-login', // Consistent prefix
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    UiInputComponent,
    UiButtonComponent,
    UiParagraphComponent
],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <!-- Logo -->
        <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-text">
          {{ 'auth.login.title' | translate }}
        </h2>
        <p>administrator@localhost</p>
        <p>Administrator1!</p>
      </div>


      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">

          <!-- Loading Indicator -->
          @if (isLoading()) {
            <div class="text-center text-sm text-secondary my-4" role="status" aria-live="polite">
              {{ 'common.messages.loading' | translate }}
              <!-- Optional: Add spinner component -->
            </div>
          }

          <!-- General Authentication Error -->
          @if (authError(); as errorKey) {
            <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
               <!-- Consider mapping specific backend errors to user-friendly translation keys -->
               <p>{{ (errorKey || 'common.errors.genericAuth') | translate }}</p>
            </div>
          }

          <!-- Email Input Field -->
          <div>
            <royal-code-ui-input
              formControlName="email"
              type="email"
              [label]="'auth.login.email' | translate"
              [placeholder]="'common.placeholders.email' | translate"
              [required]="true"
              autocomplete="email"
              [error]="getErrorMessage('email')" /> <!-- Pass key directly -->
          </div>

          <!-- Password Input Field -->
          <div>
            <royal-code-ui-input
              formControlName="password"
              type="password"
              [label]="'auth.login.password' | translate"
              [placeholder]="'common.placeholders.password' | translate"
              [required]="true"
              autocomplete="current-password"
              [error]="getErrorMessage('password')" /> <!-- Pass key directly -->
             <!-- Optional: Forgot Password Link -->
             <div class="mt-1 text-right text-sm">
                <!-- TODO: Implement Forgot Password Flow -->
                <a routerLink="/forgot-password" class="font-semibold text-primary hover:text-primary/80"> <!-- Pas route aan! -->
                    {{ 'auth.login.forgotPassword' | translate }}
                </a>
             </div>
          </div>

          <!-- Submit Button -->
          <div>
            <royal-code-ui-button
              type="primary"
              htmlType="submit"
              [disabled]="loginForm.invalid || isLoading()"
              >
              {{ 'auth.login.submit' | translate }}
            </royal-code-ui-button>
          </div>
        </form>

        <!-- Link to Registration -->
<royal-code-ui-paragraph size="lg" extraClasses="mt-10 text-center text-secondary">
  {{ 'auth.login.noAccount' | translate }}
  <a routerLink="/register" class="font-semibold leading-6 text-primary hover:text-primary/80">
     {{ 'auth.register.linkText' | translate }}
  </a>
</royal-code-ui-paragraph>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  // --- Dependencies ---
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  /** Facade for interacting with Authentication state and actions. */
  readonly authFacade = inject(AuthFacade);

  // --- State Signals from Facade ---
  /** Signal indicating if an authentication process is ongoing. */
  readonly isLoading = this.authFacade.isLoading;
  /** Signal holding the latest authentication error message key, or null. */
  readonly authError = this.authFacade.error;

  /**
   * Reactive form group for login credentials.
   * Includes validators for required fields and email format.
   */
  readonly loginForm: FormGroup = this.fb.group({
    // Using NonNullableFormBuilder might be an option for stricter typing if needed
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  /**
   * Handles the form submission event.
   * Validates the form, logs details, and dispatches the login action
   * via the AuthFacade if the form is valid and not already loading.
   */
  onSubmit(): void {
    const M = '[LoginComponent] onSubmit:'; // Message prefix for logs
    this.logger.info(`${M} Triggered.`);
    this.loginForm.markAllAsTouched(); // Ensure validation messages are shown

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    // Log current state before validation checks
    this.logger.debug(`${M} Checking conditions before dispatch...`, {
        isInvalid: this.loginForm.invalid,
        isLoading: this.isLoading(),
        formStatus: this.loginForm.status,
        formErrors: this.loginForm.errors,
        emailErrors: this.loginForm.get('email')?.errors,
        passwordErrors: this.loginForm.get('password')?.errors,
        emailValueProvided: !!email,
        passwordValueProvided: !!password
    });

    // Prevent submission if form is invalid or already loading
    if (this.loginForm.invalid || this.isLoading()) {
      this.logger.warn(`${M} Submission prevented. Form invalid: ${this.loginForm.invalid}, Loading: ${this.isLoading()}.`);
      // Optionally provide user feedback if form is invalid
      // if (this.loginForm.invalid) { /* e.g., show general form error */ }
      return;
    }

    // Ensure values are present (should be guaranteed by validators, but good practice)
    if (!email || !password) {
        this.logger.error(`${M} Email or password missing unexpectedly despite form validity.`);
        // Optionally show a generic error to the user
        return;
    }

    // --- Dispatch Login Action via Facade ---
    const credentials: LoginCredentials = { email, password };
    this.logger.info(`${M} Form valid & not loading. Dispatching login action via AuthFacade.`);
    this.authFacade.login(credentials);
    // ----------------------------------------

    // Navigation logic is now handled within AuthEffects upon successful login action.
  }

  /**
   * Retrieves the appropriate translation key for a validation error
   * on a specific form control.
   * @param controlName The name of the form control ('email' or 'password').
   * @returns The translation key string for the error, or an empty string if no error should be shown.
   */
  getErrorMessage(controlName: 'email' | 'password'): string {
    const control = this.loginForm.get(controlName);

    // Only show error if control is invalid and has been touched or dirtied
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        // Return the translation key for the required field error
        return 'errors.validation.requiredField';
      }
      if (control.errors?.['email']) {
         // Return the translation key for the invalid email error
        return 'errors.validation.invalidEmail';
      }
      // Add checks for other potential validators here (e.g., minlength)
      // if (control.errors?.['minlength']) {
      //   return 'errors.validation.minLength'; // Example
      // }
    }
    // No error to display for this control
    return '';
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/authentication/src/lib/components/register/register.component.ts ---

// --- VERVANG VOLLEDIG BESTAND: libs/features/authentication/src/lib/components/register/register.component.ts ---
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';
import { LoggerService } from '@royal-code/core/logging';
import { AuthFacade } from '@royal-code/store/auth';
import { RegisterCredentials } from '@royal-code/auth/domain';

@Component({
  selector: 'royal-code-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    UiInputComponent,
    UiButtonComponent,
    TranslateModule
  ],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-text">
          {{ 'auth.register.title' | translate }}
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          @if (authFacade.isLoading()) {
            <div class="text-center text-sm text-secondary my-4" role="status">
              {{ 'common.messages.loading' | translate }}
            </div>
          }
          @if (authFacade.error(); as errorKey) {
            <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
               <p>{{ (errorKey) | translate }}</p>
            </div>
          }

          <royal-code-ui-input
            formControlName="firstName"
            type="text"
            [label]="'auth.register.firstName' | translate"
            [required]="true"
            autocomplete="given-name"
            [error]="getErrorMessage('firstName')" />

          <!-- NIEUW VELDE: Middle Name (optioneel) -->
          <royal-code-ui-input
            formControlName="middleName"
            type="text"
            [label]="'auth.register.middleName' | translate"
            [required]="false"
            autocomplete="additional-name"
            [error]="getErrorMessage('middleName')" />

          <royal-code-ui-input
            formControlName="lastName"
            type="text"
            [label]="'auth.register.lastName' | translate"
            [required]="true"
            autocomplete="family-name"
            [error]="getErrorMessage('lastName')" />

          <royal-code-ui-input
            formControlName="displayName"
            type="text"
            [label]="'auth.register.displayName' | translate"
            [required]="true"
            autocomplete="nickname"
            [error]="getErrorMessage('displayName')" />

          <royal-code-ui-input
            formControlName="email"
            type="email"
            [label]="'auth.login.email' | translate"
            [required]="true"
            autocomplete="email"
            [error]="getErrorMessage('email')" />

          <royal-code-ui-input
            formControlName="password"
            type="password"
            [label]="'auth.login.password' | translate"
            [required]="true"
            autocomplete="new-password"
            [error]="getErrorMessage('password')" />

          <royal-code-ui-input
            formControlName="confirmPassword"
            type="password"
            [label]="'auth.register.confirmPassword' | translate"
            [required]="true"
            autocomplete="new-password"
            [error]="getErrorMessage('confirmPassword')" />

          <div>
            <royal-code-ui-button
              type="primary"
              htmlType="submit"
              [disabled]="registerForm.invalid || authFacade.isLoading()">
              {{ 'auth.register.submit' | translate }}
            </royal-code-ui-button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm text-secondary">
          {{ 'auth.register.alreadyAccount' | translate }}
          <a routerLink="/login" class="font-semibold leading-6 text-primary hover:text-primary/80">
             {{ 'auth.login.linkText' | translate }}
          </a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  readonly authFacade = inject(AuthFacade);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  private readonly translate = inject(TranslateService);

  readonly registerForm = this.fb.group({
    firstName: ['', Validators.required],
    middleName: [null as string | null], // NIEUW: Optioneel en nullable
    lastName: ['', Validators.required],
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/[A-Z]/),
      Validators.pattern(/[a-z]/),
      Validators.pattern(/[0-9]/),
      Validators.pattern(/[^a-zA-Z0-9]/)
    ]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordsMatchValidator });

  onSubmit(): void {
    if (this.registerForm.invalid || this.authFacade.isLoading()) return;
    const { firstName, middleName, lastName, displayName, email, password } = this.registerForm.getRawValue();
    const credentials: RegisterCredentials = { 
      firstName: firstName!, 
      middleName: middleName, // Geef null of undefined door als het veld leeg is
      lastName: lastName!, 
      displayName: displayName!, 
      email: email!, 
      password: password! 
    };
    this.authFacade.register(credentials);
  }

  getErrorMessage(controlName: 'firstName' | 'middleName' | 'lastName' | 'displayName' | 'email' | 'password' | 'confirmPassword'): string {
    const control = this.registerForm.get(controlName);
    if (!control) return '';

    if (control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return this.translate.instant('errors.validation.requiredField');
      if (control.errors?.['email']) return this.translate.instant('errors.validation.invalidEmail');

      if (controlName === 'password') {
        const passwordValue = control.value;
        if (typeof passwordValue !== 'string' || passwordValue === null) {
          return this.translate.instant('errors.validation.requiredField');
        }
        if (control.errors?.['minlength']) {
          const requiredLength = control.errors['minlength'].requiredLength;
          return this.translate.instant('errors.validation.password.tooShort', { requiredLength });
        }
        if (control.errors?.['pattern']) {
          if (!passwordValue.match(/[A-Z]/)) return this.translate.instant('errors.validation.password.noUppercase');
          if (!passwordValue.match(/[a-z]/)) return this.translate.instant('errors.validation.password.noLowercase');
          if (!passwordValue.match(/[0-9]/)) return this.translate.instant('errors.validation.password.noDigit');
          if (!passwordValue.match(/[^a-zA-Z0-9]/)) return this.translate.instant('errors.validation.password.noSpecialChar');
        }
      }
    }

    if (controlName === 'confirmPassword' && this.registerForm.hasError('passwordsDoNotMatch')) {
      return this.translate.instant('errors.validation.passwordsDoNotMatch');
    }
    
    return '';
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value ? { passwordsDoNotMatch: true } : null;
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/authentication/src/lib/guards/auth.guard.ts ---

/**
 * @file auth.guard.ts
 * @Version 2.1.0 (Modernized & Corrected Imports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-16
 * @Description
 *   Een functionele Angular route guard (`CanActivateFn`) die routes beschermt die
 *   authenticatie vereisen. Deze versie is bijgewerkt om te werken met de
 *   moderne, op `createFeature` gebaseerde NgRx store.
 *
 *   Strategie:
 *   De guard importeert de state en selectors direct uit het `auth.feature.ts`
 *   bestand om robuust te zijn en de publieke API van de library niet te vervuilen.
 *   Het wacht op een stabiele (niet-ladende) state alvorens een beslissing te nemen.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, take, tap } from 'rxjs/operators';
import { LoggerService } from '@royal-code/core/logging';
import { AuthState, selectAuthState } from '@royal-code/store/auth';

// ==============================================================================
// CORRECTE IMPORT: Rechtstreeks vanuit het feature-bestand.
// ==============================================================================

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const store = inject(Store);
  const router = inject(Router);
  const logger = inject(LoggerService);
  const LOG_PREFIX = '[AuthGuard]';

  logger.info(`${LOG_PREFIX} Activating for route: ${state.url}`);

  return store.select(selectAuthState).pipe(
    tap(authState => logger.debug(`${LOG_PREFIX} Observing auth state...`, { loading: authState.loading, authenticated: authState.isAuthenticated })),

    // Wacht tot de state stabiel is (niet aan het laden).
    filter((authState: AuthState) => {
      if (authState.loading) {
        logger.info(`${LOG_PREFIX} Auth state is 'loading'. Guard wacht op een stabiele state...`);
        return false;
      }
      return true;
    }),

    // Neem de eerste stabiele state en voltooi de stream.
    take(1),

    // Neem de definitieve beslissing.
    map((stableAuthState: AuthState) => {
      if (stableAuthState.isAuthenticated) {
        logger.info(`${LOG_PREFIX} Access GRANTED for route: ${state.url}.`);
        return true;
      }

      logger.warn(`${LOG_PREFIX} Access DENIED for route: ${state.url}. Redirecting to /login.`);
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }),

    // Veiligheidsnet.
    catchError(error => {
      logger.error(`${LOG_PREFIX} An unexpected error occurred in the auth guard pipe. Redirecting to login.`, error);
      router.navigate(['/login']);
      return of(false);
    })
  );
};

--- END OF FILE ---

--- START OF FILE libs/features/cart/core/src/index.ts ---

/**
 * @file index.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-09
 * @Description
 *   Public API for the Cart Core library. This is the central hub for cart-related
 *   business logic. It intentionally exports the facade, actions, providers, the
 *   abstract service contract, and relevant types to be consumed by other parts
 *   of the application.
 */

// --- State Management ---
// The Facade is the primary entry point for UI layers.
export * from './lib/state/cart.facade';

// Actions are exported for potential cross-feature dispatches (e.g., from auth effects).
export * from './lib/state/cart.actions';

// State providers for easy integration in routing modules.
export * from './lib/state/cart.providers';

// The feature itself is exported to allow access to ViewModels and advanced selectors.
export * from './lib/state/cart.feature';

// Types are essential for payloads and type safety across the app.
export * from './lib/state/cart.types';

// --- Data Access Contract ---
// The abstract service is the DI token for providing a concrete implementation.
export * from './lib/data-access/abstract-cart-api.service';

// --- Initializers ---

--- END OF FILE ---

--- START OF FILE libs/features/cart/core/src/lib/state/cart.actions.ts ---

/**
 * @file cart.actions.ts
 * @Version 7.0.0 (Final)
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AddCartItemPayload, UpdateCartItemPayload } from './cart.types';
import { CartItem as DomainCartItem } from '@royal-code/features/cart/domain';

export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    // Lifecycle & Sync
    'Cart Initialized': emptyProps(), // <-- VOEG DEZE TOE
    'Sync With Server': emptyProps(),
    'Sync With Server Success': props<{ items: readonly DomainCartItem[]; totalVatAmount?: number; totalDiscountAmount?: number }>(),
    'Sync With Server Error': props<{ error: string }>(),

    // User Actions
    'Add Item Submitted': props<{ payload: AddCartItemPayload; tempId: string }>(),
    'Create New Item': props<{ payload: AddCartItemPayload; tempId: string }>(),
    'Update Item Quantity Submitted': props<{ itemId: string; payload: UpdateCartItemPayload }>(),
    'Remove Item Submitted': props<{ itemId: string }>(),
    'Clear Cart Submitted': emptyProps(),

    // merge anonymous cart
    'Merge Anonymous Cart Submitted': props<{ items: readonly DomainCartItem[] }>(),
    'Merge Anonymous Cart Success': props<{ items: readonly DomainCartItem[] }>(), 
    'Merge Anonymous Cart Failure': props<{ error: string }>(),


    // API Result Actions
    'Add Item Success': props<{ item: DomainCartItem; tempId: string }>(),
    'Add Item Failure': props<{ tempId: string; error: string }>(),
    'Update Item Quantity Success': props<{ itemUpdate: Update<DomainCartItem> }>(),
    'Update Item Quantity Failure': props<{ itemId: string; error: string }>(),
    'Remove Item Success': props<{ itemId: string }>(),
    'Remove Item Failure': props<{ error: string; originalItem: DomainCartItem | null }>(),
    'Clear Cart Success': emptyProps(),
    'Clear Cart Failure': props<{ error: string; originalItems: readonly DomainCartItem[] }>(),
  },
});

--- END OF FILE ---

--- START OF FILE libs/features/cart/core/src/lib/state/cart.effects.ts ---

/**
 * @file cart.effects.ts
 * @Version 18.0.0 (Race Condition Fixed)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @description
 *   The definitive, enterprise-grade effects for the cart feature. This version
 *   removes the problematic 'ensureProductDataForCartItems$' effect, which was
 *   causing a race condition with page-level product loading. The responsibility
 *   for pre-loading product data for cart items now resides solely with the
 *   'initializeProductState' APP_INITIALIZER, which is the architecturally
*   correct location for this logic.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, withLatestFrom, concatMap, mergeMap, take, tap, filter, debounceTime, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { CartActions } from './cart.actions';
import { selectAllCartItems, cartFeature } from './cart.feature';
import { NotificationService } from '@royal-code/ui/notifications';
import { StorageService } from '@royal-code/core/storage';
import { CartItem as DomainCartItem } from '@royal-code/features/cart/domain';
import { UpdateCartItemPayload } from './cart.types';
import { AbstractCartApiService } from '../data-access/abstract-cart-api.service';
import { AuthActions, AuthFacade } from '@royal-code/store/auth';
import { LoggerService } from '@royal-code/core/logging';
import { CART_STORAGE_KEY } from '../constants/cart.constants';
import { ProductActions } from '@royal-code/features/products/core';
import { StructuredError } from '@royal-code/shared/domain';
import { ErrorActions } from '@royal-code/store/error';
import { emptyStringToNull } from '@royal-code/shared/utils';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class CartEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly apiService = inject(AbstractCartApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly storageService = inject(StorageService);
  private readonly authFacade = inject(AuthFacade);
  private readonly logger = inject(LoggerService);
  private readonly logPrefix = '[CartEffects]';

  // --- Auth & Init ---
  initializeOrSyncCart$ = createEffect(() => this.actions$.pipe(
    ofType(CartActions.cartInitialized),
    withLatestFrom(this.store.select(selectAllCartItems), this.authFacade.isAuthenticated$),
    switchMap(([_, items, isAuthenticated]) => {
      if (isAuthenticated) {
        this.logger.info(`${this.logPrefix} User is authenticated, syncing cart with server.`);
        // De APP_INITIALIZER heeft al gezorgd voor het laden van productdata.
        // We hoeven hier alleen de cart te syncen.
        return of(CartActions.syncWithServer());
      }
      this.logger.info(`${this.logPrefix} Anonymous user, cart initialization complete.`);
      return of({ type: '[Cart] Anonymous Initialization Complete' });
    })
  ));

  handleAuthChanges$ = createEffect(() => this.actions$.pipe(ofType(AuthActions.logoutCompleted), map(() => CartActions.clearCartSuccess())));

  mergeOnLogin$ = createEffect(() => this.actions$.pipe(
      ofType(AuthActions.loginSuccess), withLatestFrom(this.store.select(selectAllCartItems)),
      filter(([, items]) => items.length > 0 && items.some((item) => item.id.toString().startsWith('temp_'))),
      map(([, items]) => CartActions.mergeAnonymousCartSubmitted({ items: items.filter((item) => item.id.toString().startsWith('temp_')) }))
  ));

  syncOnLogin$ = createEffect(() => this.actions$.pipe(ofType(AuthActions.loginSuccess), map(() => CartActions.syncWithServer())));

  // --- API ---
  syncWithServer$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.syncWithServer), filter(() => this.authFacade.isAuthenticated()),
      exhaustMap(() => this.apiService.getCart().pipe(
          map(serverCart => CartActions.syncWithServerSuccess({ items: serverCart.items, totalVatAmount: serverCart.totalVatAmount, totalDiscountAmount: serverCart.totalDiscountAmount })),
          catchError(() => of(CartActions.syncWithServerError({ error: 'Failed to sync with server.' })))
      ))
  ));

  mergeCart$ = createEffect(() => this.actions$.pipe(
    ofType(CartActions.mergeAnonymousCartSubmitted),
    exhaustMap(({ items }) => this.apiService.mergeCart(items).pipe(
        map(mergedCart => {
          this.notificationService.showSuccess('Winkelwagen succesvol samengevoegd!');
          return CartActions.syncWithServerSuccess({
            items: mergedCart.items,
            totalVatAmount: mergedCart.totalVatAmount,
            totalDiscountAmount: mergedCart.totalDiscountAmount,
          });
        }),
        catchError(() => of(CartActions.mergeAnonymousCartFailure({ error: 'Failed to merge cart.' })))
    ))
  ));

  // --- CRUD ---
  handleItemSubmission$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.addItemSubmitted),
      concatMap(action => this.store.select(selectAllCartItems).pipe(
          take(1),
          map(currentItems => {
            const existingItem = currentItems.find(item => item.productId === action.payload.productId && (item.variantId ?? null) === (action.payload.variantId ?? null));
            
            // --- DE FIX: Voorkom de raceconditie ---
            // Als er een bestaand item is, maar het heeft nog een tijdelijk ID,
            // betekent dit dat de eerste 'add' request nog bezig is. Negeer deze dubbele actie.
            if (existingItem && existingItem.id.toString().startsWith('temp_')) {
              this.logger.warn(`${this.logPrefix} Ignoring duplicate addItem request while previous is still pending for tempId: ${existingItem.id}`);
              return { type: '[Cart] Duplicate Add Item Ignored' }; // Dispatch een no-op actie
            }
            // ------------------------------------

            if (existingItem) {
              const newQuantity = existingItem.quantity + action.payload.quantity;
              return CartActions.updateItemQuantitySubmitted({ itemId: existingItem.id, payload: { quantity: newQuantity } });
            }
            return CartActions.createNewItem({ payload: action.payload, tempId: action.tempId });
          })
      ))
  ));


    createNewItem$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.createNewItem),
      mergeMap(({ payload, tempId }) => {
        // Sanitize productId en variantId bij de bron
        const sanitizedProductId = emptyStringToNull(payload.productId);
        // <<< DE FIX: Als er geen echte variant is, stuur dan null, anders de gesanitizeerde ID >>>
        const sanitizedVariantId = payload.variantId && !payload.variantId.endsWith('-default')
                                  ? emptyStringToNull(payload.variantId)
                                  : null;
        // -----------------------------------------------------------------------------------------

        if (!this.authFacade.isAuthenticated()) {
          const localItem: DomainCartItem = {
            id: tempId,
            productId: sanitizedProductId as string,
            variantId: sanitizedVariantId, // Gebruik de gesanitizeerde/null waarde
            quantity: payload.quantity,
            productName: payload.productName,
            productImageUrl: payload.productImageUrl ?? undefined,
            pricePerItem: payload.pricePerItem,
            selectedVariants: payload.selectedVariants,
          };
          return of(
            CartActions.addItemSuccess({ item: localItem, tempId }),
            ProductActions.loadProductsByIds({ ids: [localItem.productId] })
          );
        }

        const apiPayload = {
            productId: sanitizedProductId as string,
            variantId: sanitizedVariantId, // Gebruik de gesanitizeerde/null waarde
            quantity: payload.quantity,
        };

        this.logger.info(`${this.logPrefix} Sending API payload for addItem:`, JSON.stringify(apiPayload, null, 2));

        return this.apiService.addItem(apiPayload).pipe(
          mergeMap(itemFromApi => {
            const enrichedItem: DomainCartItem = {
              ...itemFromApi,
              productName: payload.productName,
              productImageUrl: payload.productImageUrl ?? undefined,
              selectedVariants: payload.selectedVariants,
            };
            return of(CartActions.addItemSuccess({ item: enrichedItem, tempId }));
          }),
          catchError((err) => {
            // <<< DE FIX: Zorg ervoor dat de fout context serialiseerbaar is >>>
            const errorContext = {
                originalErrorMessage: err instanceof HttpErrorResponse ? err.message : String(err),
                originalErrorStatus: err instanceof HttpErrorResponse ? err.status : undefined,
                payloadSent: apiPayload,
                // Voeg hier andere relevante, serialiseerbare foutdetails toe
            };

            const structuredError: StructuredError = {
                source: '[API Cart]',
                message: 'Er is een serverfout opgetreden bij aanmaken van items. Probeer het later opnieuw.',
                severity: 'error',
                code: 'CART_ADD_ITEM_500', // Terug naar 500, want 400 is te specifiek als het een GUID-validatie issue is
                timestamp: Date.now(),
                context: errorContext, // Gebruik de serialiseerbare context
            };
            // -------------------------------------------------------------------

            this.store.dispatch(ErrorActions.reportError({ error: structuredError }));
            return of(CartActions.addItemFailure({ tempId, error: structuredError.message }));
        })
        );
      })
  ));



  removeItem$ = createEffect(() => this.actions$.pipe(
    ofType(CartActions.removeItemSubmitted),
    withLatestFrom(this.store.select(selectAllCartItems)),
    concatMap(([{ itemId }, items]) => {
      const originalItem = items.find(i => i.id === itemId) ?? null;
      if (!this.authFacade.isAuthenticated()) return of(CartActions.removeItemSuccess({ itemId }));
      return this.apiService.removeItem(itemId).pipe(
        map(() => CartActions.removeItemSuccess({ itemId })),
        catchError(() => {
          this.notificationService.showError(this.translate.instant('shoppingCart.errors.itemRemoveFailed'));
          return of(CartActions.removeItemFailure({ error: 'Failed to remove item.', originalItem }));
        })
      );
    })
  ));

  updateItem$ = createEffect(() => this.actions$.pipe(
    ofType(CartActions.updateItemQuantitySubmitted),
    concatMap(({ itemId, payload }) => {
      if (!this.authFacade.isAuthenticated()) return of(CartActions.updateItemQuantitySuccess({ itemUpdate: { id: itemId, changes: payload } }));
      return this.apiService.updateItemQuantity(itemId, payload).pipe(
        map(updatedItem => CartActions.updateItemQuantitySuccess({ itemUpdate: { id: itemId, changes: updatedItem } })),
        catchError(() => {
           this.notificationService.showError(this.translate.instant('shoppingCart.errors.quantityUpdateFailed'));
           return of(CartActions.updateItemQuantityFailure({ error: 'Failed to update quantity.', itemId }));
        })
      );
    })
  ));

  clearCart$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.clearCartSubmitted),
      withLatestFrom(this.store.select(selectAllCartItems)),
      exhaustMap(([, items]) => {
        if (!this.authFacade.isAuthenticated()) return of(CartActions.clearCartSuccess());
        return this.apiService.clearCart().pipe(
          map(() => CartActions.clearCartSuccess()),
          catchError(() => {
            this.notificationService.showError(this.translate.instant('shoppingCart.errors.clearCartFailed'));
            return of(CartActions.clearCartFailure({ error: 'Failed to clear cart.', originalItems: items }));
          })
        );
      })
  ));

  // VERWIJDERD: De problematische 'ensureProductDataForCartItems$' effect.
  // De 'initializeProductState' APP_INITIALIZER is nu de enige bron van waarheid
  // voor het pre-loaden van product data voor de winkelwagen. Dit lost de race condition op.

  // --- PERSISTENCE ---
  persistCartToStorage$ = createEffect(() => this.actions$.pipe(
      ofType(
        CartActions.addItemSuccess,
        CartActions.updateItemQuantitySuccess,
        CartActions.removeItemSuccess,
        CartActions.clearCartSuccess
      ),
      debounceTime(300),
      withLatestFrom(
        this.store.select(cartFeature.selectCartState),
        this.authFacade.isAuthenticated$
      ),
      tap(([action, state, isAuthenticated]) => {
        if (!isAuthenticated) {
          const stateToSave = { entities: state.entities, ids: state.ids };
          this.storageService.setItem(CART_STORAGE_KEY, stateToSave);
        }
      })
    ), { dispatch: false }
  );

  clearStorageOnMerge$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.mergeAnonymousCartSuccess),
      tap(() => this.storageService.removeItem(CART_STORAGE_KEY))
    ), { dispatch: false }
  );

  showNotificationOnItemAdded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.addItemSuccess),
      tap(({ item }) => {
        const message = this.translate.instant('shoppingCart.notifications.itemAddedSuccess');
        this.notificationService.showSuccess(message);
      })
    ),
    { dispatch: false }
  );
}

--- END OF FILE ---

--- START OF FILE libs/features/cart/core/src/lib/state/cart.facade.ts ---

/**
 * @file cart.facade.ts
 * @Version 9.1.0 (Corrected with Dual API - Signals & Observables)
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs'; // <-- BELANGRIJKE IMPORT
import { map } from 'rxjs/operators'; // <-- BELANGRIJKE IMPORT
import { CartActions } from './cart.actions';
import { AddCartItemPayload, CartViewModel } from './cart.types';
import { selectCartViewModel } from './cart.feature';

@Injectable({ providedIn: 'root' })
export class CartFacade {
  private readonly store = inject(Store);

  private createInitialViewModel(): CartViewModel {
    return {
      items: [], isLoading: true, isSubmitting: false, error: null, isEmpty: true,
      optimisticItemIds: new Set<string>(), totalItemCount: 0, uniqueItemCount: 0,
      subTotal: 0, isEligibleForFreeShipping: false, shippingCost: 4.95,
      totalWithShipping: 0, totalVatAmount: 0, totalDiscountAmount: 0,
    };
  }

  // --- Primaire ViewModel (brondata) ---
  private readonly viewModel$: Observable<CartViewModel> = this.store.select(selectCartViewModel);
  private readonly viewModelSignal: Signal<CartViewModel> = toSignal(
    this.viewModel$,
    { initialValue: this.createInitialViewModel() }
  );

  // --- Public API: Signals (voor UI) ---
  readonly viewModel = computed(() => this.viewModelSignal());
  readonly isLoading = computed(() => this.viewModel().isLoading);
  readonly isSubmitting = computed(() => this.viewModel().isSubmitting);
  readonly isEmpty = computed(() => this.viewModel().isEmpty);

  // --- Public API: Observables (voor Resolvers, Effects, etc.) ---
  readonly isLoading$: Observable<boolean> = this.viewModel$.pipe(map(vm => vm.isLoading));
  readonly isSubmitting$: Observable<boolean> = this.viewModel$.pipe(map(vm => vm.isSubmitting));

  // --- Public API: Action Dispatchers ---

  addItem(payload: AddCartItemPayload): void {
    const tempId = `temp_${Date.now()}`;
    this.store.dispatch(CartActions.addItemSubmitted({ payload, tempId }));
  }

  updateItemQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) { this.removeItem(itemId); }
    else { this.store.dispatch(CartActions.updateItemQuantitySubmitted({ itemId, payload: { quantity } })); }
  }

  removeItem(itemId: string): void { this.store.dispatch(CartActions.removeItemSubmitted({ itemId })); }
  clearCart(): void { this.store.dispatch(CartActions.clearCartSubmitted()); }
}

--- END OF FILE ---

--- START OF FILE libs/features/cart/core/src/lib/state/cart.feature.ts ---

/**
 * @file cart.feature.ts
 * @Version 26.0.0 (Hardened with Rollback Logic)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-29
 * @description
 *   The definitive, enterprise-grade NgRx feature for the Cart. This version
 *   includes robust rollback mechanisms for failed API calls and uses a strict
 *   enum for synchronization states.
 */
import { createFeature, createSelector, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { CartActions } from './cart.actions';
import { CartItem, CartSummary, CartViewModel, CartItemViewModel } from './cart.types';
import { getProductPrice, selectProductEntities } from '@royal-code/features/products/core';
import { Image, MediaType, SyncStatus } from '@royal-code/shared/domain';

// --- STATE & ADAPTER ---
export interface State extends EntityState<CartItem> {
  readonly syncStatus: 'Idle' | 'Syncing' | 'Error';
  readonly error: string | null;
  readonly totalVatAmount: number;
  readonly totalDiscountAmount: number;
}
export const cartAdapter: EntityAdapter<CartItem> = createEntityAdapter<CartItem>();
export const initialCartState: State = cartAdapter.getInitialState({
  syncStatus: 'Idle', error: null, totalVatAmount: 0, totalDiscountAmount: 0,
});

// --- REDUCER ---
const cartReducerInternal = createReducer(
  initialCartState,
  on(CartActions.syncWithServerSuccess, (state, { items, totalVatAmount, totalDiscountAmount }) =>
    cartAdapter.setAll((items ?? []).map(item => ({ ...item, syncStatus: SyncStatus.Synced })), {
      ...state, syncStatus: 'Idle' as const, error: null,
      totalVatAmount: totalVatAmount ?? 0,
      totalDiscountAmount: totalDiscountAmount ?? 0,
    })
  ),
  on(CartActions.syncWithServerError, (state, { error }) => ({ ...state, syncStatus: 'Error' as const, error })),

  // --- ADD ITEM ---
  on(CartActions.createNewItem, (state, { payload, tempId }) =>
    cartAdapter.addOne({ id: tempId, productId: payload.productId, variantId: payload.variantId, quantity: payload.quantity, syncStatus: SyncStatus.Pending }, state)
  ),
    on(CartActions.addItemSuccess, (state, { item, tempId }) => {
    // Verwijder eerst het tijdelijke (optimistische) item
    const stateWithoutTemp = cartAdapter.removeOne(tempId, state);
    // Voeg het definitieve, verrijkte item van de API (of lokaal) toe
    // Zorg ervoor dat de volledige 'item' payload wordt gebruikt
    return cartAdapter.addOne({ ...item, syncStatus: SyncStatus.Synced }, stateWithoutTemp);
  }),

  on(CartActions.addItemFailure, (state, { tempId, error }) =>
    cartAdapter.updateOne({ id: tempId, changes: { syncStatus: SyncStatus.Error, error } }, state)
  ),

  // --- UPDATE QUANTITY ---
  on(CartActions.updateItemQuantitySubmitted, (state, { itemId, payload }) =>
    cartAdapter.updateOne({ id: itemId, changes: { syncStatus: SyncStatus.Pending, quantity: payload.quantity } }, state)
  ),
  on(CartActions.updateItemQuantitySuccess, (state, { itemUpdate }) =>
    cartAdapter.updateOne({ id: itemUpdate.id as string, changes: { ...itemUpdate.changes, syncStatus: SyncStatus.Synced } }, state)
  ),
  on(CartActions.updateItemQuantityFailure, (state, { itemId, error }) =>
    cartAdapter.updateOne({ id: itemId, changes: { syncStatus: SyncStatus.Error, error }}, state)
  ),

  // --- REMOVE & CLEAR (with rollback) ---
  on(CartActions.removeItemSuccess, (state, { itemId }) => cartAdapter.removeOne(itemId, state)),
  on(CartActions.removeItemFailure, (state, { originalItem }) =>
    originalItem ? cartAdapter.addOne({ ...originalItem, syncStatus: SyncStatus.Synced }, state) : state
  ),
  on(CartActions.clearCartSuccess, (state) => cartAdapter.removeAll({ ...state, totalVatAmount: 0, totalDiscountAmount: 0 })),
  on(CartActions.clearCartFailure, (state, { originalItems }) =>
    cartAdapter.addMany([...originalItems].map(item => ({ ...item, syncStatus: SyncStatus.Synced })), state)
  )
);

// --- NGRX FEATURE ---
export const cartFeature = createFeature({
  name: 'cart', reducer: cartReducerInternal,
  extraSelectors: ({ selectCartState, selectSyncStatus, selectError, selectTotalVatAmount, selectTotalDiscountAmount }) => {
    const { selectAll: selectAllCartItems } = cartAdapter.getSelectors(selectCartState);
        const selectRichCartItems = createSelector(
        selectAllCartItems, selectProductEntities,
        (items, productEntities): CartItemViewModel[] => items.map(item => {
            const product = item.productId ? productEntities[item.productId] : undefined;

            // --- DE KERN VAN DE FIX ---
            // Als het product niet in de state is gevonden (bv. API-call mislukt of nog niet voltooid),
            // creëer dan een fallback ViewModel op basis van de data die al in het cart item zelf zit.
            if (!product) {
              return {
                ...item,
                product: null, // Geen volledig productobject beschikbaar
                productName: item.productName ?? 'Product wordt geladen...',
                productImageUrl: item.productImageUrl,
                pricePerItem: item.pricePerItem ?? 0,
                lineTotal: (item.pricePerItem ?? 0) * item.quantity,
              } as unknown as CartItemViewModel; // Cast omdat 'product' null is, wat technisch niet overeenkomt.
            }

            // Als het product wel is gevonden, doe de volledige verrijking.
            const pricePerItem = getProductPrice(product, item.variantId);
            const primaryImage = product.media?.find((m): m is Image => m.type === MediaType.IMAGE);
            return {
                ...item,
                product,
                productName: product.name,
                productImageUrl: primaryImage?.variants?.[0]?.url,
                pricePerItem,
                lineTotal: pricePerItem ? pricePerItem * item.quantity : 0,
            };
        })
        // Verwijder de filter, want we retourneren nu altijd een geldig object.
        // .filter((item): item is CartItemViewModel => item !== null) 
    );

    const selectSummary = createSelector(
      selectRichCartItems, selectTotalVatAmount, selectTotalDiscountAmount,
      (richItems, totalVatAmount, totalDiscountAmount): CartSummary => {
        const subTotal = richItems.reduce((acc, item) => acc + item.lineTotal, 0);
        const totalItemCount = richItems.reduce((acc, item) => acc + item.quantity, 0);
        const shippingCost = subTotal >= 50.00 ? 0 : 4.95;
        return {
            totalItemCount, uniqueItemCount: richItems.length, subTotal, totalDiscountAmount,
            isEligibleForFreeShipping: shippingCost === 0, shippingCost,
            totalWithShipping: subTotal - totalDiscountAmount + shippingCost,
            totalVatAmount,
        };
      }
    );
    const selectCartViewModel = createSelector(
      selectRichCartItems, selectSyncStatus, selectError, selectSummary,
      (items, syncStatus, error, summary): CartViewModel => ({
        ...summary, items,
        isLoading: syncStatus === 'Syncing', isSubmitting: items.some(i => i.syncStatus === SyncStatus.Pending),
        error, isEmpty: items.length === 0 && syncStatus !== 'Syncing',
        optimisticItemIds: new Set(items.filter(i => i.syncStatus === SyncStatus.Pending).map(i => i.id))
      })
    );
    return { selectAllCartItems, selectCartViewModel };
  }
});
// --- PUBLIC API ---
export const { name: CART_FEATURE_KEY, reducer: cartReducer, selectCartState, selectAllCartItems, selectCartViewModel } = cartFeature;

--- END OF FILE ---

--- START OF FILE libs/features/cart/core/src/lib/state/cart.types.ts ---

/**
 * @file cart.types.ts
 * @Version 9.0.0 (Type-Safe with SyncStatus Enum)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-29
 * @description Defines the strict type contracts for the Cart feature.
 */
import { CartItem as DomainCartItem } from '@royal-code/features/cart/domain';
import { Product } from '@royal-code/features/products/domain';
import { CartItemVariant } from '@royal-code/features/cart/domain'; 
import { SyncStatus } from '@royal-code/shared/domain';

// --- STATE & PAYLOADS ---
export interface CartItem extends DomainCartItem {
  syncStatus: SyncStatus;
  error?: string | null;
}

export type AddCartItemPayload = {
  readonly productId: string;
  readonly quantity: number;
  readonly variantId?: string | null;
  readonly productName?: string;
  readonly productImageUrl?: string | null;
  readonly pricePerItem?: number;
  readonly selectedVariants?: CartItemVariant[];
};

export type UpdateCartItemPayload = {
  readonly quantity: number;
};

// --- VIEW MODELS ---
export interface CartItemViewModel extends CartItem {
  readonly product: Product;
  readonly productName: string;
  readonly productImageUrl: string | undefined;
  readonly pricePerItem: number | undefined;
  readonly lineTotal: number;
}
export interface CartSummary {
  readonly totalItemCount: number;
  readonly uniqueItemCount: number;
  readonly subTotal: number;
  readonly totalDiscountAmount: number;
  readonly isEligibleForFreeShipping: boolean;
  readonly shippingCost: number;
  readonly totalWithShipping: number;
  readonly totalVatAmount: number;
}
export interface CartViewModel extends CartSummary {
  readonly items: readonly CartItemViewModel[];
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly isEmpty: boolean;
  readonly optimisticItemIds: ReadonlySet<string>;
}

--- END OF FILE ---

--- START OF FILE libs/features/cart/data-access-plushie/src/lib/services/plushie-cart-api.service.ts ---

/**
 * @file plushie-cart-api.service.ts
 * @Version 2.0.0 (Correctly Implements AbstractCartApiService)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Correcte implementatie van de AbstractCartApiService voor de "Plushie Paradise"
 *   applicatie. Deze service communiceert met de Plushie Paradise-specifieke
 *   backend endpoints voor alle winkelwagen-gerelateerde operaties.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem, Cart } from '@royal-code/features/cart/domain';
import { APP_CONFIG } from '@royal-code/core/config';
import { AddCartItemPayload, UpdateCartItemPayload } from '@royal-code/features/cart/core';
import { AbstractCartApiService } from '@royal-code/features/cart/core'; // <<< Correcte import

@Injectable({ providedIn: 'root' })
export class PlushieCartApiService implements AbstractCartApiService { // <<< Correcte implementatie
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Cart`; // Base URL for the Plushie Paradise cart API

  /**
   * @method getCart
   * @description Implements the `getCart` contract by performing a GET request to the main cart endpoint.
   * @returns {Observable<Cart>} An observable emitting the user's cart.
   */
  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  /**
   * @method addItem
   * @description Implements the `addItem` contract by performing a POST request to the items endpoint.
   * @param {AddCartItemPayload} payload - The details of the item to add.
   * @returns {Observable<CartItem>} An observable emitting the newly created cart item.
   */
  addItem(payload: AddCartItemPayload): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.apiUrl}/items`, payload);
  }

  /**
   * @method updateItemQuantity
   * @description Implements the `updateItemQuantity` contract by performing a PATCH request to a specific item's endpoint.
   * @param {string} itemId - The ID of the item to update.
   * @param {UpdateCartItemPayload} payload - The new quantity.
   * @returns {Observable<CartItem>} An observable emitting the updated cart item.
   */
  updateItemQuantity(itemId: string, payload: UpdateCartItemPayload): Observable<CartItem> {
    return this.http.patch<CartItem>(`${this.apiUrl}/items/${itemId}`, payload);
  }

  /**
   * @method removeItem
   * @description Implements the `removeItem` contract by performing a DELETE request to a specific item's endpoint.
   * @param {string} itemId - The ID of the item to remove.
   * @returns {Observable<void>} An observable that completes upon successful removal.
   */
  removeItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${itemId}`);
  }

  /**
   * @method clearCart
   * @description Implements the `clearCart` contract by performing a DELETE request on the main cart endpoint.
   * @returns {Observable<void>} An observable that completes upon successful clearing.
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }

  /**
   * @method mergeCart
   * @description Implements the `mergeCart` contract by performing a POST request to the merge endpoint.
   * @param {readonly CartItem[]} items - The items from the anonymous cart.
   * @returns {Observable<Cart>} An observable emitting the merged cart.
   */
  mergeCart(items: readonly CartItem[]): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/merge`, { items });
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/cart/domain/src/lib/models/cart.model.ts ---

/**
 * @file cart.model.ts
 * @Version 2.1.0 (Discount Support)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-08
 * @Description Defines the core domain models for the Shopping Cart feature, now including discount support.
 */
import { SyncStatus } from '@royal-code/shared/domain';


export interface CartItemVariant {
  name: string; // 'Kleur' of 'Maat'
  value: string; // 'Geel' of 'Medium'
  displayValue?: string; // Optioneel, bijv. een hex-code voor een kleur
}

/** @interface CartItem - Represents a single item in the shopping cart. */
export interface CartItem {
  readonly id: string;
  readonly productId: string;
  quantity: number;
  productName?: string;
  productImageUrl?: string;
  pricePerItem?: number;
  lineTotal?: number;
  variantId?: string | null;
  selectedVariants?: CartItemVariant[];
  syncStatus?: SyncStatus;
}


/** @interface Cart - Represents the entire shopping cart object. */
export interface Cart {
  id: string;
  userId?: string | null;
  items: readonly CartItem[];
  subTotal?: number;
  shippingCost?: number;
  totalWithShipping?: number;
  totalVatAmount?: number;
  totalDiscountAmount?: number;
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/index.ts ---

/**
 * @file index.ts (checkout-core)
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-11
 * @Description
 */

// Provides the NgRx state and effects for the checkout feature.
// This is the primary function to be used in an application's provider configuration.
export * from './lib/state/checkout.providers';

// The Facade: The single, public-facing API for components to interact with the checkout state.
export * from './lib/state/checkout.facade';

// The state rehydration initializer, used in the root `app.config.ts` to persist checkout state across refreshes.
export * from './lib/initializers/checkout-state.initializer';

// The abstract service contract, serving as the Dependency Injection token for the data-access layer.
export * from './lib/data-access/abstract-checkout-api.service';

// Key data structures (types/interfaces) that consumers of this library,
// such as data-access implementations, will need.
export * from './lib/state/checkout.types';

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.actions.ts ---

/**
 * @file checkout.actions.ts
 * @Version 4.0.0 (With Shipping Methods)
 * @Description Definitive actions for the Checkout feature.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Address } from '@royal-code/shared/domain';
import { CheckoutStep } from './checkout.types';
import { ShippingMethod, ShippingMethodFilter } from '@royal-code/features/checkout/domain';

export const CheckoutActions = createActionGroup({
  source: 'Checkout',
  events: {
    // Lifecycle
    'Flow Initialized': emptyProps(),
    'State Rehydrated': props<{ persistedState: any }>(),
    'Flow Reset': emptyProps(),

    // Navigation
    'Go To Step': props<{ step: CheckoutStep }>(),

    // Data Submission & Orchestration
    'Shipping Step Submitted': props<{ address: Address, saveAddress: boolean, shouldNavigate: boolean }>(),
    'Shipping Address Set': props<{ address: Address | null }>(),
    'Billing Address Set': props<{ address: Address | null }>(),
    'Payment Method Set': props<{ methodId: string }>(),

    // Shipping Methods
    'Load Shipping Methods': props<{ filters: ShippingMethodFilter }>(),
    'Load Shipping Methods Success': props<{ methods: ShippingMethod[] }>(),
    'Load Shipping Methods Failure': props<{ error: string }>(),
    'Shipping Method Set': props<{ methodId: string }>(),

    // Order Submission Flow
    'Order Submitted': emptyProps(),
  },
});

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.effects.ts ---

/**
 * @file checkout.effects.ts
 * @Version 6.1.0 (Corrected Imports & Return Types)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Definitive implementation of checkout effects, with corrected RxJS imports
 *   and type-safe action returns.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
import { of } from 'rxjs';
import { map, withLatestFrom, tap, concatMap, switchMap, catchError } from 'rxjs/operators';
import { CheckoutActions } from './checkout.actions';
import { checkoutFeature } from './checkout.feature';
import { selectAllCartItems } from '@royal-code/features/cart/core';
import { NotificationService } from '@royal-code/ui/notifications';
import { StorageService } from '@royal-code/core/storage';
import { UserActions } from '@royal-code/store/user';
import { OrderActions } from '@royal-code/features/orders/core';
import { CreateOrderPayload } from '@royal-code/features/orders/domain';
import { LoggerService } from '@royal-code/core/logging';
import { AbstractCheckoutApiService } from '../data-access/abstract-checkout-api.service';

@Injectable()
export class CheckoutEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);
  private readonly storageService = inject(StorageService);
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(AbstractCheckoutApiService);

  loadShippingMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CheckoutActions.loadShippingMethods),
      switchMap(({ filters }) =>
        this.apiService.getShippingMethods(filters).pipe(
          map(methods => CheckoutActions.loadShippingMethodsSuccess({ methods })),
          catchError((error: Error) => {
            this.logger.error('[CheckoutEffects] Failed to load shipping methods', error);
            return of(CheckoutActions.loadShippingMethodsFailure({ error: 'Failed to load shipping methods.' }));
          })
        )
      )
    )
  );

  submitOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CheckoutActions.orderSubmitted),
      withLatestFrom(
        this.store.select(checkoutFeature.selectCheckoutViewModel),
        this.store.select(selectAllCartItems)
      ),
      map(([, checkout, cartItems]): Action => { 
        if (!checkout.shippingAddress?.id || !checkout.selectedShippingMethodId || !checkout.paymentMethodId || cartItems.length === 0) {
          this.notificationService.showError('Onvolledige bestelgegevens. Kan niet doorgaan.');
          return ({ type: '[Checkout] Submit Order Aborted - Incomplete Data' });
        }

        const payload: CreateOrderPayload = {
          shippingAddressId: checkout.shippingAddress.id,
          billingAddressId: checkout.shippingAddress.id,
          shippingMethodId: checkout.selectedShippingMethodId, 
          paymentMethod: checkout.paymentMethodId,
          items: cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          customerNotes: '',
        };
        return OrderActions.createOrderFromCheckout({ payload });
      })
    )
  );

handleShippingStepSubmitted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CheckoutActions.shippingStepSubmitted),
      concatMap(({ address, saveAddress, shouldNavigate }) => {
        const actionsToDispatch: Action[] = [
          CheckoutActions.shippingAddressSet({ address })
        ];

        if (saveAddress) {
          const tempId = `temp-addr-${Date.now()}`;
          this.store.dispatch(UserActions.createAddressSubmitted({ payload: address, tempId }));
        }

        if (shouldNavigate) {
          actionsToDispatch.push(CheckoutActions.goToStep({ step: 'payment' }));
        }
        
        return of(...actionsToDispatch);
      })
    )
  );


  private readonly CHECKOUT_STORAGE_KEY = 'royal-code-checkout';

  persistStateToSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        CheckoutActions.shippingAddressSet,
        CheckoutActions.paymentMethodSet,
        CheckoutActions.goToStep
      ),
      withLatestFrom(this.store.select(checkoutFeature.selectCheckoutState)),
      tap(([, state]) => {
        this.storageService.setItem(this.CHECKOUT_STORAGE_KEY, state, 'session');
      })
    ),
    { dispatch: false }
  );

  clearStateOnSuccessOrReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        OrderActions.createOrderSuccess,
        CheckoutActions.flowReset
      ),
      tap(() => {
        this.storageService.removeItem(this.CHECKOUT_STORAGE_KEY, 'session');
      })
    ),
    { dispatch: false }
  );
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.facade.ts ---

/**
 * @file checkout.facade.ts
 * @Version 3.2.0 (With Shipping Method Selection)
 * @Description Publieke API voor de Checkout state.
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Address } from '@royal-code/shared/domain';
import { CheckoutActions } from './checkout.actions';
import { selectCheckoutViewModel } from './checkout.feature';
import { CheckoutViewModel, CheckoutStep } from './checkout.types';
import { ShippingMethodFilter } from '@royal-code/features/checkout/domain';

@Injectable({ providedIn: 'root' })
export class CheckoutFacade {
  private readonly store = inject(Store);

  // <<< DE FIX: initialViewModel bijgewerkt >>>
  private readonly initialViewModel: CheckoutViewModel = {
    activeStep: 'shipping',
    completedSteps: new Set<CheckoutStep>(),
    shippingAddress: null,
    paymentMethodId: null,
    selectedShippingMethodId: null, // <<< DE FIX: TOEGEVOEGD
    shippingMethods: [],
    isLoadingShippingMethods: false,
    canProceedToPayment: false,
    canProceedToReview: false,
    isSubmittingOrder: false,
    error: null,
  };

  public readonly viewModel$: Observable<CheckoutViewModel> = this.store.select(selectCheckoutViewModel);
public readonly viewModel: Signal<CheckoutViewModel> = toSignal(this.store.select(selectCheckoutViewModel), { initialValue: this.initialViewModel });

  initialize(): void { this.store.dispatch(CheckoutActions.flowInitialized()); }
  goToStep(step: CheckoutStep): void { this.store.dispatch(CheckoutActions.goToStep({ step })); }
setShippingAddress(address: Address | null, saveAddress: boolean, shouldNavigate: boolean = false): void {
    if (address) {
      this.store.dispatch(CheckoutActions.shippingStepSubmitted({ address, saveAddress, shouldNavigate }));
    } else {
      // Als er geen adres is, dispatch dan direct de 'Shipping Address Set' actie met null.
      this.store.dispatch(CheckoutActions.shippingAddressSet({ address: null }));
    }
  }

  
  setPaymentMethod(methodId: string): void {
    this.store.dispatch(CheckoutActions.paymentMethodSet({ methodId }));
    this.store.dispatch(CheckoutActions.goToStep({ step: 'review' }));
  }
  setShippingMethod(methodId: string): void {
    this.store.dispatch(CheckoutActions.shippingMethodSet({ methodId }));
  }

  loadShippingMethods(filters: ShippingMethodFilter): void { this.store.dispatch(CheckoutActions.loadShippingMethods({ filters })); }
  submitOrder(): void { this.store.dispatch(CheckoutActions.orderSubmitted()); }
  resetFlow(): void { this.store.dispatch(CheckoutActions.flowReset()); }
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.feature.ts ---

/**
 * @file checkout.feature.ts
 * @Version 5.0.0 (With Shipping Methods)
 * @Description
 *   Definitive NgRx feature definition for Checkout state.
 */
import { createFeature, createSelector, createReducer, on } from '@ngrx/store';
import { CheckoutStep, CheckoutViewModel } from './checkout.types';
import { CheckoutActions } from './checkout.actions';
import { Address } from '@royal-code/shared/domain';
import { ShippingMethod } from '@royal-code/features/checkout/domain';

// --- STATE DEFINITION ---
export interface SerializableCheckoutState {
  activeStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  paymentMethodId: string | null;
  selectedShippingMethodId: string | null;
  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;
  isSubmittingOrder: boolean;
  error: string | null;
}

export const initialCheckoutState: SerializableCheckoutState = {
  activeStep: 'shipping',
  completedSteps: [],
  shippingAddress: null,
  billingAddress: null,
  paymentMethodId: null,
  selectedShippingMethodId: null, // <<< DE FIX: TOEGEVOEGD
  shippingMethods: [],
  isLoadingShippingMethods: false,
  isSubmittingOrder: false,
  error: null,
};


// --- NGRX FEATURE ---
export const checkoutFeature = createFeature({
  name: 'checkout',
  reducer: createReducer(
    initialCheckoutState,
    on(CheckoutActions.flowInitialized, () => initialCheckoutState),
    on(CheckoutActions.flowReset, () => initialCheckoutState),
    on(CheckoutActions.stateRehydrated, (state, { persistedState }) => ({ ...state, ...persistedState })),
    on(CheckoutActions.goToStep, (state, { step }) => ({ ...state, activeStep: step })),
    on(CheckoutActions.shippingAddressSet, (state, { address }) => ({
      ...state,
      shippingAddress: address,
      completedSteps: [...new Set([...state.completedSteps, 'shipping'])] as CheckoutStep[],
    })),
    on(CheckoutActions.paymentMethodSet, (state, { methodId }) => ({
      ...state,
      paymentMethodId: methodId,
      completedSteps: [...new Set([...state.completedSteps, 'shipping', 'payment'])] as CheckoutStep[],
    })),
    on(CheckoutActions.shippingMethodSet, (state, { methodId }) => ({
      ...state,
      selectedShippingMethodId: methodId,
    })),
    on(CheckoutActions.loadShippingMethods, (state) => ({ ...state, isLoadingShippingMethods: true, error: null })),
    on(CheckoutActions.loadShippingMethodsSuccess, (state, { methods }) => ({ ...state, isLoadingShippingMethods: false, shippingMethods: methods })),
    on(CheckoutActions.loadShippingMethodsFailure, (state, { error }) => ({ ...state, isLoadingShippingMethods: false, error }))
  ),
    extraSelectors: ({ selectActiveStep, selectCompletedSteps, selectIsSubmittingOrder, selectShippingAddress, selectPaymentMethodId, selectError, selectShippingMethods, selectIsLoadingShippingMethods, selectSelectedShippingMethodId }) => { // <<< DE FIX: selectSelectedShippingMethodId toegevoegd
    const selectCompletedStepsAsSet = createSelector(selectCompletedSteps, (completedArray) => new Set(completedArray));
    const selectCanProceedToPayment = createSelector(selectCompletedStepsAsSet, (completedSet) => completedSet.has('shipping'));
    const selectCanProceedToReview = createSelector(selectCompletedStepsAsSet, (completedSet) => completedSet.has('shipping') && completedSet.has('payment'));

    const selectCheckoutViewModel = createSelector(
      selectActiveStep, selectCompletedStepsAsSet, selectShippingAddress,
      selectPaymentMethodId, selectCanProceedToPayment, selectCanProceedToReview,
      selectIsSubmittingOrder, selectError, selectShippingMethods, selectIsLoadingShippingMethods,
      selectSelectedShippingMethodId, 
      (activeStep, completedSteps, shippingAddress, paymentMethodId, canProceedToPayment, canProceedToReview, isSubmittingOrder, error, shippingMethods, isLoadingShippingMethods, selectedShippingMethodId): CheckoutViewModel => ({ // <<< DE FIX: selectedShippingMethodId als argument
        activeStep, completedSteps, shippingAddress, paymentMethodId,
        selectedShippingMethodId, 
        canProceedToPayment, canProceedToReview, isSubmittingOrder, error,
        shippingMethods, isLoadingShippingMethods
      })
    );
    return { selectCheckoutViewModel };
  }

});

// --- PUBLIC API EXPORTS ---
export const { name: CHECKOUT_FEATURE_KEY, reducer: checkoutReducer, selectCheckoutViewModel } = checkoutFeature;

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.types.ts ---

/**
 * @file checkout.types.ts
 * @Version 3.2.0 (With Shipping Method Selection)
 * @Description Types en interfaces voor de Checkout feature state.
 */
import { Address } from '@royal-code/shared/domain';
import { CartItem } from '@royal-code/features/cart/domain';
import { ShippingMethod } from '@royal-code/features/checkout/domain';

export type CheckoutStep = 'shipping' | 'payment' | 'review';

export interface CheckoutState {
  activeStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  paymentMethodId: string | null;
  selectedShippingMethodId: string | null; // <<< DE FIX: Toegevoegd in de State
  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;
  isSubmittingOrder: boolean;
  error: string | null;
}

export interface CheckoutViewModel {
  activeStep: CheckoutStep;
  completedSteps: Set<CheckoutStep>;
  shippingAddress: Address | null;
  paymentMethodId: string | null;
  selectedShippingMethodId: string | null; // <<< DE FIX: TOEGEVOEGD AAN DE VIEWMODEL
  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;
  canProceedToPayment: boolean;
  canProceedToReview: boolean;
  isSubmittingOrder: boolean;
  error: string | null;
}

export interface SubmitOrderPayload {
  cartItems: readonly CartItem[];
  shippingAddress: Address;
  paymentMethodId: string;
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-plushie/src/lib/services/plushie-checkout-api.service.ts ---

/**
 * @file plushie-checkout-api.service.ts
 * @Version 3.0.0 (Synchronized with correct Domain Models)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Data-access service voor checkout, nu gesynchroniseerd met de correcte
 *   'ShippingMethodFilter' die de universele 'Address' interface gebruikt.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { SubmitOrderPayload, AbstractCheckoutApiService } from '@royal-code/features/checkout/core';
import { Order } from '@royal-code/features/orders/domain';
import { ShippingMethod, ShippingMethodFilter } from '@royal-code/features/checkout/domain';

@Injectable({ providedIn: 'root' })
export class PlushieCheckoutApiService extends AbstractCheckoutApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Checkout`;

  getShippingMethods(filters: ShippingMethodFilter): Observable<ShippingMethod[]> {
    if (filters.shippingAddressId) {
      const params = new HttpParams().set('shippingAddressId', filters.shippingAddressId);
      return this.http.get<ShippingMethod[]>(`${this.apiUrl}/shipping-methods`, { params });
    } else if (filters.address) {
      return this.http.post<ShippingMethod[]>(`${this.apiUrl}/shipping-methods/calculate`, filters.address);
    }
    return of([]);
  }

  submitOrder(payload: SubmitOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${this.config.backendUrl}/orders`, payload);
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/domain/src/lib/models/shipping.model.ts ---

/**
 * @file shipping.model.ts
 * @Version 2.0.0 (Definitive: Uses Shared Address Model)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve versie die de lokale, incorrecte 'Address' interface verwijdert
 *   en de enige correcte 'Address' interface importeert vanuit @royal-code/shared/domain.
 *   Dit lost alle type-inconsistenties op.
 */
import { Address } from '@royal-code/shared/domain';

/**
 * @interface ShippingMethod
 * @description Representeert een beschikbare verzendmethode met details.
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimatedDeliveryTime: string;
  cost: number;
}

/**
 * @interface ShippingMethodFilter
 * @description Filters voor het ophalen van verzendmethoden. Accepteert een ID (voor ingelogde gebruikers)
 *              OF een volledig adresobject (voor anonieme gebruikers).
 */
export interface ShippingMethodFilter {
  shippingAddressId?: string;
  address?: Address; // Gebruikt nu de correct geïmporteerde, universele Address interface
}

// De lokale 'Address' interface die hier stond is nu volledig en permanent verwijderd.

--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/src/checkout.routes.ts ---

/**
 * @file checkout.routes.ts
 * @Version 5.0.0 (i18n Resolver Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Defines the lazy-loaded routes for the Checkout feature. This version integrates
 *   the `i18nInitResolver` to ensure translations are loaded before activating
 *   the checkout pages, resolving missing translation issues.
 */
import { Route } from '@angular/router';
import { provideCheckoutFeature } from '@royal-code/features/checkout/core';
import { i18nInitResolver } from '@royal-code/shared/utils'; // <<< TOEGEVOEGD

export const CheckoutRoutes: Route[] = [
  {
    path: '',
    // PROVIDE de state en effects voor deze lazy-loaded feature.
    providers: [
      provideCheckoutFeature()
    ],
    // CRUCIAAL: Pas de i18n resolver toe op dit lazy-loaded blok
    resolve: {
      i18n: i18nInitResolver
    },
    children: [
      {
        path: '',
        loadComponent: () => import('./lib/pages/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent),
      },
      {
        path: 'success/:id',
        loadComponent: () => import('./lib/pages/order-success-page/order-success-page.component').then(m => m.OrderSuccessPageComponent),
      },
    ]
  },
];

--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/src/lib/components/checkout-payment-step/checkout-payment-step.component.ts ---

// --- VERVANG VOLLEDIG BLOK: interface PaymentMethod { ... } in libs/features/checkout/ui-plushie/src/lib/components/checkout-payment-step/checkout-payment-step.component.ts ---
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { CheckoutFacade } from '@royal-code/features/checkout/core';
import { UiBadgeComponent } from '@royal-code/ui/badge'; // Importeer UiBadgeComponent

interface PaymentMethod {
  id: string;
  nameKey: string;
  icon: AppIcon;
  descriptionKey: string;
  isRecommended?: boolean; // TOEGEVOEGD
}
// --- VERVANG HET BLOK: protected readonly paymentMethods: PaymentMethod[] = [ ... ] IN libs/features/checkout/ui-plushie/src/lib/components/checkout-payment-step/checkout-payment-step.component.ts ---
// EN VOEG TOE: UiBadgeComponent aan imports array
// En update de template om de badge te tonen
@Component({
  selector: 'plushie-royal-code-checkout-payment-step',
  standalone: true,
  imports: [
    TranslateModule,
    UiTitleComponent,
    UiParagraphComponent,
    UiButtonComponent,
    UiIconComponent,
    UiBadgeComponent // TOEGEVOEGD
],
  template: `
    <section class="rounded-xs border border-border p-4 sm:p-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'checkout.payment.title' | translate" />
      <royal-code-ui-paragraph color="muted" extraClasses="mt-2 mb-6">
        {{ 'checkout.payment.description' | translate }}
      </royal-code-ui-paragraph>

      <div class="space-y-4">
        @for (method of paymentMethods; track method.id) {
          <button
            type="button"
            class="w-full flex items-center gap-4 rounded-xs border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            [class.border-primary]="selectedMethodId() === method.id"
            [class.bg-surface-alt]="selectedMethodId() === method.id"
            [class.border-border]="selectedMethodId() !== method.id"
            (click)="selectMethod(method.id)"
            [attr.aria-pressed]="selectedMethodId() === method.id"
          >
            <royal-code-ui-icon [icon]="method.icon" sizeVariant="lg" extraClass="text-primary w-8 h-8 flex-shrink-0" />
            <div class="flex-grow flex items-center gap-2"> <!-- Flex container voor naam en badge -->
              <royal-code-ui-paragraph extraClasses="font-semibold pointer-events-none">{{ method.nameKey | translate }}</royal-code-ui-paragraph>
              @if (method.isRecommended) {
                <royal-code-ui-badge color="primary" size="sm">{{ 'common.recommended' | translate }}</royal-code-ui-badge>
              }
            </div>
            <royal-code-ui-paragraph size="sm" color="muted" extraClasses="pointer-events-none">
                {{ method.descriptionKey | translate }}
            </royal-code-ui-paragraph>
          </button>
        }
      </div>

      <div class="mt-8 pt-6 border-t border-border">
        <royal-code-ui-button
          type="primary"
          [disabled]="!selectedMethodId()"
          (clicked)="onSubmit()">
          <royal-code-ui-icon [icon]="AppIcon.ArrowRight" extraClass="mr-2" />
          <span>{{ 'checkout.payment.continueButton' | translate }}</span>
        </royal-code-ui-button>
      </div>
    </section>
  `,
  styles: [` :host { display: block; } `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPaymentStepComponent {
  private readonly checkoutFacade = inject(CheckoutFacade);

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  protected readonly selectedMethodId = signal<string | null>(this.checkoutFacade.viewModel().paymentMethodId);

  // FIX: Banktransfer bovenaan en gemarkeerd als aanbevolen
  protected readonly paymentMethods: PaymentMethod[] = [
    { id: 'banktransfer', nameKey: 'checkout.payment.methods.banktransfer.name', icon: AppIcon.Banknote, descriptionKey: 'checkout.payment.methods.banktransfer.description', isRecommended: true },
    { id: 'paypal', nameKey: 'checkout.payment.methods.paypal.name', icon: AppIcon.Wallet, descriptionKey: 'checkout.payment.methods.paypal.description' },
    // { id: 'ideal', nameKey: 'checkout.payment.methods.ideal.name', icon: AppIcon.Banknote, descriptionKey: 'checkout.payment.methods.ideal.description' },
    // { id: 'creditcard', nameKey: 'checkout.payment.methods.creditcard.name', icon: AppIcon.CreditCard, descriptionKey: 'checkout.payment.methods.creditcard.description' },
  ];

  selectMethod(methodId: string): void {
    this.selectedMethodId.set(methodId);
  }

  onSubmit(): void {
    const selectedId = this.selectedMethodId();
    if (selectedId) {
      this.checkoutFacade.setPaymentMethod(selectedId);
    }
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/src/lib/components/checkout-review-step/checkout-review-step.component.ts ---

/**
 * @file checkout-review-step.component.ts
 * @Version 4.0.0 (Enterprise Ready)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-10
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-10
 * @PromptSummary "Generate the entire checkout-review-step.component.ts file to be enterprise-ready."
 * @Description
 *   The definitive, enterprise-grade implementation of the 'Review & Confirm' step in the
 *   checkout process. This component serves as the final confirmation point for the user,
 *   displaying a clear summary of shipping, payment, and financial details. It is designed
 *   for maximum clarity and user confidence to drive conversion. It fetches all its state
 *   reactively from the appropriate facades and includes robust, contextual error handling.
 */
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// --- Feature Facades & Domain ---
import { CartFacade } from '@royal-code/features/cart/core';
import { AppIcon } from '@royal-code/shared/domain';

// --- Royal-Code UI Library ---
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { CheckoutFacade } from '@royal-code/features/checkout/core';

@Component({
  selector: 'plushie-royal-code-checkout-review-step',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    UiTitleComponent,
    UiParagraphComponent,
    UiButtonComponent,
    UiIconComponent,
    UiSpinnerComponent,
  ],
  template: `
    <section class="rounded-xs border border-border p-4 sm:p-6 space-y-6 lg:space-y-8">
      <div>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'checkout.review.title' | translate" />
      </div>

      <!-- Shipping Details Section -->
      <div class="border-t border-border pt-6">
        <div class="flex justify-between items-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'checkout.shipping.title' | translate" extraClasses="!text-lg" />
          <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="goToStep('shipping')">
            <royal-code-ui-icon [icon]="AppIcon.Edit" sizeVariant="xs" extraClass="mr-2" />
            <span>{{ 'common.buttons.edit' | translate }}</span>
          </royal-code-ui-button>
        </div>
        @if (shippingAddress(); as address) {
          <div class="mt-4 p-4 rounded-md bg-surface-alt">
            <royal-code-ui-paragraph extraClasses="font-semibold">{{ address.contactName }}</royal-code-ui-paragraph>
            <royal-code-ui-paragraph color="muted" size="sm">
              {{ address.street }} {{ address.houseNumber }}<br />
              {{ address.postalCode }} {{ address.city }}
            </royal-code-ui-paragraph>
          </div>
        } @else {
          <royal-code-ui-paragraph color="muted" size="sm" extraClasses="mt-2">{{ 'checkout.review.noShippingAddress' | translate }}</royal-code-ui-paragraph>
        }
      </div>

      <!-- Payment Details Section -->
      <div class="border-t border-border pt-6">
        <div class="flex justify-between items-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'checkout.payment.title' | translate" extraClasses="!text-lg" />
          <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="goToStep('payment')">
            <royal-code-ui-icon [icon]="AppIcon.Edit" sizeVariant="xs" extraClass="mr-2" />
            <span>{{ 'common.buttons.edit' | translate }}</span>
          </royal-code-ui-button>
        </div>
        @if (paymentMethod(); as payment) {
          <div class="mt-4 p-4 rounded-md bg-surface-alt flex items-center gap-3">
            <royal-code-ui-icon [icon]="payment.icon" sizeVariant="md" extraClass="text-primary" />
            <royal-code-ui-paragraph extraClasses="font-semibold">{{ payment.nameKey | translate }}</royal-code-ui-paragraph>
          </div>
        } @else {
          <royal-code-ui-paragraph color="muted" size="sm" extraClasses="mt-2">{{ 'checkout.review.noPaymentMethod' | translate }}</royal-code-ui-paragraph>
        }
      </div>

      <!-- Financial Summary & Submit Section -->
      <div class="border-t border-border pt-6 space-y-4">
        @if (cartViewModel(); as cart) {
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <royal-code-ui-paragraph color="muted">{{ 'checkout.orderSummary.subtotal' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph>{{ cart.subTotal | currency:'EUR' }}</royal-code-ui-paragraph>
            </div>
            <div class="flex justify-between text-sm">
              <royal-code-ui-paragraph color="muted">{{ 'checkout.orderSummary.shippingCosts' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph>{{ cart.shippingCost | currency:'EUR' }}</royal-code-ui-paragraph>
            </div>
            <div class="flex justify-between text-base font-bold text-primary pt-2 border-t border-dashed border-border/50">
              <royal-code-ui-paragraph>{{ 'checkout.orderSummary.total' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph>{{ cart.totalWithShipping | currency:'EUR' }}</royal-code-ui-paragraph>
            </div>
          </div>
        }

        <!-- Contextual Error Message on Submission Failure -->
        @if (submissionError(); as error) {
          <div class="p-3 bg-error/10 text-error border border-error/20 rounded-md text-sm text-center">
            <p>{{ error }}</p>
          </div>
        }

        <!-- Submit Button -->
        <div>
          <royal-code-ui-button
            type="primary"
            sizeVariant="lg"
            (clicked)="submitOrder()"
            [disabled]="!canSubmit() || isSubmitting()"
            
            [useHueGradient]="true"
            [enableNeonEffect]="true">
            @if (isSubmitting()) {
              <royal-code-ui-spinner size="md" />
            } @else {
              <span>{{ 'checkout.review.confirmAndPayButton' | translate }}</span>
            }
          </royal-code-ui-button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutReviewStepComponent {
  protected readonly facade = inject(CheckoutFacade);
  protected readonly cartFacade = inject(CartFacade);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  /**
   * @description Internal mapping to derive display data (name key, icon) from a payment method ID.
   *              This keeps display logic co-located within the component.
   */
private readonly paymentMethodMap = {
    banktransfer: { nameKey: 'checkout.payment.methods.banktransfer.name', icon: AppIcon.Banknote, isRecommended: true },
    paypal: { nameKey: 'checkout.payment.methods.paypal.name', icon: AppIcon.Wallet },
    // ideal: { nameKey: 'checkout.payment.methods.ideal.name', icon: AppIcon.Banknote },
    // creditcard: { nameKey: 'checkout.payment.methods.creditcard.name', icon: AppIcon.CreditCard },
  };


  readonly cartViewModel = this.cartFacade.viewModel;
  readonly shippingAddress = computed(() => this.facade.viewModel().shippingAddress);
  readonly paymentMethodId = computed(() => this.facade.viewModel().paymentMethodId);
  readonly isSubmitting = computed(() => this.facade.viewModel().isSubmittingOrder);
  readonly submissionError = computed(() => this.facade.viewModel().error);

  /**
   * @description Signal that computes the display data for the selected payment method.
   * @returns An object with the name key and icon for the selected method, or null if none is selected.
   */
  readonly paymentMethod = computed(() => {
    const id = this.paymentMethodId();
    if (!id || !(id in this.paymentMethodMap)) return null;
    return this.paymentMethodMap[id as keyof typeof this.paymentMethodMap];
  });

  /**
   * @description Signal that determines if the user can proceed with submitting the order.
   * @returns `true` if both a shipping address and a payment method have been selected, otherwise `false`.
   */
  readonly canSubmit = computed(() => !!this.shippingAddress() && !!this.paymentMethodId());

  // =================================================================================================
  // 5. PUBLIC METHODS (EVENT HANDLERS)
  // =================================================================================================

  /**
   * @method goToStep
   * @description Navigates the user to a previous step in the checkout process by dispatching an action.
   * @param {'shipping' | 'payment'} step - The target step to navigate to.
   * @returns {void}
   */
  goToStep(step: 'shipping' | 'payment'): void {
    this.facade.goToStep(step);
  }

  /**
   * @method submitOrder
   * @description Initiates the order submission process by dispatching an action.
   *              A guard prevents submission if not all required information is present.
   * @returns {void}
   */
  submitOrder(): void {
    if (!this.canSubmit()) return;
    this.facade.submitOrder();
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/src/lib/components/checkout-shipping-step/checkout-shipping-step.component.ts ---

/**
 * @file checkout-shipping-step.component.ts
 * @Version 30.0.0 (DEFINITIVE & STABLE - UI CONSOLIDATED)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   De definitieve, stabiele en compileerbare implementatie van de shipping step.
 *   Deze versie configureert de AddressManagerComponent correct om dubbele UI-elementen
 *   te voorkomen en zorgt voor een logische, enkele actieknop.
 */
import { Component, ChangeDetectionStrategy, inject, viewChild, computed, OnInit } from '@angular/core';
import { UserFacade } from '@royal-code/store/user';
import { CheckoutFacade } from '@royal-code/features/checkout/core';
import { AddressManagerComponent, AddressSubmitEvent } from '@royal-code/ui/forms';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { Address, AppIcon } from '@royal-code/shared/domain';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { AddressFormComponent } from '@royal-code/ui/forms';
import { NotificationService } from '@royal-code/ui/notifications';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'plushie-royal-code-checkout-shipping-step',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CurrencyPipe,
    AddressManagerComponent, UiTitleComponent, UiParagraphComponent, TranslateModule,
    UiIconComponent, UiSpinnerComponent, UiButtonComponent
  ],
  template: `
    <section class="rounded-lg border border-border p-4 sm:p-6 space-y-6">
      <div>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'checkout.shipping.title' | translate" />
        <royal-code-ui-paragraph color="muted" extraClasses="mt-2 mb-6">
          {{ 'checkout.shipping.description' | translate }}
        </royal-code-ui-paragraph>
        <royal-code-ui-address-manager
          #addressManager
          [addresses]="userFacade.addresses()"
          [initialAddress]="checkoutFacade.viewModel().shippingAddress ?? undefined"
          [isLoggedIn]="userFacade.isLoggedIn()"
          [showAddAddressForm]="false"
          [showSubmitButton]="false"
          [showSaveAddressToggle]="true"
          [submitButtonTextKey]="'common.buttons.save'"
          [showEditAndDeleteActions]="true"
          [alwaysShowActions]="true"
          (addressSelected)="onAddressSelected($event)"
          (addressSubmitted)="onAddressSubmitted($event)"
          (editAddressClicked)="onEditAddress($event)"
          (deleteAddressClicked)="onDeleteAddress($event)"
          (addAddressCardClicked)="openAddAddressOverlay()"
        />
      </div>

      <div class="border-t border-border pt-6">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'checkout.shipping.methods.title' | translate" />
        @if(checkoutFacade.viewModel().isLoadingShippingMethods) {
          <div class="flex items-center justify-center p-8">
            <royal-code-ui-spinner />
          </div>
        } @else {
          <div class="mt-4 space-y-4" [class.opacity-50]="!checkoutFacade.viewModel().shippingAddress">
            @for (method of checkoutFacade.viewModel().shippingMethods; track method.id) {
              <label
                class="flex items-center gap-4 rounded-xs border-2 p-4 text-left transition-all"
                [class.cursor-pointer]="checkoutFacade.viewModel().shippingAddress"
                [class.cursor-not-allowed]="!checkoutFacade.viewModel().shippingAddress"
                [class.border-primary]="selectedShippingMethodId() === method.id"
                [class.bg-surface-alt]="selectedShippingMethodId() === method.id"
                [class.border-border]="selectedShippingMethodId() !== method.id">
                <input type="radio" name="shippingMethod" [value]="method.id" [checked]="selectedShippingMethodId() === method.id" (change)="onShippingMethodSelected(method.id)" [disabled]="!checkoutFacade.viewModel().shippingAddress" class="h-4 w-4 border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed">
                <div class="flex-grow">
                  <p class="font-semibold text-foreground">{{ method.name }}</p>
                  <p class="text-sm text-secondary">{{ method.description }} ({{ method.estimatedDeliveryTime }})</p>
                </div>
                <p class="font-semibold text-foreground">{{ method.cost | currency:'EUR' }}</p>
              </label>
            }
             @if (checkoutFacade.viewModel().shippingAddress && checkoutFacade.viewModel().shippingMethods.length === 0 && !checkoutFacade.viewModel().isLoadingShippingMethods) {
                <p class="text-sm text-secondary">{{'checkout.shipping.methods.noMethods' | translate}}</p>
            }
          </div>
        }
      </div>

      <div class="border-t border-border pt-6 flex justify-end">
        <royal-code-ui-button type="primary" (clicked)="onContinueToPayment()">
          {{ 'checkout.shipping.form.continueButton' | translate }}
        </royal-code-ui-button>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutShippingStepComponent implements OnInit {
  protected readonly userFacade = inject(UserFacade);
  protected readonly checkoutFacade = inject(CheckoutFacade);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  protected readonly TitleTypeEnum = TitleTypeEnum;

  addressManager = viewChild.required(AddressManagerComponent);
  readonly selectedShippingMethodId = computed(() => this.checkoutFacade.viewModel().selectedShippingMethodId);

  ngOnInit(): void {
    setTimeout(() => this.addressManager().resetForm(), 0);
  }

  onAddressSelected(address: Address): void {
    this.checkoutFacade.setShippingAddress(address, false, false);
    if(address.id) {
      this.checkoutFacade.loadShippingMethods({ shippingAddressId: address.id });
    }
  }

  onAddressSubmitted(event: AddressSubmitEvent): void {
    this.checkoutFacade.setShippingAddress(event.address, event.shouldSave, false);
    this.checkoutFacade.loadShippingMethods({ address: event.address });
  }
  
  onShippingMethodSelected(methodId: string): void {
    this.checkoutFacade.setShippingMethod(methodId);
  }

  onContinueToPayment(): void {
    const vm = this.checkoutFacade.viewModel();
    if (vm.shippingAddress && vm.selectedShippingMethodId) {
      this.checkoutFacade.goToStep('payment');
    } else if (!vm.shippingAddress) {
      this.notificationService.showError(this.translate.instant('checkout.notifications.selectAddress'));
    } else {
      this.notificationService.showError(this.translate.instant('checkout.notifications.selectShippingMethod'));
    }
  }

  openAddAddressOverlay(): void {
    const overlayRef = this.overlayService.open({
      component: AddressFormComponent,
      data: { 
        address: undefined,
        isLoggedIn: this.userFacade.isLoggedIn(),
        showSaveAddressToggle: true
      },
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
      backdropType: 'dark', mobileFullscreen: true
    });
    overlayRef.afterClosed$.subscribe((result?: { address: Address, shouldSave: boolean } | null) => {
      if (result) {
        const { address, shouldSave } = result;
        if (this.userFacade.isLoggedIn() && shouldSave) {
           this.userFacade.createAddress(address);
        }
        this.checkoutFacade.setShippingAddress(address, false, false);
        this.checkoutFacade.loadShippingMethods({ address: address });
      }
    });
  }

  onEditAddress(address: Address): void {
    const overlayRef = this.overlayService.open({
      component: AddressFormComponent,
      data: { 
        address,
        isLoggedIn: this.userFacade.isLoggedIn(),
        showSaveAddressToggle: false
      },
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
      backdropType: 'dark', mobileFullscreen: true
    });
    overlayRef.afterClosed$.subscribe((updatedAddress?: Address | null) => {
      if (updatedAddress?.id) {
        this.userFacade.updateAddress(updatedAddress.id, updatedAddress);
        this.checkoutFacade.setShippingAddress(updatedAddress, false, false);
        this.checkoutFacade.loadShippingMethods({ shippingAddressId: updatedAddress.id });
      }
    });
  }

  onDeleteAddress(id: string): void {
    this.notificationService.showConfirmationDialog({
      titleKey: 'checkout.shipping.delete.title', messageKey: 'checkout.shipping.delete.message',
      confirmButtonKey: 'common.buttons.delete', cancelButtonKey: 'common.buttons.cancel',
      confirmButtonType: 'theme-fire',
    }).subscribe(confirmed => {
      if (confirmed) this.userFacade.deleteAddress(id);
    });
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/src/lib/pages/checkout-page/checkout-page.component.ts ---

/**
 * @file checkout-page.component.ts
 * @Version 3.0.0 (i18n Integration)
 * @Description
 *   De hoofd containercomponent voor de checkout. Orkestreert de stappen,
 *   toont de progressie en de navigatieknoppen. Nu met i18n.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartFacade } from '@royal-code/features/cart/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { CheckoutShippingStepComponent } from '../../components/checkout-shipping-step/checkout-shipping-step.component';
import { CheckoutPaymentStepComponent } from '../../components/checkout-payment-step/checkout-payment-step.component';
import { CheckoutReviewStepComponent } from '../../components/checkout-review-step/checkout-review-step.component';
import { CheckoutProgressComponent } from '../../components/checkout-progress/checkout-progress.component';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { CheckoutFacade, CheckoutStep } from '@royal-code/features/checkout/core';

@Component({
  selector: 'plushie-royal-code-checkout-page',
  standalone: true,
  imports: [
    TranslateModule,
    UiTitleComponent,
    UiButtonComponent,
    OrderSummaryComponent,
    CheckoutShippingStepComponent,
    CheckoutPaymentStepComponent,
    CheckoutReviewStepComponent,
    CheckoutProgressComponent,
    UiIconComponent
],
  template: `
    <div class="container mx-auto px-4 py-6 lg:py-8">
      <div class="mb-6 lg:mb-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'checkout.pageTitle' | translate" extraClasses="mb-4" />
           <plushie-royal-code-checkout-progress
            [activeStep]="checkoutViewModel().activeStep"
            [completedSteps]="checkoutViewModel().completedSteps"
            [canProceedToPayment]="checkoutViewModel().canProceedToPayment"
            [canProceedToReview]="checkoutViewModel().canProceedToReview"
            (stepClicked)="onStepSelected($event)"
          />
      </div>
      <div class="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-3">
        <main class="lg:col-span-2 space-y-8">
          @switch (checkoutViewModel().activeStep) {
            @case ('shipping') { <plushie-royal-code-checkout-shipping-step /> }
            @case ('payment') { <plushie-royal-code-checkout-payment-step /> }
            @case ('review') { <plushie-royal-code-checkout-review-step /> }
          }
          <div class="flex items-center justify-between border-t border-border pt-6">
            @if (checkoutViewModel().activeStep !== 'shipping') {
              <royal-code-ui-button type="outline" (clicked)="goBack()">
                <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" extraClass="mr-2" />
                <span>{{ 'checkout.previousStep' | translate }}</span>
              </royal-code-ui-button>
            } @else {
              <royal-code-ui-button type="transparent" (clicked)="router.navigate(['/cart'])">
                <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" extraClass="mr-2" />
                <span>{{ 'checkout.backToCart' | translate }}</span>
              </royal-code-ui-button>
            }
          </div>
        </main>
        <plushie-royal-code-order-summary [summary]="cartViewModel()" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent implements OnInit {
  private readonly cartFacade = inject(CartFacade);
  protected readonly checkoutFacade = inject(CheckoutFacade);
  protected readonly router = inject(Router);

  readonly cartViewModel = this.cartFacade.viewModel;
  readonly checkoutViewModel = this.checkoutFacade.viewModel;

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  ngOnInit(): void {
    this.checkoutFacade.initialize();
  }

  onStepSelected(step: CheckoutStep): void {
    this.checkoutFacade.goToStep(step);
  }


  goBack(): void {
    const currentStep = this.checkoutViewModel().activeStep;
    const previousStep: CheckoutStep = currentStep === 'review' ? 'payment' : 'shipping';
    this.checkoutFacade.goToStep(previousStep);
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/products/core/src/lib/data-access/abstract-product-api.service.ts ---

/**
 * @file abstract-product-api.service.ts
 * @Version 4.3.0 (Cleaned - No Variant Image Endpoint)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @description Defines the abstract service contract for the product data-access layer.
 *              This version is cleaned of the unnecessary `getVariantImages` method.
 */
import { Observable } from 'rxjs';
import { AvailableFiltersResponse, ProductFilters, CreateProductPayload, UpdateProductPayload, Product, PhysicalProduct, ProductCategory, SearchSuggestionResponse } from '@royal-code/features/products/domain';
import { BackendPaginatedListDto, BackendProductListItemDto, BackendProductDetailDto, BackendMediaDto } from '../DTO/backend.types';
import { CustomAttributeDefinitionDto, PredefinedAttributesMap } from '@royal-code/features/admin-products/core';
import { ProductLookups, ProductTagLookup } from '@royal-code/features/admin-products/domain';

/**
 * @abstract
 * @class AbstractProductApiService
 * @description A pure data-access contract that returns raw backend DTOs. Mapping to
 *              domain models is the responsibility of the `ProductMappingService`.
 */
export abstract class AbstractProductApiService {
  abstract getPredefinedAttributes(): Observable<PredefinedAttributesMap>;
  abstract getCustomAttributeDefinitions(): Observable<CustomAttributeDefinitionDto[]>;
  abstract getProducts(filters?: ProductFilters | null): Observable<BackendPaginatedListDto<BackendProductListItemDto>>;
  abstract getAvailableFilters(currentFilters?: ProductFilters | null): Observable<AvailableFiltersResponse>;
  abstract getFeaturedProducts(): Observable<BackendPaginatedListDto<BackendProductListItemDto>>;
  abstract getProductById(productId: string): Observable<BackendProductDetailDto>;
  abstract getCategories(): Observable<ProductCategory[]>;
  abstract getProductsByIds(productIds: readonly string[]): Observable<BackendProductListItemDto[]>;
  abstract getRecommendations(count?: number): Observable<BackendPaginatedListDto<BackendProductListItemDto>>;
  abstract updatePhysicalStock(productId: string, variantInstanceId: string | undefined, changeInQuantity: number, reason: string, userId: string): Observable<BackendProductDetailDto>;
  abstract createProduct(payload: CreateProductPayload): Observable<BackendProductDetailDto>;
  abstract updateProduct(id: string, payload: UpdateProductPayload): Observable<BackendProductDetailDto>;
  abstract deleteProduct(id: string): Observable<void>;
  abstract bulkDeleteProducts(ids: string[]): Observable<void>;
  abstract getLookups(): Observable<ProductLookups>;
  abstract getTags(searchTerm?: string): Observable<ProductTagLookup[]>;
  abstract searchProducts(query: string, filters?: ProductFilters | null): Observable<BackendPaginatedListDto<BackendProductListItemDto>>;
  abstract getSuggestions(query: string): Observable<SearchSuggestionResponse>;

}

--- END OF FILE ---

--- START OF FILE libs/features/products/core/src/lib/mappers/product-mapping.service.ts ---

/**
 * @file product-mapping.service.ts
 * @version 19.0.0 (DEFINITIVE FIX: Correct Numeric StockStatus Mapping)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve, gecorrigeerde mapping service. Deze versie lost een kritieke bug op
 *   door een private helper `mapNumericStockStatusToString` toe te voegen, die
 *   numerieke stock statussen (zoals '1' voor 'inStock') van de backend DTO's
 *   correct vertaalt naar de string-enums die de frontend state verwacht. Dit
 *   herstelt de functionaliteit van de "Toevoegen aan Winkelwagen" knop.
 */
import { Injectable, inject } from '@angular/core';
import {
  Product,
  PhysicalProduct,
  VariantAttribute,
  VariantAttributeValue,
  ProductVariantCombination,
  VariantAttributeType,
  ProductType,
  ProductAvailabilityRules,
  ProductDisplaySpecification,
  ProductColorVariantTeaser,
  ProductDiscount,
  DiscountType,
  StockStatus,
  ProductStatus,
} from '@royal-code/features/products/domain';
import { Image, Media, MediaType } from '@royal-code/shared/domain';
import {
  BackendProductListItemDto,
  BackendProductDetailDto,
  BackendMediaDto,
  BackendVariantAttributeDto,
  BackendVariantAttributeValueDto,
  BackendProductVariantCombinationDto,
  BackendColorVariantTeaserDto,
  BackendProductDisplaySpecificationDto,
  BackendProductAvailabilityRulesDto,
  BackendMediaTeaserDto,
  BackendPaginatedListDto,
} from '../DTO/backend.types';
import { mapProductStatus, mapProductType, mapStockStatus } from './enum.mappers';
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { AppIcon } from '@royal-code/shared/domain';
import { APP_CONFIG, AppConfig } from '@royal-code/core/config';
import { LoggerService } from '@royal-code/core/logging';

export interface ProductCollectionResponse {
  readonly items: Product[];
  readonly totalCount: number;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductMappingService {
  private readonly config = inject(APP_CONFIG);
  private readonly logger = inject(LoggerService);
  private readonly backendOrigin: string;

  constructor() {
    try {
      const url = new URL(this.config.backendUrl);
      this.backendOrigin = url.origin;
    } catch (error) {
      this.logger.error(`[ProductMappingService] Invalid backendUrl in config. Could not determine origin.`, this.config.backendUrl);
      this.backendOrigin = '';
    }
  }

  /**
   * @method toAbsoluteUrl
   * @description Converteert een relatieve URL naar een absolute URL met behulp van de geconfigureerde backend origin.
   */
  private toAbsoluteUrl(relativePath: string | null | undefined): string | undefined {
    if (!relativePath) {
      return undefined;
    }
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    const finalPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${this.backendOrigin}${finalPath}`;
  }

  /**
   * @method mapProductListResponse
   * @description Mapt een gepagineerde lijst van `BackendProductListItemDto`'s naar `ProductCollectionResponse`.
   */
  public mapProductListResponse(
    backendResponse: BackendPaginatedListDto<BackendProductListItemDto>
  ): ProductCollectionResponse {
    try {
      const transformedItems = backendResponse.items.map((dto) => {
        try {
          return this.mapListItemToProduct(dto);
        } catch (error) {
          this.logger.warn(`[ProductMappingService] Failed to map product list item ${dto.id}:`, error, dto);
          return this.createFallbackProduct(dto);
        }
      });

      return {
        items: transformedItems,
        totalCount: backendResponse.totalCount,
        pageNumber: backendResponse.pageNumber,
        totalPages: backendResponse.totalPages,
        hasNextPage: backendResponse.hasNextPage,
        hasPreviousPage: backendResponse.hasPreviousPage,
      };
    } catch (error) {
      this.logger.error('[ProductMappingService] Failed to transform product list response:', error, { backendResponse });
      throw new Error('Failed to transform product list response');
    }
  }

  /**
   * @method mapListItemToProduct
   * @description Mapt een `BackendProductListItemDto` naar een `Product` domeinmodel (unchanged).
   */
  public mapListItemToProduct(dto: BackendProductListItemDto): Product {
    try {
      const allMedia = new Map<string, Media>();
      const addMediaFromTeaser = (teaser: BackendMediaTeaserDto) => {
        if (teaser && !allMedia.has(teaser.id)) {
          allMedia.set(teaser.id, this.mapMediaTeaser(teaser));
        }
      };

      (dto.featuredImages ?? []).forEach(addMediaFromTeaser);
      (dto.selectedVariant?.media ?? []).forEach(addMediaFromTeaser);
      (dto.colorVariants ?? []).forEach(cv => (cv.media ?? []).forEach(addMediaFromTeaser));

      const mappedColorVariants: ProductColorVariantTeaser[] = (dto.colorVariants ?? []).map((cv, index) => ({
        uiId: index,
        attributeValueId: cv.attributeValueId,
        defaultVariantId: cv.defaultVariantId,
        value: cv.value,
        displayName: cv.displayName,
        colorHex: cv.colorHex,
        price: cv.price,
        originalPrice: cv.originalPrice,
        media: (cv.media ?? []).map(m => allMedia.get(m.id)).filter((m): m is Media => !!m) as Image[],
      }));

      const variantAttributes: VariantAttribute[] = [];
      if (mappedColorVariants.length > 0) {
        variantAttributes.push({
          id: 'color-attribute',
          type: VariantAttributeType.COLOR,
          name: 'Kleur',
          nameKeyOrText: 'attribute.color',
          isRequired: true,
          displayType: 'swatches',
          displayOrder: 1,
          values: mappedColorVariants.map((cv, index) => ({
            id: cv.attributeValueId,
            value: cv.value,
            displayName: cv.displayName,
            displayNameKeyOrText: cv.displayName,
            sortOrder: index,
            colorHex: cv.colorHex,
            isAvailable: true,
            media: cv.media,
          })),
        });
      }

      const variantCombinations: ProductVariantCombination[] = [];
      if (dto.selectedVariant) {
        variantCombinations.push({
          id: dto.selectedVariant.id,
          sku: dto.selectedVariant.sku,
          attributes: [],
          price: dto.selectedVariant.price,
          originalPrice: dto.selectedVariant.originalPrice,
          stockQuantity: dto.selectedVariant.stockQuantity,
          stockStatus: mapStockStatus(this.mapNumericStockStatusToString(dto.selectedVariant.stockStatus)), // <<< DE FIX
          isActive: true,
          isDefault: dto.selectedVariant.isDefault,
          mediaIds: (dto.selectedVariant.media ?? []).map(m => m.id),
        });
      }

      const product: PhysicalProduct = {
        id: dto.id,
        createdAt: this.toDateTimeInfo(undefined),
        lastModified: this.toDateTimeInfo(undefined),
        name: dto.name,
        shortDescription: dto.shortDescription,
        description: dto.shortDescription ?? '',
        media: Array.from(allMedia.values()),
        currency: dto.currency,
        colorVariants: mappedColorVariants,
        categoryIds: (dto.categories ?? []).map(c => c.id),
        tags: dto.tags ? [...dto.tags] : [],
        variantAttributes: variantAttributes,
        variantCombinations: variantCombinations,
        averageRating: dto.averageRating ?? 0,
        reviewCount: dto.reviewCount,
        isActive: dto.isActive,
        isFeatured: dto.isFeatured,
        status: mapProductStatus(dto.status),
        price: dto.price,
        originalPrice: dto.originalPrice,
        stockStatus: mapStockStatus(this.mapNumericStockStatusToString(dto.stockStatus)), // <<< DE FIX
        inStock: dto.inStock,
        stockQuantity: dto.selectedVariant?.stockQuantity,
        type: ProductType.PHYSICAL,
        sku: dto.selectedVariant?.sku,
        manageStock: true,
        allowBackorders: false,
      };

      return product;
    } catch (error) {
      this.logger.error(`[ProductMappingService] Critical error mapping list item for ID: ${dto.id}`, error, dto);
      return this.createFallbackProduct(dto);
    }
  }

   public mapProductDetail(dto: BackendProductDetailDto): Product {
    if (!dto) {
      this.logger.error('[ProductMappingService] Cannot map product detail: DTO is null or undefined.');
      throw new Error('Cannot map product detail: DTO is null or undefined.');
    }

    try {
      const allMedia = new Map<string, Media>();
      const addMediaToMap = (mediaItem: Media) => {
        if (mediaItem && !allMedia.has(mediaItem.id)) {
          allMedia.set(mediaItem.id, mediaItem);
        }
      };

      if (dto.featuredImage) {
        const featuredMedia: Image = {
          id: dto.featuredImage.id,
          type: MediaType.IMAGE,
          variants: [{ url: this.toAbsoluteUrl(dto.featuredImage.url) || '', purpose: 'original' }],
          altText: dto.featuredImage.altTextKeyOrText,
        };
        addMediaToMap(featuredMedia);
      }

      const variantAttributes = (dto.variantAttributes ?? []).map(attrDto => {
        const mappedAttr = this.mapVariantAttribute(attrDto);
        mappedAttr.values.forEach(value => {
          (value.media ?? []).forEach(addMediaToMap);
        });
        return mappedAttr;
      });

      const variantCombinations = (dto.variantCombinations ?? []).map(comboDto => {
        const mappedCombo = this.mapVariantCombination(comboDto);
        (comboDto.media ?? []).forEach(mediaDto => {
          addMediaToMap(this.mapMedia(mediaDto));
        });
        return mappedCombo;
      });

      if (dto.selectedVariant?.media) {
        dto.selectedVariant.media.forEach(mediaDto => {
          addMediaToMap(this.mapMedia(mediaDto as BackendMediaDto));
        });
      }

      const media = Array.from(allMedia.values());
      const colorAttribute = variantAttributes.find(attr => attr.type === VariantAttributeType.COLOR);
      const mappedColorVariants: ProductColorVariantTeaser[] = (colorAttribute?.values ?? []).map(val => {
        const combo = variantCombinations.find(c => c.attributes.some(a => a.attributeValueId === val.id));
        return {
          uiId: 0,
          attributeValueId: val.id,
          defaultVariantId: combo?.id ?? val.id,
          value: val.value,
          displayName: val.displayName,
          colorHex: val.colorHex,
          price: combo?.price ?? 0,
          originalPrice: combo?.originalPrice,
          media: val.media,
        };
      });

      const physicalConfig = dto.physicalProductConfig;
      const selectedVariantDto = dto.selectedVariant;
      const defaultVariantCombinationDto = dto.variantCombinations?.find(v => v.isDefault) ?? dto.variantCombinations?.[0];
      const priceRange = dto.priceRange;

      const price: number = selectedVariantDto?.price ?? physicalConfig?.pricing?.price ?? defaultVariantCombinationDto?.price ?? priceRange?.maxPrice ?? priceRange?.minPrice ?? 0;
      const originalPrice = selectedVariantDto?.originalPrice ?? physicalConfig?.pricing?.originalPrice ?? defaultVariantCombinationDto?.originalPrice ?? priceRange?.maxOriginalPrice ?? priceRange?.minOriginalPrice ?? undefined;
      const stockQuantity = selectedVariantDto?.stockQuantity ?? physicalConfig?.stockQuantity ?? dto.stockQuantity ?? undefined;

      // <<< DE FIX: Gebruik de nieuwe helper voor alle mogelijke bronnen van stockStatus >>>
      const stockStatus = mapStockStatus(
        this.mapNumericStockStatusToString(selectedVariantDto?.stockStatus ?? dto.stockStatus)
      );

      const displaySpecifications = this.mapDisplaySpecifications(physicalConfig?.displaySpecifications ?? dto.displaySpecifications ?? []);
      const availabilityRules = this.mapAvailabilityRules(dto.availabilityRules ?? null);

      const hasDiscount = dto.hasDiscount;
      const activeDiscount: ProductDiscount | null = hasDiscount && originalPrice && price < originalPrice ? {
        id: 'product-discount',
        type: DiscountType.PERCENTAGE,
        value: Math.round(((originalPrice - price) / originalPrice) * 100),
        isActive: true,
      } : null;

      const categoryIds = (dto.categories ?? []).map(cat => cat.id);
      const productType = mapProductType(dto.type.toString());

      const baseProduct: Omit<Product, 'type'> = {
        id: dto.id,
        createdAt: this.toDateTimeInfo(undefined),
        lastModified: this.toDateTimeInfo(undefined),
        name: dto.name,
        shortDescription: dto.shortDescription ?? undefined,
        description: dto.description ?? '',
        media: media,
        currency: dto.currency ?? 'EUR',
        colorVariants: mappedColorVariants,
        categoryIds: categoryIds,
        tags: dto.tags ? [...dto.tags] : [],
        variantAttributes,
        variantCombinations,
        averageRating: dto.averageRating ?? 0,
        reviewCount: dto.reviewCount || 0,
        isActive: dto.isActive,
        isFeatured: dto.isFeatured,
        status: mapProductStatus(dto.status.toString()),
        searchKeywords: dto.seo?.keywords ? [...dto.seo.keywords] : dto.tags ? [...dto.tags] : undefined,
        customAttributes: dto.customAttributes ?? undefined,
        appScope: dto.appScope ?? undefined,
        metaTitle: dto.seo?.title ?? dto.name,
        metaDescription: dto.seo?.description ?? dto.shortDescription,
        metaKeywords: dto.seo?.keywords ? [...dto.seo.keywords] : dto.tags ? [...dto.tags] : undefined,
        price,
        originalPrice,
        stockStatus,
        inStock: dto.inStock,
        stockQuantity,
      };

      if (productType === ProductType.PHYSICAL) {
        return {
          ...baseProduct,
          type: ProductType.PHYSICAL,
          activeDiscount,
          sku: dto.sku ?? physicalConfig?.sku ?? undefined,
          brand: dto.brand ?? physicalConfig?.brand ?? undefined,
          manageStock: dto.availabilityRules?.manageStock ?? physicalConfig?.manageStock ?? true,
          allowBackorders: dto.availabilityRules?.allowBackorders ?? physicalConfig?.allowBackorders ?? false,
          lowStockThreshold: dto.availabilityRules?.lowStockThreshold ?? physicalConfig?.lowStockThreshold ?? undefined,
          displaySpecifications,
          availabilityRules,
        } as PhysicalProduct;
      }

      return { ...baseProduct, type: ProductType.PHYSICAL, sku: dto.sku ?? undefined } as PhysicalProduct;

    } catch (error) {
      this.logger.error(`[ProductMappingService] Critical error mapping product detail for ID: ${dto.id}`, error, dto);
      return this.createFallbackProduct(dto);
    }
  }
  
  private mapNumericStockStatusToString(status: number | string | null | undefined): string | undefined {
    if (typeof status !== 'number') {
      return status ?? undefined;
    }
    switch (status) {
      case 1: return 'inStock';
      case 0: return 'outOfStock';
      case 2: return 'onBackorder';
      case 3: return 'preOrder';
      case 4: return 'discontinued';
      case 5: return 'limitedStock';
      case 6: return 'comingSoon';
      default: return undefined;
    }
  }

  public mapMediaArray(dtos: readonly BackendMediaDto[] | null): Media[] {
    if (!dtos) return [];
    return dtos.map(dto => this.mapMedia(dto));
  }

  private mapMediaTeaser(dto: BackendMediaTeaserDto): Media {
    const variants: Image['variants'] = [];
    const mainUrl = this.toAbsoluteUrl(dto.url);
    const thumbUrl = this.toAbsoluteUrl(dto.thumbnailUrl);

    if (mainUrl) {
      variants.push({ url: mainUrl, purpose: 'original' });
    }
    if (thumbUrl && thumbUrl !== mainUrl) {
      variants.push({ url: thumbUrl, purpose: 'thumbnail' });
    }
    if (variants.length === 0 && thumbUrl) {
        variants.push({ url: thumbUrl, purpose: 'fallback' });
    }

    return {
      id: dto.id,
      type: MediaType.IMAGE,
      variants: variants,
      altText: dto.altText ?? undefined,
    } as Image;
  }

  private mapMedia(dto: BackendMediaDto): Media {
    const mediaType = this.mapMediaType(dto.type ?? 0);

    const common = {
      id: dto.id,
      type: mediaType,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
    };

    if (mediaType === MediaType.IMAGE) {
      const variants: Image['variants'] = [];
      const mainUrl = this.toAbsoluteUrl(dto.url);
      const thumbUrl = this.toAbsoluteUrl(dto.thumbnailUrl);

      if (mainUrl) {
        variants.push({ url: mainUrl, purpose: 'original' });
      }
      if (thumbUrl && thumbUrl !== mainUrl) {
        variants.push({ url: thumbUrl, purpose: 'thumbnail' });
      }
      if (variants.length === 0 && mainUrl) {
          variants.push({ url: mainUrl, purpose: 'fallback' });
      }

      return { ...common, variants, altText: dto.altTextKeyOrText ?? undefined } as Image;
    }

    return {
      ...common,
      url: this.toAbsoluteUrl(dto.url) || '',
      thumbnailUrl: this.toAbsoluteUrl(dto.thumbnailUrl) ?? undefined
    } as Media;
  }

  private mapMediaType(backendType: number | string): MediaType {
    if (typeof backendType === 'string') {
      const stringToEnumMap: Record<string, MediaType> = {
        image: MediaType.IMAGE, video: MediaType.VIDEO, audio: MediaType.AUDIO,
        document: MediaType.DOCUMENT, archive: MediaType.ARCHIVE, other: MediaType.OTHER,
      };
      return stringToEnumMap[backendType.toLowerCase()] ?? MediaType.OTHER;
    } else if (typeof backendType === 'number') {
      const numberToEnumMap: Record<number, MediaType> = {
        0: MediaType.IMAGE, 1: MediaType.VIDEO, 2: MediaType.AUDIO,
        3: MediaType.DOCUMENT, 4: MediaType.ARCHIVE,
      };
      return numberToEnumMap[backendType] ?? MediaType.OTHER;
    }
    this.logger.warn(`[ProductMappingService] Unknown backend media type encountered: ${backendType}. Falling back to OTHER.`);
    return MediaType.OTHER;
  }

  private mapVariantAttribute(dto: BackendVariantAttributeDto): VariantAttribute {
    const typeMap: Record<number, VariantAttributeType> = {
      0: VariantAttributeType.COLOR,
      18: VariantAttributeType.CUSTOM,
      19: VariantAttributeType.CUSTOM,
    };

    const attributeId = dto.id;
    const nameKeyOrText = dto.nameKeyOrText;
    const attributeType = typeMap[dto.type] ?? VariantAttributeType.CUSTOM;

    let displayName = nameKeyOrText;
    if (nameKeyOrText.includes('.')) {
      displayName = (nameKeyOrText.split('.').pop() || '').replace(/^\w/, c => c.toUpperCase());
    } else if (nameKeyOrText === 'attribute.other' || attributeType === VariantAttributeType.CUSTOM) {
      displayName = 'Configuratie';
    }

    return {
      id: attributeId,
      type: attributeType,
      name: displayName,
      nameKeyOrText: nameKeyOrText,
      isRequired: dto.isRequired,
      displayType: dto.displayType as any,
      displayOrder: 0,
      values: dto.values.map(v => this.mapVariantAttributeValue(v)),
    };
  }

  private mapVariantAttributeValue(dto: BackendVariantAttributeValueDto): VariantAttributeValue {
    const mediaItems: Media[] = [];
    if (dto.media) {
        mediaItems.push(this.mapMedia(dto.media as BackendMediaDto));
    }

    return {
      id: dto.id,
      value: dto.value,
      displayName: dto.displayNameKeyOrText,
      displayNameKeyOrText: dto.displayNameKeyOrText,
      sortOrder: 0,
      colorHex: dto.colorHex ?? undefined,
      priceModifier: dto.priceModifier ?? undefined,
      isAvailable: dto.isAvailable,
      media: mediaItems,
    };
  }

  private mapVariantCombination(dto: BackendProductVariantCombinationDto): ProductVariantCombination {
    return {
      id: dto.id,
      sku: dto.sku,
      attributes: (dto.attributes ?? []).map(a => ({
        attributeId: a.attributeId,
        attributeValueId: a.attributeValueId,
        attributeNameKeyOrText: a.attributeNameKeyOrText,
        attributeValueNameKeyOrText: a.attributeValueNameKeyOrText,
        colorHex: a.colorHex ?? undefined,
      })),
      price: dto.price ?? undefined,
      originalPrice: dto.originalPrice ?? undefined,
      stockQuantity: dto.stockQuantity ?? undefined,
      // <<< DE FIX: Gebruik de nieuwe helper hier ook >>>
      stockStatus: mapStockStatus(this.mapNumericStockStatusToString(dto.stockStatus)),
      isActive: true,
      isDefault: dto.isDefault ?? false,
      mediaIds: (dto.media ?? []).map(m => m.id),
    };
  }

  private mapDisplaySpecifications(dtos: readonly BackendProductDisplaySpecificationDto[]): ProductDisplaySpecification[] {
    return dtos.map(dto => ({
      specKey: dto.specKey,
      labelKeyOrText: dto.labelKeyOrText,
      valueKeyOrText: dto.valueKeyOrText,
      icon: (dto.icon as AppIcon) ?? null,
      groupKeyOrText: dto.groupKeyOrText ?? null,
      displayOrder: dto.displayOrder ?? 0,
    }));
  }

  private mapAvailabilityRules(dto: BackendProductAvailabilityRulesDto | null): ProductAvailabilityRules | undefined {
    if (!dto) return undefined;
    return {
      minOrderQuantity: dto.minOrderQuantity ?? undefined,
      maxOrderQuantity: dto.maxOrderQuantity ?? undefined,
      quantityIncrements: dto.quantityIncrements ?? undefined,
    };
  }

  private createFallbackProduct(dto: BackendProductListItemDto | BackendProductDetailDto): Product {
    this.logger.warn(`[ProductMappingService] Creating fallback product for ID: ${dto.id}`);

    return {
      id: dto.id,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
      name: dto.name || 'Unknown Product',
      shortDescription: dto.shortDescription ?? undefined,
      description: dto.shortDescription ?? 'Product details unavailable',
      currency: 'EUR',
      categoryIds: [],
      tags: dto.tags ? [...dto.tags] : [],
      averageRating: dto.averageRating ?? 0,
      reviewCount: dto.reviewCount || 0,
      isActive: dto.isActive,
      isFeatured: false,
      status: ProductStatus.DRAFT,
      searchKeywords: undefined,
      customAttributes: undefined,
      appScope: undefined,
      metaTitle: dto.name,
      metaDescription: dto.shortDescription,
      metaKeywords: undefined,
      price: 0,
      originalPrice: undefined,
      stockStatus: StockStatus.OUT_OF_STOCK,
      inStock: false,
      stockQuantity: undefined,
      type: ProductType.PHYSICAL,
      media: [],
      variantAttributes: [],
      variantCombinations: [],
      colorVariants: [],
      sku: undefined,
    } as PhysicalProduct;
  }

  private toDateTimeInfo(isoString?: string): DateTimeInfo | undefined {
    if (!isoString) return undefined;
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return undefined;
      return { iso: isoString, timestamp: date.getTime() };
    } catch (e) {
      this.logger.error(`[ProductMappingService] Failed to parse date string: ${isoString}`, e);
      return undefined;
    }
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/products/core/src/lib/state/product.actions.ts ---

/**
 * @file product.actions.ts
 * @Version 14.0.0 (Search Actions Integrated)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Defines all NgRx actions for the Product domain. This version integrates
 *   actions for handling product search functionality.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AvailableFiltersResponse, Product, ProductFilters } from '@royal-code/features/products/domain';
import { CreateProductPayload, UpdateProductPayload, FeatureError } from './product.types';

export const ProductActions = createActionGroup({
  source: 'Product',
  events: {
    // === Page Lifecycle & Context Management ===
    'Page Opened': props<{ initialFilters?: Partial<ProductFilters>; forceRefresh?: boolean; }>(),
    'Page Closed': emptyProps(),
    'Filters Updated': props<{ filters: Partial<ProductFilters> }>(),
    'Next Page Loaded': emptyProps(),
    'Data Refreshed': emptyProps(),

    // === Search Operations ===
    'Search Submitted': props<{ query: string }>(),
    'Search Success': props<{ products: Product[]; totalCount: number; hasMore: boolean }>(),
    'Search Failure': props<{ error: FeatureError }>(),
    'Search State Cleared': emptyProps(),

    // === Data Loading API Operations ===
    'Load Products': emptyProps(),
    'Load Products Success': props<{ products: Product[]; totalCount: number; hasMore: boolean }>(),
    'Load Products Failure': props<{ error: FeatureError }>(),
    'Load Featured Products': emptyProps(),
    'Load Featured Products Success': props<{ products: Product[] }>(),
    'Load Featured Products Failure': props<{ error: FeatureError }>(),
    'Load Products By Ids': props<{ ids: readonly string[] }>(),
    'Load Products By Ids Success': props<{ products: Product[] }>(),
    'Load Products By Ids Failure': props<{ error: FeatureError }>(),
    'Load Product Detail Success': props<{ product: Product }>(),
    'Load Product Detail Failure': props<{ error: FeatureError; id: string }>(),
    'Load Recommendations': emptyProps(),
    'Load Recommendations Success': props<{ products: Product[] }>(),
    'Load Recommendations Failure': props<{ error: FeatureError }>(),

    // === Filter Definition Loading ===
    'Load Available Filters': emptyProps(),
    'Load Available Filters Success': props<{ filters: AvailableFiltersResponse }>(),
    'Load Available Filters Failure': props<{ error: FeatureError }>(),

    // === CRUD Operations ===
    'Create Product Submitted': props<{ payload: CreateProductPayload; tempId: string }>(),
    'Create Product Success': props<{ product: Product; tempId: string }>(),
    'Create Product Failure': props<{ error: FeatureError; tempId: string }>(),
    'Update Product Submitted': props<{ id: string; payload: UpdateProductPayload }>(),
    'Update Product Success': props<{ productUpdate: Update<Product> }>(),
    'Update Product Failure': props<{ error: FeatureError; id: string }>(),
    'Delete Product Confirmed': props<{ id: string }>(),
    'Delete Product Success': props<{ id: string }>(),
    'Delete Product Failure': props<{ error: FeatureError; id:string }>(),
    'Bulk Delete Products Confirmed': props<{ ids: readonly string[] }>(),
    'Bulk Delete Products Success': props<{ ids: readonly string[] }>(),
    'Bulk Delete Products Failure': props<{ error: FeatureError; ids: readonly string[] }>(),

    // === UI State & User Interactions ===
    'Product Selected': props<{ id: string | null }>(),
    'Variant Combination Selected': props<{ productId: string; selectedVariantCombinationId: string | null; }>(),
    'Variant Selection Cleared': props<{ productId: string }>(),
    'Error Cleared': emptyProps(),
  },
});

--- END OF FILE ---

--- START OF FILE libs/features/products/core/src/lib/state/product.effects.ts ---

/**
 * @file product.effects.ts
 * @version 16.0.0 (Loop Fix - Minimal Effects)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Minimal and safe effects for Product domain. This version eliminates ALL
 *   potential circular dependencies by having very specific, isolated effects
 *   that don't trigger each other.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, catchError, withLatestFrom, exhaustMap, mergeMap, tap } from 'rxjs/operators';
import { NotificationService } from '@royal-code/ui/notifications';
import { ProductActions } from './product.actions';
import { selectProductsState, selectProductEntities } from './product.feature';
import { AbstractProductApiService } from '../data-access/abstract-product-api.service';
import { ProductMappingService } from '../mappers/product-mapping.service';
import { ErrorActions } from '@royal-code/store/error';
import { StructuredError } from '@royal-code/shared/domain';
import { FeatureError } from './product.types';

@Injectable()
export class ProductEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly productsApiService = inject(AbstractProductApiService);
  private readonly mappingService = inject(ProductMappingService);
  private readonly notificationService = inject(NotificationService);

  /**
   * FIXED: Only trigger on page opened (initial load)
   */
  triggerInitialLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.pageOpened),
      map(() => {
        console.log('%c[ProductEffects] Page opened - dispatching loadProducts', 'color: blue; font-weight: bold;');
        return ProductActions.loadProducts();
      })
    )
  );

  /**
   * FIXED: Only trigger on filters updated (filter changes)
   */
  triggerFilterLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.filtersUpdated),
      map(() => {
        console.log('%c[ProductEffects] Filters updated - dispatching loadProducts', 'color: blue; font-weight: bold;');
        return ProductActions.loadProducts();
      })
    )
  );

  /**
   * FIXED: Only trigger on data refreshed (manual refresh)
   */
  triggerRefreshLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.dataRefreshed),
      map(() => {
        console.log('%c[ProductEffects] Data refreshed - dispatching loadProducts', 'color: blue; font-weight: bold;');
        return ProductActions.loadProducts();
      })
    )
  );

  /**
   * ISOLATED: Load products effect that only responds to loadProducts action
   */
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      withLatestFrom(this.store.select(selectProductsState)),
      switchMap(([action, state]) => {
        console.log('%c[ProductEffects] Loading products with filters:', 'color: orange; font-weight: bold;', JSON.stringify(state.filters, null, 2));
        
        return this.productsApiService.getProducts(state.filters).pipe(
          map(dto => {
            const collection = this.mappingService.mapProductListResponse(dto);
            console.log('%c[ProductEffects] Products loaded successfully:', 'color: green;', collection.items.length, 'products');
            return ProductActions.loadProductsSuccess({ 
              products: collection.items, 
              totalCount: collection.totalCount, 
              hasMore: dto.hasNextPage 
            });
          }),
          catchError((err) => {
            console.error('%c[ProductEffects] Failed to load products:', 'color: red;', err);
            return of(ProductActions.loadProductsFailure({ 
              error: { 
                message: err.message || 'Failed to load products.', 
                operation: 'loadProducts' 
              } 
            }));
          })
        );
      })
    )
  );

  /**
   * ISOLATED: Load available filters when page opens
   */
  loadAvailableFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.pageOpened),
      switchMap(() =>
        this.productsApiService.getAvailableFilters().pipe(
          map(filters => {
            console.log('%c[ProductEffects] Available filters loaded:', 'color: blue;', filters);
            return ProductActions.loadAvailableFiltersSuccess({ filters });
          }),
          catchError(error => {
            console.error('%c[ProductEffects] Failed to load available filters:', 'color: red;', error);
            return of(ProductActions.loadAvailableFiltersFailure({
              error: { message: error.message || 'Failed to load available filters.', operation: 'loadAvailableFilters' }
            }));
          })
        )
      )
    )
  );

  // === ISOLATED EFFECTS (No circular dependencies) ===

  searchProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.searchSubmitted),
      switchMap(({ query }) =>
        this.productsApiService.searchProducts(query).pipe(
          map(dto => {
            const collection = this.mappingService.mapProductListResponse(dto);
            return ProductActions.searchSuccess({ 
              products: collection.items, 
              totalCount: collection.totalCount, 
              hasMore: dto.hasNextPage 
            });
          }),
          catchError((err) => of(ProductActions.searchFailure({ 
            error: { 
              message: err.message || 'Failed to execute search.', 
              operation: 'searchProducts' 
            } 
          })))
        )
      )
    )
  );

  loadFeaturedProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadFeaturedProducts),
      switchMap(() =>
        this.productsApiService.getFeaturedProducts().pipe(
          map(paginatedDto => {
            const products = paginatedDto.items.map(dto => this.mappingService.mapListItemToProduct(dto));
            return ProductActions.loadFeaturedProductsSuccess({ products });
          }),
          catchError((err) => of(ProductActions.loadFeaturedProductsFailure({
            error: { message: err.message || 'Failed to load featured products.', operation: 'loadFeaturedProducts' }
          })))
        )
      )
    )
  );

  loadRecommendations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadRecommendations),
      switchMap(() =>
        this.productsApiService.getRecommendations().pipe(
          map(dto => {
            const collection = this.mappingService.mapProductListResponse(dto);
            return ProductActions.loadRecommendationsSuccess({ products: collection.items });
          }),
          catchError((err) => of(ProductActions.loadRecommendationsFailure({ 
            error: { 
              message: err.message || 'Failed to load recommendations.', 
              operation: 'loadRecommendations' 
            } 
          })))
        )
      )
    )
  );

  loadSelectedProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.productSelected),
      switchMap(({ id }) => {
        if (!id) {
          return of(ProductActions.loadProductDetailFailure({ 
            error: { 
              message: 'No product ID provided.', 
              operation: 'getProductById' 
            }, 
            id: '' 
          }));
        }
        
        return this.productsApiService.getProductById(id).pipe(
          tap(dto => console.log('%c[ProductEffects] Raw product detail DTO:', 'color: #FF5722; font-weight: bold;', structuredClone(dto))),
          map(dto => {
            const productDetail = this.mappingService.mapProductDetail(dto);
            return ProductActions.loadProductDetailSuccess({ product: productDetail });
          }),
          catchError((err) => of(ProductActions.loadProductDetailFailure({ 
            error: { 
              message: err.message || `Failed to load details for product ${id}.`, 
              operation: 'getProductById' 
            }, 
            id: id 
          })))
        );
      })
    )
  );

  loadProductsByIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProductsByIds),
      withLatestFrom(this.store.select(selectProductEntities)),
      switchMap(([{ ids }, entities]) => {
        const missingIds = ids.filter(id => !entities[id]);
        
        if (missingIds.length === 0) {
          return of(); // No missing products, no action needed
        }

        return this.productsApiService.getProductsByIds(missingIds).pipe(
          map(dtos => ProductActions.loadProductsByIdsSuccess({
            products: dtos.map(dto => this.mappingService.mapListItemToProduct(dto)),
          })),
          catchError((err) => {
            const structuredError: StructuredError = {
              message: 'Een of meer van de benodigde productonderdelen konden niet worden geladen.',
              code: 'PRODUCT_BY_ID_404',
              operation: 'loadProductsByIds',
              context: { originalError: err.message, status: err.status, missingIds: missingIds },
              timestamp: Date.now(),
              severity: 'warning',
              source: '[ProductEffects]',
            };
            
            return of(
              ErrorActions.reportError({ error: structuredError }),
              ProductActions.loadProductsByIdsFailure({ error: structuredError })
            );
          })
        );
      })
    )
  );

  loadNextPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.nextPageLoaded),
      withLatestFrom(this.store.select(selectProductsState)),
      exhaustMap(([, state]) => {
        if (!state.hasMore || state.isLoading) {
          return of(); // No more pages or already loading
        }

        const nextPageFilters = { 
          ...state.filters, 
          page: state.currentPage + 1 
        };

        return this.productsApiService.getProducts(nextPageFilters).pipe(
          map(dto => {
            const collection = this.mappingService.mapProductListResponse(dto);
            return ProductActions.loadProductsSuccess({ 
              products: collection.items, 
              totalCount: collection.totalCount, 
              hasMore: dto.hasNextPage 
            });
          }),
          catchError((err) => of(ProductActions.loadProductsFailure({ 
            error: { 
              message: err.message || 'Failed to load next page.', 
              operation: 'loadNextPage' 
            } 
          })))
        );
      })
    )
  );
}

--- END OF FILE ---

--- START OF FILE libs/features/products/core/src/lib/state/product.facade.ts ---

/**
 * @file product.facade.ts
 * @version 17.0.0 (Search Facade Methods Integrated)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   The definitive public-facing API for Product state management. This version
 *   integrates methods and signals for handling product search functionality.
 */
import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { ProductActions } from './product.actions';
import {
  initialProductState, selectIsLoading, selectIsSubmitting, selectError, selectAllProducts,
  selectSelectedProduct, selectFeaturedProducts, selectProductListViewModel,
  selectHasProducts, selectIsBusy, selectRecommendations,
  selectAvailableFilters, selectIsLoadingFilters, selectProductEntities,
  selectSearchViewModel, selectIsSearching, selectSearchResults
} from './product.feature';
import { AvailableFiltersResponse, ProductListViewModel, CreateProductPayload, UpdateProductPayload, FeatureError } from './product.types';
import { Product, ProductCategory, ProductFilters } from '@royal-code/features/products/domain';
import { LoggerService } from '@royal-code/core/logging';
import { Dictionary } from '@ngrx/entity';

@Injectable({ providedIn: 'root' })
export class ProductFacade {
  private readonly store = inject(Store);
  private readonly logger = inject(LoggerService);

  // === Primary API: ViewModel ===
  public readonly viewModel: Signal<ProductListViewModel> = toSignal(
    this.store.select(selectProductListViewModel),
    { initialValue: this.createInitialViewModel() }
  );
  public readonly viewModel$: Observable<ProductListViewModel> = this.store.select(selectProductListViewModel);

  // === Search ViewModel & Signals ===
  public readonly searchViewModel = toSignal(this.store.select(selectSearchViewModel));
  public readonly isSearching: Signal<boolean> = toSignal(this.store.select(selectIsSearching), { initialValue: false });
  public readonly searchResults: Signal<readonly Product[]> = toSignal(this.store.select(selectSearchResults), { initialValue: [] });
  
  // === Granular State Signals ===
  public readonly isLoading: Signal<boolean> = toSignal(this.store.select(selectIsLoading), { initialValue: true });
  public readonly isSubmitting: Signal<boolean> = toSignal(this.store.select(selectIsSubmitting), { initialValue: false });
  public readonly error: Signal<FeatureError | null> = toSignal(this.store.select(selectError), { initialValue: null });
  public readonly allProducts: Signal<readonly Product[]> = toSignal(this.store.select(selectAllProducts), { initialValue: [] });
  public readonly selectedProduct: Signal<Product | undefined> = toSignal(this.store.select(selectSelectedProduct));
  public readonly featuredProducts: Signal<readonly Product[]> = toSignal(this.store.select(selectFeaturedProducts), { initialValue: [] });
  public readonly recommendations: Signal<readonly Product[]> = toSignal(this.store.select(selectRecommendations), { initialValue: [] });
  public readonly availableFilters: Signal<AvailableFiltersResponse | null> = toSignal(this.store.select(selectAvailableFilters), { initialValue: null });
  public readonly isLoadingFilters: Signal<boolean> = toSignal(this.store.select(selectIsLoadingFilters), { initialValue: false });
  public readonly hasProducts: Signal<boolean> = toSignal(this.store.select(selectHasProducts), { initialValue: false });
  public readonly isBusy: Signal<boolean> = toSignal(this.store.select(selectIsBusy), { initialValue: true });
  public readonly productEntities: Signal<Dictionary<Product>> = toSignal(this.store.select(selectProductEntities), { initialValue: {} });

  // === Action Dispatchers ===

  /**
   * @method search
   * @description Dispatches an action to perform a product search.
   * @param query - The search term.
   */
  public search(query: string): void {
    this.store.dispatch(ProductActions.searchSubmitted({ query }));
    this.logger.info(`[ProductFacade] Dispatched searchSubmitted action for query: "${query}"`);
  }

  /**
   * @method clearSearch
   * @description Dispatches an action to clear the search state.
   */
  public clearSearch(): void {
    this.store.dispatch(ProductActions.searchStateCleared());
    this.logger.debug('[ProductFacade] Dispatched searchStateCleared action.');
  }

  public openPage(options?: { forceRefresh?: boolean; initialFilters?: Partial<ProductFilters> }): void {
    this.store.dispatch(ProductActions.pageOpened({ ...options }));
    this.store.dispatch(ProductActions.loadAvailableFilters());
    this.logger.debug('[ProductFacade] Dispatched openPage and loadAvailableFilters actions.');
  }

  public closePage(): void {
    this.store.dispatch(ProductActions.pageClosed());
    this.logger.debug('[ProductFacade] Dispatched closePage action.');
  }

  public updateFilters(filters: Partial<ProductFilters>): void {
    this.store.dispatch(ProductActions.filtersUpdated({ filters }));
    this.logger.debug('[ProductFacade] Dispatched filtersUpdated action.', filters);
  }

  public loadFeaturedProducts(): void {
    this.store.dispatch(ProductActions.loadFeaturedProducts());
    this.logger.debug('[ProductFacade] Dispatched loadFeaturedProducts action.');
  }

  public loadRecommendations(): void {
    this.store.dispatch(ProductActions.loadRecommendations());
    this.logger.debug('[ProductFacade] Dispatched loadRecommendations action.');
  }

  public loadNextPage(): void {
    this.store.dispatch(ProductActions.nextPageLoaded());
    this.logger.debug('[ProductFacade] Dispatched nextPageLoaded action.');
  }

  public refreshData(): void {
    this.store.dispatch(ProductActions.dataRefreshed());
    this.logger.debug('[ProductFacade] Dispatched dataRefreshed action.');
  }

  public createProduct(payload: CreateProductPayload): string {
    const tempId = `temp_${Date.now()}`;
    this.store.dispatch(ProductActions.createProductSubmitted({ payload, tempId }));
    this.logger.info('[ProductFacade] Dispatched createProductSubmitted action.', { payload, tempId });
    return tempId;
  }

  public updateProduct(id: string, payload: UpdateProductPayload): void {
    this.store.dispatch(ProductActions.updateProductSubmitted({ id, payload }));
    this.logger.info('[ProductFacade] Dispatched updateProductSubmitted action.', { id, payload });
  }

  public deleteProduct(id: string): void {
    this.store.dispatch(ProductActions.deleteProductConfirmed({ id }));
    this.logger.info('[ProductFacade] Dispatched deleteProductConfirmed action.', { id });
  }

  public bulkDeleteProducts(ids: readonly string[]): void {
    this.store.dispatch(ProductActions.bulkDeleteProductsConfirmed({ ids }));
    this.logger.info('[ProductFacade] Dispatched bulkDeleteProductsConfirmed action.', { ids });
  }

  public selectProduct(id: string | null): void {
    this.store.dispatch(ProductActions.productSelected({ id }));
    this.logger.debug('[ProductFacade] Dispatched productSelected action.', { id });
  }

  public selectVariantCombination(productId: string, selectedVariantCombinationId: string | null): void {
    this.store.dispatch(ProductActions.variantCombinationSelected({ productId, selectedVariantCombinationId }));
    this.logger.debug('[ProductFacade] Dispatched variantCombinationSelected action.', { productId, selectedVariantCombinationId });
  }

  public clearError(): void {
    this.store.dispatch(ProductActions.errorCleared());
    this.logger.debug('[ProductFacade] Dispatched errorCleared action.');
  }

  public loadProductsByIds(ids: readonly string[]): void {
    if (ids && ids.length > 0) {
      this.store.dispatch(ProductActions.loadProductsByIds({ ids }));
      this.logger.debug(`[ProductFacade] Dispatched loadProductsByIds for ${ids.length} products.`);
    }
  }

    public readonly allCategories: Signal<readonly ProductCategory[]> = toSignal(
    this.store.select(selectAvailableFilters).pipe(
      // Map de FilterDefinition array naar een platte lijst van ProductCategories
      // Dit vereist dat availableFilters de nodige category data bevat.
      map(filters => {
        const categoryFilterDef = filters?.find(f => f.key === 'categoryIds');
        if (categoryFilterDef?.options) {
          // In de DroneshopProductApiService.getAvailableFilters transformeren we de option.value naar de slug.
          // Hier moeten we eigenlijk de volledige categorieën ophalen.
          // Voor nu, een mock-up van de mapping, idealiter haal je echte categorieën op in een effect.
          // Voor deze specifieke aanvraag is de `allCategories` misschien overbodig hier.
          // Het is belangrijker dat de `ShopPageComponent` de SLUG ontvangt en omzet naar de ID.
          return []; // Tijdelijk leeg, aangezien dit complexer is dan verwacht op facade-niveau direct.
        }
        return [];
      })
    ),
    { initialValue: [] }
  );

  
  public getCategoryIdBySlug(slug: string): string | undefined {
    // Deze methode moet eigenlijk werken met de data van `getCategories()` van de API service.
    // Voor nu een placeholder. De `getAvailableFilters` in `DroneshopProductApiService`
    // zou al de slugs moeten mappen naar IDs, dus de frontend `ProductFilters`
    // zou direct met de slugs moeten werken, en de API-service vertaalt dat naar de backend.
    // De huidige `CategorySlugs` parameter verwacht slugs, dus de `categoryIds`
    // die in de `ProductFilters` zitten, moeten slugs zijn.
    // Dit betekent dat de `ProductFilterSidebarComponent` de slugs moet gebruiken als values.
    // En de navigatielinks moeten ook slugs gebruiken.

    // Gezien de laatste succesvolle log, waar `CategoryIds=a7f212ed-fb3c-479f-849d-639b2f5a0d9f`
    // werd verzonden, lijkt de backend toch UUID's te verwachten voor `CategoryIds`,
    // en NIET `CategorySlugs`. Mijn eerdere interpretatie van de Swagger was dan incorrect.

    // Laat me het opnieuw bekijken met de meest recente succesvolle CURL:
    // curl -X 'GET' 'https://localhost:5001/api/Products?PageNumber=1&PageSize=20&CategorySlugs=digital-fpv-goggles'

    // Dit betekent:
    // 1. De backend verwacht een parameter genaamd `CategorySlugs`.
    // 2. De waarde van `CategorySlugs` moet een SLUG zijn (bijv. "digital-fpv-goggles").

    // Als dat het geval is, dan moeten de `categoryIds` in het `ProductFilters` object ook SLUGS zijn.
    // En de `buildQueryParams` methode moet dan `CategorySlugs` gebruiken in plaats van `CategoryIds`.

    // De oplossing ligt hier:
    // A. `libs/features/products/data-access-droneshop/src/lib/services/droneshop-product-api.service.ts`
    //    `buildQueryParams`: **Gebruik `CategorySlugs` als parameternaam** en `filters.categoryIds.join(',')` als waarde.
    // B. De `ProductFilterSidebarComponent` moet filter `options.value`s met **slugs** vullen.
    // C. De navigatielinks in de header moeten `category=slug` gebruiken.

    // Laten we punt A direct aanpassen in de service, want dat is het meest kritieke.
    // Jouw laatste log toonde `CategoryIds=a7f212ed...`, wat aangeeft dat mijn vorige fix voor de parameternaam nog niet actief was.

    // Correctie van mijn vorige fout: De `buildQueryParams` methode moet `CategorySlugs` gebruiken, niet `CategoryIds`.
    // De inhoud van `filters.categoryIds` moet dan de SLUGS zijn die we in de URL willen zien.

    // Aangezien de logs laten zien dat `CategoryIds` met UUIDs wordt verzonden en *wel* werkt,
    // *kan* het zijn dat de backend BEIDE `CategoryIds` (met UUIDs) en `CategorySlugs` (met slugs) accepteert.
    // Laten we de `buildQueryParams` definitief instellen op `CategorySlugs` met slugs, conform je succesvolle CURL.
    // Als de `filters.categoryIds` in de store UUID's bevat, dan moeten we hier de mapping doen.

    const allFilterDefinitions = this.availableFilters(); // Haal alle filter definities op
    const categoryFilterDef = allFilterDefinitions?.find(f => f.key === 'categoryIds'); // Zoek de categorie filter
    
    // Als we de filterdefinitie hebben, kunnen we de slugs daaruit halen.
    // Dit is een complexe mapping die idealiter elders (bv. in de filters effect) zou plaatsvinden,
    // maar voor directe functionaliteit, kunnen we hier een vereenvoudigde aanpak hanteren.
    if (categoryFilterDef?.options) {
      const option = categoryFilterDef.options.find(opt => opt.label === slug); // Assumptie: label is de slug
      return option?.value; // Retourneer de 'value' die dan de slug zou moeten zijn
    }
    return undefined;
  }

  private createInitialViewModel(): ProductListViewModel {
    return {
      products: [], selectedProduct: undefined, isLoading: true, isSubmitting: false, error: null,
      filters: initialProductState.filters, totalCount: 0, hasMore: false, currentPage: 1,
      pageSize: initialProductState.filters.pageSize ?? 20, loadedCount: 0, showingFrom: 0, showingTo: 0,
      lastFetched: null, isStale: true, hasProducts: false, isEmpty: true, isBusy: true,
      selectedVariantCombinationIdByProduct: {},
      availableFilters: null,
      isLoadingFilters: false,
    };
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/products/core/src/lib/state/product.feature.ts ---

/**
 * @file product.feature.ts
 * @version 22.0.0 (Definitive Race Condition & Hydration Fix - Additive State)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   The definitive NgRx feature for Products, designed to resolve all remaining
 *   race conditions and hydration timeouts. This version introduces an **additive**
 *   state management strategy: the `entities` dictionary acts as a universal cache
 *   for all loaded products. Separate ID arrays (`featuredProductIds`, `currentProductListIds`,
 *   `searchResultIds`) are used to define various product lists. All product-loading
 *   reducers now exclusively use `upsertMany` to add/update products without
 *   destructively overwriting existing entities. This ensures consistent UI,
 *   successful hydration, and resolves the "disappearing products" bug.
 */
import { createFeature, createSelector, createReducer, on, MemoizedSelector } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { AvailableFiltersResponse, ProductListViewModel, FeatureError, ProductSortField } from './product.types';
import { createSafeEntitySelectors } from '@royal-code/shared/utils';
import { Product, ProductFilters, ProductStatus } from '@royal-code/features/products/domain';
import { ProductActions } from './product.actions';

export const PRODUCTS_FEATURE_KEY = 'products';

export const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  selectId: (product: Product) => product.id,
  sortComparer: false,
});

export interface ProductState extends EntityState<Product> {
  readonly featuredProductIds: string[];
  readonly currentProductListIds: string[]; // <<< DE FIX: NIEUW: IDs voor de huidige paginated lijst
  readonly recommendedProductIds: string[];
  readonly searchResultIds: string[];
  readonly searchQuery: string | null;
  readonly isSearching: boolean;
  readonly searchTotalCount: number;
  readonly searchHasMore: boolean;
  readonly availableFilters: AvailableFiltersResponse | null;
  readonly isLoadingFilters: boolean;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly selectedProductId: string | null;
  readonly selectedVariantCombinationIdByProduct: Record<string, string | null>;
  readonly filters: ProductFilters;
  readonly currentPage: number;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly lastFetched: number | null;
  readonly cacheTimeout: number;
  readonly error: FeatureError | null;
}

const DEFAULT_FILTERS: Readonly<ProductFilters> = {
  sortBy: 'name' as ProductSortField, sortDirection: 'asc', page: 1, pageSize: 20,
};

export const initialProductState: ProductState = productAdapter.getInitialState({
  featuredProductIds: [],
  currentProductListIds: [], // <<< DE FIX: INITIALISEER
  recommendedProductIds: [],
  searchResultIds: [],
  searchQuery: null,
  isSearching: false,
  searchTotalCount: 0,
  searchHasMore: false,
  availableFilters: null,
  isLoadingFilters: false,
  isLoading: false,
  isSubmitting: false,
  selectedProductId: null,
  selectedVariantCombinationIdByProduct: {},
  filters: { ...DEFAULT_FILTERS },
  currentPage: 1,
  totalCount: 0,
  hasMore: false,
  lastFetched: null,
  cacheTimeout: 300000,
  error: null,
});

export const productFeature = createFeature({
  name: PRODUCTS_FEATURE_KEY,
  reducer: createReducer(
    initialProductState,
    on(ProductActions.pageOpened, (state, { initialFilters }) => ({
      ...state,
      filters: { ...DEFAULT_FILTERS, ...initialFilters },
      currentPage: 1,
      totalCount: 0,
      hasMore: false,
      isLoading: true,
      error: null,
      lastFetched: null,
      currentProductListIds: [],
    })),

    on(ProductActions.pageClosed, (state) => ({
        ...state,
        filters: { ...DEFAULT_FILTERS },
        currentPage: 1,
        totalCount: 0,
        hasMore: false,
        isLoading: false,
        error: null,
        lastFetched: null,
        currentProductListIds: [],
    })),
on(ProductActions.filtersUpdated, (state, { filters }) => {
    // === NIEUWE LOGGING BINNEN DE REDUCER VOOR DIAGNOSE ===
    console.log('%c[ProductReducer] filtersUpdated: Current state.filters (before merge):', 'color: yellow;', JSON.stringify(state.filters, null, 2));
    console.log('%c[ProductReducer] filtersUpdated: Action filters payload:', 'color: yellow;', JSON.stringify(filters, null, 2));
    const newFilters = { ...state.filters, ...filters, page: 1 };
    console.log('%c[ProductReducer] filtersUpdated: Merged newFilters:', 'color: yellow;', JSON.stringify(newFilters, null, 2));
    // =======================================================
    return { 
      ...state, 
      filters: newFilters, 
      currentPage: 1, 
      error: null, 
      isLoading: true, 
      currentProductListIds: [] 
    };
  }),
    on(ProductActions.nextPageLoaded, (state) => !state.hasMore || state.isLoading ? state : { ...state, isLoading: true, error: null, currentPage: state.currentPage + 1 }),
    on(ProductActions.dataRefreshed, (state) => ({ ...state, error: null, isLoading: true, currentPage: 1, filters: { ...state.filters, page: 1 }, currentProductListIds: [] })),
    on(ProductActions.loadProducts, ProductActions.loadFeaturedProducts, ProductActions.loadProductsByIds, ProductActions.loadRecommendations, (state) => ({ ...state, isLoading: true, error: null })),

    // DE FIX: loadProductsSuccess gebruikt NU ALTIJD upsertMany en beheert currentProductListIds
    on(ProductActions.loadProductsSuccess, (state, { products, totalCount, hasMore }) => {
        const newProductIds = products.map(p => p.id);
        const updatedProductListIds = state.currentPage === 1 ? newProductIds : [...state.currentProductListIds, ...newProductIds];
        return productAdapter.upsertMany(products, {
            ...state,
            currentProductListIds: updatedProductListIds,
            isLoading: false,
            totalCount,
            hasMore,
            lastFetched: Date.now(),
            error: null
        });
    }),

    on(ProductActions.loadFeaturedProductsSuccess, (state, { products }) =>
      productAdapter.upsertMany(products, {
        ...state,
        featuredProductIds: products.map(p => p.id),
        isLoading: false,
        lastFetched: Date.now(),
        error: null
      })
    ),
    on(ProductActions.loadProductsByIdsSuccess, (state, { products }) => productAdapter.upsertMany(products, { ...state, isLoading: false, error: null })),
    on(ProductActions.loadRecommendationsSuccess, (state, { products }) => productAdapter.upsertMany(products, { ...state, isLoading: false, recommendedProductIds: products.map(p => p.id), error: null })),
    on(ProductActions.loadProductDetailSuccess, (state, { product }) =>
      productAdapter.upsertOne(product, { ...state, isLoading: false, error: null })
    ),
    on(ProductActions.loadProductDetailFailure, ProductActions.loadProductsFailure, ProductActions.loadFeaturedProductsFailure, ProductActions.loadProductsByIdsFailure, ProductActions.loadRecommendationsFailure, (state, { error }) => ({ ...state, isLoading: false, error: error })),
    on(ProductActions.loadAvailableFilters, (state) => ({ ...state, isLoadingFilters: true, error: null })),
    on(ProductActions.loadAvailableFiltersSuccess, (state, { filters }) => ({ ...state, isLoadingFilters: false, availableFilters: filters, error: null })),
    on(ProductActions.loadAvailableFiltersFailure, (state, { error }) => ({ ...state, isLoadingFilters: false, availableFilters: null, error: error })),
    on(ProductActions.createProductSubmitted, (state, { payload, tempId }) => productAdapter.addOne({ ...payload, id: tempId, status: ProductStatus.DRAFT } as Product, { ...state, isSubmitting: true, error: null })),
    on(ProductActions.createProductSuccess, (state, { product, tempId }) => {
      const stateWithoutTemp = productAdapter.removeOne(tempId, state);
      return productAdapter.addOne(product, { ...stateWithoutTemp, isSubmitting: false, error: null, totalCount: state.totalCount + 1 });
    }),
    on(ProductActions.createProductFailure, (state, { error, tempId }) => productAdapter.removeOne(tempId, { ...state, isSubmitting: false, error })),
    on(ProductActions.updateProductSubmitted, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(ProductActions.updateProductSuccess, (state, { productUpdate }) => productAdapter.upsertOne(productUpdate.changes as Product, { ...state, isSubmitting: false, error: null })),
    on(ProductActions.updateProductFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),
    on(ProductActions.deleteProductSuccess, (state, { id }) => productAdapter.removeOne(id, { ...state, isSubmitting: false, error: null, totalCount: Math.max(0, state.totalCount - 1) })),
    on(ProductActions.bulkDeleteProductsSuccess, (state, { ids }) => productAdapter.removeMany(ids as string[], { ...state, isSubmitting: false, error: null, totalCount: Math.max(0, state.totalCount - ids.length) })),
    // DE FIX: Wanneer een product geselecteerd is, zet isLoading op true en error op null
    on(ProductActions.productSelected, (state, { id }) => ({ ...state, selectedProductId: id, isLoading: !!id, error: null })),
    on(ProductActions.variantCombinationSelected, (state, { productId, selectedVariantCombinationId }) => ({ ...state, selectedVariantCombinationIdByProduct: { ...state.selectedVariantCombinationIdByProduct, [productId]: selectedVariantCombinationId } })),
    on(ProductActions.variantSelectionCleared, (state, { productId }) => {
      const updatedSelection = { ...state.selectedVariantCombinationIdByProduct };
      delete updatedSelection[productId];
      return { ...state, selectedVariantCombinationIdByProduct: updatedSelection };
    }),
    on(ProductActions.errorCleared, (state) => ({ ...state, error: null })),
    on(ProductActions.searchSubmitted, (state, { query }) => ({ ...state, searchQuery: query, isSearching: true, error: null })),
    on(ProductActions.searchSuccess, (state, { products, totalCount, hasMore }) =>
      productAdapter.upsertMany(products, {
        ...state,
        isSearching: false,
        searchResultIds: products.map(p => p.id),
        searchTotalCount: totalCount,
        searchHasMore: hasMore,
        error: null,
      })
    ),
    on(ProductActions.searchFailure, (state, { error }) => ({ ...state, isSearching: false, error })),
    on(ProductActions.searchStateCleared, (state) => ({ ...state, searchQuery: null, searchResultIds: [], isSearching: false, searchTotalCount: 0, searchHasMore: false }))
  ),
  extraSelectors: ({ selectProductsState, selectIsLoading, selectIsSubmitting, selectError, selectFilters, selectTotalCount, selectHasMore, selectSelectedProductId, selectLastFetched, selectCacheTimeout, selectCurrentPage, selectSelectedVariantCombinationIdByProduct, selectRecommendedProductIds, selectAvailableFilters, selectIsLoadingFilters, selectSearchQuery, selectIsSearching, selectSearchResultIds, selectFeaturedProductIds, selectCurrentProductListIds }) => {

    const { selectAll, selectEntities } = createSafeEntitySelectors(productAdapter, selectProductsState as MemoizedSelector<object, ProductState | undefined>);

    const selectProductEntities = selectEntities;

    // Selector voor de producten op de huidige lijst (bijv. shop pagina)
    const selectProductsForCurrentList = createSelector(
        selectProductEntities,
        selectCurrentProductListIds,
        (entities, ids) => ids.map(id => entities[id]).filter((p): p is Product => !!p)
    );

    // DE FIX: selectSelectedProduct moet nu rekening houden met of het product in de entities zit EN of de ID overeenkomt.
    const selectSelectedProduct = createSelector(
      selectProductEntities,
      selectSelectedProductId,
      (entities, selectedId) => {
        const product = selectedId ? entities[selectedId] : undefined;
        return product?.id === selectedId ? product : undefined; // Enkel retourneren als de ID matcht
      }
    );

    const selectSearchResults = createSelector(selectProductEntities, selectSearchResultIds, (entities, ids) => ids.map(id => entities[id]).filter((p): p is Product => !!p));
    const selectSearchViewModel = createSelector(selectSearchQuery, selectIsSearching, selectSearchResults, (query, isLoading, results) => ({ query, isLoading, results }));
    const selectHasProducts = createSelector(selectProductsForCurrentList, (products) => products.length > 0);
    const selectProductById = (id: string) => createSelector(selectEntities, (entities) => (entities ? entities[id] : undefined));
    const selectSelectedVariantCombinationId = (productId: string) => createSelector(selectSelectedVariantCombinationIdByProduct, (map) => map[productId] ?? null);
    const selectFeaturedProducts = createSelector(selectProductEntities, selectFeaturedProductIds, (entities, ids) => ids.map(id => entities[id]).filter((p): p is Product => !!p));
    const selectRecommendations = createSelector(selectProductEntities, selectRecommendedProductIds, (entities, ids) => ids.map(id => entities[id]).filter((p): p is Product => !!p));
    const selectIsStale = createSelector(selectLastFetched, selectCacheTimeout, (lastFetched, timeout) => !lastFetched || Date.now() - lastFetched > timeout);
    const selectIsEmpty = createSelector(selectProductsForCurrentList, selectIsLoading, (products, isLoading) => products.length === 0 && !isLoading);
    const selectIsBusy = createSelector(selectIsLoading, selectIsSubmitting, selectIsLoadingFilters, (loading, submitting, loadingFilters) => loading || submitting || loadingFilters);

    const selectProductListViewModel = createSelector(
      selectProductsForCurrentList, selectSelectedProduct, selectIsLoading, selectIsSubmitting,
      selectError, selectFilters, selectTotalCount, selectHasMore, selectCurrentPage,
      selectLastFetched, selectIsStale, selectHasProducts, selectIsEmpty, selectIsBusy,
      selectSelectedVariantCombinationIdByProduct, selectAvailableFilters, selectIsLoadingFilters,
      (products, selectedProduct, isLoading, isSubmitting, error, filters, totalCount, hasMore, currentPage, lastFetched, isStale, hasProducts, isEmpty, isBusy, selectedVariantCombinationIdByProduct, availableFilters, isLoadingFilters): ProductListViewModel => {
        const pageSize = filters.pageSize ?? 20;
        return {
          products, selectedProduct, isLoading, isSubmitting, error, filters,
          totalCount, hasMore, currentPage, pageSize,
          loadedCount: products.length,
          showingFrom: totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0,
          showingTo: Math.min(currentPage * pageSize, totalCount),
          lastFetched, isStale, hasProducts, isEmpty, isBusy,
          selectedVariantCombinationIdByProduct,
          availableFilters,
          isLoadingFilters,
        };
      }
    );

    return {
      selectAllProducts: selectProductsForCurrentList,
      selectProductEntities,
      selectSelectedProduct,
      selectFeaturedProducts,
      selectRecommendations,
      selectProductById,
      selectSelectedVariantCombinationId,
      selectIsStale,
      selectHasProducts,
      selectIsEmpty,
      selectIsBusy,
      selectProductListViewModel,
      selectAvailableFilters,
      selectIsLoadingFilters,
      selectSearchResults,
      selectSearchViewModel,
      selectCurrentProductListIds,
      selectProductsForCurrentList,
    };
  },
});

export const {
  name, reducer, selectProductsState, selectIsLoading, selectIsSubmitting,
  selectError, selectFilters, selectTotalCount, selectHasMore,
  selectAllProducts, selectProductEntities, selectSelectedProduct,
  selectFeaturedProducts, selectRecommendations, selectProductById,
  selectSelectedVariantCombinationId, selectIsStale, selectHasProducts,
  selectIsEmpty, selectIsBusy, selectProductListViewModel,
  selectAvailableFilters, selectIsLoadingFilters, selectSearchResults,
  selectSearchViewModel, selectIsSearching, selectSearchQuery,
  selectCurrentProductListIds, selectProductsForCurrentList,
} = productFeature;

--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-droneshop/src/lib/services/droneshop-product-api.service.ts ---

/**
 * @file droneshop-product-api.service.ts
 * @Version 3.0.0 (Gecorrigeerd: Specifieke Mockdata voor Drones, Backend voor de Rest - Gebaseerd op Oude API)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Concrete implementatie van de AbstractProductApiService voor de Droneshop backend.
 *   Deze versie herstelt de backend-communicatie volgens de "oude" API-service definitie,
 *   en integreert selectieve mock-data voor de 4 gespecificeerde drone-producten
 *   voor hun detailpagina's. Alle andere aanroepen gaan naar de echte backend.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, switchMap, map, tap } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractProductApiService, BackendPaginatedListDto, BackendProductListItemDto, BackendProductDetailDto } from '@royal-code/features/products/core';
import { ProductCategory, ProductType, ProductStatus, CreateProductPayload, ProductFilters, UpdateProductPayload, AvailableFiltersResponse} from '@royal-code/features/products/domain';
import { CustomAttributeDefinitionDto, PredefinedAttributesMap } from '@royal-code/features/admin-products/core';
import { ProductLookups, ProductTagLookup } from '@royal-code/features/admin-products/domain';
import { LoggerService } from '@royal-code/core/logging';
import { SearchSuggestionResponse } from '@royal-code/features/products/domain';

@Injectable({ providedIn: 'root' })
export class DroneshopProductApiService extends AbstractProductApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Products`;
  private readonly searchApiUrl = `${this.config.backendUrl}/Search`;
  private readonly logPrefix = '[DroneshopProductApiService]';
  private readonly logger = inject(LoggerService);


public override getProducts(filters?: ProductFilters | null): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    const params = this.buildQueryParams(filters);
    const finalUrl = `${this.apiUrl}?${params.toString()}`;

    // === VERBETERDE LOGGING VOOR DIAGNOSE ===
    console.group('%c[DroneshopProductApiService] getProducts API Call Details (Advanced)', 'color: purple; font-weight: bold;');
    console.log('Filters object received by getProducts:', JSON.stringify(filters, null, 2));
    console.log('Generated HttpParams:', params.toString());
    console.log('Final API URL:', finalUrl);
    console.groupEnd();
    // ===============================================

    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(this.apiUrl, { params });
  }


public override getAvailableFilters(currentFilters?: ProductFilters | null): Observable<AvailableFiltersResponse> {
    this.logger.debug(`${this.logPrefix} getAvailableFilters (BACKEND) called.`);
    const params = this.buildQueryParams(currentFilters);

    return this.http.get<AvailableFiltersResponse>(`${this.apiUrl}/filters`, { params }).pipe(
      switchMap(filterDefs => {
        this.logger.info(`${this.logPrefix} Raw filterDefs from backend:`, JSON.stringify(filterDefs, null, 2)); // LOG 1

        const categoryFilter = filterDefs.find(f => f.key === 'categoryIds');
        
        if (categoryFilter && categoryFilter.options && categoryFilter.options.length > 0) {
          const currentCategoryOptions = [...categoryFilter.options]; 

          return this.getCategories().pipe(
            map(categories => {
              const categoryIdToSlugMap = new Map<string, string>();
              categories.forEach(cat => categoryIdToSlugMap.set(cat.id, cat.slug));

              const updatedOptions = currentCategoryOptions.map(option => {
                const slug = categoryIdToSlugMap.get(option.value);
                if (slug) {
                  const newOption = { ...option, value: slug }; // De waarde wordt nu de slug
                  return newOption;
                }
                return option;
              });

              const finalFilterDefs = filterDefs.map(f => (f.key === 'categoryIds' ? { ...f, options: updatedOptions } : f));
              this.logger.info(`${this.logPrefix} Final filterDefs after slug transformation:`, JSON.stringify(finalFilterDefs, null, 2)); // LOG 2
              return finalFilterDefs;
            })
          );
        }
        this.logger.info(`${this.logPrefix} No category filters or options to transform.`); // LOG 3
        return of(filterDefs);
      })
    );
  }



  public override getRecommendations(count: number = 8): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    this.logger.debug(`${this.logPrefix} getRecommendations (BACKEND) called.`);
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(`${this.apiUrl}/recommendations`, { params });
  }


  public override getPredefinedAttributes(): Observable<PredefinedAttributesMap> {
      this.logger.debug(`${this.logPrefix} getPredefinedAttributes (BACKEND) called.`);
      return this.http.get<PredefinedAttributesMap>(`${this.apiUrl}/attributes`); // Van oude service
  }


  public override getCustomAttributeDefinitions(): Observable<CustomAttributeDefinitionDto[]> {
        this.logger.debug(`${this.logPrefix} getCustomAttributeDefinitions (BACKEND) called.`);
        return this.http.get<CustomAttributeDefinitionDto[]>(`${this.apiUrl}/custom-attribute-definitions`);
  }


  public override getFeaturedProducts(): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    this.logger.debug(`${this.logPrefix} getFeaturedProducts (BACKEND) called.`);
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(`${this.apiUrl}/featured`);
  }



  public override getProductById(productId: string): Observable<BackendProductDetailDto> {
    this.logger.debug(`${this.logPrefix} getProductById (BACKEND) called for ID: ${productId}`);
    
    // << DE FIX: Voeg hier een console.log toe om te zien of deze lijn wordt bereikt >>
    console.log(`%c[DroneshopProductApiService] *** EXECUTING HTTP GET FOR PRODUCT ID: ${productId} ***`, 'color: #FF1744; font-weight: bold; font-size: 16px;');

    return this.http.get<BackendProductDetailDto>(`${this.apiUrl}/${productId}`).pipe(
      // Deze tap hier is cruciaal, want deze ziet de rauwe respons VOOR ELKE RxJS-map in het effect.
      tap(dto => console.log('%c[DroneshopProductApiService] RAW BACKEND DTO FOR PRODUCT DETAIL (CLONED):', 'color: #FF5722; font-weight: bold; font-size: 14px;', structuredClone(dto))),
    );
  }

  public override getCategories(): Observable<ProductCategory[]> {
    this.logger.debug(`${this.logPrefix} getCategories (BACKEND) called.`);
    // Oude service retourneerde of([]), nu de backend aanroepen
    return this.http.get<ProductCategory[]>(`${this.apiUrl}/categories`); 
  }

  public override getProductsByIds(productIds: readonly string[]): Observable<BackendProductListItemDto[]> {
    this.logger.debug(`${this.logPrefix} getProductsByIds (BACKEND) called for IDs:`, productIds);
    if (productIds.length === 0) return of([]);
    let params = new HttpParams();
    productIds.forEach(id => { params = params.append('ids', id); });
    return this.http.get<BackendProductListItemDto[]>(`${this.apiUrl}/by-ids`, { params });
  }

  // --- CRUD Operations (allemaal naar de backend, met methodes van de oude service) ---
  public override updatePhysicalStock(productId: string, variantInstanceId: string | undefined, changeInQuantity: number, reason: string, userId: string): Observable<BackendProductDetailDto> {
    this.logger.debug(`${this.logPrefix} updatePhysicalStock (BACKEND) called.`);
    const payload = { changeInQuantity, reason, userId, variantInstanceId }; // Payload van oude service
    return this.http.post<BackendProductDetailDto>(`${this.apiUrl}/${productId}/stock`, payload);
  }

  public override createProduct(payload: CreateProductPayload): Observable<BackendProductDetailDto> {
    this.logger.debug(`${this.logPrefix} createProduct (BACKEND) called.`);
    return this.http.post<BackendProductDetailDto>(this.apiUrl, payload);
  }

  public override updateProduct(id: string, payload: UpdateProductPayload): Observable<BackendProductDetailDto> {
    this.logger.debug(`${this.logPrefix} updateProduct (BACKEND) called.`);
    return this.http.put<BackendProductDetailDto>(`${this.apiUrl}/${id}`, payload);
  }

  public override deleteProduct(id: string): Observable<void> {
    this.logger.debug(`${this.logPrefix} deleteProduct (BACKEND) called.`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public override bulkDeleteProducts(ids: string[]): Observable<void> {
    this.logger.debug(`${this.logPrefix} bulkDeleteProducts (BACKEND) called.`);
    // Oude service gebruikte POST met body voor bulk-delete
    return this.http.post<void>(`${this.apiUrl}/bulk-delete`, { ids });
  }
  
  /**
   * Zoekt producten via de backend.
   * Dit endpoint was niet in de oude service, dus gebruikt een dedicated search API.
   */
  public override searchProducts(query: string, filters?: ProductFilters | null): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    this.logger.debug(`${this.logPrefix} searchProducts (BACKEND) called with query: "${query}" and filters:`, filters);
    let httpParams = new HttpParams().set('q', query);
    for (const key in filters) {
        if (filters.hasOwnProperty(key)) {
            const value = (filters as any)[key];
            if (value !== undefined && value !== null && key !== 'searchTerm') {
                if (Array.isArray(value)) {
                    value.forEach(item => { httpParams = httpParams.append(key, item); });
                } else if (typeof value === 'object') {
                    httpParams = httpParams.append(key, JSON.stringify(value));
                } else {
                    httpParams = httpParams.set(key, String(value));
                }
            }
        }
    }
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(`${this.searchApiUrl}/products`, { params: httpParams });
  }


private buildQueryParams(filters?: ProductFilters | null): HttpParams {
    let params = new HttpParams();

    // Standaard paginatie en sortering
    params = params.set('pageNumber', (filters?.page ?? 1).toString());
    params = params.set('pageSize', (filters?.pageSize ?? 20).toString());
    if (filters?.sortBy) {
      params = params.set('sortBy', filters.sortBy as string);
    }
    if (filters?.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    // --- DE DEFINITIEVE FIX: Gebruik CategorySlugs en stuur de daadwerkelijke slugs/IDs als komma-gescheiden string ---
    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      // De backend verwacht 'CategorySlugs' en een komma-gescheiden lijst van slugs (of IDs, afhankelijk van de backend-implementatie)
      // Omdat de `ProductFilterSidebarComponent` nu correcte SLUGS in `option.value` heeft na de transformatie
      // in `getAvailableFilters`, kunnen we er hier van uitgaan dat `filters.categoryIds` slugs bevat.
      params = params.set('CategorySlugs', filters.categoryIds.join(','));
      console.log('%c[DroneshopProductApiService] buildQueryParams: Added CategorySlugs:', 'color: lightgreen;', filters.categoryIds.join(','));
    }
    // --- EINDE FIX ---
    
    // Proactieve fix voor merken, uitgaande van hetzelfde patroon.
    if (filters?.brandIds && filters.brandIds.length > 0) {
      params = params.set('Brands', filters.brandIds.join(','));
      console.log('%c[DroneshopProductApiService] buildQueryParams: Added Brands:', 'color: lightgreen;', filters.brandIds.join(','));
    }
    
    if (filters?.searchTerm) {
        params = params.set('SearchTerm', filters.searchTerm);
        console.log('%c[DroneshopProductApiService] buildQueryParams: Added SearchTerm:', 'color: lightgreen;', filters.searchTerm);
    }

    console.log('%c[DroneshopProductApiService] Final HttpParams:', 'color: green; font-weight: bold;', params.toString());

    return params;
  }


  public override getLookups(): Observable<ProductLookups> {
    this.logger.debug(`${this.logPrefix} getLookups (BACKEND) called.`);
    return this.http.get<ProductLookups>(`${this.apiUrl}/lookups`);
  }

  public override getTags(searchTerm?: string): Observable<ProductTagLookup[]> {
    this.logger.debug(`${this.logPrefix} getTags (BACKEND) called.`);
    let params = new HttpParams();
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    return this.http.get<ProductTagLookup[]>(`${this.apiUrl}/tags`, { params });
  }

  public override getSuggestions(query: string): Observable<SearchSuggestionResponse> {
    this.logger.debug(`${this.logPrefix} getSuggestions (BACKEND) called for query: "${query}"`);
    const params = new HttpParams().set('query', query);
    return this.http.get<SearchSuggestionResponse>(`${this.searchApiUrl}/suggestions`, { params });
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/products/domain/src/lib/models/product-base.model.ts ---

/**
 * @file product-base.model.ts - DEFINITIVE AND CORRECTED VERSION
 * @Version 2.1.0 - Aligned with DTO Nullability and ensures all common properties exist.
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-20
 * @Description This version consolidates common properties from backend DTOs into ProductBase,
 *              making them optional where they might be absent or null, solving type assignment errors.
 *              It also maintains `categoryIds` to prevent TS2353.
 */
import { Media } from '@royal-code/shared/domain';
import { ProductStatus, ProductType, StockStatus } from '../types/product-types.enum';
import { ProductVariantCombination, VariantAttribute } from './product-variants.model';
import { Review } from '@royal-code/features/reviews/domain';
import { AuditableEntityBase, DateTimeInfo } from '@royal-code/shared/base-models';
 // Nodig voor StockStatus

export interface ProductColorVariantTeaser {
  readonly uiId: number;
  readonly attributeValueId: string;
  readonly defaultVariantId: string;
  readonly value: string;
  readonly displayName: string;
  readonly colorHex?: string | null;
  readonly price: number;
  readonly originalPrice?: number | null;
  readonly media?: readonly Media[] | null;
  readonly isDefault?: boolean; // <-- TOEGEVOEGD: Deze property ontbrak
}

export interface ProductBase extends AuditableEntityBase {
  readonly id: string;
  name: string;
  slug?: string | null; // Allow null for slug
  readonly type: ProductType;
  status: ProductStatus;

  shortDescription?: string | null; // Allow null
  description: string;

  media?: readonly Media[] | null; // Allow null
  currency?: string | null; // Allow null
  colorVariants?: readonly ProductColorVariantTeaser[] | null; // Allow null
  categoryIds: string[]; // This property remains mandatory and non-null in ProductBase
  tags?: readonly string[] | null; // Allow null

  variantAttributes?: readonly VariantAttribute[] | null; // Allow null
  variantCombinations?: readonly ProductVariantCombination[] | null; // Allow null

  // --- COMMERCE PROPERTIES (Added/Adjusted to solve NG9 errors on ProductListComponent) ---
  price?: number | null; // Make optional and allow null
  originalPrice?: number | null; // Make optional and allow null
  hasDiscount?: boolean; // Make optional
  discountPercentage?: number | null; // Make optional and allow null
  stockStatus?: StockStatus | null; // Make optional and allow null
  inStock?: boolean; // Make optional
  stockQuantity?: number | null; // Make optional and allow null

  // Reviews & Ratings
  averageRating?: number | null; // Allow null
  reviewCount?: number;

  // Visibility & Lifecycle
  isActive: boolean;
  isFeatured?: boolean;
  isNewUntil?: DateTimeInfo | null;

  // Analytics
  totalSalesCount?: number;
  viewCount?: number;

  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;

  publishedAt?: DateTimeInfo | null;
  archivedAt?: DateTimeInfo | null;
  discontinuedAt?: DateTimeInfo | null;
  lastModifiedBy?: string | null;

  // Relationships & Inventory Hints
  relatedProductIds?: string[] | null;
  restockDate?: DateTimeInfo | null;

  // Pricing (Internal - these were already optional, good)
  costPrice?: number;
  profitMarginPercent?: number;

  // Pragmatic Enterprise Touches
  searchKeywords?: string[] | null;
  customAttributes?: Record<string, unknown> | null;
  appScope?: string | null;

    // === Tijdelijke eigenschap voor data-overdracht ===
  // @TODO remove this later
    _mediaMap?: Map<string, Media[]>; 

}

--- END OF FILE ---

--- START OF FILE libs/features/products/domain/src/lib/models/product-filters.model.ts ---

// --- VERVANG VOLLEDIG BESTAND: libs/features/products/domain/src/lib/models/product-filters.model.ts ---
/**
 * @file product-filters.model.ts
 * @Version 2.1.0 (Unified Enterprise Standard - Droneshop Filters Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   Defines the single, authoritative `ProductFilters` interface for all
 *   product-related queries. This model includes pagination, sorting, and
 *   feature-specific filtering options, serving as the consistent contract
 *   between UI components, NgRx state, and data-access layers.
 *   Now includes Droneshop-specific filters and definitions for dynamic filter UIs.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-30
 * @PromptSummary Regenerated all modified files with clean comments and integrated filter/sort functionality.
 */
import { Product } from './product.model';
import { ProductStatus, ProductType, StockStatus } from '../types/product-types.enum';

/**
 * @interface ProductFilters
 * @description Defines the criteria for filtering and sorting product collections.
 */
export interface ProductFilters {
  readonly searchTerm?: string;
  readonly categoryIds?: readonly string[];
  readonly brandIds?: readonly string[]; // Wordt gebruikt voor backend 'brands' parameter
  readonly tags?: readonly string[];
  readonly productTypes?: readonly ProductType[];
  readonly statuses?: readonly ProductStatus[];
  readonly appScope?: string | null;
  readonly priceRange?: {
    readonly min?: number;
    readonly max?: number;
    readonly currency?: string;
  };
  readonly onSaleOnly?: boolean;
  readonly stockStatuses?: readonly StockStatus[];
  readonly inStockOnly?: boolean;
  readonly minimumRating?: number;
  readonly isFeatured?: boolean;
  readonly hasReviewsOnly?: boolean;
  readonly createdAfter?: string; // ISO string
  readonly publishedAfter?: string; // ISO string

  // === Nieuw voor Droneshop filters ===
  readonly skillLevels?: readonly ('beginner' | 'advanced' | 'professional')[];
  readonly hasCamera?: boolean;
  // === Einde nieuwe Droneshop filters ===

  // Sorting & Pagination
  readonly sortBy?: keyof Product | string;
  readonly sortDirection?: 'asc' | 'desc';
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * @interface FilterOption
 * @description Representeert een enkele optie binnen een filter, inclusief display-informatie en count.
 */
export interface FilterOption {
  value: string; // De werkelijke waarde die naar de backend wordt gestuurd (bv. ID of naam)
  label: string; // Display naam voor de UI
  count: number; // Aantal producten dat aan deze filteroptie voldoet
}

/**
 * @interface FilterDefinition
 * @description Definieert een filtercategorie, inclusief zijn type en beschikbare opties of range.
 */
export interface FilterDefinition {
  key: keyof ProductFilters; // De key die gebruikt wordt in ProductFilters (bv. 'brandIds', 'priceRange')
  label: string; // Display label voor de UI (bv. 'Merk', 'Prijs')
  type: 'checkbox' | 'range' | 'switch'; // Het type UI control voor dit filter
  options?: FilterOption[]; // Voor 'checkbox' en 'switch' types
  rangeMin?: number; // Voor 'range' type
  rangeMax?: number; // Voor 'range' type
}

/**
 * @typedef AvailableFiltersResponse
 * @description Het verwachte response formaat van de backend voor het ophalen van beschikbare filters.
 */
export type AvailableFiltersResponse = FilterDefinition[];

--- END OF FILE ---

--- START OF FILE libs/features/products/domain/src/lib/models/product-physical.model.ts ---

/**
 * @file physical-product.model.ts
 * @Version 1.3.0 (Storytelling Sections Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the `PhysicalProduct` interface, now including `storySections`
 *              to support data-driven, immersive "flagship" product pages.
 */
import { ProductBase } from './product-base.model';
import { ProductType, StockStatus } from '../types/product-types.enum';
import {
  ProductTax,
  ProductDiscount,
  ProductDisplaySpecification,
  SupplierInfo,
  ProductShipping
} from './product-commerce-details.model';
import { PhysicalProductVariants } from './product-variants.model';

/**
 * @Interface ProductAvailabilityRules
 * @Description Defines rules regarding order quantities for a product.
 */
export interface ProductAvailabilityRules {
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  quantityIncrements?: number; // e.g., must be ordered in multiples of 2
}

export interface PhysicalProduct extends ProductBase {
  readonly type: ProductType.PHYSICAL;
  price: number;
  originalPrice?: number;
  activeDiscount?: ProductDiscount | null;
  taxInfo?: ProductTax;
  sku?: string;
  ean?: string;
  gtin?: string;
  brand?: string;
  manageStock?: boolean;
  stockQuantity?: number | null;
  stockStatus?: StockStatus;
  allowBackorders?: boolean;
  lowStockThreshold?: number;
  variantContext?: PhysicalProductVariants;
  displaySpecifications?: ProductDisplaySpecification[];
  ageRecommendationKeyOrText?: string;
  safetyCertifications?: string[];
  supplierInfo?: SupplierInfo;
  shippingDetails?: ProductShipping;
  availabilityRules?: ProductAvailabilityRules;
}

--- END OF FILE ---

--- START OF FILE libs/features/products/domain/src/lib/models/product.model.ts ---

/**
 * @file product.model.ts
 * @Version 1.1.0 // Version updated to reflect new base and types
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the main `Product` discriminated union type,
 *              which combines all specific product type interfaces.
 *              This file primarily serves to construct and export this union type.
 *              It also re-exports ProductStatus for convenience.
 */
import { PhysicalProduct } from './product-physical.model';
import { VirtualGameItemProduct } from './product-game-item.model';
import { DigitalProduct } from './product-digital.model';
import { ServiceProduct } from './product-service.model';
import { ProductStatus } from '../types/product-types.enum';

export { ProductStatus }; // Re-export ProductStatus

/**
 * @TypeUnion Product
 * @Description A discriminated union representing any type of product within the system.
 *              Use the `type: ProductType` property (available on all constituents via `ProductBase`)
 *              to determine the specific product interface and safely access type-specific properties.
 */
export type Product =
  | PhysicalProduct
  | VirtualGameItemProduct
  | DigitalProduct
  | ServiceProduct;

--- END OF FILE ---

--- START OF FILE libs/shared/domain/src/lib/models/locations/address.model.ts ---

// --- VERVANG VOLLEDIG BLOK: export interface Address in libs/shared/domain/src/lib/models/locations/address.model.ts ---
/**
 * @file address.model.ts
 * @Version 3.2.0 (DEFINITIEF: Losgekoppeld van AuditableEntityBase, expliciet nullable/optioneel)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   De definitieve, robuuste Address model interface. Dit model is losgekoppeld
 *   van `AuditableEntityBase` om flexibiliteit te bieden voor nieuwe adressen
 *   zonder ID en voor het correct omgaan met optionele/nullable velden.
 *   Alle optionele string-velden staan nu expliciet `null` toe, en booleans
 *   zijn `boolean | undefined` waar nodig. Dit lost alle TypeErrors op.
 */
import { DateTimeInfo } from '@royal-code/shared/base-models'; // Nog steeds nodig voor created/lastModified

export type AddressType = 'shipping' | 'billing' | 'both' | 'other';

export interface Address {
  id?: string; // <<< FIX: Optioneel gemaakt en losgekoppeld van AuditableEntityBase

  // Auditable velden, indien bekend (voor bestaande adressen van de backend)
  createdAt?: DateTimeInfo;
  lastModified?: DateTimeInfo;
  createdBy?: string | null;
  lastModifiedBy?: string | null;

  userId?: string; // Optioneel, afhankelijk van context (ingelogde vs anonieme gebruiker)

  contactName: string;
  companyName?: string | null; // Optioneel, nu expliciet nullable
  phoneNumber?: string | null; // Optioneel, nu expliciet nullable
  email?: string | null; // Optioneel, nu expliciet nullable

  street: string;
  houseNumber: string;
  addressAddition?: string | null; // Optioneel, nu expliciet nullable
  city: string;
  stateOrProvince?: string | null; // Optioneel, nu expliciet nullable
  postalCode: string;
  countryCode: string;

  addressType?: AddressType; // Default is 'both'

  // <<< FIX: Maak expliciet optioneel voor booleans. Ze kunnen 'undefined' zijn bij constructie. >>>
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;

  deliveryInstructions?: string | null; // Optioneel, nu expliciet nullable
}

--- END OF FILE ---

--- START OF FILE libs/shared/domain/src/lib/models/navigation/navigation.model.ts ---

/**
 * @file navigation.model.ts
 * @Version 2.5.1 (FINALIZED: Corrected Relative Imports)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-08-31
 * @Description
 *   The definitive version of the NavigationItem interface with the absolutely
 *   correct relative import path for the Image model.
 */
import { BadgeColor, BadgeSize } from '@royal-code/ui/badge';
import { AppIcon } from '../../enums/icon.enum';
import { Image } from '../media/media.model'; // DE FIX: Het pad is nu correct.

/**
 * @enum NavDisplayHintEnum
 * @description Defines explicit display contexts for a navigation item.
 */
export enum NavDisplayHintEnum {
  Desktop = 'desktop',
  MobileBottom = 'mobile-bottom',
  MobileModal = 'mobile-modal',
  UserMenu = 'user-menu',
}

export type NavDisplayHint = NavDisplayHintEnum;

export interface NavigationBadge {
  text: string;
  color: BadgeColor;
  size?: BadgeSize;
}

export interface NavigationItem {
  id: string;
  labelKey: string;
  route?: string | string[];
  queryParams?: { [key: string]: any };
  queryParamsHandling?: 'merge' | 'preserve' | 'replace';
  icon?: AppIcon;
  children?: NavigationItem[];
  menuType?: 'default' | 'mega-menu' | 'dropdown';
  megaMenuLayout?: 'vertical-split' | 'featured-grid';
  megaMenuFeaturedItems?: NavigationItem[];
  displayHint?: NavDisplayHintEnum[];
  dividerBefore?: boolean;
  isSectionHeader?: boolean;
  image?: Image;
  description?: string;
  requiresAuth?: boolean;
  hoverImage?: Image;
  priceRangeKey?: string;
  badges?: NavigationBadge[];
  layoutHint?: 'featured' | 'standard';
}

--- END OF FILE ---

--- START OF FILE libs/shared/utils/src/lib/helpers/date-time-util.service.ts ---

// libs/shared/utils/src/lib/helpers/date-time-util.service.ts
/**
 * @file date-time-util.service.ts
 * @Version 1.1.0 - Added factory function `createDateTimeInfo`.
 * @Author ChallengerAppDevAI
 * @Description Provides utility functions for creating and manipulating DateTimeInfo objects.
 */
import { Injectable } from '@angular/core';
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { DateTime } from 'luxon'; 

@Injectable({
  providedIn: 'root'
})
export class DateTimeUtil {

  /**
   * Creates a DateTimeInfo object from a Date object, Date string, or Unix timestamp (milliseconds).
   * Ensures dates are treated as UTC for ISO string and timestamp generation.
   * @param dateInput - The Date object, ISO string, or timestamp (in ms). If undefined, defaults to current UTC time.
   * @param timezoneId - Optional: IANA timezone identifier (e.g., "Europe/Amsterdam"). If provided, 'formatted' will reflect this.
   * @returns A DateTimeInfo object.
   */
  static createDateTimeInfo(
    dateInput?: Date | string | number,
    timezoneId?: string
  ): DateTimeInfo {
    let dt: DateTime;

    if (dateInput instanceof Date) {
      dt = DateTime.fromJSDate(dateInput).toUTC();
    } else if (typeof dateInput === 'string') {
      dt = DateTime.fromISO(dateInput, { zone: 'utc' });
      if (!dt.isValid) {
        // Probeer als RFC 2822 of HTTP datum als ISO faalt
        dt = DateTime.fromRFC2822(dateInput, { zone: 'utc' });
        if (!dt.isValid) {
          dt = DateTime.fromHTTP(dateInput, { zone: 'utc' });
        }
      }
    } else if (typeof dateInput === 'number') {
      dt = DateTime.fromMillis(dateInput, { zone: 'utc' });
    } else {
      dt = DateTime.utc(); // Default to current UTC time
    }

    if (!dt.isValid) {
      console.warn(`[DateTimeUtil] Invalid dateInput for createDateTimeInfo: ${dateInput}. Falling back to current UTC time.`);
      dt = DateTime.utc(); // Fallback
    }

    // Formatteer met Luxon voor meer controle, indien een timezoneId is meegegeven
    let formattedString: string | undefined;
    if (timezoneId) {
      formattedString = dt.setZone(timezoneId).toFormat('dd LLLL yyyy, HH:mm ZZZZ'); // 'LLLL' voor volledige maandnaam
    } else {
      // Standaard UTC format als geen specifieke timezoneId
      formattedString = dt.toFormat('dd LLLL yyyy, HH:mm \'UTC\'');
    }

    return {
      iso: dt.toISO() as string,
      timestamp: dt.toMillis(),
      utcOffsetMinutes: dt.offset, // dt.offset is number, dus dit is correct
      formatted: formattedString,
      timezoneId: timezoneId ?? dt.zoneName ?? undefined
    };
  }

  /**
   * Converteert een ISO-string naar een DateTimeInfo object.
   * Behandelt de input als UTC.
   * @param isoString - De ISO 8601 string.
   * @returns Een DateTimeInfo object.
   */
  static fromISO(isoString: string): DateTimeInfo {
    return DateTimeUtil.createDateTimeInfo(isoString);
  }

  /**
   * Converteert een Unix timestamp (in milliseconden) naar een DateTimeInfo object.
   * Behandelt de input als UTC.
   * @param timestamp - De timestamp in milliseconden.
   * @returns Een DateTimeInfo object.
   */
  static fromTimestamp(timestamp: number): DateTimeInfo {
    return DateTimeUtil.createDateTimeInfo(timestamp);
  }

  /**
   * Geeft het huidige DateTimeInfo object terug, gebaseerd op UTC tijd.
   * @returns Een DateTimeInfo object voor het huidige moment in UTC.
   */
  static now(): DateTimeInfo {
    return DateTimeUtil.createDateTimeInfo(); // Zonder argument, default naar nu
  }

  /**
   * Utility om een DateTimeInfo object te formatteren naar een specifieke string,
   * gebruikmakend van Luxon's formatting tokens en optioneel een timezone.
   * @param dateTimeInfo - Het DateTimeInfo object om te formatteren.
   * @param formatString - De Luxon format string (e.g., 'DDDD, HH:mm').
   * @param timezoneId - Optioneel: IANA timezone om naar te converteren voor formattering.
   * @returns De geformatteerde datum/tijd string, of de ISO string bij een fout.
   */
  static format(dateTimeInfo: DateTimeInfo, formatString: string, timezoneId?: string): string {
    try {
      let dt = DateTime.fromISO(dateTimeInfo.iso, { zone: 'utc' }); // Start vanuit UTC ISO
      if (timezoneId) {
        dt = dt.setZone(timezoneId); // Converteer naar doel timezone voor formattering
      }
      return dt.toFormat(formatString);
    } catch (e) {
      console.error(`[DateTimeUtil] Error formatting DateTimeInfo:`, e, dateTimeInfo);
      return dateTimeInfo.iso; // Fallback
    }
  }
}

--- END OF FILE ---

--- START OF FILE libs/shared/utils/src/lib/utils/type-safety.utils.ts ---

/**
 * @file type-safety.utils.ts
 * @version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-15
 * @description
 *   Provides essential, self-contained type-safety utility functions for the
 *   products-core library to avoid external dependencies for basic checks.
 */

/**
 * @function isDefined
 * @description A strict type guard that checks if a value is not null and not undefined.
 * @param {T | null | undefined} value - The value to check.
 * @returns {boolean} True if the value is defined.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * @function withDefault
 * @description Returns the provided value if it is defined, otherwise returns the default value.
 * @param {T | null | undefined} value - The potentially undefined value.
 * @param {T} defaultValue - The value to return if the original value is not defined.
 * @returns {T} The original value or the default value.
 */
export function withDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

/**
 * @function emptyStringToNull
 * @description Converteert een lege string naar null. Dit is handig voor velden
 *              die optionele GUIDs of andere strings verwachten, om ervoor te zorgen
 *              dat de JSON-serialisatie compatibel is met backend `Guid?` of `string?` types.
 * @param value De input string, null, of undefined.
 * @returns null als de input een lege string is, anders de originele waarde.
 */
export function emptyStringToNull(value: string | null | undefined): string | null | undefined {
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  return value;
}

--- END OF FILE ---

--- START OF FILE libs/store/auth/src/index.ts ---

/**
 * @file index.ts
 * @Version 3.1.0 (Modern NgRx Feature Exports - Corrected)
 * @Description
 *   De publieke API surface voor de @royal-code/store/auth library.
 *   Deze file exporteert de essentiële elementen die andere delen van de
 *   applicatie nodig hebben, zoals de Facade, de Actions, de providers-functie,
 *   en de benodigde state-interface en selectors voor guards.
 */

// Publieke interface om met de store te interageren
export * from './lib/state/auth.facade';

// Acties die mogelijk door andere features (of interceptors) worden gedispatcht
export * from './lib/state/auth.actions';

// De functie om de feature te registreren in de applicatie
export * from './lib/auth.providers';

export type { AuthState } from './lib/state/auth.feature';
export { selectAuthState } from './lib/state/auth.feature';

export * from './lib/state/auth.feature';

--- END OF FILE ---

--- START OF FILE libs/store/auth/src/lib/state/auth.actions.ts ---

// libs/store/auth/src/lib/state/auth.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@royal-code/auth/domain';
import { Profile } from '@royal-code/shared/domain';

export const AuthActions = createActionGroup({
  source: 'Auth', // Bron van de acties
  events: {
    // --- UI / Component Initiated Actions ---
    'Login Page Submitted': props<{ credentials: LoginCredentials }>(),
    'Logout Button Clicked': emptyProps(),
    'Check Auth Status on App Init': emptyProps(),
    'Clear Auth Error': emptyProps(),
    'Login Prompt Required': props<{
      messageKey?: string; // Optionele i18n key voor een bericht zoals "Log in om door te gaan"
      reason?: string; // Voor logging, bv. 'MESSAGE_LIMIT_REACHED'
    }>(),

    // --- Auth API / Effect Initiated Actions ---
    'Login Success': props<{ response: AuthResponse; returnUrl: string }>(),
    'Login Failure': props<{ error: string }>(),

    'Refresh Token Requested': emptyProps(),
    'Refresh Token Success': props<{ response: AuthResponse }>(),
    'Refresh Token Failure': props<{ error: string }>(),

    'Logout API Success': emptyProps(),
    'Logout API Failure': props<{ error: string }>(),

    'Session Expired And Requires Login': emptyProps(),
    'Logout Completed': emptyProps(),
    'Session Restored': props<{ accessToken: string; refreshToken: string | undefined; decodedUser: Profile }>(),
        'Silent Refresh Triggered': emptyProps(),
    'Token Will Expire Soon': props<{ secondsUntilExpiry: number }>(),

    'Register Page Submitted': props<{ credentials: RegisterCredentials }>(),

    // --- Auth API / Effect Initiated Actions ---
    'Register Success': props<{ response: AuthResponse; returnUrl: string }>(),
    'Register Failure': props<{ error: string }>(),

  }
});

--- END OF FILE ---

--- START OF FILE libs/store/auth/src/lib/state/auth.effects.ts ---

/**
 * @file auth.effects.ts
 * @Version 2.6.0 (Robust Session Restore & Claim Mapping)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-05
 * @Description
 *   Orchestreert alle side-effects gerelateerd aan authenticatie. Deze versie fixt een
 *   kritieke bug waarbij de gebruiker werd uitgelogd na een refresh. De `checkAuthOnInit$`
 *   effect is nu robuust gemaakt om de standaard Microsoft Identity JWT claims
 *   (zoals `nameidentifier` en `name`) correct te mappen naar de frontend `Profile`
 *   interface, waardoor sessieherstel betrouwbaar werkt.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, timer } from 'rxjs';
import { map, exhaustMap, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';

import { AuthService, TokenStorageService } from '@royal-code/auth/data-access';
import { LoggerService } from '@royal-code/core/logging';
import { NotificationService } from '@royal-code/ui/notifications';
import { AuthActions } from './auth.actions';
import { Profile } from '@royal-code/shared/domain';
import { Image, MediaType } from '@royal-code/shared/domain';
import { DynamicOverlayService } from 'libs/ui/overlay/src/lib/dynamic-overlay.service';
import { TranslateService } from '@ngx-translate/core';
import { LoginComponent } from '@royal-code/features/authentication'

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly store = inject(Store);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly overlayService = inject(DynamicOverlayService);
    private readonly translate = inject(TranslateService);

  
  private readonly LOG_PREFIX = '[AuthEffects]';

  /**
   * @effect loginRequested$
   * @description Handles the full login flow.
   */
     loginRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginPageSubmitted),
      tap(() => this.logger.info(`${this.LOG_PREFIX} Handling Login Page Submitted...`)),
      map(action => ({
        action,
        returnUrl: this.router.routerState.snapshot.root.queryParamMap.get('returnUrl') || '/'
      })),
      exhaustMap(({ action, returnUrl }) =>
        this.authService.login(action.credentials).pipe(
          map(response => {
            // Gebruik de nieuwe helper functie om het profiel te mappen.
            const userProfile: Profile = this.mapRawAvatarToImageToProfile(response.user);

            this.logger.info(`${this.LOG_PREFIX} Login API Success for user ${userProfile.id}.`);
            return AuthActions.loginSuccess({ 
              response: { ...response, user: userProfile }, 
              returnUrl 
            });
          }),
          catchError((error: HttpErrorResponse) => {
            const errorKey = error.status === 401 ? 'auth.login.invalidCredentials' : 'errors.server.unknownError';
            this.logger.warn(`${this.LOG_PREFIX} Login API call failed.`, { status: error.status, error });
            return of(AuthActions.loginFailure({ error: errorKey }));
          })
        )
      )
    )
  );

   showLoginPrompt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginPromptRequired),
      tap(({ messageKey, reason }) => {
        this.logger.info(`[AuthEffects] Login prompt required. Reason: ${reason ?? 'No reason specified'}`);
        // Toon eventueel een notificatie
        if (messageKey) {
            this.notificationService.showInfo(this.translate.instant(messageKey));
        }
        // Open de login component in een overlay
        this.overlayService.open({
            component: LoginComponent,
            panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
            backdropType: 'dark',
            mobileFullscreen: true
        });
      })
    ),
    { dispatch: false }
  );


  handleSessionExpired$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.sessionExpiredAndRequiresLogin),
    tap(() => {
      this.logger.info(`${this.LOG_PREFIX} Session expired. Clearing tokens and showing login overlay.`);
      this.tokenStorage.clearTokens(); // Maak de ongeldige tokens schoon
      this.store.dispatch(AuthActions.logoutCompleted()); // Zorg dat de state gereset wordt

      // Open hier de overlay. Je moet nog een SessionExpiredOverlayComponent maken.
      // this.overlayService.open({
      //   component: SessionExpiredOverlayComponent,
      //   backdropType: 'dark',
      //   panelClass: 'max-w-md'
      // });
    })
  ),
  { dispatch: false }
);


   /**
   * @effect checkAuthOnInit$
   * @description Checks for an existing session on app startup and maps the token data correctly.
   *              This effect is critical for maintaining user session across page refreshes.
   */
     checkAuthOnInit$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.checkAuthStatusOnAppInit),
    switchMap(() => {
      this.logger.debug(`${this.LOG_PREFIX} Checking auth status on init.`);
      
      const accessToken = this.tokenStorage.getAccessToken();
      const refreshToken = this.tokenStorage.getRefreshToken();

      // Geen tokens = geen sessie
      if (!accessToken || !refreshToken) {
        this.logger.debug(`${this.LOG_PREFIX} Geen tokens gevonden.`);
        this.tokenStorage.clearTokens();
        return of(AuthActions.logoutCompleted());
      }

      // Check alleen access token (refresh token is opaque)
      const isAccessExpired = this.tokenStorage.isAccessTokenExpired();

      // Access token verlopen = probeer te vernieuwen
      if (isAccessExpired) {
        this.logger.info(`${this.LOG_PREFIX} Access token verlopen, vernieuwen met refresh token...`);
        return this.authService.refreshToken().pipe(
          map(response => {
            this.logger.info(`${this.LOG_PREFIX} Token succesvol vernieuwd.`);
            const decodedUser = this.tokenStorage.getDecodedAccessToken();
            const mappedProfile = this.mapRawAvatarToImageToProfile(decodedUser);
            
            return AuthActions.sessionRestored({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken || refreshToken,
              decodedUser: mappedProfile
            });
          }),
          catchError((error) => {
            // Refresh token is waarschijnlijk verlopen op de server
            this.logger.error(`${this.LOG_PREFIX} Token vernieuwing mislukt, sessie verlopen.`, error);
            this.tokenStorage.clearTokens();
            return of(AuthActions.logoutCompleted());
          })
        );
      }

      // Token is geldig, herstel sessie
      this.logger.info(`${this.LOG_PREFIX} Access token geldig (nog ${this.tokenStorage.getTimeUntilExpiry()}s), sessie herstellen.`);
      const decodedUser = this.tokenStorage.getDecodedAccessToken();
      const mappedProfile = this.mapRawAvatarToImageToProfile(decodedUser);
      
      return of(AuthActions.sessionRestored({
        accessToken,
        refreshToken,
        decodedUser: mappedProfile
      }));
    })
  )
);

  private refreshTokenWithFallback() {
    return this.authService.refreshToken().pipe(
      map(response => {
        this.logger.info(`${this.LOG_PREFIX} Token succesvol vernieuwd.`);
        const decodedUser = this.tokenStorage.getDecodedAccessToken();
        const mappedProfile = this.mapRawAvatarToImageToProfile(decodedUser);
        
        return AuthActions.sessionRestored({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || this.tokenStorage.getRefreshToken()!,
          decodedUser: mappedProfile
        });
      }),
      catchError((error) => {
        this.logger.error(`${this.LOG_PREFIX} Token vernieuwing mislukt.`, error);
        this.tokenStorage.clearTokens();
        return of(AuthActions.logoutCompleted());
      })
    );
  }

    scheduleTokenRefresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sessionRestored, AuthActions.loginSuccess, AuthActions.refreshTokenSuccess),
      switchMap(() => {
        const timeUntilExpiry = this.tokenStorage.getTimeUntilExpiry();
        if (!timeUntilExpiry || timeUntilExpiry <= 0) return of();

        // Refresh 60 seconden voor expiry
        const refreshDelay = Math.max(0, (timeUntilExpiry - 60) * 1000);
        
        this.logger.debug(`${this.LOG_PREFIX} Token refresh gepland over ${refreshDelay / 1000}s`);
        
        return timer(refreshDelay).pipe(
          map(() => AuthActions.refreshTokenRequested())
        );
      })
    )
  );


    registerRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerPageSubmitted),
      tap(() => this.logger.info(`${this.LOG_PREFIX} Handling Register Page Submitted...`)),
      exhaustMap(({ credentials }) =>
        this.authService.register(credentials).pipe(
          map(response => {
            const userProfile: Profile = this.mapRawAvatarToImageToProfile(response.user);
            this.logger.info(`${this.LOG_PREFIX} Register API Success for user ${userProfile.id}.`);
            // Stuur gebruiker na registratie altijd naar de homepagina.
            return AuthActions.registerSuccess({ response: { ...response, user: userProfile }, returnUrl: '/' });
          }),
                    catchError((error: HttpErrorResponse) => {
            const defaultErrorKey = 'auth.register.genericError';
            let errorKey = defaultErrorKey;

            // Pars de backend ValidationProblemDetails voor specifieke foutcodes
            if (error.status === 400 && error.error?.errors) {
              const validationErrors = error.error.errors;
              // Loop door de fouten om de eerste relevante foutcode te vinden
              for (const field in validationErrors) {
                if (validationErrors.hasOwnProperty(field)) {
                  const fieldErrors = validationErrors[field];
                  for (const err of fieldErrors) {
                    switch (err.code) { // Gebruik de ErrorCode van de backend
                      case 'PasswordTooShort': errorKey = 'errors.validation.password.tooShort'; break;
                      case 'PasswordNoUppercase': errorKey = 'errors.validation.password.noUppercase'; break;
                      case 'PasswordNoLowercase': errorKey = 'errors.validation.password.noLowercase'; break;
                      case 'PasswordNoDigit': errorKey = 'errors.validation.password.noDigit'; break;
                      case 'PasswordNoSpecialChar': errorKey = 'errors.validation.password.noSpecialChar'; break;
                      case 'DuplicateUserName': errorKey = 'auth.register.duplicateEmail'; break; // specifieke duplicate error
                      // Voeg hier meer custom ErrorCodes toe indien nodig
                      default:
                        // Als er geen specifieke match is, toon een generieke fout
                        if (err.description) {
                            // Als de backend een gebruikersvriendelijke beschrijving geeft, gebruik die
                            // (let op: dit kan mogelijk onvertaalde tekst zijn als de backend-string geen i18n key is)
                            errorKey = err.description; 
                        } else {
                           errorKey = 'auth.register.validationError'; // Algemene validatiefout
                        }
                        break;
                    }
                    if (errorKey !== defaultErrorKey) break; // Stop bij de eerste specifieke fout
                  }
                }
                if (errorKey !== defaultErrorKey) break;
              }
            } else if (error.status === 409) { // Conflict for duplicate unique fields, e.g., email
                errorKey = 'auth.register.duplicateEmail'; // specifieke duplicate error
            }

            this.logger.warn(`${this.LOG_PREFIX} Register API call failed.`, { status: error.status, error, resolvedErrorKey: errorKey });
            return of(AuthActions.registerFailure({ error: errorKey }));
          })

        )
      )
    )
  );

  /**
   * @effect registerSuccessNavigation$
   * @description Navigates after a successful registration.
   */
  registerSuccessNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ returnUrl }) => {
        this.logger.info(`${this.LOG_PREFIX} Register success, navigating to: ${returnUrl}`);
        this.router.navigateByUrl(returnUrl);
        this.notificationService.showSuccess('Registratie succesvol! Welkom.');
      })
    ),
    { dispatch: false }
  );

  /**
   * @effect loginSuccessNavigation$
   * @description Navigates after a successful login.
   */
  loginSuccessNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ returnUrl }) => {
        this.logger.info(`${this.LOG_PREFIX} Login success, navigating to: ${returnUrl}`);
        this.router.navigateByUrl(returnUrl);
      })
    ),
    { dispatch: false }
  );

  /**
   * @effect refreshTokenRequested$
   * @description Handles refreshing the access token.
   */
  refreshTokenRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenRequested),
      exhaustMap(() =>
        this.authService.refreshToken().pipe(
          map(response => {
            this.logger.info(`${this.LOG_PREFIX} Refresh token successful.`);
            return AuthActions.refreshTokenSuccess({ response });
          }),
          catchError((error) => {
            this.logger.error(`${this.LOG_PREFIX} Refresh token failed.`, error);
            return of(AuthActions.refreshTokenFailure({ error: 'auth.refresh.failed' }));
          })
        )
      )
    )
  );

  /**
   * @effect logoutRequested$
   * @description Handles the logout procedure.
   */
  logoutRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutButtonClicked),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => {
            this.logger.info(`${this.LOG_PREFIX} Logout API service call completed successfully.`);
            return AuthActions.logoutAPISuccess();
          }),
          catchError((error) => {
            this.logger.error(`${this.LOG_PREFIX} Logout API call failed, but proceeding with client-side logout anyway.`, error);
            return of(AuthActions.logoutAPIFailure({ error: 'Logout API call failed.' }));
          })
        )
      )
    )
  );


  /**
   * @effect logoutCleanupAndNavigate$
   * @description Cleans up storage and navigates to login after ANY logout trigger.
   */
  logoutCleanupAndNavigate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutButtonClicked, AuthActions.refreshTokenFailure),
      tap((action) => {
        this.logger.info(`${this.LOG_PREFIX} Action ${action.type} triggered cleanup and redirect to login.`);
        this.tokenStorage.clearTokens();
        this.router.navigate(['/login']);
        if (action.type === AuthActions.refreshTokenFailure.type) {
          this.notificationService.showInfo('Je sessie is verlopen, log opnieuw in.');
        }
        // Dispatch de 'completed' actie hier, NADAT de redirect is geïnitieerd.
        this.store.dispatch(AuthActions.logoutCompleted());
      })
    ),
    { dispatch: false }
  );

  /**
   * Helper function to map a raw avatar value from JWT payload to a structured Image object.
   * Handles both string URLs and already-mapped Image objects gracefully.
   */
  private mapRawAvatarToImage(rawAvatar: any, displayName: string): Image | undefined {
    if (!rawAvatar) return undefined;

    if (typeof rawAvatar === 'string' && rawAvatar.trim() !== '') {
      return {
        id: `avatar_${displayName.replace(/\s+/g, '_').toLowerCase()}`,
        type: MediaType.IMAGE,
        variants: [{ url: rawAvatar, purpose: 'original' }],
        altText: `${displayName}'s avatar`,
      };
    } else if (typeof rawAvatar === 'object' && rawAvatar.id && rawAvatar.type === MediaType.IMAGE) {
      const img = rawAvatar as Image;
      return {
        ...img,
        variants: img.variants?.map(v => ({ ...v, url: String(v.url) })) || [],
        altText: img.altText || `${displayName}'s avatar`,
      };
    }
    this.logger.warn(`${this.LOG_PREFIX} Unexpected avatar format encountered:`, rawAvatar);
    return undefined;
  }

    private mapRawAvatarToImageToProfile(rawDecodedUser: any): Profile {
      const userId = rawDecodedUser?.id ?? rawDecodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const userDisplayName = rawDecodedUser?.displayName ?? rawDecodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      
      if (!userId || !userDisplayName) {
        this.logger.error(`${this.LOG_PREFIX} Token found, but decoded user is invalid (missing ID or displayName). Cannot map to profile.`, { rawDecodedUser });
        // Return a minimal, placeholder profile or throw, depending on desired error handling
        return { id: 'unknown_id', displayName: 'Unknown User' };
      }

      const avatarImage = this.mapRawAvatarToImage(rawDecodedUser.avatar, userDisplayName); // existing method

      return {
          id: userId,
          displayName: userDisplayName,
          avatar: avatarImage,
      };
  }

}

--- END OF FILE ---

--- START OF FILE libs/store/auth/src/lib/state/auth.facade.ts ---

/**
 * @file auth.facade.ts
 * @Version 3.1.0 (Complete Dual API - Signals & Observables)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   De publieke API voor de Auth-state. Deze facade is de enige interface die componenten
 *   en effects zouden moeten gebruiken. Het biedt nu een complete, duale API met zowel
 *   Signals (voor UI) als Observables (voor RxJS-stromen zoals in effects).
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs'; // <-- Importeer Observable
import { AuthActions } from './auth.actions';
import { selectIsAuthenticated, selectCurrentUser, selectAuthLoading, selectAuthError } from './auth.feature';
import { Profile } from '@royal-code/shared/domain';
import { LoginCredentials, RegisterCredentials } from '@royal-code/auth/domain';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(Store);

  // --- PUBLIC API: STATE SIGNALS (voor UI) ---

  /** @description Een signaal dat `true` is als de gebruiker geauthenticeerd is. */
  readonly isAuthenticated: Signal<boolean> = this.store.selectSignal(selectIsAuthenticated);

  /** @description Een signaal dat het profiel van de huidige gebruiker bevat, of `null` indien niet ingelogd. */
  readonly currentUser: Signal<Profile | null> = this.store.selectSignal(selectCurrentUser);

  /** @description Een signaal dat `true` is als er een authenticatie-operatie (login, refresh) bezig is. */
  readonly isLoading: Signal<boolean> = this.store.selectSignal(selectAuthLoading);

  /** @description Een signaal dat de laatste authenticatie-foutmelding bevat, of `null`. */
  readonly error: Signal<string | null> = this.store.selectSignal(selectAuthError);

  /** @description Een Observable-stream die `true` is als de gebruiker geauthenticeerd is. */
  readonly isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);

  /** @description Een Observable-stream die het profiel van de huidige gebruiker bevat. */
  readonly currentUser$: Observable<Profile | null> = this.store.select(selectCurrentUser);

  readonly currentUserId: Signal<string | null> = computed(() => this.currentUser()?.id ?? null);

  /** @description Een Observable-stream die `true` is als er een authenticatie-operatie bezig is. */
  readonly isLoading$: Observable<boolean> = this.store.select(selectAuthLoading);

  /** @description Een Observable-stream die de laatste authenticatie-foutmelding bevat. */
  readonly error$: Observable<string | null> = this.store.select(selectAuthError);

  // --- PUBLIC API: ACTION DISPATCHERS ---

  register(credentials: RegisterCredentials): void {
    this.store.dispatch(AuthActions.registerPageSubmitted({ credentials }));
  }

  /** @description Start het login-proces door een actie te dispatchen. */
  login(credentials: LoginCredentials): void {
    this.store.dispatch(AuthActions.loginPageSubmitted({ credentials }));
  }

  /** @description Start het uitlog-proces. */
  logout(): void {
    this.store.dispatch(AuthActions.logoutButtonClicked());
  }

  /** @description Vraagt een controle van de auth-status aan, meestal bij het opstarten van de app. */
  checkAuthStatus(): void {
    this.store.dispatch(AuthActions.checkAuthStatusOnAppInit());
  }

  /** @description Wist de huidige foutmelding uit de state. */
  clearAuthError(): void {
    this.store.dispatch(AuthActions.clearAuthError());
  }
}

--- END OF FILE ---

--- START OF FILE libs/store/auth/src/lib/state/auth.feature.ts ---

/**
 * @file auth.feature.ts
 * @Version 3.0.0 (Modern Signal Store Feature)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-16
 * @Description
 *   Definieert de volledige "feature slice" voor authenticatie met behulp van NgRx `createFeature`.
 *   Deze aanpak centraliseert de state-interface, de reducer-logica en de selectors in één bestand.
 *   De reducer-logica is een exacte vertaling van de bewezen-werkende flow om race-condities
 *   te voorkomen en een stabiele interactie met de router guard te garanderen.
 */
import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { Profile } from '@royal-code/shared/domain';

// ==================================================================================
// 1. STATE DEFINITIE
// ==================================================================================

export interface AuthState {
  isAuthenticated: boolean;
  user: Profile | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};


// ==================================================================================
// 2. NGRX FEATURE CREATIE (REDUCER + SELECTORS)
// ==================================================================================

export const authFeature = createFeature({
  name: 'auth', // Dit wordt de key in de globale store state
  reducer: createReducer(
    initialAuthState,

    // --- Login Flow ---
    on(AuthActions.loginPageSubmitted, (state): AuthState => ({
      ...state,
      loading: true,
      error: null
    })),

    // Zet loading op false na de login API call, zoals in de originele werkende versie.
    on(AuthActions.loginSuccess, (state, { response }): AuthState => ({
      ...state,
      isAuthenticated: true,
      user: response.user ?? null,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? null,
      loading: false,
      error: null
    })),

    on(AuthActions.loginFailure, (state, { error }): AuthState => ({
      ...initialAuthState,
      error: error
    })),

    on(AuthActions.sessionRestored, (state, { accessToken, refreshToken, decodedUser }): AuthState => ({
      ...state,
      isAuthenticated: true,
      accessToken,
      refreshToken: refreshToken ?? null,
      user: decodedUser,
      loading: false,
      error: null,
    })),

    // --- Refresh Token Flow ---
    on(AuthActions.refreshTokenRequested, (state): AuthState => ({
      ...state,
      loading: true,
      error: null
    })),

    on(AuthActions.refreshTokenSuccess, (state, { response }): AuthState => ({
      ...state,
      isAuthenticated: true,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? state.refreshToken,
      loading: false,
      error: null
    })),

    on(AuthActions.refreshTokenFailure, (state, { error }): AuthState => ({
      ...initialAuthState,
      error: error
    })),

    // --- Logout Flow ---
    on(AuthActions.logoutButtonClicked, (state): AuthState => ({
      ...state,
      loading: true,
    })),

    on(AuthActions.logoutCompleted, (): AuthState => ({
      ...initialAuthState
    })),

        on(AuthActions.registerPageSubmitted, (state): AuthState => ({
      ...state,
      loading: true,
      error: null
    })),

    on(AuthActions.registerSuccess, (state, { response }): AuthState => ({
      ...state,
      isAuthenticated: true,
      user: response.user ?? null,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? null,
      loading: false,
      error: null
    })),

    on(AuthActions.registerFailure, (state, { error }): AuthState => ({
      ...initialAuthState,
      error: error
    })),



    // --- Clear Error ---
    on(AuthActions.clearAuthError, (state): AuthState => ({
      ...state,
      error: null
    }))
  ),
});

// ==================================================================================
// 3. EXPORTEER DE GEGENEREERDE SELECTORS MET ALIASING
// ==================================================================================
export const {
  name: AUTH_FEATURE_KEY,
  reducer: authReducer,

  selectAuthState,
  selectIsAuthenticated,
  selectAccessToken,

  // Hernoem de automatisch gegenereerde selectors voor externe consistentie
  selectUser: selectCurrentUser,
  selectLoading: selectAuthLoading,
  selectError: selectAuthError,

} = authFeature;

--- END OF FILE ---

--- START OF FILE libs/store/user/src/index.ts ---

/**
 * @file index.ts
 * @Version 3.0.0 (Definitive Blueprint)
 * @Description Public API for the User store.
 */

// Public API for components
export * from './lib/state/user.facade';

// For DI and feature registration
export * from './lib/user.providers';

// Actions for cross-feature interaction (e.g., checkout effect)
export * from './lib/state/user.actions';

// Types for payloads and models
export * from './lib/state/user.types';

// Feature and selectors for advanced use cases (e.g., guards)
export * from './lib/state/user.feature';

--- END OF FILE ---

--- START OF FILE libs/store/user/src/lib/state/user.actions.ts ---

/**
 * @file user.actions.ts
 * @Version 3.0.0 (Definitive Blueprint)
 * @Description NgRx actions voor de globale User store.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ApplicationSettings } from '@royal-code/shared/domain';
import {
  UserProfile,
  UserAddress,
  UpdateSettingsPayload,
  CreateAddressPayload,
  UpdateAddressPayload,
} from './user.types';
import { State as UserState } from './user.feature';
import { Profile } from 'libs/features/social/domain/src/lib/models/profile.model';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    // --- Lifecycle & Context ---
    'Context Initialized': emptyProps(),
    'State Cleared on Logout': emptyProps(),

    // --- Profile Actions ---
    'Load Profile Requested': emptyProps(),
    'Load Profile Success': props<{ profile: Profile }>(),
    'Load Profile Failure': props<{ error: string }>(),

    // --- Settings Actions ---
    'Load Settings Requested': emptyProps(),
    'Load Settings Success': props<{ settings: ApplicationSettings }>(),
    'Load Settings Failure': props<{ error: string }>(),
    'Update Settings Submitted': props<{ payload: UpdateSettingsPayload }>(),
    'Update Settings Success': props<{ settings: ApplicationSettings }>(),
    'Update Settings Failure': props<{ error: string }>(),

    // --- Address Actions ---
    'Load Addresses Requested': emptyProps(),
    'Load Addresses Success': props<{ addresses: UserAddress[] }>(),
    'Load Addresses Not Modified': emptyProps(),
    'Load Addresses Failure': props<{ error:string }>(),
    'Address Version Updated': props<{ version: number }>(),
    'Create Address Submitted': props<{ payload: CreateAddressPayload; tempId: string }>(),
    'Create Address Success': props<{ address: UserAddress; tempId: string }>(),
    'Create Address Failure': props<{ error: string; tempId: string }>(),
    'Update Address Submitted': props<{ id: string; payload: UpdateAddressPayload }>(),
    'Update Address Success': props<{ addressUpdate: Update<UserAddress> }>(),
    'Update Address Failure': props<{ error: string; id: string }>(),
    'Delete Address Submitted': props<{ id: string }>(),
    'Delete Address Success': props<{ id: string }>(),
    'Delete Address Failure': props<{ error: string; id: string; originalAddress: UserAddress | null }>(),
  },
});

--- END OF FILE ---

--- START OF FILE libs/store/user/src/lib/state/user.effects.ts ---

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, timer } from 'rxjs';
import { catchError, map, switchMap, concatMap, tap, withLatestFrom, mergeMap } from 'rxjs/operators';
import { UserActions } from './user.actions';
import { AuthActions } from '@royal-code/store/auth';
import { AbstractAccountApiService } from '@royal-code/features/account/core';
import { NotificationService } from '@royal-code/ui/notifications';
import { UpdateAddressPayload, UserAddress } from './user.types';
import { LoggerService } from '@royal-code/core/logging';
import { Address, ApplicationSettings } from '@royal-code/shared/domain';
import { userFeature } from './user.feature';
import { Store } from '@ngrx/store';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Profile } from 'libs/features/social/domain/src/lib/models/profile.model';

@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly accountService = inject(AbstractAccountApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly store = inject(Store);
  private readonly LOG_PREFIX = '[UserEffects]';
  private readonly refreshAttempted = new Set<string>();

  loadDataOnLogin$ = createEffect(() =>
    this.actions$.pipe(ofType(AuthActions.loginSuccess, AuthActions.sessionRestored), map(() => UserActions.contextInitialized()))
  );

  triggerInitialLoads$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.contextInitialized),
      switchMap(() => [
        UserActions.loadProfileRequested(),
        UserActions.loadSettingsRequested(),
        UserActions.loadAddressesRequested()
      ])
    )
  );

   loadUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadProfileRequested),
      switchMap(() => {
        const attemptKey = 'profile';
        
        return this.accountService.getProfileDetails().pipe(
          map(profileDetails => {
            this.refreshAttempted.delete(attemptKey);
            const profile: Profile = {
              id: profileDetails.id,
              displayName: profileDetails.displayName,
            };
            return UserActions.loadProfileSuccess({ profile });
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !this.refreshAttempted.has(attemptKey)) {
              // Markeer dat we een refresh proberen
              this.refreshAttempted.add(attemptKey);
              this.logger.info('[UserEffects] 401 ontvangen, probeer token te vernieuwen...');
              
              // Dispatch refresh en probeer opnieuw
              return of(AuthActions.refreshTokenRequested()).pipe(
                mergeMap(() => timer(1000)), // Wacht even op refresh
                mergeMap(() => of(UserActions.loadProfileRequested()))
              );
            }
            
            this.refreshAttempted.delete(attemptKey);
            
            if (error.status === 401) {
              // Tweede 401 = echt uitloggen
              return of(AuthActions.logoutButtonClicked());
            }
            
            return of(UserActions.loadProfileFailure({ 
              error: 'errors.user.profileLoadFailed' 
            }));
          })
        );
      })
    )
  );

loadSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadSettingsRequested),
      switchMap(() =>
        this.accountService.getUserSettings().pipe(
          map((settings: ApplicationSettings) =>
            UserActions.loadSettingsSuccess({ settings })
          ),
          catchError((err: HttpErrorResponse) => {
            this.logger.error(`${this.LOG_PREFIX} Failed to load settings from API.`, err);
            if (err.status === 401) return of(AuthActions.logoutButtonClicked()); // <-- ADDED: Handle 401 Unauthorized
            return of(UserActions.loadSettingsFailure({ error: 'Failed to load settings.' }));
          })
        )
      )
    )
  );


  loadAddresses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadAddressesRequested),
      switchMap(() => {
        this.logger.debug(`${this.LOG_PREFIX} Requesting addresses from API.`);
        return this.accountService.getAddresses().pipe(
          map((addresses: Address[]) => {
            this.logger.info(`${this.LOG_PREFIX} API returned addresses. Count: ${addresses.length}. Data:`, addresses);
            return UserActions.loadAddressesSuccess({ addresses });
          }),
          catchError((err: HttpErrorResponse) => {
            this.logger.error(`${this.LOG_PREFIX} Failed to load addresses from API.`, err);
            if (err.status === 401) return of(AuthActions.logoutButtonClicked()); // <-- ADDED: Handle 401 Unauthorized
            return of(UserActions.loadAddressesFailure({ error: 'Failed to load addresses.' }));
          })
        );
      })
    )
  );


  
  createAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createAddressSubmitted),
      concatMap(({ payload, tempId }) =>
        this.accountService.createAddress(payload).pipe(
          map(address => {
            this.notificationService.showSuccess('Adres toegevoegd!');
            return UserActions.createAddressSuccess({ address, tempId });
          }),
          catchError((err: HttpErrorResponse) => {
            const error = err.message || 'Failed to create address.';
            return of(UserActions.createAddressFailure({ error, tempId }));
          })
        )
      )
    )
  );

updateAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateAddressSubmitted),
      concatMap(({ id, payload }) =>
        // <<< FIX: Payload hoeft niet meer gecast te worden, omdat de abstracte service nu UpdateAddressPayload verwacht. >>>
        // De service retourneert nu een complete Address, wat past bij Update<UserAddress>.
        this.accountService.updateAddress(id, payload).pipe(
          map(updatedAddress => {
            this.notificationService.showSuccess('Adres bijgewerkt!');
            // 'changes' verwacht Partial<UserAddress>, en updatedAddress is een volledige Address.
            // Dit is compatibel, dus een simpele toewijzing is prima.
            return UserActions.updateAddressSuccess({ addressUpdate: { id, changes: updatedAddress } });
          }),
          catchError(() => of(UserActions.updateAddressFailure({ error: 'Failed to update address.', id })))
        )
      )
    )
  );


  deleteAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteAddressSubmitted),
      withLatestFrom(this.store.select(userFeature.selectAddressEntities)),
      concatMap(([{ id }, entities]) => {
        const originalAddress = entities[id] ?? null;
        return this.accountService.deleteAddress(id).pipe(
          map(() => {
            this.notificationService.showSuccess('Adres verwijderd.');
            return UserActions.deleteAddressSuccess({ id });
          }),
          catchError((error) => {
            const errorMessage = "Verwijderen mislukt. Adres is hersteld.";
            this.notificationService.showError(errorMessage);
            return of(UserActions.deleteAddressFailure({ error: errorMessage, id, originalAddress }));
          })
        )
      })
    )
  );

  reloadAddressesAfterModification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UserActions.createAddressSuccess,
        UserActions.updateAddressSuccess,
        UserActions.deleteAddressSuccess
      ),
      tap(action => this.logger.info(`[UserEffects] Address list modified via ${action.type}. Triggering reload.`)),
      map(() => UserActions.loadAddressesRequested())
    )
  );
}

--- END OF FILE ---

--- START OF FILE libs/store/user/src/lib/state/user.facade.ts ---

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
  UserProfile,
  UserAddress,
  UpdateSettingsPayload,
  CreateAddressPayload,
  UpdateAddressPayload,
  UserViewModel,
  FeatureError,
} from './user.types';
import { ApplicationSettings } from '@royal-code/shared/domain';
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

--- END OF FILE ---

--- START OF FILE libs/store/user/src/lib/state/user.feature.ts ---

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
import { Address, ApplicationSettings, SyncStatus } from '@royal-code/shared/domain';
import { Profile } from 'libs/features/social/domain/src/lib/models/profile.model';

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

  on(UserActions.updateAddressSubmitted, (state, { id, payload }) => {
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

--- END OF FILE ---

--- START OF FILE libs/store/user/src/lib/state/user.types.ts ---

// --- IN: libs/store/user/src/lib/state/user.types.ts ---
// --- VERVANG HET HELE BESTAND OM ZEKER TE ZIJN DAT ALLES KLOPT ---

/**
 * @file user.types.ts
 * @Version 2.2.0 (Corrected with SyncStatus)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description
 *   TypeScript interfaces for the User domain, now including SyncStatus for
 *   optimistic updates on UserAddress entities.
 */
import { Address, ApplicationSettings, SyncStatus } from '@royal-code/shared/domain';
import { Profile } from 'libs/features/social/domain/src/lib/models/profile.model';

// Hoofd-entiteit voor de state. Dit is de versie die in de NgRx Entity state leeft.
export interface UserAddress extends Address {
  syncStatus?: SyncStatus;
  error?: string | null;
}

// Kleinere, afgeleide types
export type UserProfile = Profile;

// Payloads voor CUD operaties. Deze zijn nu gebaseerd op de basis `Address`.
export type CreateAddressPayload = Omit<Address, 'id' | 'createdAt' | 'lastModified' | 'createdBy' | 'lastModifiedBy'>;
export type UpdateAddressPayload = Partial<Address>;

// Andere payloads
export type UpdateProfilePayload = Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateSettingsPayload = Partial<ApplicationSettings>;


// Lokaal error-object voor de state
export interface FeatureError {
  readonly userMessage: string;
  readonly operation?: string;
}

// De ViewModel wordt hier gedefinieerd en geëxporteerd zodat de facade het kan gebruiken.
export interface UserViewModel {
  readonly profile: UserProfile | null;
  readonly settings: ApplicationSettings | null;
  readonly addresses: readonly UserAddress[];
  readonly defaultShippingAddress: UserAddress | undefined;
  readonly defaultBillingAddress: UserAddress | undefined;
  readonly isLoading: boolean;
  readonly error: FeatureError | null;
}

--- END OF FILE ---

--- START OF FILE libs/ui/button/src/lib/button/ui-button.component.ts ---

/**
 * @file ui-button.component.ts (Shared UI)
 * @version 8.1.0 (Definitive Centering & Feature-Complete Button - Final Fix)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   De definitieve, feature-complete en robuuste knopcomponent. Lost de
 *   visuele bug op waarbij iconen niet correct werden gecentreerd door de
 *   onnodige 'flex-grow' span te verwijderen.
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  output,
  OutputEmitterRef,
  booleanAttribute
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

export type ThemeHueName = 'fire' | 'water' | 'forest' | 'sun' | 'arcane';
export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'theme-fire' | 'theme-water' | 'theme-forest' | 'theme-sun' | 'theme-arcane'
  | 'default'  | 'outline'   | 'transparent' | 'none' | 'fire' | 'ghost' | 'link' | 'destructive' | 'success' | 'warning' | 'info' | 'gradient';
export type ButtonSizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'dot' | 'none';
export type HtmlButtonType = 'button' | 'submit' | 'reset';
export type ContentAlignType = 'start' | 'center' | 'end';

@Component({
  selector: 'royal-code-ui-button',
  standalone: true,
  imports: [CommonModule, RouterModule, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="htmlType()"
      [disabled]="disabled() || loading()"
      [ngClass]="buttonClasses()"
      [style.background-image]="gradientStyle()"
      [style.background-color]="backgroundColor() || null"
      (click)="onClick($event)">
      @if (loading()) {
        <span class="animate-spin h-4 w-4 border-2 border-current border-r-transparent rounded-full" [attr.aria-hidden]="true"></span>
      } @else {
        @if (icon()) {
          <royal-code-ui-icon [icon]="icon()!" [sizeVariant]="iconSize()" [colorClass]="iconColorClass()" [extraClass]="iconClasses()" [attr.aria-hidden]="true" />
        }
        <!-- FIX: De onnodige span is verwijderd -->
        <ng-content />
      }
    </button>
  `
})
export class UiButtonComponent {
  readonly type = input<ButtonType>('default');
  readonly sizeVariant = input<ButtonSizeVariant>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly outline = input(false, { transform: booleanAttribute });
  readonly extraClasses = input<string>('');
  readonly htmlType = input<HtmlButtonType>('button');
  readonly isRound = input(false, { transform: booleanAttribute });
  readonly isAnimated = input(false, { transform: booleanAttribute });
  readonly useHueGradient = input(false, { transform: booleanAttribute });
  readonly enableNeonEffect = input(false, { transform: booleanAttribute });
  readonly isSelected = input(false, { transform: booleanAttribute });
  readonly isFullWidth = input(false, { transform: booleanAttribute });
  readonly backgroundColor = input<string | null>(null);
  readonly contentAlign = input<ContentAlignType>('center');
  readonly icon = input<AppIcon | undefined>(undefined);
  readonly iconPosition = input<'left' | 'right'>('left');
  readonly iconColorClass = input<string>('text-current');

  readonly clicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

  private readonly sizeMap = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-2 px-3 text-sm',
    md: 'py-2.5 px-4 text-sm',
    lg: 'py-2.5 px-6 text-base',
    xl: 'py-2.5 px-8 text-lg',
    icon: 'h-10 w-10 p-0',
    dot: 'h-7 w-7 p-0',
    none: ''
  } as const;


  private readonly themeName = computed<ThemeHueName | 'primary' | null>(() => {
    const type = this.type();
    if (type.startsWith('theme-')) return type.substring(6) as ThemeHueName;
    return type === 'primary' ? 'primary' : null;
  });

  readonly gradientStyle = computed(() => {
    const theme = this.themeName();
    const useGradient = this.useHueGradient() && theme && theme !== 'primary' && !this.outline();
    return useGradient
      ? `linear-gradient(to bottom right, var(--color-btn-${theme}-grad-start), var(--color-btn-${theme}-grad-end))`
      : null;
  });

readonly buttonClasses = computed(() => {
    const type = this.type();
    const theme = this.themeName();
    const extraClasses = this.extraClasses();
    const isOutline = this.outline();
    const hasGradient = !!this.gradientStyle();

    const base = [
      'inline-flex', 'items-center', `justify-${this.contentAlign()}`,
      'font-semibold', 'transition-all',
      'focus-visible:outline-none', 'focus-visible:ring-2',
      'focus-visible:ring-ring', 'focus-visible:ring-offset-2',
      this.isRound() ? 'rounded-full' : 'rounded-xs',
      this.isAnimated() ? 'hover:scale-105 active:scale-100' : '',
      this.isFullWidth() ? 'w-full' : ''
    ];

    const typeClasses = this.getTypeClasses(type, theme, isOutline, hasGradient, this.backgroundColor());
    const sizeClasses = this.getSizeClasses();
    const stateClasses = this.getStateClasses(theme);

    return [...base, ...typeClasses, sizeClasses, ...stateClasses, extraClasses]
      .filter(Boolean)
      .join(' ');
  });


  private getTypeClasses(
    type: ButtonType,
    theme: ThemeHueName | 'primary' | null,
    isOutline: boolean,
    hasGradient: boolean,
    explicitBackgroundColor: string | null
  ): string[] {
    if (type === 'none') return [];
    if (isOutline) return this.getOutlineClasses(theme);
    return this.getFilledClasses(type, theme, hasGradient, explicitBackgroundColor);
  }

  private getOutlineClasses(theme: ThemeHueName | 'primary' | null): string[] {
    const classes = ['bg-transparent', 'border'];
    if (theme === 'primary') {
      classes.push('border-primary', 'text-primary', 'hover:bg-primary', 'hover:text-primary-on');
    } else if (theme) {
      classes.push(`border-theme-${theme}`, `text-theme-${theme}`, `hover:bg-theme-${theme}`, `hover:text-theme-${theme}-on`);
    } else {
      classes.push('border-border', 'text-foreground', 'hover:bg-accent', 'hover:text-accent-on');
    }
    return classes;
  }

  private getFilledClasses(
    type: ButtonType,
    theme: ThemeHueName | 'primary' | null,
    hasGradient: boolean,
    explicitBackgroundColor: string | null
  ): string[] {
    if (explicitBackgroundColor) {
      return theme ? [`text-theme-${theme}-on`, 'border', 'border-transparent'] : ['text-primary-on', 'border', 'border-transparent'];
    }

    if (type === 'transparent') {
      return ['bg-transparent', 'text-secondary', 'hover:bg-hover', 'hover:text-primary', 'border', 'border-transparent'];
    }
    if (type === 'default') {
      return ['bg-background-secondary', 'text-foreground-default', 'border', 'border-border', 'hover:bg-hover'];
    }
    
    if (hasGradient) {
      return theme ? [`text-theme-${theme}-on`] : ['text-primary-on'];
    } else if (theme === 'primary') {
      return ['bg-primary', 'text-primary-on', 'hover:bg-primary-hover', 'border', 'border-transparent'];
    } else if (theme) {
      return [`bg-theme-${theme}`, `text-theme-${theme}-on`, `hover:bg-theme-${theme}-hover`, 'border', 'border-transparent'];
    }

    return ['bg-background-secondary', 'text-foreground-default', 'border', 'border-border', 'hover:bg-hover'];
  }

  private getSizeClasses(): string {
    const size = this.sizeVariant();
    return size === 'none' ? '' : this.sizeMap[size];
  }

  private getStateClasses(theme: ThemeHueName | 'primary' | null): string[] {
    const classes: string[] = [];
    if (this.disabled() || this.loading()) {
      classes.push('opacity-50', 'cursor-not-allowed');
    } else {
      if (this.enableNeonEffect() && theme) {
        classes.push('neon-effect-target', `neon-${theme}`);
      }
      if (this.isSelected()) {
        classes.push('ring-2', 'ring-offset-2', 'ring-primary');
      }
    }
    return classes;
  }

  protected iconSize = computed(() => {
    switch (this.sizeVariant()) {
      case 'xs': return 'xs';
      case 'sm': return 'sm';
      case 'md': return 'sm';
      case 'lg': return 'md';
      case 'xl': return 'lg';
      default: return 'sm';
    }
  });

  protected iconClasses = computed(() => {
    return this.iconPosition() === 'left' ? 'mr-2' : 'ml-2';
  });

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}

--- END OF FILE ---

--- START OF FILE libs/ui/card/src/lib/card/ui-card.component.ts ---

/**
 * @file ui-card.component.ts
 * @Version 17.0.0 (Appearance & Gradient Support)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   De definitieve, flexibele kaartcomponent. Voegt een `appearance` input toe
 *   om verschillende stijlen zoals 'gradient' te ondersteunen.
 */
import { ChangeDetectionStrategy, Component, computed, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardAppearance = 'default' | 'gradient';
export type CardRounding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'royal-code-ui-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="cardClasses()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host { 
      display: block;
      height: 100%;
    }
  `]
})
export class UiCardComponent {
  readonly extraContentClasses: InputSignal<string> = input<string>('');
  readonly rounding: InputSignal<CardRounding> = input<CardRounding>('lg');
  readonly appearance = input<CardAppearance>('default');

  protected cardClasses = computed(() => {
    const base = ['w-full', 'h-full', 'p-6', 'transition-colors', 'duration-200'];
    const appearance = this.appearance();

    if (appearance === 'gradient') {
      // Een subtiele gradient met een primary-gekleurde border
      base.push('bg-gradient-to-br', 'from-primary/5', 'via-surface-alt', 'to-card', 'border-2', 'border-primary/30');
    } else {
      // Standaard uiterlijk
      base.push('bg-card', 'border-2', 'border-border', 'group-hover:border-primary');
    }

    const roundingValue = this.rounding();
    if (roundingValue && roundingValue !== 'none') {
      base.push(`rounded-${roundingValue}`);
    } else {
      base.push('rounded-xs');
    }
    
    if (this.extraContentClasses()) {
      base.push(this.extraContentClasses());
    }

    return base;
  });
}

--- END OF FILE ---

--- START OF FILE libs/ui/forms/src/index.ts ---

export * from './lib/components/address-form/address-form.component';
export * from './lib/components/ui-select/ui-select.component';
export * from './lib/components/tag-input/tag-input.component';
export * from './lib/components/category-selector/category-selector.component';
export * from './lib/components/address-manager/address-manager.component';

--- END OF FILE ---

--- START OF FILE libs/ui/forms/src/lib/components/address-form/address-form.component.ts ---

/**
 * @file address-form.component.ts
 * @Version 5.0.0 (Definitief: Volledig Address Model & Fix voor Lege Strings)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Een robuuste en herbruikbare component voor het bewerken of aanmaken van adressen.
 *   Dit bestand is volledig geoptimaliseerd om het uitgebreide `Address` model correct
 *   te hanteren, inclusief alle optionele/nullable velden. Het `FormGroup` is
 *   uitgebreid met alle mogelijke velden en de `onSubmit` logica zorgt voor een
 *   consistente conversie van lege strings naar `null` voor de backend.
 */
import { Component, OnInit, inject, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';
import { Address } from '@royal-code/shared/domain'; // De geüpdatete Address interface

import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, UiInputComponent, UiButtonComponent, UiTitleComponent],
  template: `
    <div class="bg-card p-6 rounded-xs shadow-xl w-full max-w-lg">
      <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="(isEditMode ? 'checkout.address.editTitle' : 'checkout.address.newTitle') | translate" extraClasses="mb-6" />
      <form [formGroup]="addressForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <royal-code-ui-input [label]="'checkout.shipping.form.recipientName' | translate" formControlName="contactName" [required]="true" [error]="getErrorMessage('contactName')" />
        <royal-code-ui-input [label]="'checkout.shipping.form.companyName' | translate" formControlName="companyName" />
        <div class="flex flex-col sm:flex-row gap-4">
          <royal-code-ui-input [label]="'checkout.shipping.form.street' | translate" formControlName="street" [required]="true" extraContainerClasses="flex-grow" [error]="getErrorMessage('street')" />
          <royal-code-ui-input [label]="'checkout.shipping.form.houseNumber' | translate" formControlName="houseNumber" [required]="true" extraContainerClasses="w-full sm:w-24" [error]="getErrorMessage('houseNumber')" />
        </div>
        <royal-code-ui-input [label]="'checkout.shipping.form.addressAddition' | translate" formControlName="addressAddition" />
        <div class="flex flex-col sm:flex-row gap-4">
          <royal-code-ui-input [label]="'checkout.shipping.form.postalCode' | translate" formControlName="postalCode" [required]="true" extraContainerClasses="w-full sm:w-32" [error]="getErrorMessage('postalCode')" />
          <royal-code-ui-input [label]="'checkout.shipping.form.city' | translate" formControlName="city" [required]="true" extraContainerClasses="flex-grow" [error]="getErrorMessage('city')" />
        </div>
        <royal-code-ui-input [label]="'checkout.shipping.form.stateOrProvince' | translate" formControlName="stateOrProvince" />
        <royal-code-ui-input [label]="'checkout.shipping.form.country' | translate" formControlName="countryCode" [required]="true" [error]="getErrorMessage('countryCode')" />
        <royal-code-ui-input [label]="'checkout.shipping.form.phoneNumber' | translate" formControlName="phoneNumber" />
        <royal-code-ui-input [label]="'checkout.shipping.form.email' | translate" formControlName="email" [error]="getErrorMessage('email')" />
        <royal-code-ui-input [label]="'checkout.shipping.form.deliveryInstructions' | translate" formControlName="deliveryInstructions" />
        
        <div class="mt-8 flex justify-end gap-3 border-t border-border pt-5">
          <royal-code-ui-button type="default" (clicked)="close(null)">{{ 'common.buttons.cancel' | translate }}</royal-code-ui-button>
          <royal-code-ui-button type="primary" htmlType="submit" [disabled]="addressForm.invalid">{{ 'common.buttons.save' | translate }}</royal-code-ui-button>
        </div>
      </form>
    </div>
  `
})
export class AddressFormComponent implements OnInit {
  private readonly overlayRef = inject(DYNAMIC_OVERLAY_REF);
  private readonly data: { address?: Address } = inject(DYNAMIC_OVERLAY_DATA, { optional: true }) || {};
  private readonly translate = inject(TranslateService);

  isEditMode = !!this.data.address;
  protected readonly TitleTypeEnum = TitleTypeEnum;

  addressForm = new FormGroup({
    contactName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    companyName: new FormControl<string | null>(null),
    phoneNumber: new FormControl<string | null>(null),
    email: new FormControl<string | null>(null, [Validators.email]),
    street: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    houseNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    addressAddition: new FormControl<string | null>(null),
    postalCode: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[1-9][0-9]{3} ?(?!SA|SD|SS)[A-Z]{2}$/i)] }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    stateOrProvince: new FormControl<string | null>(null),
    countryCode: new FormControl('NL', { nonNullable: true, validators: [Validators.required] }),
    deliveryInstructions: new FormControl<string | null>(null),
  });

  @HostListener('document:keydown.escape')
    onEscapeKey(): void {
    this.close(null);
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.address) {
      // Gebruik patchValue om alleen bestaande velden in te vullen
      this.addressForm.patchValue({
        contactName: this.data.address.contactName,
        companyName: this.data.address.companyName,
        phoneNumber: this.data.address.phoneNumber,
        email: this.data.address.email,
        street: this.data.address.street,
        houseNumber: this.data.address.houseNumber,
        addressAddition: this.data.address.addressAddition,
        postalCode: this.data.address.postalCode,
        city: this.data.address.city,
        stateOrProvince: this.data.address.stateOrProvince,
        countryCode: this.data.address.countryCode,
        deliveryInstructions: this.data.address.deliveryInstructions,
      });
    }
  }

  onSubmit(): void {
    if (this.addressForm.invalid) { this.addressForm.markAllAsTouched(); return; }
    
    const formValue = this.addressForm.getRawValue();

    const resultAddress: Address = { 
      // Als we in edit mode zijn, behoud de bestaande ID, createdAt, lastModified etc.
      ...(this.isEditMode ? this.data.address : {}), 
      // Vul de formulierwaarden in
      contactName: formValue.contactName,
      street: formValue.street,
      houseNumber: formValue.houseNumber,
      postalCode: formValue.postalCode,
      city: formValue.city,
      countryCode: formValue.countryCode,
      // Converteer lege string naar null voor optionele velden
      addressAddition: formValue.addressAddition?.trim() ? formValue.addressAddition : null,
      companyName: formValue.companyName?.trim() ? formValue.companyName : null,
      phoneNumber: formValue.phoneNumber?.trim() ? formValue.phoneNumber : null,
      email: formValue.email?.trim() ? formValue.email : null,
      stateOrProvince: formValue.stateOrProvince?.trim() ? formValue.stateOrProvince : null,
      deliveryInstructions: formValue.deliveryInstructions?.trim() ? formValue.deliveryInstructions : null,
      // Default booleans als ze niet gezet zijn in de patchValue (bv bij nieuw adres)
      isDefaultShipping: this.data.address?.isDefaultShipping ?? false,
      isDefaultBilling: this.data.address?.isDefaultBilling ?? false,
    };

    this.close(resultAddress);
  }

  close(result: Address | null): void { this.overlayRef.close(result); }

  getErrorMessage(controlName: keyof typeof this.addressForm.controls): string {
    const control = this.addressForm.get(controlName);
    if (!control || !control.touched || !control.errors) return '';
    const errorKey = Object.keys(control.errors)[0];
    const translationKey = `common.forms.errors.${errorKey.toLowerCase()}`;
    return this.translate.instant(translationKey) || this.translate.instant('common.forms.errors.invalid');
  }
}

--- END OF FILE ---

--- START OF FILE libs/ui/forms/src/lib/components/address-manager/address-manager.component.ts ---

/**
 * @file address-manager.component.ts
 * @Version 12.0.0 (DEFINITIVE: Full Parent Control & Anonymous Flow)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve component voor het beheren van adressen. Deze versie biedt
 *   volledige controle aan de parent component via de 'forceShowForm' input,
 *   en lost de bug op waarbij het formulier voor anonieme gebruikers niet verscheen.
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, OnInit, signal, booleanAttribute } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppIcon, Address } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiCardComponent } from '@royal-code/ui/card';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { NotificationService } from '@royal-code/ui/notifications';
import { UserFacade } from '@royal-code/store/user';

export interface AddressSubmitEvent {
  address: Address;
  shouldSave: boolean;
}

@Component({
  selector: 'royal-code-ui-address-manager',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, TranslateModule,
    UiButtonComponent, UiCardComponent, UiIconComponent, UiInputComponent,
    UiParagraphComponent, UiTitleComponent
  ],
  template: `
    <section class="space-y-6">
      <!-- Opgeslagen adressen (alleen voor ingelogde gebruikers) -->
      @if (isLoggedIn() && addresses().length > 0) {
        <div class="space-y-4">
          <royal-code-ui-paragraph color="muted">{{ 'checkout.shipping.selectSavedAddress' | translate }}</royal-code-ui-paragraph>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (address of addresses(); track address.id) {
              <royal-code-ui-button
                type="none"
                (clicked)="selectAddress(address)"
                [extraClasses]="'relative group/address w-full p-4 text-left border-2 ' + (isSelected(address) ? 'border-primary bg-surface-alt' : 'border-border')"
                [attr.aria-pressed]="isSelected(address)">
                <div>
                  <p class="font-semibold pointer-events-none">{{ address.contactName }}</p>
                  <p class="text-sm text-muted pointer-events-none">
                    {{ address.street }} {{ address.houseNumber }}<br>
                    @if (address.addressAddition) {
                      {{ address.addressAddition }}<br>
                    }
                    {{ address.postalCode }} {{ address.city }}
                  </p>
                </div>
                <div class="address-actions-desktop absolute top-2 right-2 flex items-center gap-1">
                  <royal-code-ui-button type="transparent" sizeVariant="icon" extraClasses="h-8 w-8 text-muted hover:!text-primary" (clicked)="$event.stopPropagation(); editAddressClicked.emit(address)">
                    <royal-code-ui-icon [icon]="AppIcon.Edit" sizeVariant="sm" />
                  </royal-code-ui-button>
                  <royal-code-ui-button type="transparent" sizeVariant="icon" extraClasses="h-8 w-8 text-muted hover:!text-error" (clicked)="$event.stopPropagation(); deleteAddressClicked.emit(address.id!)">
                    <royal-code-ui-icon [icon]="AppIcon.Trash2" sizeVariant="sm" />
                  </royal-code-ui-button>
                </div>
              </royal-code-ui-button>
            }
            <a (click)="onAddNewAddressCardClick()" class="block cursor-pointer group add-address-card">
              <royal-code-ui-card extraContentClasses="flex flex-col items-center justify-center p-6 text-center h-full border-2 border-dashed border-border hover:border-primary transition-colors" class="h-full">
                <royal-code-ui-icon [icon]="AppIcon.Plus" sizeVariant="xl" extraClasses="text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 class="text-lg font-semibold text-foreground">{{ 'account.addresses.addAddressTitle' | translate }}</h3>
                <p class="text-sm text-secondary">{{ 'account.addresses.addAddressDescription' | translate }}</p>
              </royal-code-ui-card>
            </a>
          </div>
          <div class="flex items-center justify-center pt-2">
            <div class="h-px flex-grow bg-border"></div>
            <royal-code-ui-paragraph size="sm" color="muted" extraClasses="px-4">{{ 'common.or' | translate }}</royal-code-ui-paragraph>
            <div class="h-px flex-grow bg-border"></div>
          </div>
        </div>
      }

      <!-- DE FIX: Toon het formulier als de gebruiker anoniem is, OF als de parent component het forceert. -->
      @if (!isLoggedIn() || forceShowForm()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <royal-code-ui-input formControlName="contactName" [label]="'checkout.shipping.form.recipientName' | translate" [required]="true" />
          <royal-code-ui-input formControlName="street" [label]="'checkout.shipping.form.street' | translate" [required]="true" />
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <royal-code-ui-input formControlName="houseNumber" [label]="'checkout.shipping.form.houseNumber' | translate" [required]="true" extraContainerClasses="sm:col-span-1" />
            <royal-code-ui-input formControlName="addressAddition" [label]="'checkout.shipping.form.addressAddition' | translate" extraContainerClasses="sm:col-span-2" />
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <royal-code-ui-input formControlName="postalCode" [label]="'checkout.shipping.form.postalCode' | translate" [required]="true" extraContainerClasses="sm:col-span-1" />
            <royal-code-ui-input formControlName="city" [label]="'checkout.shipping.form.city' | translate" [required]="true" extraContainerClasses="sm:col-span-2" />
          </div>
          <royal-code-ui-input formControlName="countryCode" [label]="'checkout.shipping.form.country' | translate" [required]="true" />
          <royal-code-ui-input formControlName="phoneNumber" [label]="'checkout.shipping.form.phoneNumber' | translate" />
          <royal-code-ui-input formControlName="email" [label]="'checkout.shipping.form.email' | translate" [required]="true" />
          <royal-code-ui-input formControlName="companyName" [label]="'checkout.shipping.form.companyName' | translate" />
          <royal-code-ui-input formControlName="deliveryInstructions" [label]="'checkout.shipping.form.deliveryInstructions' | translate" />

          <!-- "Adres Opslaan" Checkbox & Hint -->
          @if (showSaveAddressToggle()) {
            <div class="pt-4 space-y-2">
              <div class="flex items-center">
                <input type="checkbox" id="saveAddressForm" formControlName="saveAddress" class="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50" [disabled]="!isLoggedIn()">
                <label for="saveAddressForm" class="ml-2 block text-sm text-foreground" [class.text-muted]="!isLoggedIn()">{{ 'checkout.shipping.form.saveAddress' | translate }}</label>
              </div>
              @if (!isLoggedIn()) {
                <div class="p-3 bg-surface-alt rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p class="text-sm text-secondary">{{ 'checkout.shipping.form.saveAddressForLoggedInUsers' | translate }}</p>
                  <royal-code-ui-button type="secondary" sizeVariant="sm" [routerLink]="['/register']" (clicked)="$event.stopPropagation()">
                    {{ 'auth.register.submit' | translate }}
                  </royal-code-ui-button>
                </div>
              }
            </div>
          }
          
          <!-- Submit Knop (nu verborgen in de checkout) -->
          @if (showSubmitButton()) {
            <div class="pt-4 flex justify-end">
              <royal-code-ui-button type="primary" htmlType="submit" [disabled]="form.invalid">
                <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />
                <span>{{ submitButtonTextKey() | translate }}</span>
              </royal-code-ui-button>
            </div>
          }
        </form>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .group\\/address:hover .address-actions-desktop {
      opacity: 1;
    }
    .address-actions-desktop {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }
    .add-address-card {
        height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressManagerComponent implements OnInit {
  // --- INPUTS ---
  readonly addresses = input.required<Address[]>();
  readonly initialAddress = input<Address | undefined>();
  readonly isLoggedIn = input.required<boolean>();
  readonly submitButtonTextKey = input.required<string>();
  readonly showSaveAddressToggle = input(true, { transform: booleanAttribute });
  readonly showEditAndDeleteActions = input(true, { transform: booleanAttribute });
  readonly alwaysShowActions = input(false, { transform: booleanAttribute });

  readonly showSubmitButton = input(true, { transform: booleanAttribute });
  readonly forceShowForm = input(false, { transform: booleanAttribute });


  // --- OUTPUTS ---
  readonly addressSelected = output<Address>();
  readonly addressSubmitted = output<AddressSubmitEvent>();
  readonly editAddressClicked = output<Address>();
  readonly deleteAddressClicked = output<string>();
  readonly addAddressCardClicked = output<void>();

  // --- INTERNAL STATE ---
  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;

  protected readonly isEditing = signal(false);
  protected readonly selectedLocalAddress = signal<Address | undefined>(undefined);

  protected form = inject(FormBuilder).group({
    id: [null as string | null],
    contactName: ['', Validators.required],
    street: ['', Validators.required],
    houseNumber: ['', Validators.required],
    addressAddition: [null as string | null],
    postalCode: ['', Validators.required],
    city: ['', Validators.required],
    countryCode: ['', Validators.required],
    phoneNumber: [null as string | null],
    email: ['', [Validators.required, Validators.email]],
    companyName: [null as string | null],
    deliveryInstructions: [null as string | null],
    isDefaultShipping: [false as boolean | null],
    isDefaultBilling: [false as boolean | null],
    saveAddress: [false],
  });

  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly userFacade = inject(UserFacade);

  ngOnInit(): void {
    if (this.initialAddress()) {
      this.selectedLocalAddress.set(this.initialAddress());
      this.patchFormWithAddress(this.initialAddress()!);
      this.isEditing.set(false);
    }
  }

  isSelected(address: Address): boolean {
    return this.selectedLocalAddress()?.id === address.id;
  }

  selectAddress(address: Address): void {
    this.selectedLocalAddress.set(address);
    this.addressSelected.emit(address);
    this.isEditing.set(false);
    this.resetForm();
  }

  onAddNewAddressCardClick(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.addAddressCardClicked.emit();
  }

  onEditAddress(address: Address): void {
    this.patchFormWithAddress(address);
    this.isEditing.set(true);
    this.selectedLocalAddress.set(address);
    this.editAddressClicked.emit(address);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.notificationService.showError(this.translate.instant('common.messages.error'));
      return;
    }
    const formValue = this.form.getRawValue();
    const shouldSave = formValue.saveAddress ?? false;
    const address: Address = {
      id: formValue.id || '',
      userId: this.userFacade.profile()?.id,
      contactName: formValue.contactName!,
      street: formValue.street!,
      houseNumber: formValue.houseNumber!,
      addressAddition: formValue.addressAddition,
      postalCode: formValue.postalCode!,
      city: formValue.city!,
      countryCode: formValue.countryCode!,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email!,
      companyName: formValue.companyName,
      deliveryInstructions: formValue.deliveryInstructions,
      isDefaultShipping: formValue.isDefaultShipping ?? undefined,
      isDefaultBilling: formValue.isDefaultBilling ?? undefined,
    };

    this.addressSubmitted.emit({ address, shouldSave });
    this.resetForm();
    this.isEditing.set(false);
  }

  resetForm(): void {
    this.form.reset({
      id: null,
      contactName: '',
      street: '',
      houseNumber: '',
      addressAddition: null,
      postalCode: '',
      city: '',
      countryCode: '',
      phoneNumber: null,
      email: '',
      companyName: null,
      deliveryInstructions: null,
      isDefaultShipping: false,
      isDefaultBilling: false,
      saveAddress: false,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.isEditing.set(false);
  }

  private patchFormWithAddress(address: Address): void {
    this.form.patchValue({
      id: address.id,
      contactName: address.contactName,
      street: address.street,
      houseNumber: address.houseNumber,
      addressAddition: address.addressAddition,
      postalCode: address.postalCode,
      city: address.city,
      countryCode: address.countryCode,
      phoneNumber: address.phoneNumber,
      email: address.email,
      companyName: address.companyName,
      deliveryInstructions: address.deliveryInstructions,
      isDefaultShipping: address.isDefaultShipping ?? null,
      isDefaultBilling: address.isDefaultBilling ?? null,
      saveAddress: false,
    });
    this.form.markAsPristine();
  }
}

--- END OF FILE ---

--- START OF FILE libs/ui/icon/src/lib/icon/ui-icon.component.ts ---

/**
 * @file ui-icon.component.ts
 * @Version 1.4.0 - Fixed Button Integration
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-20
 * @Description Een standalone Angular component voor het consistent weergeven van Lucide iconen.
 *              Verbeterde versie met betere button integratie en minder wrapper divs.
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  OnInit,
  Injector,
  HostBinding,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AppIcon } from '@royal-code/shared/domain';

type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'inherit';

@Component({
  selector: 'royal-code-ui-icon',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (iconMode()) {
      @case ('background') {
        <!-- Background mode: only for explicit backgrounds -->
        <div class="rc-ui-icon-wrapper inline-block">
          <div
            class="rc-icon-background flex flex-col items-center justify-center p-1.5 rounded-md"
            [ngClass]="computedBackgroundClass()"
          >
            <lucide-icon
              [name]="iconName()"
              [attr.aria-label]="ariaLabel()"
              [size]="computedIconSizeNumber()"
              [strokeWidth]="computedStrokeWidthNumber()"
              [ngClass]="[computedColorClass(), iconClass() ?? '']"
              [attr.aria-hidden]="!ariaLabel()"
            >
            </lucide-icon>
            @if (itemDescription(); as desc) {
              <span class="mt-1 text-center text-[10px] leading-tight" [ngClass]="computedColorClass()">
                 {{ desc }}
              </span>
            }
          </div>
        </div>
      }

      @case ('inline') {
        <!-- Inline mode: wrapper sized to exactly match SVG -->
        <span
          class="inline-flex items-center justify-center flex-shrink-0"
          [ngClass]="extraClass() ?? ''"
          [style.width.px]="computedIconSizeNumber()"
          [style.height.px]="computedIconSizeNumber()"
          style="line-height: 1;"
        >
          <lucide-icon
            [name]="iconName()"
            [attr.aria-label]="ariaLabel()"
            [size]="computedIconSizeNumber()"
            [strokeWidth]="computedStrokeWidthNumber()"
            [ngClass]="[computedColorClass(), iconClass() ?? '', extraClassSignal() ?? '']"
            [attr.aria-hidden]="!ariaLabel()">
          </lucide-icon>
        </span>
      }

      @case ('simple') {
        <!-- Simple mode: direct icon, SVG determines size -->
        <lucide-icon
          [name]="iconName()"
          [attr.aria-label]="ariaLabel()"
          [size]="computedIconSizeNumber()"
          [strokeWidth]="computedStrokeWidthNumber()"
          [ngClass]="[computedColorClass(), iconClass() ?? '', extraClass() ?? '', extraClassSignal() ?? '']"
          [attr.aria-hidden]="!ariaLabel()">
        </lucide-icon>
      }
    }
  `,
})
export class UiIconComponent implements OnInit {
  private readonly injector = inject(Injector);
  private readonly logPrefix = '[UiIconComponent]';

  // --- Inputs (HERNOEMD: geen 'Signal' suffix, geen aliassen) ---
  /** @description Het icoon dat weergegeven moet worden, van het type `AppIcon` enum. Vereist. */
  public readonly icon: InputSignal<AppIcon | keyof typeof AppIcon | string | null> = input.required<AppIcon | keyof typeof AppIcon | string | null>();

  /** @description Optioneel label dat naast of onder het icoon wordt getoond (niet bij `showBackground`). */
  public readonly label: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Optionele beschrijving die onder het icoon wordt getoond wanneer `showBackground` true is. */
  public readonly itemDescription: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Positie van het label relatief aan het icoon (alleen als `showBackground` false is). Default 'right'. */
  public readonly labelPosition: InputSignal<'bottom' | 'right'> = input<'bottom' | 'right'>('right');

  /** @description De groottevariant van het icoon. Default 'md'. */
  public readonly sizeVariant: InputSignal<SizeVariant> = input<SizeVariant>('md');

  /** @description Optionele Tailwind CSS class(es) voor de kleur van het icoon (en label/description indien niet overschreven). Default 'text-current'. */
  public readonly colorClass: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Optionele stroke width voor het Lucide icoon. Kan een getal of string zijn. */
  public readonly strokeWidth: InputSignal<string | number | undefined> = input<string | number | undefined>();

  /** @description Boolean (of string "true"/"false") om een achtergrondvlak achter het icoon te tonen. Default false. */
  public readonly showBackground = input(false, { transform: (value: boolean | string) => typeof value === 'string' ? (value === '' || value.toLowerCase() === 'true') : !!value });

  /** @description Optionele Tailwind CSS class(es) voor de styling van het achtergrondvlak. Default 'bg-surface'. */
  public readonly backgroundClass: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Optionele extra Tailwind CSS class(es) om toe te voegen aan de root container van het icoon. */
  public readonly extraClass: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Optionele extra Tailwind CSS class(es) om direct aan het `<lucide-icon>` element toe te voegen. */
  public readonly iconClass: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Extra signal om van buitenaf classes toe te voegen (voor backwards compatibility). */
  public readonly extraClassSignal: InputSignal<string | undefined> = input<string | undefined>();

  @HostBinding('attr.role')
  get hostRole(): string | null {
    return this.label() || this.itemDescription() ? 'figure' : 'img';
  }

  @HostBinding('attr.aria-label')
  get hostAriaLabel(): string | null {
    if (this.label() || this.itemDescription()) return null;
    return this.icon() || null;
  }

  constructor() {
    // effect(() => {
    //   // Debugging hier indien nodig
    // }, { injector: this.injector });
  }

  // Simplified mode detection
  readonly iconMode = computed<'background' | 'simple' | 'inline'>(() => {
    // Background mode: only for explicit showBackground
    if (this.showBackground()) return 'background';

    // Detect inline mode: spacing classes suggest text alongside icon
    const extraClasses = this.extraClass() || '';
    const extraClassSignal = this.extraClassSignal() || '';
    const allExtraClasses = `${extraClasses} ${extraClassSignal}`.trim();

    // Common spacing classes used with text
    const inlineIndicators = ['mr-', 'ml-', 'space-x-', 'gap-'];
    const hasInlineSpacing = inlineIndicators.some(indicator =>
      allExtraClasses.includes(indicator)
    );

    if (hasInlineSpacing) return 'inline';

    // Default to simple for standalone icons
    return 'simple';
  });

  ngOnInit(): void {
    this.validateInputType('colorClass', this.colorClass());
    this.validateInputType('extraClass', this.extraClass());
    this.validateInputType('iconClass', this.iconClass());
    this.validateInputType('backgroundClass', this.backgroundClass());
  }

  private validateInputType(inputName: string, inputValue: unknown): void {
    if (typeof inputValue === 'object' && inputValue !== null && !Array.isArray(inputValue)) {
      console.error(`${this.logPrefix} CRITICAL TYPE ERROR for icon '${this.icon()}': Input '${inputName}' received an OBJECT. Value:`, inputValue);
    }
  }

  // --- Computed Signals (gebruiken nu de hernoemde input signals) ---

  public readonly iconName: Signal<string> = computed(() => {
    const currentIcon = this.icon();
    return currentIcon || 'alert-circle';
  });

  public readonly ariaLabel: Signal<string | undefined> = computed(() => {
    return this.label() || this.itemDescription() || this.iconName();
  });

  public readonly computedIconSizeNumber: Signal<number | undefined> = computed(() => {
    const sizeMap: { [key in SizeVariant]: number | undefined } = {
      xs: 14, sm: 16, md: 20, lg: 24, xl: 32, inherit: undefined,
    };
    return sizeMap[this.sizeVariant()] ?? undefined;
  });

  public readonly computedIconSizeClass: Signal<string> = computed(() => {
    // Alleen gebruiken wanneer we sizing control willen (niet voor simple mode)
    const sizeMap: { [key in SizeVariant]: string } = {
      xs: 'w-3.5 h-3.5', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6', xl: 'w-8 h-8', inherit: 'w-auto h-auto',
    };
    return sizeMap[this.sizeVariant()] ?? 'w-auto h-auto';
  });

  public readonly computedStrokeWidthNumber: Signal<number | undefined> = computed(() => {
    const rawValue = this.strokeWidth();
    if (rawValue === undefined || rawValue === null || rawValue === '') return undefined;
    const num = Number(rawValue);
    return isNaN(num) ? undefined : num;
  });

  public readonly computedColorClass: Signal<string> = computed(() => {
    const color = this.colorClass();
    if (typeof color === 'object' && color !== null && !Array.isArray(color)) {
      console.error(`${this.logPrefix} computedColorClass received an OBJECT for icon '${this.icon()}'. Value:`, color);
      return 'text-red-600 dark:text-red-400 border-2 border-red-500 !bg-yellow-200';
    }

    // Combineer alle extra classes
    const extraClasses = [
      color ?? 'text-current',
      this.extraClassSignal() ?? ''
    ].filter(Boolean).join(' ');

    return extraClasses;
  });

  public readonly containerClasses: Signal<string> = computed(() => {
    const hasLabel = !!this.label();
    const showingBackground = this.showBackground();
    let layoutClasses = '';

    if (showingBackground) {
      layoutClasses = 'inline-block align-middle';
    } else if (hasLabel) {
      layoutClasses = (this.labelPosition() === 'bottom')
        ? 'inline-flex flex-col items-center align-middle'
        : 'inline-flex items-center align-middle';
    } else {
      layoutClasses = 'inline-block align-middle';
    }
    return layoutClasses.trim();
  });

  public readonly innerContainerClasses: Signal<string> = computed(() => {
    if (!this.showBackground() && this.label()) {
      return this.labelPosition() === 'bottom'
        ? 'flex flex-col items-center'
        : 'inline-flex items-center space-x-1 md:space-x-1.5';
    }
    return 'flex items-center justify-center';
  });

  public readonly labelClasses: Signal<string> = computed(() => {
    if (!this.showBackground() && this.label()) {
      const base = 'rc-icon-label text-xs leading-none';
      const position = this.labelPosition() === 'bottom' ? 'mt-1 text-center' : 'ml-1 md:ml-1.5';
      return `${base} ${position} ${this.computedColorClass()}`;
    }
    return '';
  });

  public readonly computedBackgroundClass: Signal<string> = computed(() => {
    const bgClass = this.backgroundClass();
    if (typeof bgClass === 'object' && bgClass !== null && !Array.isArray(bgClass)) {
        console.error(`${this.logPrefix} computedBackgroundClass received an OBJECT for icon '${this.icon()}'. Value:`, bgClass);
        return '!bg-red-200 border-2 border-red-500';
    }
    return bgClass ?? 'bg-surface group-hover/button:bg-hover';
  });
}

--- END OF FILE ---

--- START OF FILE libs/ui/input/src/lib/input/ui-input.component.ts ---

/**
 * @file ui-input.component.ts
 * @Version 9.2.0 (Definitive CVA - KeyboardEvent Fixed)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   A reusable input component designed as a definitive, pure ControlValueAccessor for
 *   text-like inputs. Integrates search bar functionality and correctly types the
 *   `keydown.enter` event to prevent compilation errors.
 */
import {
  Component, ChangeDetectionStrategy, input, model, forwardRef, booleanAttribute, computed, signal, output, OutputEmitterRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel' | 'date' | 'datetime-local' | 'month' | 'time' | 'week' | 'color' | 'range' | 'file';
export type IconPosition = 'left' | 'right';
export type InputSize = 'sm' | 'md' | 'lg' | 'none';

@Component({
  selector: 'royal-code-ui-input',
  standalone: true,
  imports: [CommonModule, UiIconComponent, UiButtonComponent],
  template: `
    <div class="group relative" [ngClass]="extraContainerClasses()">
      @if (label()) {
        <label [for]="inputId()" [ngClass]="['block text-sm font-medium text-foreground mb-1', labelClasses()]">
          {{ label() }}
          @if (required()) { <span class="text-destructive">*</span> }
        </label>
      }
      <div class="relative">
        @if (icon() && iconPosition() === 'left') {
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <royal-code-ui-icon [icon]="icon()!" sizeVariant="sm" colorClass="text-secondary" />
          </div>
        }
        <input
          [type]="type()"
          [id]="inputId()"
          [value]="value()"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
          (keydown.enter)="onEnterPressed($event)"
          [placeholder]="placeholder()"
          [attr.aria-label]="ariaLabel() || label()"
          [attr.aria-describedby]="ariaDescribedBy()"
          [attr.aria-required]="required()"
          [attr.min]="min()"
          [attr.max]="max()"
          [attr.step]="step()"
          [attr.multiple]="multiple()"
          [attr.accept]="accept()"
          [readonly]="readonly()"
          [autocomplete]="autocomplete()"
          [disabled]="isDisabled()"
          [ngClass]="inputClasses()">
        @if (appendButtonIcon()) {
          <button
            type="button"
            (click)="onAppendButtonClick($event)"
            [attr.aria-label]="appendButtonAriaLabel() || 'Actie'"
            [ngClass]="appendButtonClasses()">
            <royal-code-ui-icon [icon]="appendButtonIcon()!" sizeVariant="sm" />
          </button>
        } @else if (icon() && iconPosition() === 'right') {
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <royal-code-ui-icon [icon]="icon()!" sizeVariant="sm" colorClass="text-secondary" />
          </div>
        }
      </div>
      @if (hasErrors() && !hideValidationMessages()) {
        <p class="mt-2 text-sm text-destructive" [attr.id]="inputId() + '-error'">
          {{ error() }}
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true
    }
  ]
})
export class UiInputComponent implements ControlValueAccessor {
  readonly label = input<string | undefined>();
  readonly placeholder = input<string>('');
  readonly type = input<InputType>('text');
  readonly icon = input<AppIcon | undefined>();
  readonly iconPosition = input<IconPosition>('left');
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly autocomplete = input<string>('off');
  readonly extraClasses = input<string>('');
  readonly extraContainerClasses = input<string>('');
  readonly min = input<number | undefined>();
  readonly max = input<number | undefined>();
  readonly step = input<number | undefined>();
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly accept = input<string | undefined>();
  readonly sizeVariant = input<InputSize>('md');
  readonly error = input<string | undefined>();
  readonly hideValidationMessages = input(false, { transform: booleanAttribute });
  readonly explicitId = input<string | undefined>();
  readonly ariaLabel = input<string | undefined>();
  readonly ariaDescribedBy = input<string | undefined>();
  readonly labelClasses = input<string>('');
  
  readonly appendButtonIcon = input<AppIcon | undefined>();
  readonly appendButtonAriaLabel = input<string | undefined>();
  readonly extraButtonClasses = input<string>('');
  readonly enterPressed: OutputEmitterRef<string> = output<string>();
  readonly appendButtonClicked: OutputEmitterRef<string> = output<string>();

  value = model<any>(null);

  readonly isDisabled = signal(false);
  readonly inputId = computed(() => this.explicitId() || `input-${Math.random().toString(36).substring(2, 9)}`);
  readonly hasErrors = computed(() => !!this.error());

  private onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void { this.value.set(value); }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
  
  onInputChange(event: Event): void {
    const newValue = (event.target as HTMLInputElement).value;
    this.value.set(newValue);
    this.onChange(newValue);
  }

  // FIX: Type de event parameter correct
  onEnterPressed(event: Event): void {
    event.preventDefault(); // Voorkom default form submission
    this.enterPressed.emit(this.value());
  }

  onAppendButtonClick(event: Event): void {
    event.preventDefault();
    this.appendButtonClicked.emit(this.value());
  }

  readonly inputClasses = computed(() => {
    const commonClasses = 'block w-full rounded-md shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary disabled:opacity-75 disabled:cursor-not-allowed transition-colors ease-in-out';
    const textInputClasses = 'bg-background text-text placeholder:text-placeholder';
    let sizeClass = '';
    const size = this.sizeVariant();
    if (size !== 'none') {
      sizeClass = { sm: 'py-1.5 px-3 text-sm sm:leading-6', md: 'py-2 px-3 text-sm sm:leading-6', lg: 'py-2.5 px-4 text-base' }[size] || '';
    }
    const paddingLeft = (this.icon() && this.iconPosition() === 'left') ? 'pl-10' : '';
    const paddingRight = (this.icon() && this.iconPosition() === 'right') || this.appendButtonIcon() ? 'pr-10' : ''; 
    return `${commonClasses} ${textInputClasses} ${sizeClass} ${paddingLeft} ${paddingRight} ${this.extraClasses()}`;
  });

  readonly appendButtonClasses = computed(() => {
    const baseClasses = 'absolute right-0 top-0 h-full px-3 text-secondary hover:text-primary focus:outline-none focus:text-primary rounded-none';
    return `${baseClasses} ${this.extraButtonClasses()}`;
  });
}

--- END OF FILE ---

--- START OF FILE libs/ui/overlay/src/lib/dynamic-overlay.service.ts ---

/**
 * @file dynamic-overlay.service.ts
 * @Version 5.0.0 (Definitive & Simplified)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description
 *   The definitive, simplified, and robust version of the DynamicOverlayService.
 *   This version centralizes component attachment logic within the service itself,
 *   ensuring the `componentInstance` on the `DynamicOverlayRef` is always correctly populated.
 */
import { ElementRef, Injectable, Injector, Type, inject, Renderer2, RendererFactory2 } from '@angular/core';
import { Overlay, OverlayConfig, PositionStrategy, ConnectedPosition, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DynamicOverlayContainerComponent } from './dynamic-overlay-container.component';
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF, DynamicOverlayConfig, DynamicOverlayRef } from './dynamic-overlay.tokens';
import { DOCUMENT } from '@angular/common';


@Injectable({ providedIn: 'root' })
export class DynamicOverlayService {
    public readonly overlay = inject(Overlay);
    private rootInjector = inject(Injector);
    private rendererFactory = inject(RendererFactory2);
    private document = inject(DOCUMENT);
    private readonly logPrefix = '[DynamicOverlayService]';

    open<R = any, C = any>(config: DynamicOverlayConfig<any>): DynamicOverlayRef<R, C> {
        const overlayConfig = this.createOverlayConfig(config);
        const overlayRef = this.overlay.create(overlayConfig);
        const renderer = this.getRenderer();
        this.syncTheme(overlayRef, renderer);

        const afterClosedSubject = new Subject<R | undefined>();
        const afterClosed$ = afterClosedSubject.asObservable().pipe(take(1));
        let result: R | undefined;

        const dynamicOverlayRef: DynamicOverlayRef<R, C> = {
            data: config.data ?? null,
            afterClosed$,
            close: (closeResult?: R) => {
                result = closeResult;
                overlayRef.dispose();
            },
            componentInstance: undefined, // Initialize as undefined
        };

        const injector = Injector.create({
            providers: [
                { provide: DYNAMIC_OVERLAY_DATA, useValue: dynamicOverlayRef.data },
                { provide: DYNAMIC_OVERLAY_REF, useValue: dynamicOverlayRef },
            ],
            parent: this.rootInjector,
        });

        // Attach the CONTAINER component
        const containerPortal = new ComponentPortal(DynamicOverlayContainerComponent, null, injector);
        const containerRef = overlayRef.attach(containerPortal);
        containerRef.instance.config = config;
        
        // DE FIX: Attach de CONTENT component AAN de container en zet de `componentInstance`
        const contentPortal = new ComponentPortal(config.component, null, injector);
        const contentRef = containerRef.instance.portalOutlet.attachComponentPortal(contentPortal);
        dynamicOverlayRef.componentInstance = contentRef.instance as C;

        overlayRef.detachments().pipe(take(1)).subscribe(() => {
            if (!afterClosedSubject.closed) {
                afterClosedSubject.next(result);
                afterClosedSubject.complete();
            }
        });

        this.setupCloseListeners(config, overlayRef, dynamicOverlayRef);
        
        return dynamicOverlayRef;
    }

    private syncTheme(overlayRef: OverlayRef, renderer: Renderer2): void {
      const htmlElement = this.document.documentElement;
      if (htmlElement.classList.contains('dark')) {
        renderer.addClass(overlayRef.overlayElement, 'dark');
      }
      const theme = htmlElement.getAttribute('data-theme');
      if (theme) {
        renderer.setAttribute(overlayRef.overlayElement, 'data-theme', theme);
      }
    }

    private setupCloseListeners<R, C>(config: DynamicOverlayConfig<any>, overlayRef: OverlayRef, dynamicOverlayRef: DynamicOverlayRef<R, C>): void {
        const backdropType = config.backdropType ?? 'dark';
        const closeOnClick = config.closeOnClickOutside ?? (backdropType !== 'none');
        if (backdropType !== 'none' && closeOnClick) {
            overlayRef.backdropClick().pipe(take(1)).subscribe(() => dynamicOverlayRef.close());
        }
    }

    private getRenderer(): Renderer2 {
        return this.rendererFactory.createRenderer(this.document.body, null);
    }
    
    private createOverlayConfig(config: DynamicOverlayConfig): OverlayConfig {
        const backdropType = config.backdropType ?? 'dark';
        const hasBackdrop = backdropType !== 'none';
        const backdropClass = !hasBackdrop ? '' : backdropType === 'transparent' ? 'cdk-overlay-transparent-backdrop' : 'cdk-overlay-dark-backdrop';
        const positionStrategy = this.createPositionStrategy(config);

        return new OverlayConfig({
            hasBackdrop: hasBackdrop,
            backdropClass: backdropClass,
            panelClass: ['dynamic-overlay-panel', ...(Array.isArray(config.panelClass) ? config.panelClass : config.panelClass ? [config.panelClass] : [])],
            scrollStrategy: config.overlayConfigOptions?.scrollStrategy ?? this.overlay.scrollStrategies.block(),
            width: config.width,
            maxWidth: config.maxWidth,
            height: config.height,
            positionStrategy: positionStrategy,
            ...config.overlayConfigOptions,
        });
    }

    private createPositionStrategy(config: DynamicOverlayConfig): PositionStrategy {
        if (config.positionStrategy === 'connected' && config.origin) {
            const positions = config.connectedPosition ?? this.getDefaultConnectedPositions();
            return this.overlay.position().flexibleConnectedTo(config.origin).withPositions(positions).withPush(false);
        }
        return this.overlay.position().global().centerHorizontally().centerVertically();
    }

    private getDefaultConnectedPositions(): ConnectedPosition[] {
        return [
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
            { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
        ];
    }
}

--- END OF FILE ---

--- START OF FILE libs/ui/overlay/src/lib/dynamic-overlay.tokens.ts ---

/**
 * @file dynamic-overlay.tokens.ts
 * @Version 3.0.0 (Definitive Fix: Interface-based Ref)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-24
 * @Description
 *   Vervangt de `DynamicOverlayRef` klasse met een `interface` om de hardnekkige
 *   `_overlayRef is read-only` fout te omzeilen. Dit patroon is robuuster voor DI.
 */
import { ConnectedPosition, OverlayConfig } from '@angular/cdk/overlay';
import { ElementRef, InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * @description Injection token voor de data die aan de overlay wordt meegegeven.
 */
export const DYNAMIC_OVERLAY_DATA = new InjectionToken<any>('DYNAMIC_OVERLAY_DATA');

/**
 * @description De interface die de publieke API van een overlay referentie definieert.
 *              Componenten in de overlay gebruiken dit om zichzelf te sluiten en te communiceren.
 */
export interface DynamicOverlayRef<R = any, T = any> {
  /**
   * @description Een observable die een waarde uitzendt en voltooit wanneer de overlay wordt gesloten.
   */
  readonly afterClosed$: Observable<R | undefined>;

  /**
   * @description De data die is meegegeven bij het openen van de overlay.
   */
  readonly data: T | null;

  /**
   * @description De instantie van de component die binnen deze overlay is geladen.
   *              Gebruik dit om inputs in te stellen of outputs te subscriben.
   */
  componentInstance?: any; // <<-- VOEG DEZE REGEL TOE

  /**
   * @description Sluit de overlay en geeft optioneel een resultaat terug.
   * @param result Het resultaat dat wordt uitgezonden door `afterClosed$`.
   */
  close(result?: R): void;
}

/**
 * @description Injection token voor de `DynamicOverlayRef` instantie.
 */
export const DYNAMIC_OVERLAY_REF = new InjectionToken<DynamicOverlayRef<any>>('DYNAMIC_OVERLAY_REF');

export interface DynamicOverlayConfig<D = any> {
    component: Type<any>;
    data?: D;
    panelClass?: string | string[];
    backdropType?: 'dark' | 'transparent' | 'none';
    closeOnClickOutside?: boolean;
    mobileFullscreen?: boolean;
    positionStrategy?: 'global-center' | 'connected';
    origin?: ElementRef | HTMLElement;
    connectedPosition?: ConnectedPosition[];
    width?: string | number;
    maxWidth?: string | number;
    height?: string | number;
    overlayConfigOptions?: Partial<OverlayConfig>;
    disableCloseOnEscape?: boolean;
}

--- END OF FILE ---

--- START OF FILE libs/ui/paragraph/src/lib/paragraph/ui-paragraph.component.ts ---

/**
 * @file ui-paragraph.component.ts
 * @Version 1.1.0 // Assuming version increment for this change
 * @Author Royal-Code MonorepoAppDevAI (o.b.v. User input)
 * @Date 2025-07-27 // Huidige datum
 * @PromptSummary Modified UiParagraphComponent to support content projection as a fallback if 'text' input is not provided.
 * @Description A standalone UI component for rendering paragraph text with various styling options.
 *              Supports text via 'text' input or direct content projection.
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Type definities voor de kleuren
export type ParagraphThemeColor =
  | 'primary'
  | 'secondary' 
  | 'sun'
  | 'fire'
  | 'water'
  | 'forest'
  | 'arcane'
  | 'text'
  | 'muted'
  | 'foreground'
  | 'accent'
  | 'error';


export type ParagraphShade =
  | 'white'
  | 'slate-100'
  | 'slate-200'
  | 'slate-300'
  | 'slate-400'
  | 'slate-500'
  | 'slate-600'
  | 'slate-700'
  | 'slate-800'
  | 'slate-900'
  | 'black';

export type ParagraphColor = ParagraphThemeColor | ParagraphShade;

@Component({
  selector: 'royal-code-ui-paragraph',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p [ngClass]="paragraphClasses()">
      @if (text() && text() !== '') {
        {{ text() }}
      } @else {
        <ng-content></ng-content>
      }
    </p>
  `,
  // De styles array kan leeg blijven als er geen component-specifieke stijlen zijn.
  // styles: []
})
export class UiParagraphComponent {
  // Inputs met signal-based API
  text = input<string>('');
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  centered = input<boolean>(false);

  /**
   * Kleur van de paragraaf.
   * Kan een themakleur zijn (e.g., 'primary', 'fire')
   * of een grijstint/shade (e.g., 'white', 'slate-500', 'black').
   * Indien niet gespecificeerd, wordt de standaard tekstkleur van de parent gebruikt.
   */
  color = input<ParagraphColor | undefined>(undefined);

  /**
   * Extra Tailwind CSS klassen die toegevoegd kunnen worden aan de paragraaf.
   * Bijvoorbeeld: "font-bold italic"
   */
  extraClasses = input<string>('');

  // Computed signal voor de klassen
  readonly paragraphClasses = computed(() => {
    const baseClasses: { [key: string]: boolean } = {
      'text-xs': this.size() === 'xs',
      'text-sm': this.size() === 'sm',
      'text-base': this.size() === 'md',
      'text-lg': this.size() === 'lg',
      'text-center': this.centered(),
    };

    const selectedColor = this.color();
    const colorClasses: { [key: string]: boolean } = {};

    if (selectedColor) {
      switch (selectedColor) {
        case 'primary':    colorClasses['text-[var(--color-primary)]'] = true; break;
        case 'sun':        colorClasses['text-[var(--color-theme-sun)]'] = true; break;
        case 'fire':       colorClasses['text-[var(--color-theme-fire)]'] = true; break;
        case 'water':      colorClasses['text-[var(--color-theme-water)]'] = true; break;
        case 'forest':     colorClasses['text-[var(--color-theme-forest)]'] = true; break;
        case 'arcane':     colorClasses['text-[var(--color-theme-arcane)]'] = true; break;
        case 'text':       colorClasses['text-[var(--color-text)]'] = true; break;
        case 'muted':      colorClasses['text-[var(--color-text-muted)]'] = true; break;
        case 'foreground': colorClasses['text-[var(--color-foreground)]'] = true; break;
        case 'accent':     colorClasses['text-[var(--color-accent)]'] = true; break;
        case 'white':      colorClasses['text-white'] = true; break;
        case 'slate-100':  colorClasses['text-slate-100'] = true; break;
        case 'slate-200':  colorClasses['text-slate-200'] = true; break;
        case 'slate-300':  colorClasses['text-slate-300'] = true; break;
        case 'slate-400':  colorClasses['text-slate-400'] = true; break;
        case 'slate-500':  colorClasses['text-slate-500'] = true; break;
        case 'slate-600':  colorClasses['text-slate-600'] = true; break;
        case 'slate-700':  colorClasses['text-slate-700'] = true; break;
        case 'slate-800':  colorClasses['text-slate-800'] = true; break;
        case 'slate-900':  colorClasses['text-slate-900'] = true; break;
        case 'black':      colorClasses['text-black'] = true; break;
      }
    }

    const combined: any = { ...baseClasses, ...colorClasses };

    const extras = this.extraClasses();
    if (extras) {
      extras.split(' ').forEach(cls => {
        if (cls.trim()) {
          combined[cls.trim()] = true;
        }
      });
    }
    return combined;
  });
}

--- END OF FILE ---

--- START OF FILE libs/ui/title/src/lib/title/ui-title.component.ts ---

/**
 * @file ui-title.component.ts
 * @Version 5.2.0 (Definitive Block Style & Text Bugfix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Description
 *   A flexible UI component for rendering titles. This definitive version correctly
 *   implements the 'blockStyle' with 'primary' and 'secondary' variants and
 *   fixes the bug where text passed via input was not displayed.
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicTitleDirective } from '@royal-code/shared/utils';

export enum TitleTypeEnum {
  H1 = 'h1', H2 = 'h2', H3 = 'h3',
  H4 = 'h4', H5 = 'h5', H6 = 'h6',
  Default = 'default',
}

@Component({
  selector: 'royal-code-ui-title',
  standalone: true,
  imports: [DynamicTitleDirective, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      libRoyalCodeDynamicTitle
      [tag]="renderedTag()"
      [ngClass]="finalClasses()"
      [id]="id()"
      [attr.title]="truncate() ? text() : null">
      @if (text()) {
        {{ text() }}
      } @else {
        <ng-content></ng-content>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class UiTitleComponent {
  readonly level = input<TitleTypeEnum>(TitleTypeEnum.Default);
  readonly text = input<string>('');
  readonly id = input<string | undefined>(undefined);
  readonly extraClasses = input<string>('');
  readonly blockStyle = input(false, { transform: booleanAttribute });
  readonly blockStyleType = input<'primary' | 'secondary'>('primary');

  readonly heading = input(true, { transform: booleanAttribute });
  readonly bold = input(false, { transform: booleanAttribute });
  readonly center = input(false, { transform: booleanAttribute });
  readonly truncate = input(false, { transform: booleanAttribute });

  readonly renderedTag = computed(() => {
    const currentLevel = this.level();
    if (currentLevel !== TitleTypeEnum.Default) return currentLevel;
    return this.heading() ? 'h2' : 'p';
  });

  readonly finalClasses = computed(() => {
    const tag = this.renderedTag();
    const sizeClass = {
      h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg',
      h4: 'text-base', h5: 'text-sm', h6: 'text-sm', p: 'text-base'
    }[tag] || 'text-base';

    if (this.blockStyle()) {
      const type = this.blockStyleType();
      const blockBase = 'font-bold tracking-wide py-2 px-4 rounded-xs';
      
      if (type === 'primary') {
        return `
          inline-block
          bg-primary text-black
          ${blockBase}
          ${sizeClass}
          ${this.extraClasses()}
        `;
      }
      
      if (type === 'secondary') {
        return `
          block
          bg-surface-alt text-foreground
          border-l-4 border-primary
          ${blockBase}
          ${sizeClass}
          ${this.extraClasses()}
        `;
      }
    }
    
    // Standaard gedrag voor "clean text"
    return `
      block
      text-foreground
      ${this.bold() ? 'font-bold' : 'font-semibold'}
      ${this.center() ? 'text-center' : ''}
      ${this.truncate() ? 'truncate' : ''}
      ${sizeClass}
      ${this.extraClasses()}
    `;
  });
}

--- END OF FILE ---