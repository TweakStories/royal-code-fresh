/**
 * @file app.config.ts (Admin Panel) - DEFINITIVE CORRECTED VERSION
 * @Version 6.0.2 (Removed Eager Character Progression Feature)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Fixed critical import errors where ActionReducer and ActionReducerMap
 *   were incorrectly imported from @angular/core instead of @ngrx/store.
 *   Removed eager loading of CharacterProgressionFeature to improve performance.
 */

// ===== ANGULAR CORE IMPORTS =====
import { 
  ApplicationConfig, 
  provideZoneChangeDetection, 
  isDevMode, 
  inject, 
  APP_INITIALIZER,
  PLATFORM_ID
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { isPlatformBrowser } from '@angular/common';

// ===== HTTP & INTERCEPTORS =====
import { provideHttpClient, withInterceptors, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthInterceptor } from '@royal-code/auth/data-access';
import { globalErrorInterceptor } from '@royal-code/core/error-handling';
import { etagInterceptor } from '@royal-code/core/http';

// ===== NGRX STORE =====
import { 
  MetaReducer, 
  provideStore, 
  Store, 
  ActionReducer, 
  ActionReducerMap 
} from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer, RouterReducerState } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { localStorageSync } from 'ngrx-store-localstorage';
import { RouterStateUrl } from '@royal-code/core/routing'; // Import RouterStateUrl

// ===== STORE FEATURES =====
import { AuthFacade, provideAuthFeature } from '@royal-code/store/auth';
import { provideUserFeature } from '@royal-code/store/user';
import { provideErrorFeature } from '@royal-code/store/error';
import { provideThemeFeature, APP_THEME_DEFAULTS, AppThemeDefaults } from '@royal-code/store/theme';
import { provideNavigationFeature } from '@royal-code/core/navigations/state';
// << DE FIX: provideCharacterProgressionFeature is verwijderd voor lazy loading >>
// import { provideCharacterProgressionFeature } from '@royal-code/features/character-progression';
import { provideProductsFeature, AbstractProductApiService } from '@royal-code/features/products/core';
import { provideCartFeature, AbstractCartApiService } from '@royal-code/features/cart/core';
import { provideOrdersFeature, AbstractOrderApiService } from '@royal-code/features/orders/core';
import { provideChatFeature, AbstractChatApiService } from '@royal-code/features/chat/core';
import { provideReviewsFeature, AbstractReviewsApiService } from '@royal-code/features/reviews/core';
import { provideMediaFeature, AbstractMediaApiService } from '@royal-code/features/media/core';
import { provideAdminProductsFeature } from '@royal-code/features/admin-products/core';
import { provideAdminUsersFeature } from '@royal-code/features/admin-users/core';
import { provideAdminOrdersFeature } from '@royal-code/features/admin-orders/core';
import { provideAdminVariantsFeature } from '@royal-code/features/admin-variants/core';
import { AbstractAdminDashboardApiService, provideAdminDashboardFeature } from '@royal-code/features/admin-dashboard/core';
import { PlushieAdminDashboardApiService } from '@royal-code/features/admin-dashboard/data-access'; 
import { DroneshopAccountApiService } from '@royal-code/features/account/data-access-droneshop';

// ===== I18N =====
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

// ===== CORE SERVICES =====
import { APP_CONFIG } from '@royal-code/core/config';
import { LOGGER_CONFIG, LogLevel } from '@royal-code/core/core-logging';
import { StorageService } from '@royal-code/core/storage';

// ===== API SERVICE IMPLEMENTATIONS (Adjust as needed for Admin Panel) =====
import { DroneshopProductApiService } from '@royal-code/features/products/data-access-droneshop';
import { PlushieCartApiService } from '@royal-code/features/cart/data-access-plushie';
import { PlushieReviewsApiService } from '@royal-code/features/reviews/data-access-plushie';
import { PlushieChatApiService } from '@royal-code/features/chat/data-access-plushie';
import { PlushieMediaApiService } from '@royal-code/features/media/data-access-plushie';
import { PlushieOrderApiService } from '@royal-code/features/orders/data-access-plushie';

// ===== ICONS =====
import { BarChart, CheckCircle, Edit, HelpCircle, Home, LUCIDE_ICONS, LucideIconProvider, MoreVertical, UserCircle, XCircle, icons } from 'lucide-angular';

// ===== ENVIRONMENT & ROUTES =====
import { environment } from '../../environments/environment';
import { appRoutes } from './app.routes';
import { AbstractAccountApiService, provideAccountFeature } from '@royal-code/features/account/core';

// ========================================
// ROOT STATE & REDUCERS
// ========================================
// DE FIX: Definieer de root state en reducers lokaal, en beperk deze tot ENKEL de router.
// Alle andere state slices worden via hun `provide...Feature` functies geregistreerd.
export interface RootState {
  router: RouterReducerState<RouterStateUrl>;
}

const rootReducers: ActionReducerMap<RootState> = {
  router: routerReducer,
};

// ========================================
// META REDUCERS (PLATFORM-AWARE)
// ========================================
// DE FIX: Maak de meta-reducer platform-aware om SSR hydration problemen te voorkomen.
export function localStorageSyncFactory(platformId: object): MetaReducer<any> {
  return function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    if (isPlatformBrowser(platformId)) {
      return localStorageSync({
        keys: ['theme', 'user', 'cart', 'adminUiSettings', 'adminProducts', 'adminUsers'],
        rehydrate: true,
        storageKeySerializer: (key) => `AdminPanelApp_${key}`,
      })(reducer);
    }
    return reducer;
  };
}

