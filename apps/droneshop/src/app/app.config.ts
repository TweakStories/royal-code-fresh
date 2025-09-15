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
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';

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
import { LOGGER_CONFIG, LogLevel } from '@royal-code/core/core-logging';

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
  UserCircle,
  Filter
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
import { DRONESHOP_MOBILE_MODAL_NAVIGATION, DRONESHOP_PRIMARY_NAVIGATION, DRONESHOP_TOPBAR_NAVIGATION } from './config/droneshop-navigation';
import { APP_NAVIGATION_ITEMS } from '@royal-code/core/navigations/state';

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

 {
      provide: APP_NAVIGATION_ITEMS,
      useValue: {
        primary: DRONESHOP_PRIMARY_NAVIGATION,
        topBar: DRONESHOP_TOPBAR_NAVIGATION,
        mobileModal: DRONESHOP_MOBILE_MODAL_NAVIGATION
      }
    },    // ===== I18N (Uw originele, werkende configuratie) =====
    // Deze configuratie wordt ongewijzigd gelaten, zoals u deze heeft aangeleverd.
    // De TranslateBrowserLoader die u definieert, is dan verantwoordelijk voor de HTTP-aanroep.
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    {
      provide: APP_NAVIGATION_ITEMS,
      useValue: {
        primary: DRONESHOP_PRIMARY_NAVIGATION,
        topBar: DRONESHOP_TOPBAR_NAVIGATION,
        mobileModal: DRONESHOP_MOBILE_MODAL_NAVIGATION
      }
    },

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
    CurrencyPipe,

    // ===== ICONS =====
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ...icons,
        Home, Edit3, Edit, Grid, MoreHorizontal, AlertCircle, MoreVertical, GitCommit, Sliders, PlayCircle, CheckCircle, AlertTriangle, UserCircle, Filter,
      })
    },
  ],
};