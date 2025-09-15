// apps/plushie-paradise/src/app/app.config.ts - FINAL FIX (Injector)
/**
 * @file app.config.ts (Plushie Paradise) - FINAL VERSION
 * @Version 1.5.0 - Corrected APP_INITIALIZER provider syntax
 * @Description Complete app config with a robust, correctly configured initialization flow.
 */

// --- Angular Core & Platform ---
import { ApplicationConfig, provideZoneChangeDetection, isDevMode, inject, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient, HttpInterceptorFn, withInterceptors, HttpRequest } from '@angular/common/http';

// --- NgRx Core & State Management ---
import { MetaReducer, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { localStorageSync } from 'ngrx-store-localstorage';
import { RootState, rootReducers } from '@royal-code/store';

// --- NgRx Feature States ---
import { provideAuthFeature } from '@royal-code/store/auth';
import { provideUserFeature } from '@royal-code/store/user';
import { provideErrorFeature } from '@royal-code/store/error';
import { provideThemeFeature, APP_THEME_DEFAULTS, AppThemeDefaults } from '@royal-code/store/theme';
import { provideNavigationFeature } from '@royal-code/core/navigations/state';
import { provideCharacterProgressionFeature } from '@royal-code/features/character-progression';
import { AbstractSocialApiService, provideFeedFeature } from '@royal-code/features/social/core';
import { SocialApiService } from '@royal-code/features/social/data-access';

// --- Product Feature & Initializer ---
import {
  provideProductsFeature,
  AbstractProductApiService
} from '@royal-code/features/products/core';
import { initializeProductCartData } from '@royal-code/shared/initializers';
import { PlushieProductApiService } from '@royal-code/features/products/data-access-plushie';

// --- Other Features & Initializers ---
import { provideCartFeature, AbstractCartApiService } from '@royal-code/features/cart/core';
import { AbstractCheckoutApiService, initializeCheckoutState } from '@royal-code/features/checkout/core';
import { PlushieCheckoutApiService } from '@royal-code/features/checkout/data-access-plushie';
import { PlushieCartApiService } from '@royal-code/features/cart/data-access-plushie';
import { AbstractReviewsApiService } from '@royal-code/features/reviews/core';
import { PlushieReviewsApiService } from '@royal-code/features/reviews/data-access-plushie';
import { PlushieChatApiService } from '@royal-code/features/chat/data-access-plushie';
import { PlushieMediaApiService } from '@royal-code/features/media/data-access-plushie';
import { AbstractMediaApiService } from '@royal-code/features/media/core';
import { PlushieOrderApiService } from '@royal-code/features/orders/data-access-plushie';
import { AbstractOrderApiService, provideOrdersFeature } from '@royal-code/features/orders/core';

// --- Internationalization (i18n) ---
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// --- Core Services & Configuration ---
import { APP_CONFIG } from '@royal-code/core/config';
import { LOGGER_CONFIG, LogLevel } from '@royal-code/core/core-logging';

// --- Application Specific ---
import { environment } from '../../environments/environment';
import { appRoutes } from './app.routes';
import { AuthInterceptor } from '@royal-code/auth/data-access';
import { globalErrorInterceptor } from '@royal-code/core/error-handling';
import { etagInterceptor, configureEtagEndpoints } from '@royal-code/core/http';
import { selectAddressesVersion, UserActions } from '@royal-code/store/user';

// --- UI & Icons (Lucide) ---
import { LUCIDE_ICONS, LucideIconProvider, Activity, Angry, ArrowLeft, ArrowRight, Award, Book, Bookmark, BookmarkCheck, BowArrow, BrainCircuit, Briefcase, CalendarClock, Camera, Car, Castle, CheckCheck, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock, Clover, Coins, CreditCard, DollarSign, DoorOpen, Droplet, Droplets, Edit, Euro, Eye, Flag, FlaskConical, Footprints, Frown, Gamepad2, Gauge, Ghost, Gift, Globe, Goal, Grid, Hammer, Handshake, Headphones, Heart, HelpCircle, Hexagon, Home, ImageOff, Info, Key, Landmark, Leaf, List, ListChecks, LocateFixed, Lock, LogOut, Mail, Map, MapIcon, MapPin, Menu, MessageCircle, MessageSquare, Monitor, Moon, MoreHorizontal, Navigation, Package, PackageOpen, PartyPopper, PenTool, Pickaxe, Play, Route, Server, Settings, Share, Shield, ShieldCheck, Shirt, ShoppingBag, ShoppingBasket, ShoppingCart, Skull, Smartphone, Smile, SmilePlus, Space, Sparkle, Sparkles, Sprout, Star, Store, Sun, SunDim, Sword, Swords, Target, ThumbsUp, TowerControl, Trash2, Trophy, User, UserCheck, UserCircle, Users, Wallet, Watch, Waves, Wind, Wrench, X, XCircle, BookMarked, Barcode, Loader, Check, Plus, Truck, RotateCcw, Minus, CircleCheck, Timer, Baby, Recycle, HeartHandshake, Ruler, AlertCircle, BadgeCheck, MoreVertical, StarHalf, AlertTriangle, File, ThumbsDown, BarChart, Flame, Banknote, CircleHelp, CircleX, Hand, SearchX, Slash, Hourglass, Edit3, CornerDownRight, } from 'lucide-angular';
import { AbstractChatApiService, provideChatFeature } from '@royal-code/features/chat/core';
import { StorageService } from '@royal-code/core/storage';

export function localStorageSyncReducer(reducer: any): any {
  return localStorageSync({
    keys: [
      { theme: {} },
      {
        user: {
          reviver: (key: any, value: any): any => {
            return value;
          },
        }
      },
      { cart: {} } 
    ],
    rehydrate: true,
    storageKeySerializer: (key) => `PlushieParadiseApp_${key}`,
  })(reducer);
}


const metaReducers: MetaReducer<RootState>[] = [localStorageSyncReducer];

// Configure etag endpoints for caching
configureEtagEndpoints({
  '/api/Users/addresses': {
    selector: (store) => store.select(selectAddressesVersion),
    updateAction: (version) => UserActions.addressVersionUpdated({ version }),
  },
});

const PLUSHIE_PARADISE_THEME_DEFAULTS: AppThemeDefaults = {
  defaultThemeName: 'oceanicFlow',
  defaultDarkMode: false,
};

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const handlerAdapter = { handle: (request: HttpRequest<any>) => next(request), };
  return inject(AuthInterceptor).intercept(req, handlerAdapter);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(),
    provideAnimations(),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideHttpClient(
      withInterceptors([ authInterceptorFn, etagInterceptor, globalErrorInterceptor, ])
    ),
    StorageService,
    AuthInterceptor,

    // === NGRx STORE SETUP ===
    provideStore(rootReducers, { metaReducers,
      runtimeChecks: {
        strictStateImmutability: false, strictActionImmutability: false,
        strictStateSerializability: false, strictActionSerializability: false,
        strictActionWithinNgZone: false, strictActionTypeUniqueness: false,
      },
    }),
    provideEffects([]),
    provideRouterStore(),

    // === FEATURE STATES ===
    provideAuthFeature(),
    provideUserFeature(),
    provideErrorFeature(),
    provideThemeFeature(),
    provideNavigationFeature(),
    provideCharacterProgressionFeature(),
    provideChatFeature(),
    provideProductsFeature(),
    provideCartFeature(),
    provideOrdersFeature(),
    provideFeedFeature(),
    
    // === DEVTOOLS ===
    isDevMode() ? provideStoreDevtools({ maxAge: 25, logOnly: environment.production }) : [],

    // === APP INITIALIZERS (CORRECTE SYNTAX) ===
    {
      provide: APP_INITIALIZER,
      useFactory: initializeCheckoutState,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeProductCartData, // Zorgt voor het pre-loaden van productdata voor de cart
      multi: true,
      deps: [], // Geen expliciete deps nodig als het inject() gebruikt
    },

    // === API SERVICE IMPLEMENTATIONS ===
    { provide: AbstractCheckoutApiService, useClass: PlushieCheckoutApiService },
    { provide: AbstractCartApiService, useClass: PlushieCartApiService },
    { provide: AbstractProductApiService, useClass: PlushieProductApiService },
    { provide: AbstractReviewsApiService, useClass: PlushieReviewsApiService },
    { provide: AbstractChatApiService, useClass: PlushieChatApiService },
    { provide: AbstractMediaApiService, useClass: PlushieMediaApiService },
    { provide: AbstractOrderApiService, useClass: PlushieOrderApiService },
    { provide: AbstractSocialApiService, useClass: SocialApiService },

    // === I18N & CONFIG ===
    provideTranslateService(),
    { provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient] },
    { provide: APP_CONFIG, useValue: environment },
    { provide: LOGGER_CONFIG, useValue: {
        level: isDevMode() ? LogLevel.DEBUG : LogLevel.WARN,
        enableExternalLogging: !isDevMode(),
        appName: 'PlushieParadiseApp',
      },
    },
    { provide: APP_THEME_DEFAULTS, useValue: PLUSHIE_PARADISE_THEME_DEFAULTS },

    // === ICONS ===
    { provide: LUCIDE_ICONS, multi: true,
      useValue: new LucideIconProvider({ Activity, Angry, Edit3, ArrowLeft, ArrowRight, CornerDownRight, Award, Book, Bookmark, BookmarkCheck, BowArrow, BrainCircuit, Briefcase, CalendarClock, Camera, Car, Castle, CheckCheck, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock, Clover, Coins, CreditCard, DollarSign, DoorOpen, Droplet, Droplets, Edit, Euro, Eye, Flag, FlaskConical, Footprints, Frown, Gamepad2, Gauge, Ghost, Gift, Globe, Goal, Grid, Hammer, Handshake, Headphones, Heart, HelpCircle, Hexagon, Home, ImageOff, Info, Key, Landmark, Leaf, List, ListChecks, LocateFixed, Lock, LogOut, Mail, Map, MapIcon, MapPin, Menu, MessageCircle, MessageSquare, Monitor, Moon, MoreHorizontal, Navigation, Package, PackageOpen, PartyPopper, PenTool, Pickaxe, Play, Route, Server, Settings, Share, Shield, ShieldCheck, Shirt, ShoppingBag, ShoppingBasket, ShoppingCart, Skull, Smartphone, Smile, SmilePlus, Space, Sparkle, Sparkles, Sprout, Star, Store, Sun, SunDim, Sword, Swords, Target, ThumbsUp, TowerControl, Trash2, Trophy, User, UserCheck, UserCircle, Users, Wallet, Watch, Waves, Wind, Wrench, X, XCircle, BookMarked, Barcode, Loader, Check, Plus, Truck, RotateCcw, Minus, CircleCheck, Timer, Baby, Recycle, HeartHandshake, Ruler, AlertCircle, BadgeCheck, MoreVertical, StarHalf, AlertTriangle, File, ThumbsDown, BarChart, Flame, Banknote, CircleHelp, CircleX, Hand, SearchX,
        Slash, Hourglass
      }),
    },
  ],
};
