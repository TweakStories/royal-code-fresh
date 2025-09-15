/**
 * @file app.config.ts (CV App) - DEFINITIVE STABLE VERSION with Fixed Provider Error
 * @Version 3.4.0 (Fixed NG0201 Provider Error)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-01
 * @Description
 *   Fixed NG0201 runtime error by providing a concrete implementation for
 *   AbstractAccountApiService and initializing the Account feature store.
 *   This is crucial for UserEffects which depends on account services.
 */
import { ApplicationConfig, provideZoneChangeDetection, isDevMode, inject, APP_INITIALIZER, provideAppInitializer, PLATFORM_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, provideHttpClient, HttpInterceptorFn, HttpRequest, withInterceptors } from '@angular/common/http';
import { Action, ActionReducer, MetaReducer, provideStore, ActionReducerMap } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer, RouterReducerState } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { localStorageSync } from 'ngrx-store-localstorage';
import { RouterStateUrl } from '@royal-code/core/routing';

// --- Relevant Core Features & Services ---
import { provideAuthFeature } from '@royal-code/store/auth';
import { provideUserFeature } from '@royal-code/store/user';
import { provideErrorFeature } from '@royal-code/store/error';
import { provideThemeFeature, APP_THEME_DEFAULTS, AppThemeDefaults } from '@royal-code/store/theme';
import { provideNavigationFeature } from '@royal-code/core/navigations/state';
import { provideCharacterProgressionFeature } from '@royal-code/features/character-progression';
import { AbstractSocialApiService, provideFeedFeature } from '@royal-code/features/social/core';
import { SocialApiService } from '@royal-code/features/social/data-access';
import { AbstractAccountApiService, provideAccountFeature } from '@royal-code/features/account/core';
import { DroneshopAccountApiService } from '@royal-code/features/account/data-access-droneshop';
import { APP_NAVIGATION_ITEMS } from '@royal-code/core';


// --- Interaction Features ---
import { provideChatFeature, AbstractChatApiService } from '@royal-code/features/chat/core';
import { PlushieChatApiService } from '@royal-code/features/chat/data-access-plushie';
import { provideReviewsFeature, AbstractReviewsApiService } from '@royal-code/features/reviews/core';
import { PlushieReviewsApiService } from '@royal-code/features/reviews/data-access-plushie';
import { provideMediaFeature, AbstractMediaApiService } from '@royal-code/features/media/core';
import { PlushieMediaApiService } from '@royal-code/features/media/data-access-plushie';

// --- i18n ---
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

// --- Core Utilities ---
import { APP_CONFIG } from '@royal-code/core/config';
import { LOGGER_CONFIG, LogLevel } from '@royal-code/core/core-logging';
import { environment } from '../../environments/environment';
import { appRoutes } from './app.routes';
import { globalErrorInterceptor } from '@royal-code/core/error-handling';
import { etagInterceptor } from '@royal-code/core/http';
import { AuthInterceptor } from '@royal-code/auth/data-access';
import { StorageService } from '@royal-code/core/storage';

// --- Lucide Icons ---
import {
  LUCIDE_ICONS, LucideIconProvider,
  Mail, Linkedin, Github, Download, Sparkles, Bot, ArrowRight, SunDim, Droplets, Sprout,
  AlertCircle, Info, X, Check, Search, Upload, Send, MessageSquare, UserCircle, Home, Briefcase, Package, Gauge, Gamepad2, Award, BrainCircuit, Book, ChevronLeft, ChevronRight, CircleDot, Clock, Trophy, FileText, Settings, MapPin, Phone, Code, Server, Database, Cloud, Palette, Wrench, ShieldCheck, Target, Goal, Activity, Angry, Bookmark, BookmarkCheck, BowArrow, CalendarClock, Camera, Car, Castle, CheckCheck, CheckCircle, Clover, Coins, CreditCard, DollarSign, DoorOpen, Droplet, Edit, Euro, Eye, Flag, FlaskConical, Footprints, Frown, Ghost, Gift, Globe, Grid, Hammer, Handshake, Headphones, Heart, HelpCircle, Hexagon, ImageOff, Key, Landmark, Leaf, List, ListChecks, LocateFixed, Lock, LogOut, Monitor, Moon, MoreHorizontal, Navigation, PackageOpen, PartyPopper, PenTool, Pickaxe, Play, Route, Slash, Smartphone, Smile, SmilePlus, Space, Star, Store, ThumbsUp, TowerControl, Trash2, Truck, Waves, Wind, Watch, Swords, Sword, Skull, Shirt, ShoppingBag, ShoppingBasket, ShoppingCart, RotateCcw, Minus, CircleCheck, Timer, Baby, Recycle, HeartHandshake, Ruler, BadgeCheck, MoreVertical, StarHalf, AlertTriangle, File, ThumbsDown, BarChart, Flame, Banknote, CircleHelp, CircleX, Hand, SearchX, Hourglass,
  FileCode, Share, Layers, Box, GitPullRequest, MousePointer, Cone, MessageCircle, Terminal, Link, Bug, LayoutList, RefreshCcw, Paintbrush, Microscope, LayoutDashboard, Zap, GraduationCap, Lightbulb, ExternalLink, Users, User, Gem, Folder, FolderOpen, ChevronDown, XCircle, UserCheck, Flashlight, Building, Menu, ArrowLeft, Square,
  LogIn,
  UserPlus,
  Sun
} from 'lucide-angular';
import { CV_APP_NAVIGATION } from './config/cv-navigation';

