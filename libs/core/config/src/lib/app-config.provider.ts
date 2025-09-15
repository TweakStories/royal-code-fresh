/**
 * @file app-config.provider.ts
 * @Version 1.3.0 (Volledig Gecorrigeerd & Stabiel)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-20
 * @Description Robuuste, DRY factory functie voor applicatieconfiguratie. Lost alle build-errors op.
 */
import { APP_INITIALIZER, ApplicationConfig, EnvironmentProviders, Provider, isDevMode, makeEnvironmentProviders, provideZoneChangeDetection } from '@angular/core';
import { Routes, provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';

// NgRx Core & Features
import { MetaReducer, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';
import { rootReducers, RootState } from '@royal-code/store';
import { AppThemeDefaults, APP_THEME_DEFAULTS } from '@royal-code/store/theme';

// Interceptors & Services
import { authInterceptorFn } from '@royal-code/auth/data-access';
import { globalErrorInterceptor } from '@royal-code/core/error-handling';
import { etagInterceptor } from '@royal-code/core/http';
import { StorageService } from '@royal-code/core/storage';

// I18n
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { i18nInitResolver } from '@royal-code/shared/utils';

// Algemene Config
import { APP_CONFIG } from './app-config.token';
import { LOGGER_CONFIG, LogLevel } from '@royal-code/core/core-logging';

// Lucide Icons
import { LUCIDE_ICONS, LucideIconProvider, Activity, Angry, ArrowLeft, ArrowRight, Award, Book, Bookmark, BookmarkCheck, BowArrow, BrainCircuit, Briefcase, CalendarClock, Camera, Car, Castle, CheckCheck, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock, Clover, Coins, CreditCard, DollarSign, DoorOpen, Droplet, Droplets, Edit, Euro, Eye, Flag, FlaskConical, Footprints, Frown, Gamepad2, Gauge, Ghost, Gift, Globe, Goal, Grid, Hammer, Handshake, Headphones, Heart, HelpCircle, Hexagon, Home, ImageOff, Info, Key, Landmark, Leaf, List, ListChecks, LocateFixed, Lock, LogOut, Mail, Map, MapIcon, MapPin, Menu, MessageCircle, MessageSquare, Monitor, Moon, MoreHorizontal, Navigation, Package, PackageOpen, PartyPopper, PenTool, Pickaxe, Play, Route, Server, Settings, Share, Shield, ShieldCheck, Shirt, ShoppingBag, ShoppingBasket, ShoppingCart, Skull, Smartphone, Smile, SmilePlus, Space, Sparkle, Sparkles, Sprout, Star, Store, Sun, SunDim, Sword, Swords, Target, ThumbsUp, TowerControl, Trash2, Trophy, User, UserCheck, UserCircle, Users, Wallet, Watch, Waves, Wind, Wrench, X, XCircle, BookMarked, Barcode, Loader, Check, Plus, Truck, RotateCcw, Minus, CircleCheck, Timer, Baby, Recycle, HeartHandshake, Ruler, AlertCircle, BadgeCheck, MoreVertical, StarHalf, AlertTriangle, File, ThumbsDown, BarChart, Flame, Banknote, CircleHelp, CircleX, Hand, SearchX, Slash, Hourglass } from 'lucide-angular';

import { localStorageSync } from 'ngrx-store-localstorage';

export function createLocalStorageSyncReducer(keys: any[]): MetaReducer<RootState> {
  return localStorageSync({ keys, rehydrate: true, storageKeySerializer: (key) => `RoyalCodeApp_${key}` });
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader();
}

export function createBaseAppConfig(
  appName: string,
  environment: any,
  routes: Routes,
  themeDefaults: AppThemeDefaults,
  localStorageKeys: any[] = [],
  // GECORRIGEERDE PARAMETER TYPE: accepteert een array van 'losse' providers of 'environment providers'
  // Maar we zullen ze binnen de functie correct combineren.
  appSpecificProviders: (Provider | EnvironmentProviders)[] = [] // Dit type blijft, want de `bootstrapApplication` accepteert dit.
): ApplicationConfig {

  const metaReducers: MetaReducer<any>[] = localStorageKeys.length > 0 ? [createLocalStorageSyncReducer(localStorageKeys)] : [];
  const allLucideIcons = { Activity, Angry, ArrowLeft, ArrowRight, Award, Book, Bookmark, BookmarkCheck, BowArrow, BrainCircuit, Briefcase, CalendarClock, Camera, Car, Castle, CheckCheck, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock, Clover, Coins, CreditCard, DollarSign, DoorOpen, Droplet, Droplets, Edit, Euro, Eye, Flag, FlaskConical, Footprints, Frown, Gamepad2, Gauge, Ghost, Gift, Globe, Goal, Grid, Hammer, Handshake, Headphones, Heart, HelpCircle, Hexagon, Home, ImageOff, Info, Key, Landmark, Leaf, List, ListChecks, LocateFixed, Lock, LogOut, Mail, Map, MapIcon, MapPin, Menu, MessageCircle, MessageSquare, Monitor, Moon, MoreHorizontal, Navigation, Package, PackageOpen, PartyPopper, PenTool, Pickaxe, Play, Route, Server, Settings, Share, Shield, ShieldCheck, Shirt, ShoppingBag, ShoppingBasket, ShoppingCart, Skull, Smartphone, Smile, SmilePlus, Space, Sparkle, Sparkles, Sprout, Star, Store, Sun, SunDim, Sword, Swords, Target, ThumbsUp, TowerControl, Trash2, Trophy, User, UserCheck, UserCircle, Users, Wallet, Watch, Waves, Wind, Wrench, X, XCircle, BookMarked, Barcode, Loader, Check, Plus, Truck, RotateCcw, Minus, CircleCheck, Timer, Baby, Recycle, HeartHandshake, Ruler, AlertCircle, BadgeCheck, MoreVertical, StarHalf, AlertTriangle, File, ThumbsDown, BarChart, Flame, Banknote, CircleHelp, CircleX, Hand, SearchX, Slash, Hourglass };

  return {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideClientHydration(),
      provideAnimations(),
      provideRouter(
        routes,
        withComponentInputBinding(),
        withViewTransitions(),
        withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
      ),
      provideHttpClient(withInterceptors([authInterceptorFn, etagInterceptor, globalErrorInterceptor])),
      StorageService,

      provideStore(rootReducers, { metaReducers,
        runtimeChecks: {
          strictStateImmutability: false, strictActionImmutability: false,
          strictStateSerializability: false, strictActionSerializability: false,
          strictActionWithinNgZone: false, strictActionTypeUniqueness: false,
        },
      }),
      provideEffects([]),
      provideRouterStore(),


      isDevMode() ? provideStoreDevtools({ maxAge: 25, logOnly: environment.production }) : [],

      provideTranslateService(),
      { provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient] },

      { provide: APP_CONFIG, useValue: environment },
      { provide: LOGGER_CONFIG, useValue: { level: isDevMode() ? LogLevel.DEBUG : LogLevel.WARN, appName } },
      { provide: APP_THEME_DEFAULTS, useValue: themeDefaults },

      { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(allLucideIcons) },

      // GECORRIGEERD: Voeg appSpecificProviders toe binnen een makeEnvironmentProviders call
      // Dit 'verpakt' alle specifieke providers in een correct EnvironmentProviders object
      // en zorgt ervoor dat de compiler dit correct typeert.
      makeEnvironmentProviders(appSpecificProviders),
    ],
  };
}
