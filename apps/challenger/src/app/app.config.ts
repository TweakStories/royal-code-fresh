/**
 * @file app.config.ts (Challenger App)
 * @Version 1.2.1 // Versie update voor runtime checks en structuur
 * @Author User & Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28
 * @Description Configuratiebestand voor de Challenger Angular applicatie.
 */

// --- Angular Core & Platform ---
import { ApplicationConfig, provideZoneChangeDetection, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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

// --- Internationalization (i18n) ---
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateBrowserLoader } from './translate-browser.loader';

// --- Core Services & Configuration ---
import { APP_CONFIG } from '@royal-code/core/config';
import { LOGGER_CONFIG, LogLevel } from '@royal-code/core/core-logging';

// --- Application Specific ---
import { environment } from '../../environments/environment';
import { appRoutes } from './app.routes'; // Zorg dat dit pad correct is voor Challenger
import { AuthInterceptor } from '@royal-code/auth/data-access';

// --- Mocking (Development Only) ---
// import { InMemoryDataService } from '@royal-code/mocks';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

// --- UI & Icons (Lucide) ---
import { // Hergebruik of pas de iconenlijst aan voor Challenger
  LUCIDE_ICONS,
  LucideIconProvider,
  Activity,
  Angry,
  ArrowLeft,
  ArrowRight,
  Award,
  Book,
  Bookmark,
  BookmarkCheck,
  BowArrow,
  BrainCircuit,
  Briefcase,
  CalendarClock,
  Camera,
  Car,
  Castle,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Clover,
  Coins,
  CreditCard,
  DollarSign,
  DoorOpen,
  Droplet,
  Droplets,
  Edit,
  Euro,
  Eye,
  Flag,
  FlaskConical,
  Footprints,
  Frown,
  Gamepad2,
  Gauge,
  Ghost,
  Gift,
  Globe,
  Goal,
  Grid,
  Hammer,
  Handshake,
  Headphones,
  Heart,
  HelpCircle,
  Hexagon,
  Home,
  ImageOff,
  Info,
  Key,
  Landmark,
  Leaf,
  List,
  ListChecks,
  LocateFixed,
  Lock,
  LogOut,
  Mail,
  Map,
  MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Monitor,
  Moon,
  MoreHorizontal,
  Navigation,
  Package,
  PackageOpen,
  PartyPopper,
  PenTool,
  Pickaxe,
  Play,
  Route,
  Server,
  Settings,
  Share,
  Shield,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Skull,
  Smartphone,
  Smile,
  SmilePlus,
  Space,
  Sparkle,
  Sparkles,
  Sprout,
  Star,
  Store,
  Sun,
  SunDim,
  Sword,
  Swords,
  Target,
  ThumbsUp,
  TowerControl,
  Trash2,
  Trophy,
  User,
  UserCheck,
  UserCircle,
  Users,
  Wallet,
  Watch,
  Waves,
  Wind,
  Wrench,
  X,
  XCircle,
  BookMarked,
  Barcode,
  Loader
} from 'lucide-angular';

/**
 * @function localStorageSyncReducerChallenger
 * @description Meta-reducer voor NgRx voor de Challenger app.
 */
export function localStorageSyncReducerChallenger(reducer: any): any {
  return localStorageSync({
    keys: [ { theme: {} }, { user: {} } ],
    rehydrate: true,
    storageKeySerializer: (key) => `challengerApp_${key}`, // App-specifieke prefix
  })(reducer);
}

const metaReducersChallenger: MetaReducer<RootState>[] = [localStorageSyncReducerChallenger];

const CHALLENGER_APP_THEME_DEFAULTS: AppThemeDefaults = {
  defaultThemeName: 'balancedGold',
  defaultDarkMode: true,
};

/**
 * @function HttpLoaderFactoryChallenger
 * @description Factory functie voor `TranslateBrowserLoader` voor de Challenger app.
 */