// ========================================
// FACTORY FUNCTIONS
// ========================================

function initializeHighlightJsFactory() {
  return () => {
    return import('highlight.js').then((module) => {
      const hljs = module.default;
      console.log('Highlight.js initialized and languages registered.');
      return Promise.resolve();
    }).catch(error => {
      console.error('Failed to load highlight.js:', error);
      return Promise.reject(error);
    });
  };
}

// ========================================
// STATE DEFINITIONS
// ========================================

export interface CVRootState {
  router: RouterReducerState<RouterStateUrl>;
}

const cvRootReducers: ActionReducerMap<CVRootState> = {
  router: routerReducer,
};

// ========================================
// META REDUCERS
// ========================================

export function localStorageSyncFactory(platformId: object): MetaReducer<any> {
  return function cvLocalStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    if (isPlatformBrowser(platformId)) {
      return localStorageSync({
        keys: ['theme', 'user'],
        rehydrate: true,
        storageKeySerializer: (key) => `cvApp_${key}`,
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
  const authInterceptor = inject(AuthInterceptor, { optional: true });
  if (authInterceptor) {
    return authInterceptor.intercept(req, handlerAdapter);
  }
  return next(req);
};

// ========================================
// INITIALIZERS
// ========================================

export function initializeI18nFactory(translateService: TranslateService, storageService: StorageService): () => Promise<void> {
  return () => {
    const storageKey = 'cvApp_language';
    const defaultLang = 'nl';
    const supportedLangs = ['nl', 'en'];
    const storedLang = storageService.getItem<string>(storageKey);
    const browserLang = translateService.getBrowserLang();
    let langToUse: string;

    if (storedLang && supportedLangs.includes(storedLang)) {
      langToUse = storedLang;
    } else if (browserLang && supportedLangs.includes(browserLang)) {
      langToUse = browserLang;
    } else {
      langToUse = defaultLang;
    }

    translateService.setDefaultLang(defaultLang);
    return translateService.use(langToUse).toPromise().then(() => {
        console.log(`[APP_INITIALIZER] i18n initialized to: ${langToUse} (Source: ${storedLang ? 'Storage' : browserLang ? 'Browser' : 'Default'})`);
    });
  };
}

// ========================================
// CONFIGURATION CONSTANTS
// ========================================

const CV_APP_THEME_DEFAULTS: AppThemeDefaults = {
  defaultThemeName: 'verdantGrowth',
  defaultDarkMode: true,
};

const allLucideIcons = {
  Mail, Linkedin, Github, Download, Sparkles, Bot,
  SunDim, Droplets, Sprout, Gem, Folder, Square, FolderOpen, Building, Menu, ArrowLeft, ArrowRight, LogIn, UserPlus, Sun,
  AlertCircle, Info, X, Check, Search, Share, ChevronDown, Flashlight, XCircle, UserCheck, FileCode, Bug, LayoutList, RefreshCcw, LayoutDashboard, Zap, GraduationCap, Lightbulb, ExternalLink, Users, User, Paintbrush, Microscope, Layers, MessageCircle, Terminal, Link, Box, GitPullRequest, MousePointer, Cone, Upload, Send, MessageSquare, UserCircle, Home, Briefcase, Package, Gauge, Gamepad2, Award, BrainCircuit, Book, ChevronLeft, ChevronRight, CircleDot, Clock, Trophy, FileText, Settings, MapPin, Phone, Code, Server, Database, Cloud, Palette, Wrench, ShieldCheck, Target, Goal, Activity, Angry, Bookmark, BookmarkCheck, BowArrow, CalendarClock, Camera, Car, Castle, CheckCheck, CheckCircle, Clover, Coins, CreditCard, DollarSign, DoorOpen, Droplet, Edit, Euro, Eye, Flag, FlaskConical, Footprints, Frown, Ghost, Gift, Globe, Grid, Hammer, Handshake, Headphones, Heart, HelpCircle, Hexagon, ImageOff, Key, Landmark, Leaf, List, ListChecks, LocateFixed, Lock, LogOut, Monitor, Moon, MoreHorizontal, Navigation, PackageOpen, PartyPopper, PenTool, Pickaxe, Play, Route, Slash, Smartphone, Smile, SmilePlus, Space, Star, Store, ThumbsUp, TowerControl, Trash2, Truck, Waves, Wind, Watch, Swords, Sword, Skull, Shirt, ShoppingBag, ShoppingBasket, ShoppingCart, RotateCcw, Minus, CircleCheck, Timer, Baby, Recycle, HeartHandshake, Ruler, BadgeCheck, MoreVertical, StarHalf, AlertTriangle, File, ThumbsDown, BarChart, Flame, Banknote, CircleHelp, CircleX, Hand, SearchX, Hourglass
};

// ========================================
// APPLICATION CONFIGURATION
// ========================================

export const appConfig: ApplicationConfig = {
  providers: [
    // ===== ANGULAR CORE =====
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideClientHydration(),
    
    // ===== ROUTING =====
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    
    // ===== HTTP =====
    provideHttpClient(withInterceptors([authInterceptorFn, etagInterceptor, globalErrorInterceptor])),
    AuthInterceptor,
    StorageService,

    // ===== NGRX STORE SETUP =====
    provideStore(cvRootReducers, { 
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
        strictActionWithinNgZone: true,
        strictActionTypeUniqueness: true,
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
    isDevMode() ? provideStoreDevtools({ name: 'CV App' }) : [],

    // ===== EAGER-LOADED FEATURES =====
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
    // ================= FIX START =================
    // Initialiseer de account feature store
    provideAccountFeature(),
    // ================= FIX END ===================

    // ===== APP INITIALIZERS =====
    {
      provide: APP_INITIALIZER,
      useFactory: initializeI18nFactory,
      multi: true,
      deps: [TranslateService, StorageService],
    },
    provideAppInitializer(initializeHighlightJsFactory()),

    // ===== CONCRETE API SERVICE IMPLEMENTATIONS =====
    // ================= FIX START =================
    // Voeg de concrete provider toe voor de abstracte service
    // LET OP: Dit gebruikt nu de Droneshop service. Als er een specifieke service voor CV is,
    // moet deze hier worden ingewisseld.
    { provide: AbstractAccountApiService, useClass: DroneshopAccountApiService },
    // ================= FIX END ===================
    { provide: AbstractChatApiService, useClass: PlushieChatApiService },
    { provide: AbstractReviewsApiService, useClass: PlushieReviewsApiService },
    { provide: AbstractMediaApiService, useClass: PlushieMediaApiService },
    { provide: AbstractSocialApiService, useClass: SocialApiService },

    {
      provide: APP_NAVIGATION_ITEMS,
      useValue: CV_APP_NAVIGATION
    },
    // ===== I18N & GLOBAL CONFIGURATION =====
    provideTranslateService({
      defaultLanguage: 'nl',
      fallbackLang: 'en', 
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      })
    }),
    { provide: APP_CONFIG, useValue: environment },
    {
      provide: LOGGER_CONFIG,
      useValue: { level: isDevMode() ? LogLevel.DEBUG : LogLevel.INFO, appName: 'CVApp' },
    },
    { provide: APP_THEME_DEFAULTS, useValue: CV_APP_THEME_DEFAULTS },

    // ===== ICONS =====
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider(allLucideIcons),
    },
  ],
};