// ========================================
// INTERCEPTORS
// ========================================
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const handlerAdapter = { handle: (request: HttpRequest<any>) => next(request) };
  return inject(AuthInterceptor).intercept(req, handlerAdapter);
};

// ========================================
// INITIALIZERS
// ========================================
export function initializeI18nFactory(translate: TranslateService, storage: StorageService): () => Promise<void> {
  return () => {
    const defaultLang = 'en';
    const supportedLangs = ['en', 'nl'];
    const storedLang = storage.getItem<string>('AdminPanelApp_language');
    const browserLang = translate.getBrowserLang();
    const langToUse = (storedLang && supportedLangs.includes(storedLang))
      ? storedLang
      : (browserLang && supportedLangs.includes(browserLang)) ? browserLang : defaultLang;
    translate.setDefaultLang(defaultLang);
    return translate.use(langToUse).toPromise().then(() => console.log(`[APP_INITIALIZER] i18n initialized to: ${langToUse}`));
  };
}

export function initializeAuthFactory(authFacade: AuthFacade): () => void {
  return () => authFacade.checkAuthStatus();
}

// ========================================
// THEME CONFIGURATION
// ========================================
const ADMIN_PANEL_THEME_DEFAULTS: AppThemeDefaults = {
  defaultThemeName: 'oceanicFlow',
  defaultDarkMode: true,
};

// ========================================
// APPLICATION CONFIGURATION
// ========================================
export const appConfig: ApplicationConfig = {
  providers: [
    // ===== ANGULAR CORE =====
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    // provideClientHydration(),

    // ===== ROUTING =====
    provideRouter(appRoutes, 
      withComponentInputBinding(), 
      withViewTransitions(), 
      withInMemoryScrolling({ 
        scrollPositionRestoration: 'enabled', 
        anchorScrolling: 'enabled' 
      })
    ),

    // ===== HTTP =====
    provideHttpClient(withInterceptors([authInterceptorFn, etagInterceptor, globalErrorInterceptor])),
    AuthInterceptor,
    StorageService,

    // ===== NGRX STORE =====
    provideStore(rootReducers, { // DE FIX: Gebruik de lokaal gedefinieerde, minimale rootReducers
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
        strictActionWithinNgZone: true,
        strictActionTypeUniqueness: true, // Zet op true voor betere-praktijken
      }
    }),
    {
      provide: 'META_REDUCERS',
      useFactory: localStorageSyncFactory,
      deps: [PLATFORM_ID],
      multi: true
    },
    provideEffects([]),
    provideRouterStore(),
    
    // ===== DEV TOOLS (Development Only) =====
    isDevMode() ? provideStoreDevtools({ name: 'Admin Panel App', maxAge: 25, logOnly: false }) : [],

    // ===== STORE FEATURES (Dit is nu de enige manier waarop features worden geregistreerd) =====
    provideAuthFeature(),
    provideUserFeature(),
    provideErrorFeature(),
    provideThemeFeature(),
    provideNavigationFeature(),
    // << DE FIX: CharacterProgressionFeature is verwijderd uit eager providers >>
    // provideCharacterProgressionFeature(),
    provideProductsFeature(),
    provideCartFeature(),
    provideOrdersFeature(),
    provideChatFeature(),
    provideReviewsFeature(),
    provideMediaFeature(),
    provideAdminProductsFeature(),
    provideAdminUsersFeature(),
    provideAdminOrdersFeature(),
    provideAdminVariantsFeature(),
    provideAdminDashboardFeature(),
    provideAccountFeature(),

    // ===== APP INITIALIZERS =====
    { provide: APP_INITIALIZER, useFactory: initializeI18nFactory, multi: true, deps: [TranslateService, StorageService] },
    { provide: APP_INITIALIZER, useFactory: initializeAuthFactory, multi: true, deps: [AuthFacade] },

    // ===== API SERVICE IMPLEMENTATIONS (Adjust as needed for Admin Panel) =====
    { provide: AbstractProductApiService, useClass: DroneshopProductApiService },
    { provide: AbstractCartApiService, useClass: PlushieCartApiService },
    { provide: AbstractReviewsApiService, useClass: PlushieReviewsApiService },
    { provide: AbstractChatApiService, useClass: PlushieChatApiService },
    { provide: AbstractMediaApiService, useClass: PlushieMediaApiService },
    { provide: AbstractOrderApiService, useClass: PlushieOrderApiService },
    { provide: AbstractAdminDashboardApiService, useClass: PlushieAdminDashboardApiService },
    { provide: AbstractAccountApiService, useClass: DroneshopAccountApiService },


    // ===== I18N =====
    provideTranslateService({ lang: 'en', fallbackLang: 'en', loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }) }),

    // ===== CONFIGURATION =====
    { provide: APP_CONFIG, useValue: environment },
    { provide: LOGGER_CONFIG, useValue: { level: isDevMode() ? LogLevel.DEBUG : LogLevel.INFO, appName: 'AdminPanel' } },
    { provide: APP_THEME_DEFAULTS, useValue: ADMIN_PANEL_THEME_DEFAULTS },

    // ===== ICONS =====
    { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({...icons, Edit, Home, UserCircle, 
      BarChart, MoreVertical, XCircle, CheckCircle, HelpCircle, }) },
  ],
};