export function HttpLoaderFactoryChallenger(http: HttpClient): TranslateBrowserLoader {
  return new TranslateBrowserLoader(
    './assets/i18n/shared/', // Shared prefix
    './assets/i18n/challenger/', // App-specifiek prefix
    '.json'
  );
}


/**
 * @const appConfigChallenger (of pas de naam aan als het `appConfig` moet zijn)
 * @description De hoofdconfiguratie voor de Challenger Angular applicatie.
 */
export const appConfig: ApplicationConfig = { // Hernoemd voor duidelijkheid, of houd 'appConfig'
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(),
    provideAnimations(),
    provideRouter(
      appRoutes, // Gebruik Challenger specifieke appRoutes
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    provideStore(rootReducers, {
      metaReducers: metaReducersChallenger, // Gebruik Challenger specifieke metaReducers
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
        strictStateSerializability: false, // Overweeg 'false' indien nodig voor localStorageSync
        strictActionSerializability: false, // Overweeg 'false' indien nodig
        strictActionWithinNgZone: false,   // Nu zou dit moeten werken
        strictActionTypeUniqueness: false,
      },
    }),
    provideEffects([]),
    provideRouterStore(),
    provideAuthFeature(),
    provideUserFeature(),
    provideErrorFeature(),
    provideThemeFeature(),
    provideNavigationFeature(),
    provideCharacterProgressionFeature(),

    isDevMode() ? provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      name: 'Challenger App DevTools' // Specifieke naam
    }) : [],

    // importProvidersFrom(
    //   HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
    //     dataEncapsulation: false,
    //     delay: 100,
    //     passThruUnknownUrl: true,
    //     apiBase: 'api/',
    //   })
    // ),

    provideTranslateService({ 
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactoryChallenger,
        deps: [HttpClient] 
      }
    }),

    { provide: APP_CONFIG, useValue: environment },
    { provide: LOGGER_CONFIG, useValue: {
        level: isDevMode() ? LogLevel.DEBUG : LogLevel.WARN,
        enableExternalLogging: !isDevMode(),
        appName: 'ChallengerApp', // Specifieke appName
      },
    },
    { provide: APP_THEME_DEFAULTS, useValue: CHALLENGER_APP_THEME_DEFAULTS },

    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ // Hergebruik of pas iconenlijst aan
  Activity,
  Angry,
  ArrowLeft,
  ArrowRight,
  Award,
  Book,
  Bookmark,
  BookmarkCheck,
  BowArrow,
  BrainCircuit,
  Briefcase,
  CalendarClock,
  Camera,
  Car,
  Castle,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Clover,
  Coins,
  CreditCard,
  DollarSign,
  DoorOpen,
  Droplet,
  Droplets,
  Edit,
  Euro,
  Eye,
  Flag,
  FlaskConical,
  Footprints,
  Frown,
  Gamepad2,
  Gauge,
  Ghost,
  Gift,
  Globe,
  Goal,
  Grid,
  Hammer,
  Handshake,
  Headphones,
  Heart,
  HelpCircle,
  Hexagon,
  Home,
  ImageOff,
  Info,
  Key,
  Landmark,
  Leaf,
  List,
  ListChecks,
  LocateFixed,
  Lock,
  LogOut,
  Mail,
  Map,
  MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Monitor,
  Moon,
  MoreHorizontal,
  Navigation,
  Package,
  PackageOpen,
  PartyPopper,
  PenTool,
  Pickaxe,
  Play,
  Route,
  Server,
  Settings,
  Share,
  Shield,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Skull,
  Smartphone,
  Smile,
  SmilePlus,
  Space,
  Sparkle,
  Sparkles,
  Sprout,
  Star,
  Store,
  Sun,
  SunDim,
  Sword,
  Swords,
  Target,
  ThumbsUp,
  TowerControl,
  Trash2,
  Trophy,
  User,
  UserCheck,
  UserCircle,
  Users,
  Wallet,
  Watch,
  Waves,
  Wind,
  Wrench,
  X,
  XCircle, BookMarked, Barcode, Loader
      }),
    },
  ],
};
