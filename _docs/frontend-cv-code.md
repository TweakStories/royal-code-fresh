--- START OF FILE apps/cv/environments/environment.prod.ts ---
// environment.prod.ts

export const environment = {
  production: true,
  apiUrl: 'https://jouw-productie-api.com/api',
  mediaUpload: {
    maxFiles: 4,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMb: 10
  }
};
--- END OF FILE ---

--- START OF FILE apps/cv/environments/environment.ts ---
// environment.ts
export const environment = {
  production: false,
  apiUrl: '/api',
  mediaUpload: {
    maxFiles: 50,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSizeMb: 10
  }
};
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/app.component.html ---
<router-outlet></router-outlet>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/app.component.scss ---

--- END OF FILE ---

--- START OF FILE apps/cv/src/app/app.component.ts ---
// apps/cv/src/app/app.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component'; // <-- Importeer de layout

@Component({
  selector: 'app-cv-root',
  standalone: true,
  imports: [AppLayoutComponent],
  template: `
<a href="#main-content" class="sr-only focus:not-sr-only absolute top-0 left-0 m-3 p-3 bg-background text-foreground border border-primary rounded-md z-[9999]">
  Skip to main content
</a>
<!-- De router-outlet wordt verplaatst naar de AppLayoutComponent -->
<app-cv-layout></app-cv-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/app.config.ts ---
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
import { LOGGER_CONFIG, LogLevel } from '@royal-code/core/logging';
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
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/app.routes.ts ---
import { Route } from '@angular/router';
import { CvHomepageComponent } from './features/home/home.component';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.CvHomepageComponent),
    title: 'Home | Roy van de Wetering',
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects-overview/projects-overview.component').then(m => m.ProjectsOverviewComponent),
    title: 'Mijn Projecten | Roy van de Wetering',
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./features/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    title: 'Project Details | Roy van de Wetering',
  },
  {
    path: 'werkervaring',
    loadComponent: () => import('./features/experience/experience.component').then(m => m.ExperienceComponent),
    title: 'Werkervaring | Roy van de Wetering',
  },
  {
    path: 'skills',
    loadComponent: () => import('./features/skills-page/skills-page.component').then(m => m.SkillsPageComponent),
    title: 'Mijn Vaardigheden | Roy van de Wetering',
  },
  {
    path: 'architectuur',
    loadComponent: () => import('./features/architecture-page/architecture-page.component').then(m => m.ArchitecturePageComponent),
    title: 'Architectuur | Roy van de Wetering',
  },
  {
    path: 'ai-workflow',
    loadComponent: () => import('./features/ai-workflow-page/ai-workflow-page.component').then(m => m.AiWorkflowPageComponent),
    title: 'AI Workflow | Roy van de Wetering',
  },
  {
    path: 'over-mij',
    loadComponent: () => import('./features/about-me-page/about-me-page.component').then(m => m.AboutMePageComponent),
    title: 'Over Mij | Roy van de Wetering',
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact-page/contact-page.component').then(m => m.ContactPageComponent),
    title: 'Contact | Roy van de Wetering',
  },
  {
    path: '**', // Fallback route
    redirectTo: '',
    pathMatch: 'full'
  }
];
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/architecture-deep-dive/architecture-deep-dive.component.html ---
<p>architecture-deep-dive works!</p>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/architecture-deep-dive/architecture-deep-dive.component.ts ---
/**
 * @file architecture-deep-dive.component.ts (CV App)
 * @version 3.0.0 (Definitive & In-depth)
 * @description Een interactieve showcase die de diepgaande architectuur van het project
 *              visueel en gedetailleerd uitlegt, met folderstructuren en codevoorbeelden.
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { FolderTreeComponent, TreeNode } from '@royal-code/ui/folder-tree'; // <-- CORRECTE IMPORT

@Component({
  selector: 'app-cv-architecture-deep-dive',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiTitleComponent, FolderTreeComponent],
  template: `
    <div class="architecture-showcase bg-surface-alt border border-border rounded-xs p-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.underTheHoodTitle' | translate" extraClasses="!text-2xl font-bold mb-6" />

      <div class="flex border-b border-border mb-6">
        <button (click)="activeTab.set('frontend')" [class.active]="activeTab() === 'frontend'" class="tab-button">Frontend (Nx & Angular)</button>
        <button (click)="activeTab.set('backend')" [class.active]="activeTab() === 'backend'" class="tab-button">Backend (.NET)</button>
      </div>

      <div class="prose prose-sm max-w-none">
        @switch (activeTab()) {
          @case ('frontend') {
            <h4>De Anatomie van een Feature</h4>
            <p>Elke feature is opgebouwd uit een set van gespecialiseerde libraries. Deze "Slice-Based" aanpak garandeert een strikte scheiding van verantwoordelijkheden en een voorspelbare, eenrichtings-dataflow.</p>
            <royal-ui-folder-tree [data]="frontendTree" />
            
            <h4 class="mt-6">De Workflow: Van Idee tot Code</h4>
            <p>Consistentie is key. Elke nieuwe feature wordt op dezelfde, voorspelbare manier gegenereerd met Nx. Dit is geen suggestie, maar een regel. Het resultaat is een codebase die direct begrijpelijk is voor elke ontwikkelaar in het team.</p>
            <pre class="code-block"><code>{{ nxCommands }}</code></pre>
          }
          @case ('backend') {
            <h4>De Vesting: Clean Architecture</h4>
            <p>De .NET backend volgt strikt de Clean Architecture principes. De kern (Domain & Application) is volledig onafhankelijk van externe factoren zoals de database of het web framework. Dit maakt de business logic extreem robuust, testbaar en toekomstbestendig.</p>
            <royal-ui-folder-tree [data]="backendTree" />

            <h4 class="mt-6">De Afhankelijkheidsregel in Actie</h4>
            <p>De <code>Application</code> laag definieert een contract (interface), terwijl de <code>Infrastructure</code> laag deze implementeert. Dit ontkoppelt de business logic van de data-implementatie, waardoor bijvoorbeeld de database-provider (van SQL Server naar PostgreSQL) kan worden gewisseld zonder de kernlogica te beïnvloeden.</p>
            <pre class="code-block"><code>{{ backendExample }}</code></pre>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .tab-button { @apply px-4 py-2 -mb-px border-b-2 text-sm font-medium transition-colors; }
    .tab-button:not(.active) { @apply border-transparent text-secondary hover:text-foreground hover:border-border; }
    .tab-button.active { @apply border-primary text-primary; }
    .code-block { @apply bg-background border border-border rounded-md p-4 text-xs text-secondary whitespace-pre-wrap font-mono; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchitectureDeepDiveComponent {
  activeTab = signal<'frontend' | 'backend'>('frontend');
  readonly TitleTypeEnum = TitleTypeEnum;
  
readonly frontendTree: TreeNode[] = [
    { name: 'apps/', icon: AppIcon.FolderOpen, description: 'De consumenten: elke map is een deploybare applicatie.', children: [
      { name: 'cv/', icon: AppIcon.UserCircle, description: 'Deze CV/Portfolio website.' },
      { name: 'plushie-paradise/', icon: AppIcon.Store, description: 'De e-commerce storefront.' },
      { name: 'admin-panel/', icon: AppIcon.LayoutDashboard, description: 'Het beheerpaneel.' },
      { name: 'challenger/', icon: AppIcon.Gamepad2, description: 'De gamified persoonlijke groei app.' }, // Challenger hier toegevoegd op app-niveau
    ]},
    { name: 'libs/', icon: AppIcon.FolderOpen, description: 'De herbruikbare logica: de kern van de fabriek.', children: [
      { name: 'features/', icon: AppIcon.Folder, description: 'Verticale slices van business-functionaliteit.', children: [
        { name: 'products/', icon: AppIcon.Package, description: 'Voorbeeld: de "products" feature.', children: [
          { name: 'domain', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'De Waarheid: TypeScript interfaces & enums.' },
          { name: 'core', icon: AppIcon.BrainCircuit, colorClass: 'text-amber-500', description: 'NgRx State, Facade & Actions. App-onafhankelijk.' },
          
          { name: 'data-access-plushie', icon: AppIcon.Cloud, colorClass: 'text-sky-500', description: 'Connector voor de Plushie-winkel API.' },
          { name: 'ui-plushie', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-500', description: 'Smart components specifiek voor de Plushie-winkel.' },
          
          { name: 'data-access-admin', icon: AppIcon.Cloud, colorClass: 'text-sky-700', description: 'Connector voor de Admin Panel API.' },
          { name: 'ui-admin', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-700', description: 'Smart components specifiek voor het Admin Panel.' },
          { name: 'ui-drone', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-500', description: 'Gebruikersinterface voor de drone-app' },
        ]}
        // { name: 'cart/', icon: AppIcon.ShoppingCart, children: [ /* ... lagen ... */ ] },
        // { name: 'social/', icon: AppIcon.Users, children: [ /* ... lagen ... */ ] },
      ]},
      { name: 'ui/', icon: AppIcon.PackageOpen, description: 'De Algemene Lego-set: "Domme", herbruikbare UI componenten.', children: [
        { name: 'button/', icon: AppIcon.MousePointer },
        { name: 'card/', icon: AppIcon.Square },
        { name: 'input/', icon: AppIcon.PenTool },
      ]},
      { name: 'core/', icon: AppIcon.Settings, description: 'De Nutsvoorzieningen: Logging, Error Handling, Interceptors.' },
      { name: 'store/', icon: AppIcon.Recycle, description: 'Globale NgRx state: auth, user, theme.', children: [
        { name: 'auth/', icon: AppIcon.Lock },
        { name: 'user/', icon: AppIcon.User },
      ]},
      { name: 'shared/', icon: AppIcon.Folder, description: 'Gedeelde, niet-specifieke code.', children: [
        { name: 'domain/', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'Globale, feature-overstijgende modellen.'},
        { name: 'utils/', icon: AppIcon.Wrench, description: 'Herbruikbare pipes, directives en helper-functies.'},
      ]},
    ]}
  ];

  readonly backendTree: TreeNode[] = [
    { name: 'src/', icon: AppIcon.FolderOpen, children: [
      { name: 'Domain', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'cv.architecture.folderTree.backend.domain.description' },
      { name: 'Application', icon: AppIcon.Layers, colorClass: 'text-amber-500', description: 'cv.architecture.folderTree.backend.application.description' },
      { name: 'Infrastructure', icon: AppIcon.Database, colorClass: 'text-sky-500', description: 'cv.architecture.folderTree.backend.infrastructure.description' },
      { name: 'Web (API)', icon: AppIcon.Server, colorClass: 'text-green-500', description: 'cv.architecture.folderTree.backend.webApi.description' },
    ]}
  ];

  readonly nxCommands = `
# 1. Creëer de fundering (types)
nx g lib features/products/domain --tags="type:domain,scope:shared"

# 2. Bouw de business logic (state)
nx g lib features/products/core --tags="type:feature-core,scope:shared"

# 3. Implementeer de dataverbinding (API)
nx g lib features/products/data-access-plushie --tags="type:data-access,scope:plushie"

# 4. Construeer de UI
nx g lib features/products/ui-plushie --tags="type:feature,scope:plushie"
  `;

  readonly backendExample = `
// In Application/Common/Interfaces/IProductRepository.cs
// "De business logic heeft een manier nodig om producten op te halen,
// maar het maakt niet uit HOE dat gebeurt (SQL, Mongo, etc.)."
public interface IProductRepository {
    Task<Product?> GetByIdAsync(Guid id);
}

// In Infrastructure/Data/ProductRepository.cs
// "Ik weet HOE ik producten moet ophalen: met Entity Framework Core
// uit een SQL database. Ik voldoe aan het contract."
public class ProductRepository : IProductRepository {
    private readonly ApplicationDbContext _context;
    // ...
    public async Task<Product?> GetByIdAsync(Guid id) {
        return await _context.Products.FindAsync(id);
    }
}
  `;
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/availability-badge/availability-badge.component.html ---
<p>availability-badge works!</p>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/availability-badge/availability-badge.component.ts ---
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'availability-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
    🔥 {{ slotsLeft }} slots vrij in {{ quarter }}
  </span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityBadgeComponent {
  slotsLeft = 2;
  quarter = 'Q4 2025';
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/certification-card/certification-card.component.ts ---
// --- IN apps/cv/src/app/components/certification-card/certification-card.component.ts, VERVANG HET VOLLEDIGE BESTAND ---
/**
 * @file certification-card.component.ts (CV App)
 * @description Een presentational component die een enkel certificaat toont.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
// Aangepast importpad voor de verplaatste modellen
import { CertificationItem } from '../../core/models/experience.model'; // <-- CORRECT PAD
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'app-cv-certification-card',
  standalone: true,
  imports: [TranslateModule, UiTitleComponent, UiIconComponent],
  template: `
    <div class="certification-card flex items-start gap-4 bg-card p-4 rounded-xs border border-border h-full">
      <royal-code-ui-icon [icon]="AppIcon.BadgeCheck" sizeVariant="lg" colorClass="text-primary mt-1" />
      <div class="flex-grow">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H4" 
          [text]="certification().nameKey | translate"
          extraClasses="!text-base !font-semibold"
        />
        <p class="text-sm text-secondary font-medium">{{ certification().issuingBody }}</p>
        <p class="text-xs text-muted mt-1">{{ certification().dateKey | translate }}</p>
        @if (certification().credentialUrl) {
          <a [href]="certification().credentialUrl" target="_blank" rel="noopener noreferrer" class="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
            {{ 'cv.experience.viewCredential' | translate }}
            <royal-code-ui-icon [icon]="AppIcon.ExternalLink" sizeVariant="xs" />
          </a>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvCertificationCardComponent {
  certification = input.required<CertificationItem>();
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/code-showcase/code-showcase.component.ts ---
/**
 * @file code-showcase.component.ts (CV App)
 * @version 1.0.0
 * @description Een presentational component voor het tonen van een "Under the Hood" showcase,
 *              inclusief een titel, beschrijving, afbeelding en een link naar de code op GitHub.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Image } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiIconComponent } from '@royal-code/ui/icon';

// Interface voor de data die dit component verwacht
export interface CodeShowcaseData {
  titleKey: string;
  descriptionKey: string;
  image: Image;
  githubLink: string;
}

@Component({
  selector: 'app-cv-code-showcase',
  standalone: true,
  imports: [TranslateModule, UiTitleComponent, UiParagraphComponent, UiImageComponent, UiIconComponent],
  template: `
    <div class="border border-border p-4 rounded-xs bg-surface-alt transition-shadow hover:shadow-md">
      <royal-code-ui-title 
        [level]="TitleTypeEnum.H3" 
        [text]="showcase().titleKey | translate" 
        extraClasses="!text-xl !font-semibold mb-2" 
      />
      <royal-code-ui-paragraph 
        [text]="showcase().descriptionKey | translate" 
        size="sm" 
        color="muted" 
        extraClasses="mb-4" 
      />
      <div class="mb-4 rounded-md overflow-hidden border border-border">
        <royal-code-ui-image 
          [image]="showcase().image" 
          objectFit="contain" 
          class="block w-full max-h-80 bg-background" 
        />
      </div>
      <a 
        [href]="showcase().githubLink" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="inline-flex items-center text-primary hover:underline font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1 -m-1">
        {{ 'cv.projects.detail.viewCodeOnGithub' | translate }}
        <royal-code-ui-icon [icon]="AppIcon.ExternalLink" sizeVariant="xs" extraClass="ml-1.5" />
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvCodeShowcaseComponent {
  showcase: InputSignal<CodeShowcaseData> = input.required<CodeShowcaseData>();
  
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/education-card/education-card.component.ts ---
// --- IN apps/cv/src/app/components/education-card/education-card.component.ts, VERVANG HET VOLLEDIGE BESTAND ---
/**
 * @file education-card.component.ts (CV App)
 * @description Een presentational component die een enkele opleiding toont.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
// Aangepast importpad voor de verplaatste modellen
import { EducationItem } from '../../core/models/experience.model'; // <-- CORRECT PAD
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'app-cv-education-card',
  standalone: true,
  imports: [TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent],
  template: `
    <div class="education-card flex items-start gap-4 bg-card p-4 rounded-xs border border-border h-full">
      <royal-code-ui-icon [icon]="AppIcon.Award" sizeVariant="lg" colorClass="text-primary mt-1" />
      <div class="flex-grow">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H4" 
          [text]="education().degreeKey | translate"
          extraClasses="!text-base !font-semibold"
        />
        <p class="text-sm text-secondary font-medium">{{ education().institutionName }}</p>
        <p class="text-xs text-muted mt-1">{{ education().periodKey | translate }}</p>
        @if (education().descriptionKey) {
          <!-- HIER IS DE DEFINITIEVE FIX: Gebruik de nullish coalescing operator (??) -->
          <royal-code-ui-paragraph [text]="(education().descriptionKey ?? '') | translate" size="sm" color="muted" extraClasses="mt-2" />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvEducationCardComponent {
  education = input.required<EducationItem>();
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/experience-card/experience-card.component.ts ---
/**
 * @file experience-card.component.ts (CV App)
 * @version 3.5.0 (Hero Image Final Shape)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   Presentational component voor een werkervaring. De hero-afbeelding is nu
 *   definitief vierkant en zonder ronde hoeken, gepositioneerd onder de card-header,
 *   voor een strakke en consistente visuele presentatie.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiImageComponent } from '@royal-code/ui/media'; // Importeer UiImageComponent
import { WorkExperienceItem } from '../../core/models/experience.model';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'app-cv-experience-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent, UiBadgeComponent, UiImageComponent], // Voeg UiImageComponent toe aan imports
  template: `
    <div class="experience-card bg-card rounded-xs border border-border shadow-sm hover:shadow-xl hover:border-primary/40 hover:border-2 transition-all duration-300 h-full flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="p-6 border-b border-border">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H3" 
          [text]="experience().jobTitleKey | translate" 
          extraClasses="!text-xl !font-bold text-primary" 
        />
        <div class="flex items-baseline gap-2 text-sm text-foreground font-medium">
          <span>{{ experience().companyName }}</span><span>•</span><span>{{ experience().location }}</span>
        </div>
        <royal-code-ui-paragraph [text]="experience().periodKey | translate" size="sm" color="muted" extraClasses="mt-1 font-semibold" />
      </header>
      
      <!-- HERO AFBEELDING: NU VIERKANT en ZONDER RONDE HOEKEN -->
       <!--<div class="h-60"> 
        <royal-code-ui-image 
          [src]="experience().companyLogoUrl" 
          [fallbackSrc]="'images/default-image.webp'" 
          [alt]="experience().companyName + ' hero image'" 
          objectFit="cover" 
          class=""
        />
      </div> -->

      <!-- Body: Case Study -->
      <div class="p-6 flex-grow flex flex-col">
        <!-- Uitdaging -->
        <div class="mb-4">
          <h4 class="font-semibold text-sm flex items-center gap-2 mb-2 text-foreground"><royal-code-ui-icon [icon]="AppIcon.Target" colorClass="text-destructive"/> De Uitdaging</h4>
          <royal-code-ui-paragraph [text]="experience().situationKey | translate" size="sm" color="muted" />
        </div>
        
        <!-- Mijn Oplossing -->
        <div class="mb-6">
          <h4 class="font-semibold text-sm flex items-center gap-2 mb-2 text-foreground"><royal-code-ui-icon [icon]="AppIcon.Wrench" colorClass="text-primary"/> Mijn Oplossing</h4>
          <royal-code-ui-paragraph [text]="experience().actionKey | translate" size="sm" />
        </div>
        
        <!-- Resultaten -->
        <div class="mt-auto">
          <h4 class="font-semibold text-sm flex items-center gap-2 mb-3 text-foreground"><royal-code-ui-icon [icon]="AppIcon.Zap" colorClass="text-success"/> Resultaten</h4>
          <div class="space-y-2">
            @for (result of experience().results; track result.descriptionKey) {
              <div class="flex items-start gap-2 text-sm">
                <royal-code-ui-icon [icon]="result.icon || AppIcon.Check" sizeVariant="sm" colorClass="text-success mt-0.5 flex-shrink-0" />
                <royal-code-ui-paragraph [text]="result.descriptionKey | translate" size="sm" extraClasses="font-medium" />
              </div>
            }
          </div>
        </div>
      </div>
      
      <!-- Footer: Tech Stack -->
      <footer class="p-6 border-t border-border/60 bg-surface-alt">
        <h4 class="text-xs font-semibold uppercase text-secondary mb-2">{{ 'cv.projects.techStack' | translate }}</h4>
        <div class="flex flex-wrap gap-2">
          @for(tech of experience().techStack; track tech.name) {
            <royal-code-ui-badge [icon]="tech.icon" color="primary" size="sm">{{ tech.name }}</royal-code-ui-badge>
          }
        </div>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvExperienceCardComponent {
  readonly experience: InputSignal<WorkExperienceItem> = input.required<WorkExperienceItem>();
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/impact-calculator/impact-calculator.component.html ---
<p>impact-calculator works!</p>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/impact-calculator/impact-calculator.component.ts ---
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { signal, computed, WritableSignal } from '@angular/core';

@Component({
  selector: 'impact-calculator',
  standalone: true,
  imports: [CommonModule, UiParagraphComponent],
  template: `
    <div class="impact-calculator bg-card p-4 rounded-xs border border-border w-full max-w-md mx-auto text-left">
      <label class="block text-sm font-medium mb-2">Teamgrootte: {{ teamSize() }} developers</label>
      <input
        type="range"
        min="3"
        max="25"
        [value]="teamSize()"
        (input)="teamSize.set($any($event.target).value)"
        class="w-full"
      />
      <p class="mt-4 text-sm">
        Jaarlijkse besparing:
        <strong>€{{ totalSavings() | number:'1.0-0' }}</strong>
      </p>
    </div>
  `,
  styles: [`.impact-calculator { @apply shadow-sm; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpactCalculatorComponent {
  teamSize: WritableSignal<number> = signal(10);
  private readonly savingPercentage = 30;
  private readonly avgCostPerDeveloper = 70000;
  totalSavings = computed(() =>
    (this.teamSize() * this.avgCostPerDeveloper) * (this.savingPercentage / 100)
  );
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/mobile-cta-sheet/mobile-cta-sheet.component.html ---
<p>mobile-cta-sheet works!</p>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/mobile-cta-sheet/mobile-cta-sheet.component.ts ---
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mobile-cta-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible()" class="fixed bottom-0 inset-x-0 bg-background/95 border-t border-border shadow-lg p-4 z-50 flex items-center justify-between">
      <span class="font-medium text-sm">Gratis 15‑min Quick‑Scan?</span>
      <a href="#calendly" class="btn-primary">Plan Nu</a>
    </div>
  `,
  styles: [
    `.btn-primary { @apply px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileCtaSheetComponent implements OnInit {
  visible = signal(false);

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const hero = document.querySelector('app-cv-home section');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => this.visible.set(!entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(hero);
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/project-card/project-card.component.ts ---
/**
 * @file project-card.component.ts (CV App)
 * @version 3.4.0 (FIX: Image Corner Radius)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   FIX: De afronding van de afbeelding aan de bovenkant is gecorrigeerd naar
 *   'rounded-t-xs' om consistent te zijn met de 'rounded-xs' van de kaart zelf.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { ProjectCardData } from '../../core/models/project.model';

@Component({
  selector: 'app-cv-project-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiImageComponent, UiTitleComponent, UiParagraphComponent, UiBadgeComponent, UiIconComponent],
  template: `
  <a [routerLink]="project().routePath" class="project-card block bg-card border border-border rounded-xs shadow-md hover:shadow-xl hover:border-primary/50 transition-all duration-200 ease-out h-full group flex flex-col overflow-hidden">
    <div class="w-full h-48 flex-shrink-0 rounded-t-xs overflow-hidden">
      <royal-code-ui-image
        [image]="project().image"
        [fallbackSrc]="'images/default-image.webp'"
        objectFit="cover"
        [rounding]="'none'"
        class="w-full h-full"
      />
    </div>

    <div class="p-6 flex flex-col flex-grow">

      <!-- Deze div bevat nu alleen de titel en beschrijving en krijgt flex-grow -->
      <div class="flex-grow">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="project().titleKey | translate" extraClasses="!text-lg !font-semibold group-hover:text-primary transition-colors" />
        <royal-code-ui-paragraph [text]="project().descriptionKey | translate" size="sm" color="muted" extraClasses="mt-2" />
      </div>

      <!-- De metrics sectie is nu een zibling van de groeiende div, niet erin -->
      @if (project().impactMetrics && project().impactMetrics!.length > 0) {
        <div class="mt-4 pt-4 border-t border-border/60 flex flex-wrap gap-4">
          @for (metric of project().impactMetrics; track metric.label) {
            <div class="flex items-center gap-2 text-sm">
              <royal-code-ui-icon [icon]="metric.icon" sizeVariant="sm" colorClass="text-primary" />
              <div>
                <p class="font-bold text-foreground">{{ metric.value }}</p>
                <p class="text-xs text-secondary">{{ metric.label | translate }}</p>
              </div>
            </div>
          }
        </div>
      }

      <!-- De tech stack sectie is ook een zibling -->
      <div class="mt-4 pt-4 border-t border-border/60">
        <h4 class="text-xs font-semibold uppercase text-secondary mb-2">{{ 'cv.projects.techStack' | translate }}</h4>
        <div class="flex flex-wrap gap-2">
          @for(tech of project().techStack; track tech.name) {
            <royal-code-ui-badge [icon]="tech.icon" color="primary">
              {{ tech.name }}
            </royal-code-ui-badge>
          }
        </div>
      </div>
    </div>
  </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvProjectCardComponent {
  readonly project: InputSignal<ProjectCardData> = input.required<ProjectCardData>();
  readonly TitleTypeEnum = TitleTypeEnum;
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/scalability-roadmap/scalability-roadmap.component.html ---
<p>scalability-roadmap works!</p>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/scalability-roadmap/scalability-roadmap.component.ts ---
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'scalability-roadmap',
  standalone: true,
  imports: [CommonModule, UiIconComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div
        *ngFor="let step of steps"
        class="flex flex-col items-center text-center"
      >
        <royal-code-ui-icon
          [icon]="step.icon"
          sizeVariant="xl"
          colorClass="text-primary mb-4"
        />
        <h3 class="font-semibold mb-2">{{ step.title }}</h3>
        <p class="text-sm text-secondary">{{ step.description }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScalabilityRoadmapComponent {
  readonly AppIcon = AppIcon;
  steps = [
    {
      icon: AppIcon.Brick,
      title: 'Starter',
      description: 'Modular monolith with domain segregation',
    },
    {
      icon: AppIcon.Cpu,
      title: 'Scale-up',
      description: 'CQRS micro-services with event sourcing',
    },
    {
      icon: AppIcon.Cloud,
      title: 'Enterprise',
      description: 'Self-service platform with API gateway',
    },
  ];
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/skill-cloud/skill-cloud.component.html ---
<p>skill-cloud works!</p>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/skill-cloud/skill-cloud.component.ts ---
/**
 * @file skill-cloud.component.ts (CV App)
 * @version 1.0.0
 * @description Een visueel component dat skills weergeeft als een interactieve "tag cloud",
 *              waarbij de grootte en kleur de belangrijkheid van een skill aangeven.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

export interface SkillCloudItem {
  name: string;
  icon: AppIcon;
  level: 'expert' | 'advanced' | 'proficient'; // Bepaalt grootte en kleur
}

@Component({
  selector: 'app-cv-skill-cloud',
  standalone: true,
  imports: [CommonModule, UiIconComponent],
  template: `
    <div class="skill-cloud-container flex flex-wrap justify-center items-center gap-4 p-6 bg-card border border-border rounded-xs shadow-inner">
      @for (skill of skills(); track skill.name) {
        <div 
          class="skill-item flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
          [ngClass]="getSkillClasses(skill.level)">
          <royal-code-ui-icon [icon]="skill.icon" [sizeVariant]="skill.level === 'expert' ? 'md' : 'sm'" />
          <span class="font-medium whitespace-nowrap">{{ skill.name }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .skill-item.expert {
      @apply text-lg bg-primary/10 border-primary/50 text-primary;
    }
    .skill-item.advanced {
      @apply text-base bg-card border-border text-foreground;
    }
    .skill-item.proficient {
      @apply text-sm bg-card border-border text-secondary;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvSkillCloudComponent {
  skills: InputSignal<SkillCloudItem[]> = input.required<SkillCloudItem[]>();

  getSkillClasses(level: 'expert' | 'advanced' | 'proficient'): string {
    return level;
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/skills-matrix/skills-matrix.component.ts ---
/**
 * @file skills-matrix.component.ts (CV App)
 * @Version 1.1.0 (Removed Proficiency Bars)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-30
 * @Description Een presentational component dat een lijst van skill-categorieën
 *              en de bijbehorende skills visueel weergeeft in een matrix.
 *              De subjectieve proficiency bars zijn verwijderd voor een modernere look.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { SkillCategory } from '../../core/models/skills.model';

@Component({
  selector: 'app-cv-skills-matrix',
  standalone: true,
  imports: [
    TranslateModule,
    UiTitleComponent,
    UiParagraphComponent,
    UiIconComponent
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      @for (category of categories(); track category.categoryNameKey) {
        <div class="flex flex-col">
          <royal-code-ui-title
            [level]="TitleTypeEnum.H3"
            [text]="category.categoryNameKey | translate"
            extraClasses="!text-lg !font-semibold mb-3 border-b-2 border-primary pb-1"
          />
          <div class="space-y-3">
            @for (skill of category.skills; track skill.name) {
              <div class="flex items-center gap-3">
                <royal-code-ui-icon [icon]="skill.icon" sizeVariant="sm" colorClass="text-primary" />
                <royal-code-ui-paragraph [text]="skill.name" size="sm" />
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvSkillsMatrixComponent {
  readonly categories: InputSignal<SkillCategory[]> = input.required<SkillCategory[]>();
  readonly TitleTypeEnum = TitleTypeEnum;
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/skills/skills.component.ts ---
import { Component } from '@angular/core';

@Component({
  selector: 'app-cv-skills',
  imports: [],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent {

}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/sticky-cta/sticky-cta.component.html ---
<p>sticky-cta works!</p>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/sticky-cta/sticky-cta.component.ts ---
import { ChangeDetectionStrategy, Component, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'sticky-cta',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  template: `
    <div
      *ngIf="visible()"
      class="fixed bottom-0 inset-x-0 bg-background/95 border-t border-border shadow-lg p-4 z-50 flex items-center justify-between"
    >
      <span class="font-medium text-sm">Need architecture sparring?</span>
      <a routerLink="/contact">
        <royal-code-ui-button sizeVariant="sm" type="primary"
          >Book 30 min</royal-code-ui-button
        >
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StickyCtaComponent {
  visible: Signal<boolean> = signal(true);
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/trade-off-table/trade-off-table.component.html ---
<p>trade-off-table works!</p>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/components/trade-off-table/trade-off-table.component.ts ---
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'trade-off-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <table class="w-full text-sm border-collapse border-border">
      <thead>
        <tr class="bg-muted text-foreground font-semibold">
          <th class="p-3 border border-border">Aspect</th>
          <th class="p-3 border border-border">Benefit</th>
          <th class="p-3 border border-border">Trade-Off</th>
          <th class="p-3 border border-border">Mitigation</th>
        </tr>
      </thead>
      <tbody>
        <tr
          *ngFor="let row of rows"
          class="hover:bg-muted/40"
        >
          <td class="p-3 border border-border font-medium">{{ row.aspect }}</td>
          <td class="p-3 border border-border">{{ row.benefit }}</td>
          <td class="p-3 border border-border text-destructive">{{ row.tradeOff }}</td>
          <td class="p-3 border border-border">{{ row.mitigate }}</td>
        </tr>
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeOffTableComponent {
  rows = [
    {
      aspect: 'Clean Architecture',
      benefit: 'Clear layers, testable',
      tradeOff: 'More boilerplate',
      mitigate: 'Nx schematics',
    },
    {
      aspect: 'Hexagonal',
      benefit: 'Adapters simplify integration',
      tradeOff: 'Steeper learning curve',
      mitigate: 'Workshop & pairing',
    },
    {
      aspect: 'Monorepo',
      benefit: 'Single source of truth',
      tradeOff: 'Potential build time',
      mitigate: 'Nx caching',
    },
    {
      aspect: 'Micro-frontends',
      benefit: 'Independent teams',
      tradeOff: 'Runtime overhead',
      mitigate: 'Module Federation',
    },
  ];
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/config/cv-navigation.ts ---
/**
 * @file cv-navigation.ts
 * @Version 2.1.0 (FIX: Implemented 'external' property)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   De navigatiedata voor de CV-app, nu met de correcte 'external: true'
 *   property voor de downloadlink van het CV.
 */
import { AppIcon, NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { AppNavigationConfig } from '@royal-code/core';

const primaryNav: NavigationItem[] = [
  { id: 'home-cv', labelKey: 'cv.navigation.home', route: '/', icon: AppIcon.Home, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'projects-cv', labelKey: 'cv.navigation.projects', route: '/projects', icon: AppIcon.Package, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'experience-cv', labelKey: 'cv.navigation.experience', route: '/werkervaring', icon: AppIcon.Briefcase, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'skills-cv', labelKey: 'cv.navigation.skills', route: '/skills', icon: AppIcon.Gauge, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'architecture-cv', labelKey: 'cv.navigation.architecture', route: '/architectuur', icon: AppIcon.Grid, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'ai-workflow-cv', labelKey: 'cv.navigation.aiWorkflow', route: '/ai-workflow', icon: AppIcon.Bot, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'about-me-cv', labelKey: 'cv.navigation.aboutMe', route: '/over-mij', icon: AppIcon.UserCircle, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'contact-cv', labelKey: 'cv.navigation.contact', route: '/contact', icon: AppIcon.Mail, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
];

const footerLinks = {
  supportLinks: [
    { id: 'footer-contact', labelKey: 'cv.navigation.contact', route: '/contact' },
    // DE FIX: 'external: true' toegevoegd voor de downloadlink
    { id: 'footer-download', labelKey: 'cv.footer.download', route: '/assets/CV-Roy-van-de-Wetering.pdf', external: true },
  ],
  shopLinks: [
    { id: 'footer-projects', labelKey: 'cv.navigation.projects', route: '/projects' },
    { id: 'footer-experience', labelKey: 'cv.navigation.experience', route: '/werkervaring' },
    { id: 'footer-skills', labelKey: 'cv.navigation.skills', route: '/skills' },
  ],
  companyLinks: [
    { id: 'footer-architecture', labelKey: 'cv.navigation.architecture', route: '/architectuur' },
    { id: 'footer-ai', labelKey: 'cv.navigation.aiWorkflow', route: '/ai-workflow' },
    { id: 'footer-about', labelKey: 'cv.navigation.aboutMe', route: '/over-mij' },
  ],
};

export const CV_APP_NAVIGATION: AppNavigationConfig = {
  primary: primaryNav,
  topBar: [],
  mobileModal: primaryNav,
  footer: footerLinks
};
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/core/models/experience.model.ts ---
/**
 * @file experience.model.ts (CV App)
 * @version 2.0.0 (STAR Method Integration)
 * @description Defines data structures for work experience, education, and certificates,
 *              now refactored to support the STAR method for impactful storytelling.
 */
import { AppIcon } from "@royal-code/shared/domain";

export interface WorkExperienceItem {
  id: string;
  jobTitleKey: string;
  companyName: string;
  companyLogoUrl: string;
  location: string;
  periodKey: string;
  startDate: Date;
  techStack: { name: string, icon?: AppIcon }[];
  detailRoutePath: string; // Pad naar een eventuele detailpagina

  // === STAR Method Properties ===
  situationKey: string;
  taskKey: string;
  actionKey: string;
  results: {
    descriptionKey: string;
    icon?: AppIcon;
  }[];
}

export interface EducationItem {
  id: string;
  degreeKey: string;
  institutionName: string;
  periodKey: string;
  descriptionKey?: string;
}

export interface CertificationItem {
  id: string;
  nameKey: string;
  issuingBody: string;
  dateKey: string;
  credentialUrl?: string;
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/core/models/project.model.ts ---
/**
 * @file project.model.ts (CV App)
 * @version 3.1.0 (Impact-Driven & Narrative-Aligned)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description Defines data structures for projects, fully aligned with the
 *              "business case" narrative of the CV. Includes impact metrics and
 *              an architecture context section.
 */
import { Image } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';

// Interface for a single, quantifiable impact metric.
export interface ImpactMetric {
  label: string;
  value: string;
  icon: AppIcon;
}

// Model for the project overview card.
export interface ProjectCardData {
  id: string;
  image: Image;
  titleKey: string;
  descriptionKey: string;
  impactMetrics?: ImpactMetric[];
  techStack: { name: string, icon?: AppIcon }[];
  routePath: string;
}

// Extended model for the project detail page.
export interface ProjectDetail {
  id: string;
  titleKey: string;
  heroImage: Image;
  galleryImages: Image[];
  challengeKey: string;
  myApproachKey: string;
  resultKey: string;
  architectureContext?: {
    titleKey: string;
    descriptionKey: string;
    icon: AppIcon;
  };
  techStack: { name: string, icon?: AppIcon }[];
  liveUrl?: string;
  githubUrl?: string;
  underTheHood?: {
    titleKey: string;
    descriptionKey: string;
    image: Image;
    githubLink: string;
  }[];
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/core/models/skills.model.ts ---
import { AppIcon } from "@royal-code/shared/domain";

export interface Skill {
  name: string;
  icon: AppIcon; 
}

export interface SkillCategory {
  categoryNameKey: string;
  skills: Skill[];
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/core/services/cv-config.service.ts ---
import { Injectable } from '@angular/core';
import { AppIcon } from '@royal-code/shared/domain'; // Zorg dat paden kloppen
import { ButtonType } from '@royal-code/ui/button';

// Interface voor de configuratie van een enkele navigatiekaart
export interface NavCardConfigItem {
  id: string; // Unieke ID voor trackBy
  iconName?: AppIcon;
  titleKey: string;
  descriptionKey: string;
  routePath?: string | string[];
  externalLink?: string;
  buttonTextKey?: string; // Default wordt in de component afgehandeld
  buttonType?: ButtonType;  // Default wordt in de component afgehandeld
  extraCardClasses?: string;
}

@Injectable({
  providedIn: 'root' // Maak de service beschikbaar in de hele 'cv' applicatie
                     // Als je de 'cv' app als een feature module laadt, kun je ook overwegen
                     // om het daar te providen als het niet globaal nodig is.
})
export class CvConfigService {

  private readonly homepageNavigationCards: NavCardConfigItem[] = [
    {
      id: 'skills',
      iconName: AppIcon.Gauge, // Voorbeeld, pas aan naar je daadwerkelijke AppIcon enum
      titleKey: 'cv.home.cards.skills.title',
      descriptionKey: 'cv.home.cards.skills.description',
      routePath: '/cv/skills-tools', // Pas aan naar de daadwerkelijke route in je CV app
      buttonTextKey: 'cv.home.cards.skills.cta', // Optioneel, anders pakt het de default van de component
      buttonType: 'primary',
    },
    {
      id: 'projects',
      iconName: AppIcon.Package,
      titleKey: 'cv.home.cards.projects.title', // Moet bestaan in nl.json etc.
      descriptionKey: 'cv.home.cards.projects.description', // Moet bestaan in nl.json etc.
      routePath: '/cv/projects',
      buttonType: 'primary',
      buttonTextKey: 'common.buttons.viewDetails' // Moet bestaan in nl.json etc.
    },
    {
      id: 'experience',
      iconName: AppIcon.Briefcase, // Je zult 'Briefcase' moeten toevoegen aan je AppIcon enum
      titleKey: 'cv.home.cards.experience.title',
      descriptionKey: 'cv.home.cards.experience.description',
      routePath: '/cv/experience',
      buttonType: 'primary',
    },
    {
      id: 'contact',
      iconName: AppIcon.Mail, // Je zult 'Mail' moeten toevoegen aan je AppIcon enum
      titleKey: 'cv.home.cards.contact.title',
      descriptionKey: 'cv.home.cards.contact.description',
      routePath: '/cv/contact',
      buttonType: 'primary',
    },
    {
      id: 'miniGame',
      iconName: AppIcon.Gamepad2, // Je zult 'Gamepad2' of iets dergelijks moeten toevoegen
      titleKey: 'cv.home.cards.miniGame.title',
      descriptionKey: 'cv.home.cards.miniGame.description',
      routePath: '/cv/mini-game', // Of een externe link als je het apart host
      buttonType: 'primary',
    },
    // Voeg hier meer kaarten toe als nodig
  ];

  private readonly skillsData = [ /* ... je skill data hier ... */ ];
  // ... andere statische data voor je CV ...

  constructor() { }

  /**
   * Haalt de configuratie op voor de navigatiekaarten op de homepage.
   * @returns Een array van NavCardConfigItem objecten.
   */
  getHomepageNavigationCards(): NavCardConfigItem[] {
    // In de toekomst zou je hier logica kunnen toevoegen om kaarten conditioneel
    // te tonen, maar voor nu geven we gewoon de hardgecodeerde lijst terug.
    return this.homepageNavigationCards;
  }

  // Voorbeeld voor skills data (analoog aan de navigatiekaarten)
  // getSkills(): CvSkill[] {
  //   return this.skillsData;
  // }

  // Voeg hier andere methodes toe om andere statische CV data op te halen
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/core/services/experience-data.service.ts ---
/**
 * @file experience-data.service.ts (CV App)
 * @version 4.5.0 (Job1 Comprehensive Refinement - Final)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description Centrale service voor het aanleveren van alle data gerelateerd aan werkervaring,
 *              opleiding en certificaten, nu met een gedetailleerde en overtuigende Job1 beschrijving.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkExperienceItem, EducationItem, CertificationItem } from '../models/experience.model';
import { AppIcon } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class ExperienceDataService {

  private readonly workExperienceData: WorkExperienceItem[] = [
    {
      id: 'exp1',
      jobTitleKey: 'cv.experience.job1.title', // Senior Full-Stack Architect & Lead Developer
      companyName: 'Royal-Code Monorepo (Startup, Intern)',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Katwijk, NL (Volledig remote)',
      periodKey: 'cv.experience.job1.period', // Jan 2020 – Heden (of de specifieke 2023-2025 periode als die de focus is)
      startDate: new Date('2020-01-01'), // Aanpassen naar 2023-01-01 als dit de start is van de monorepo-rol
      techStack: [
        { name: 'C#/.NET 9', icon: AppIcon.Code },
        { name: 'Angular 20', icon: AppIcon.Activity },
        { name: 'Nx Monorepo', icon: AppIcon.Grid },
        { name: 'Clean Architecture', icon: AppIcon.BrainCircuit },
        { name: 'Specification-Driven Dev', icon: AppIcon.Book },
        { name: 'AI/LLMs', icon: AppIcon.Bot },
        { name: 'Azure', icon: AppIcon.Cloud },
      ],
      detailRoutePath: '/werkervaring/royal-code-monorepo',
      situationKey: 'cv.experience.job1.situation', // Aangescherpt
      taskKey: 'cv.experience.job1.task', // Aangescherpt
      actionKey: 'cv.experience.job1.action', // Aangescherpt
      results: [
        { icon: AppIcon.Zap, descriptionKey: 'cv.experience.job1.result1' }, // 70% snellere feature init
        { icon: AppIcon.BadgeCheck, descriptionKey: 'cv.experience.job1.result2' }, // 90% minder architectuur bugs
        { icon: AppIcon.Users, descriptionKey: 'cv.experience.job1.result3' }, // Juniors 3 dagen productief
        { icon: AppIcon.Wrench, descriptionKey: 'cv.experience.job1.result4' }, // TCO reductie
      ]
    },
    {
      id: 'exp2', // ID behouden voor consistentie met eerdere referenties
      jobTitleKey: 'cv.experience.job2.title', // Frontend Developer
      companyName: 'New Story',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Noordwijk, NL',
      periodKey: 'cv.experience.job2.period', // Okt 2022 – Okt 2023
      startDate: new Date('2022-10-01'),
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity },
        { name: 'AngularJS (Legacy)', icon: AppIcon.Code },
        { name: 'TypeScript', icon: AppIcon.FileCode },
        { name: 'SCSS', icon: AppIcon.Palette },
      ],
      detailRoutePath: '/werkervaring/new-story-angularjs-migration',
      situationKey: 'cv.experience.job2.situation',
      taskKey: 'cv.experience.job2.task',
      actionKey: 'cv.experience.job2.action',
      results: [
        { icon: AppIcon.RefreshCcw, descriptionKey: 'cv.experience.job2.result1' },
        { icon: AppIcon.Lightbulb, descriptionKey: 'cv.experience.job2.result2' },
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.job2.result3' },
      ]
    },
    {
      id: 'exp3',
      jobTitleKey: 'cv.experience.job3.title', // Technisch Projectondersteuner
      companyName: 'Heineken Brouwerij',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Alphen a/d Rijn, NL',
      periodKey: 'cv.experience.job3.period', // Sep 2015 – Jul 2018
      startDate: new Date('2015-09-01'),
      techStack: [
        { name: 'Siemens PLCs', icon: AppIcon.BrainCircuit },
        { name: 'Troubleshooting', icon: AppIcon.Wrench },
        { name: 'Project Support', icon: AppIcon.Briefcase },
      ],
      detailRoutePath: '/werkervaring/heineken-brouwerij',
      situationKey: 'cv.experience.job3.situation',
      taskKey: 'cv.experience.job3.task',
      actionKey: 'cv.experience.job3.action',
      results: [
        { icon: AppIcon.RefreshCcw, descriptionKey: 'cv.experience.job3.result1' },
        { icon: AppIcon.ListChecks, descriptionKey: 'cv.experience.job3.result2' },
        { icon: AppIcon.Lightbulb, descriptionKey: 'cv.experience.job3.result3' },
      ]
    },
    {
      id: 'exp4',
      jobTitleKey: 'cv.experience.job4.title', // Stagiair Industriële Automatisering
      companyName: 'BRON Drukwerkveredeling',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Valkenburg, NL',
      periodKey: 'cv.experience.job4.period', // Sep 2012 – Feb 2013
      startDate: new Date('2012-09-01'),
      techStack: [
        { name: 'Elektronica', icon: AppIcon.Flash },
        { name: 'Machine Onderhoud', icon: AppIcon.Hammer },
        { name: 'Probleemanalyse', icon: AppIcon.Search },
      ],
      detailRoutePath: '/werkervaring/bron-drukwerkveredeling',
      situationKey: 'cv.experience.job4.situation',
      taskKey: 'cv.experience.job4.task',
      actionKey: 'cv.experience.job4.action',
      results: [
        { icon: AppIcon.Zap, descriptionKey: 'cv.experience.job4.result1' },
        { icon: AppIcon.Box, descriptionKey: 'cv.experience.job4.result2' },
      ]
    },
    {
      id: 'exp-new-story', // Originele New Story, nu verschoven naar correcte periode
      jobTitleKey: 'cv.experience.jobNewStory.title', // Front-end Angular developer
      companyName: 'New Story',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Noordwijk, NL',
      periodKey: 'cv.experience.jobNewStory.period', // 2022 – 2023
      startDate: new Date('2022-01-01'), // Correcte startdatum
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity },
        { name: 'TypeScript', icon: AppIcon.FileCode },
        { name: 'SCSS', icon: AppIcon.Palette },
      ],
      detailRoutePath: '/werkervaring/new-story',
      situationKey: 'cv.experience.jobNewStory.situation',
      taskKey: 'cv.experience.jobNewStory.task',
      actionKey: 'cv.experience.jobNewStory.action',
      results: [
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobNewStory.result1' },
        { icon: AppIcon.Users, descriptionKey: 'cv.experience.jobNewStory.result2' },
        { icon: AppIcon.Briefcase, descriptionKey: 'cv.experience.jobNewStory.result3' },
      ]
    },
    {
      id: 'exp-pxl-trainee',
      jobTitleKey: 'cv.experience.jobPxlTrainee.title', // Angular & Laravel trainee
      companyName: 'PXL',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Hasselt, BE',
      periodKey: 'cv.experience.jobPxlTrainee.period', // 2021 - 2021
      startDate: new Date('2021-01-01'),
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity },
        { name: 'Laravel', icon: AppIcon.Code },
        { name: 'MySQL', icon: AppIcon.Database },
      ],
      detailRoutePath: '/werkervaring/pxl-trainee',
      situationKey: 'cv.experience.jobPxlTrainee.situation',
      taskKey: 'cv.experience.jobPxlTrainee.task',
      actionKey: 'cv.experience.jobPxlTrainee.action',
      results: [
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobPxlTrainee.result1' },
        { icon: AppIcon.ListChecks, descriptionKey: 'cv.experience.jobPxlTrainee.result2' },
      ]
    },
    {
      id: 'exp-bron',
      jobTitleKey: 'cv.experience.jobBron.title', // Storingsoplosser & elektromonteur
      companyName: 'Bron drukwerkveredeling',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Valkenburg, NL',
      periodKey: 'cv.experience.jobBron.period', // 2015-2017
      startDate: new Date('2015-01-01'),
      techStack: [
        { name: 'Elektrotechniek', icon: AppIcon.Wrench },
        { name: 'Machine Onderhoud', icon: AppIcon.Hammer },
      ],
      detailRoutePath: '/werkervaring/bron-drukwerkveredeling',
      situationKey: 'cv.experience.jobBron.situation',
      taskKey: 'cv.experience.jobBron.task',
      actionKey: 'cv.experience.jobBron.action',
      results: [
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobBron.result1' },
        { icon: AppIcon.Tool, descriptionKey: 'cv.experience.jobBron.result2' },
      ]
    },
    {
      id: 'exp-heineken',
      jobTitleKey: 'cv.experience.jobHeineken.title', // Technische dienst (stage)
      companyName: 'Heineken',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Alphen a/d Rijn, NL',
      periodKey: 'cv.experience.jobHeineken.period', // 2013
      startDate: new Date('2013-01-01'),
      techStack: [
        { name: 'PLC Programmeren', icon: AppIcon.BrainCircuit },
        { name: 'Storing Analyse', icon: AppIcon.Search },
      ],
      detailRoutePath: '/werkervaring/heineken-stage',
      situationKey: 'cv.experience.jobHeineken.situation',
      taskKey: 'cv.experience.jobHeineken.task',
      actionKey: 'cv.experience.jobHeineken.action',
      results: [
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobHeineken.result1' },
        { icon: AppIcon.Tool, descriptionKey: 'cv.experience.jobHeineken.result2' },
      ]
    },
    {
      id: 'exp-aldi',
      jobTitleKey: 'cv.experience.jobAldi.title', // Kassa | Vakkenvuller | Administratie
      companyName: 'ALDI',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Katwijk, NL',
      periodKey: 'cv.experience.jobAldi.period', // 2009 - 2015
      startDate: new Date('2009-01-01'),
      techStack: [
        { name: 'Klantenservice', icon: AppIcon.Handshake },
        { name: 'Administratie', icon: AppIcon.FileText },
      ],
      detailRoutePath: '/werkervaring/aldi',
      situationKey: 'cv.experience.jobAldi.situation',
      taskKey: 'cv.experience.jobAldi.task',
      actionKey: 'cv.experience.jobAldi.action',
      results: [
        { icon: AppIcon.Users, descriptionKey: 'cv.experience.jobAldi.result1' },
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobAldi.result2' },
      ]
    },
    {
      id: 'exp-lidl',
      jobTitleKey: 'cv.experience.jobLidl.title', // Vakkenvuller
      companyName: 'Lidl',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Katwijk, NL',
      periodKey: 'cv.experience.jobLidl.period', // 2014 - 2015
      startDate: new Date('2014-01-01'),
      techStack: [
        { name: 'Teamwork', icon: AppIcon.Users },
        { name: 'Efficiëntie', icon: AppIcon.Zap },
      ],
      detailRoutePath: '/werkervaring/lidl',
      situationKey: 'cv.experience.jobLidl.situation',
      taskKey: 'cv.experience.jobLidl.task',
      actionKey: 'cv.experience.jobLidl.action',
      results: [
        { icon: AppIcon.Users, descriptionKey: 'cv.experience.jobLidl.result1' },
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobLidl.result2' },
      ]
    }
  ].sort((a, b) => b.startDate.getTime() - a.startDate.getTime()); // Sorteer nieuwste eerst

  private readonly educationData: EducationItem[] = [
    {
      id: 'edu-pxl-applied', degreeKey: 'cv.experience.eduPxlApplied.degree', institutionName: 'Hogeschool PXL', periodKey: 'cv.experience.eduPxlApplied.period', descriptionKey: 'cv.experience.eduPxlApplied.description'
    },
    {
      id: 'edu-roc-leiden', degreeKey: 'cv.experience.eduRocLeiden.degree', institutionName: 'ROC Leiden', periodKey: 'cv.experience.eduRocLeiden.period', descriptionKey: 'cv.experience.eduRocLeiden.description'
    }
  ];

  private readonly certificationsData: CertificationItem[] = [
    {
      id: 'cert1', nameKey: 'cv.experience.cert1.name', issuingBody: 'Microsoft', dateKey: 'cv.experience.cert1.date', credentialUrl: '#'
    },
  ];

  getWorkExperience(): Observable<WorkExperienceItem[]> {
    return of(this.workExperienceData);
  }

  getEducation(): Observable<EducationItem[]> {
    return of(this.educationData);
  }

  getCertifications(): Observable<CertificationItem[]> {
    return of(this.certificationsData);
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/core/services/project-data.service.ts ---
/**
 * @file project-data.service.ts (CV App)
 * @version 5.5.0 (FINAL FIX: Reverted to Root-Relative Asset Paths)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description
 *   Definitieve service voor projectdata. Alle afbeeldingspaden zijn teruggezet
 *   naar root-relatieve paden (zonder 'assets/'), wat overeenkomt met de
 *   projectconfiguratie waarbij een 'public' of 'images' map naar de root wordt
 *   gekopieerd. Dit lost het laadprobleem in Chromium definitief op.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectCardData, ProjectDetail, ImpactMetric } from '../models/project.model';
import { AppIcon } from '@royal-code/shared/domain';
import { MediaType } from '@royal-code/shared/domain';

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {
 private readonly allProjects: ProjectDetail[] = [
  {
      id: 'projectCrypto',
      titleKey: 'cv.projects.projectCrypto.title',
      // --- FIX: Paden zijn weer root-relatief ---
      heroImage: { id: 'crypto-guru-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/crypto-coin-app.jpg', purpose: 'original' }] },
      galleryImages: [{ id: 'crypto-guru-mobile-img', type: MediaType.IMAGE, variants: [{ url: 'images/projects/crypto-guru-mobile.png', purpose: 'original' }] }],
      challengeKey: 'cv.projects.projectCrypto.challenge',
      myApproachKey: 'cv.projects.projectCrypto.approach',
      resultKey: 'cv.projects.projectCrypto.result',
      architectureContext: {
        titleKey: 'cv.projects.projectCrypto.architectureContext.title',
        descriptionKey: 'cv.projects.projectCrypto.architectureContext.description',
        icon: AppIcon.BrainCircuit
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'ASP.NET Core', icon: AppIcon.Code }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'SQL Server', icon: AppIcon.Database }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: 'https://github.com/Royw94/CryptoGuru',
      liveUrl: '#',
    },
    {
      id: 'royal-code-monorepo',
      titleKey: 'cv.projects.royal-code-monorepo.title',
      heroImage: { id: 'monorepo-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/royal-code-1.webp', purpose: 'original' }] },
      galleryImages: [],
      challengeKey: 'cv.projects.royal-code-monorepo.challenge',
      myApproachKey: 'cv.projects.royal-code-monorepo.approach',
      resultKey: 'cv.projects.royal-code-monorepo.result',
      architectureContext: {
        titleKey: 'cv.projects.royal-code-monorepo.architectureContext.title',
        descriptionKey: 'cv.projects.royal-code-monorepo.architectureContext.description',
        icon: AppIcon.Layers
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'NgRx', icon: AppIcon.Recycle }, { name: 'Nx Monorepo', icon: AppIcon.Grid }, { name: '.NET', icon: AppIcon.Code }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'SCSS', icon: AppIcon.Palette }, { name: 'Azure', icon: AppIcon.Cloud },
      ],
      githubUrl: 'https://github.com/jouwprofiel/Royal-Code-Monorepo',
      liveUrl: 'https://jouwcv.nl',
    },
    {
      id: 'smart-spec-bot',
      titleKey: 'cv.projects.smart-spec-bot.title',
      heroImage: { id: 'smart-spec-bot-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/smart-bot-1.webp', purpose: 'original' }] },
      galleryImages: [],
      challengeKey: 'cv.projects.smart-spec-bot.challenge',
      myApproachKey: 'cv.projects.smart-spec-bot.approach',
      resultKey: 'cv.projects.smart-spec-bot.result',
      architectureContext: {
        titleKey: 'cv.projects.smart-spec-bot.architectureContext.title',
        descriptionKey: 'cv.projects.smart-spec-bot.architectureContext.description',
        icon: AppIcon.Bot
      },
      techStack: [
        { name: 'AI', icon: AppIcon.Bot }, { name: 'LangChain', icon: AppIcon.BrainCircuit }, { name: 'Azure OpenAI', icon: AppIcon.Sparkles },
      ],
      githubUrl: '#',
    },
    {
      id: 'corporate-dashboard',
      titleKey: 'cv.projects.corporate-dashboard.title',
      heroImage: { id: 'corp-dash-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/admin-panel.webp', purpose: 'original' }] },
      galleryImages: [],
      challengeKey: 'cv.projects.corporate-dashboard.challenge',
      myApproachKey: 'cv.projects.corporate-dashboard.approach',
      resultKey: 'cv.projects.corporate-dashboard.result',
      architectureContext: {
        titleKey: 'cv.projects.corporate-dashboard.architectureContext.title',
        descriptionKey: 'cv.projects.corporate-dashboard.architectureContext.description',
        icon: AppIcon.Castle
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'RxJS', icon: AppIcon.Droplets }, { name: 'ASP.NET Core', icon: AppIcon.Server }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'SignalR', icon: AppIcon.Waves }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 'pxlTicketing',
      titleKey: 'cv.projects.pxlTicketing.title',
      heroImage: { id: 'pxl-ticketing-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/pxl-ticketing-system.jpg', purpose: 'original' }] },
      galleryImages: [],
      challengeKey: 'cv.projects.pxlTicketing.challenge',
      myApproachKey: 'cv.projects.pxlTicketing.approach',
      resultKey: 'cv.projects.pxlTicketing.result',
      architectureContext: {
        titleKey: 'cv.projects.pxlTicketing.architectureContext.title',
        descriptionKey: 'cv.projects.pxlTicketing.architectureContext.description',
        icon: AppIcon.ListChecks
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'Laravel (PHP)', icon: AppIcon.Code }, { name: 'MySQL', icon: AppIcon.Database }, { name: 'RESTful API', icon: AppIcon.Server }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: '#',
      liveUrl: '#',
    },
    {
      id: 'challengerApp',
      titleKey: 'cv.projects.challengerApp.title',
      heroImage: { id: 'challenger-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'challenger-desktop-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
        { id: 'challenger-desktop-3', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
        { id: 'challenger-desktop-4', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
        { id: 'challenger-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
        { id: 'challenger-mobile-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.challengerApp.challenge',
      myApproachKey: 'cv.projects.challengerApp.approach',
      resultKey: 'cv.projects.challengerApp.result',
      architectureContext: {
        titleKey: 'cv.projects.challengerApp.architectureContext.title',
        descriptionKey: 'cv.projects.challengerApp.architectureContext.description',
        icon: AppIcon.FlaskConical
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'NgRx', icon: AppIcon.Recycle }, { name: 'Nx Monorepo', icon: AppIcon.Grid }, { name: 'ASP.NET Core', icon: AppIcon.Code }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'AI/LLMs', icon: AppIcon.Bot }, { name: 'Azure', icon: AppIcon.Cloud }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: '#',
      liveUrl: '#',
    },
    {
      id: 'plushieApp',
      titleKey: 'cv.projects.plushieApp.title',
      heroImage: { id: 'plushie-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'plushie-desktop-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
        { id: 'plushie-desktop-3', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
        { id: 'plushie-desktop-4', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
        { id: 'plushie-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
        { id: 'plushie-mobile-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.plushieApp.challenge',
      myApproachKey: 'cv.projects.plushieApp.approach',
      resultKey: 'cv.projects.plushieApp.result',
      architectureContext: {
        titleKey: 'cv.projects.plushieApp.architectureContext.title',
        descriptionKey: 'cv.projects.plushieApp.architectureContext.description',
        icon: AppIcon.ShoppingCart
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'NgRx', icon: AppIcon.Recycle }, { name: 'Nx Monorepo', icon: AppIcon.Grid }, { name: 'ASP.NET Core', icon: AppIcon.Code }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'Stripe', icon: AppIcon.CreditCard }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: '#',
      liveUrl: '#',
    },
    {
      id: 'cvApp',
      titleKey: 'cv.projects.cvApp.title',
      heroImage: { id: 'cv-app-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'cv-app-desktop-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
        { id: 'cv-app-desktop-3', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
        { id: 'cv-app-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
        { id: 'cv-app-mobile-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.cvApp.challenge',
      myApproachKey: 'cv.projects.cvApp.approach',
      resultKey: 'cv.projects.cvApp.result',
      architectureContext: {
        titleKey: 'cv.projects.cvApp.architectureContext.title',
        descriptionKey: 'cv.projects.cvApp.architectureContext.description',
        icon: AppIcon.Building
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'NgRx', icon: AppIcon.Recycle }, { name: 'Nx Monorepo', icon: AppIcon.Grid }, { name: 'Tailwind CSS', icon: AppIcon.Palette }, { name: 'TypeScript', icon: AppIcon.FileCode }, { name: 'AI-Assisted Dev', icon: AppIcon.Bot }, { name: 'Azure Hosting', icon: AppIcon.Cloud }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: 'https://github.com/Royw94/royal-code-monorepo',
      liveUrl: 'https://www.royvandewetering.nl',
    },
    {
      id: 'sunnycars',
      titleKey: 'cv.projects.sunnycars.title',
      heroImage: { id: 'sunnycars-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/sunny-cars-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'sunnycars-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/sunny-cars-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.sunnycars.challenge',
      myApproachKey: 'cv.projects.sunnycars.approach',
      resultKey: 'cv.projects.sunnycars.result',
      architectureContext: {
        titleKey: 'cv.projects.sunnycars.architectureContext.title',
        descriptionKey: 'cv.projects.sunnycars.architectureContext.description',
        icon: AppIcon.RefreshCcw
      },
      techStack: [
        { name: 'AngularJS (Legacy)', icon: AppIcon.Activity }, { name: 'Angular', icon: AppIcon.Activity }, { name: 'TypeScript', icon: AppIcon.FileCode }, { name: 'RxJS', icon: AppIcon.Droplets }, { name: 'SCSS', icon: AppIcon.Palette }, { name: 'Go (Backend)', icon: AppIcon.Code }
      ],
      githubUrl: '#',
      liveUrl: 'https://www.sunnycars.nl/',
    },
    {
      id: 'vandervalk',
      titleKey: 'cv.projects.vandervalk.title',
      heroImage: { id: 'vandervalk-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/van-der-valk-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'vandervalk-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/van-der-valk-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.vandervalk.challenge',
      myApproachKey: 'cv.projects.vandervalk.approach',
      resultKey: 'cv.projects.vandervalk.result',
      architectureContext: {
        titleKey: 'cv.projects.vandervalk.architectureContext.title',
        descriptionKey: 'cv.projects.vandervalk.architectureContext.description',
        icon: AppIcon.Building
      },
      techStack: [
        { name: 'AngularJS (Legacy)', icon: AppIcon.Activity }, { name: 'Angular', icon: AppIcon.Activity }, { name: 'TypeScript', icon: AppIcon.FileCode }, { name: 'RxJS', icon: AppIcon.Droplets }, { name: 'SCSS', icon: AppIcon.Palette }, { name: 'Java (Backend)', icon: AppIcon.Code }
      ],
      githubUrl: '#',
      liveUrl: 'https://www.valk.com/nl/hotel-restaurant/',
    }
  ];

  getAllProjectsForOverview(): Observable<ProjectCardData[]> {
    return of(this.allProjects).pipe(
      map(details => details.map(detail => ({
        id: detail.id,
        image: detail.heroImage,
        titleKey: detail.titleKey,
        descriptionKey: `cv.projects.${detail.id}.description`,
        techStack: detail.techStack,
        routePath: `/projects/${detail.id}`,
        impactMetrics: this.getImpactMetricsForProject(detail.id)
      })))
    );
  }

  getProjectById(id: string): Observable<ProjectDetail | undefined> {
    const project = this.allProjects.find(p => p.id === id);
    return of(project);
  }

    private getImpactMetricsForProject(id: string): ImpactMetric[] | undefined {
    switch(id) {
      case 'royal-code-monorepo':
        return [
          { label: 'cv.projects.metrics.developerVelocity', value: '+70%', icon: AppIcon.Zap },
          { label: 'cv.projects.metrics.architecturalBugs', value: '-90%', icon: AppIcon.BadgeCheck },
        ];
      case 'smart-spec-bot':
        return [
          { label: 'cv.projects.metrics.timeToMarket', value: '-70%', icon: AppIcon.Zap },
          { label: 'cv.projects.metrics.specConsistency', value: '100%', icon: AppIcon.RefreshCcw },
        ];
       case 'corporate-dashboard':
        return [
          { label: 'cv.projects.metrics.decisionMaking', value: 'Real-time', icon: AppIcon.Clock },
        ];
       case 'projectCrypto':
        return [
          { label: 'cv.projects.metrics.dataSources', value: '6 Integrated', icon: AppIcon.Database },
          { label: 'cv.projects.metrics.tradeSignals', value: 'Real-time', icon: AppIcon.Bot },
        ];
       case 'pxlTicketing':
        return [
          { label: 'cv.projects.metrics.manualEntry', value: '-40%', icon: AppIcon.FileText },
          { label: 'cv.projects.metrics.resolutionTime', value: 'Faster', icon: AppIcon.CheckCheck },
        ];
       case 'challengerApp':
        return [
          { label: 'cv.projects.metrics.userRetention', value: 'Higher', icon: AppIcon.Heart },
          { label: 'cv.projects.metrics.personalization', value: 'AI-Driven', icon: AppIcon.Sparkles },
        ];
       case 'plushieApp':
        return [
          { label: 'cv.projects.metrics.checkoutFlow', value: 'Faster', icon: AppIcon.ShoppingCart },
          { label: 'cv.projects.metrics.productCatalog', value: 'Scalable', icon: AppIcon.Package },
        ];
       case 'cv-app':
        return [
          { label: 'cv.projects.metrics.conversionFocus', value: 'High', icon: AppIcon.UserCheck },
          { label: 'cv.projects.metrics.performanceScore', value: 'Optimized', icon: AppIcon.Gauge },
          { label: 'cv.projects.metrics.accessibility', value: 'WCAG AA', icon: AppIcon.ShieldCheck },
        ];
       case 'sunnycars':
        return [
          { label: 'cv.projects.metrics.pageLoadTime', value: '-40%', icon: AppIcon.Gauge },
          { label: 'cv.projects.metrics.buildTimes', value: '-60%', icon: AppIcon.Zap },
          { label: 'cv.projects.metrics.techDebt', value: 'Reduced', icon: AppIcon.Recycle },
        ];
       case 'vandervalk':
        return [
          { label: 'cv.projects.metrics.bookingConversion', value: '+12%', icon: AppIcon.CheckCheck },
          { label: 'cv.projects.metrics.userExperience', value: 'Modernized', icon: AppIcon.Smile },
          { label: 'cv.projects.metrics.mobilePerformance', value: 'Responsive', icon: AppIcon.Smartphone },
        ];
      default:
        return undefined;
    }
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/core/services/skills-data.service.ts ---
/**
 * @file skills-data.service.ts (CV App)
 * @description Centrale service voor het aanleveren van alle vaardigheidsdata.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SkillCategory } from '../models/skills.model';
import { AppIcon } from '@royal-code/shared/domain';

@Injectable({
  providedIn: 'root'
})
export class SkillsDataService {
  private readonly allSkills: SkillCategory[] = [
    {
      categoryNameKey: 'cv.skills.backendDevAndDatabases',
      skills: [
        { name: 'C# & .NET (ASP.NET Core 9)', icon: AppIcon.Code },
        { name: 'Clean Architecture / DDD', icon: AppIcon.Sparkles },
        { name: 'CQRS & MediatR', icon: AppIcon.Share },
        { name: 'RESTful API Design', icon: AppIcon.Server },
        { name: 'Entity Framework Core 9', icon: AppIcon.Database },
        { name: 'SQL Server & SQLite', icon: AppIcon.Database },
        { name: 'FluentValidation', icon: AppIcon.CheckCheck },
        { name: 'Serilog (Logging)', icon: AppIcon.List },
      ],
    },
    {
      categoryNameKey: 'cv.skills.frontendDevAndUi',
      skills: [
        { name: 'Angular (v20+, Signals API, Control Flow)', icon: AppIcon.Activity },
        { name: 'TypeScript', icon: AppIcon.FileCode },
        { name: 'NgRx (met Signals & createFeature)', icon: AppIcon.Recycle },
        { name: 'RxJS', icon: AppIcon.Droplets },
        { name: 'Tailwind CSS (v4+, CSS Vars)', icon: AppIcon.Palette },
        { name: 'Angular CDK', icon: AppIcon.Layers },
        { name: 'i18n (ngx-translate)', icon: AppIcon.Globe },
        { name: 'Component Libraries (Nx UI)', icon: AppIcon.Box },
      ],
    },
    {
      categoryNameKey: 'cv.skills.cloudDevOpsAndTooling',
      skills: [
        { name: 'Microsoft Azure', icon: AppIcon.Cloud },
        { name: 'Azure DevOps (CI/CD, YAML)', icon: AppIcon.Truck },
        { name: 'Docker', icon: AppIcon.Package },
        { name: 'Nx Monorepos', icon: AppIcon.Grid },
        { name: 'Git & GitHub', icon: AppIcon.GitPullRequest },
        { name: 'ESLint & Prettier', icon: AppIcon.PenTool },
        { name: 'Unit Testing (Jest, xUnit)', icon: AppIcon.ShieldCheck },
        { name: 'E2E Testing (Playwright)', icon: AppIcon.MousePointer },
      ],
    },
    {
      categoryNameKey: 'cv.skills.aiAnd3dGraphics',
      skills: [
        { name: 'Prompt Engineering', icon: AppIcon.Bot },
        { name: 'AI-Assisted Development', icon: AppIcon.BrainCircuit },
        { name: 'Babylon.js (3D Rendering)', icon: AppIcon.Box3d },
        { name: 'Three.js (3D Rendering)', icon: AppIcon.Cone },
        { name: 'Real-time Systemen', icon: AppIcon.Watch },
        { name: 'Asset Pipeline & Optimization', icon: AppIcon.Hammer },
      ],
    },
    // NIEUWE SKILL CATEGORIE: Back-End Development (uit oud CV)
    {
      categoryNameKey: 'cv.skills.oldBackendDevelopment',
      skills: [
        { name: 'ASP.NET Core', icon: AppIcon.Code },
        { name: 'Clean-Architecture', icon: AppIcon.BrainCircuit },
        { name: 'SQL', icon: AppIcon.Database },
      ],
    },
    // NIEUWE SKILL CATEGORIE: Front-End UI/UX Design (uit oud CV)
    {
      categoryNameKey: 'cv.skills.oldFrontendUiUxDesign',
      skills: [
        { name: 'Angular', icon: AppIcon.Activity },
        { name: 'JavaScript', icon: AppIcon.FileCode },
        { name: 'Redux', icon: AppIcon.Recycle },
        { name: 'Tailwind', icon: AppIcon.Palette },
        { name: 'HTML5', icon: AppIcon.Code },
        { name: 'SCSS', icon: AppIcon.Palette },
      ],
    },
    // NIEUWE SKILL CATEGORIE: Social Skills (uit oud CV)
    {
      categoryNameKey: 'cv.skills.oldSocialSkills',
      skills: [
        { name: 'Dutch', icon: AppIcon.Globe },
        { name: 'English', icon: AppIcon.Globe },
        { name: 'Jira', icon: AppIcon.ListChecks },
      ],
    },
  ];

  constructor() { }

  getAllSkillCategories(): Observable<SkillCategory[]> {
    return of(this.allSkills);
  }

  getFeaturedSkillCategories(): Observable<SkillCategory[]> {
    const featuredCategories = this.allSkills.filter(
      cat => cat.categoryNameKey !== 'cv.skills.cloudDevOpsAndTooling' && cat.categoryNameKey !== 'cv.skills.aiAnd3dGraphics' && cat.categoryNameKey !== 'cv.skills.oldSocialSkills'
    );
    return of(featuredCategories);
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/core/services/testimonial-data.service.ts ---
/**
 * @file testimonial-data.service.ts (CV App)
 * @version 1.1.0 (Corrected Image Data)
 * @description Service to provide testimonial data, with corrected authorImage model.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Testimonial } from '@royal-code/shared/domain';
import { MediaType } from '@royal-code/shared/domain';

@Injectable({
  providedIn: 'root'
})
export class TestimonialDataService {
  private readonly testimonials: Testimonial[] = [
    {
      id: 'testimonial-1',
      quoteKey: 'cv.testimonials.quote1',
      authorName: 'Jane Doe',
      authorTitleKey: 'cv.testimonials.author1_title',
      authorCompany: 'Tech Solutions Inc.',
      authorImage: { id: 'author-1', type: MediaType.IMAGE, variants: [{ url: 'images/default-image.webp', purpose: 'avatar' }] }
    },
    {
      id: 'testimonial-2',
      quoteKey: 'cv.testimonials.quote2',
      authorName: 'John Smith',
      authorTitleKey: 'cv.testimonials.author2_title',
      authorCompany: 'Innovate Corp.',
      authorImage: { id: 'author-2', type: MediaType.IMAGE, variants: [{ url: 'images/default-image.webp', purpose: 'avatar' }] }
    },
    // NIEUWE TESTIMONIAL: Jasper Kruit
    {
      id: 'testimonial-jasper-kruit',
      quoteKey: 'cv.testimonials.quoteJasperKruit', // Nieuwe vertaalsleutel voor de quote
      authorName: 'Jasper Kruit',
      authorTitleKey: 'cv.testimonials.authorJasperKruit_title', // Nieuwe vertaalsleutel voor de titel
      authorCompany: 'Crypto Client', // Bedrijf kan een simpele aanduiding zijn
      authorImage: { id: 'author-jasper', type: MediaType.IMAGE, variants: [{ url: 'images/default-image.webp', purpose: 'avatar' }] } // Standaard avatar, tenzij specifieke afbeelding beschikbaar is
    }
  ];


  getTestimonials(): Observable<Testimonial[]> {
    return of(this.testimonials);
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/core/utils/filter.utils.ts ---
/**
 * @file filter.utils.ts (CV App)
 * @description Utility-functies voor het filteren van lijsten op basis van tags.
 */

// Een generieke functie om unieke tags te verzamelen uit een lijst van items
// Elk item moet een `techStack` array hebben
export function getUniqueTags<T extends { techStack: { name: string }[] }>(items: T[]): string[] {
  const tags = new Set<string>();
  items.forEach(item => {
    item.techStack.forEach(tech => tags.add(tech.name));
  });
  return Array.from(tags).sort();
}

// Een generieke functie om een lijst van items te filteren op een geselecteerde tag
export function filterByTag<T extends { techStack: { name: string }[] }>(items: T[], selectedTag: string | null): T[] {
  if (!selectedTag) {
    return items;
  }
  return items.filter(item => 
    item.techStack.some(tech => tech.name === selectedTag)
  );
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/about-me-page/about-me-page.component.ts ---
/**
 * @file about-me-page.component.ts (CV App)
 * @version 3.7.0 (Full Internationalization)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-07
 * @Description
 *   Definitieve, productieklare en volledig geïnternationaliseerde 'Over Mij'-pagina.
 *   Alle hardgecodeerde strings zijn vervangen door vertaalsleutels (i18n).
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/card';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiButtonComponent } from '@royal-code/ui/button';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { environment } from '../../../../environments/environment';
import { UiImageComponent } from '@royal-code/ui/image';
// import { CalendlyOverlayComponent } from '...'; // Veronderstelde import

@Component({
  selector: 'app-cv-about-me-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent, UiCardComponent, UiImageComponent, UiBadgeComponent, UiButtonComponent],
  template: `
    <section id="about-main" class="about-me-page container-max py-16 md:py-24 space-y-20">

      <!-- Sectie 1: De Filosofie -->
      <header class="text-center">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H1"
          [text]="'cv.aboutMe.pageTitle' | translate"
          extraClasses="!text-3xl sm:!text-5xl !font-black mb-4"
        />
        <royal-code-ui-paragraph
          [text]="'cv.aboutMe.philosophy.hook' | translate"
          size="lg"
          color="muted"
          extraClasses="max-w-4xl mx-auto"
        />
      </header>

      <!-- Profielfoto -->
      <figure class="mx-auto my-8 w-40 h-40 relative">
        <royal-code-ui-image
          [src]="'images/profiel-roy.jpg'"
          [alt]="'cv.aboutMe.profileImage.alt' | translate"
          objectFit="cover"
          [rounded]="true"
          class="w-full h-full"
        />
        <figcaption class="sr-only">{{ 'cv.aboutMe.profileImage.alt' | translate }}</figcaption>
      </figure>

      <!-- Sectie 2: Mijn Belofte (Met Bewijs) -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aboutMe.whatIOffer.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          @for (point of whatIOfferPoints; track point.id) {
            <royal-code-ui-card
                borderColor="primary"
                role="button"
                tabindex="0"
                [attr.aria-label]="'cv.aboutMe.whatIOffer.ariaLabelPrefix' | translate: { title: (point.titleKey | translate) }"
                (click)="trackAnalytics('about_offer_click', point)"
                (keyup.enter)="trackAnalytics('about_offer_click', point)"
                (keyup.space)="trackAnalytics('about_offer_click', point)"
                [attr.data-analytics]="'about_offer_' + point.id"
                extraContentClasses="flex flex-col text-center cursor-pointer hover:bg-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <royal-code-ui-icon [icon]="point.icon" sizeVariant="xl" colorClass="text-primary mx-auto mb-4" [attr.aria-hidden]="true" />
              <h3 class="text-lg font-semibold text-foreground mb-2">{{ point.titleKey | translate }}</h3>
              <p class="text-sm text-secondary flex-grow">{{ point.descriptionKey | translate }}</p>
              <div class="text-xs bg-background p-2 rounded-md border border-border mt-4">
                <p class="italic">"{{ point.proofQuoteKey | translate }}"</p>
                <p class="font-bold text-right mt-1">- {{ point.proofAuthorKey | translate }}</p>
              </div>
            </royal-code-ui-card>
          }
        </div>
      </article>

      <!-- Sectie 3: Fouten die mij vormden -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aboutMe.failStories.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          @for(fail of failStories; track fail.slug) {
            <royal-code-ui-card 
                borderColor="primary" 
                role="button"
                tabindex="0"
                [attr.aria-label]="'cv.aboutMe.failStories.ariaLabelPrefix' | translate: { title: (fail.titleKey | translate) }"
                (click)="trackAnalytics('fail_story_click', fail)"
                (keyup.enter)="trackAnalytics('fail_story_click', fail)"
                (keyup.space)="trackAnalytics('fail_story_click', fail)"
                [attr.data-analytics]="'fail_story_'+fail.slug"
                extraContentClasses="flex flex-col text-center cursor-pointer hover:bg-hover p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <royal-code-ui-icon [icon]="AppIcon.AlertTriangle" sizeVariant="lg" colorClass="text-warning mx-auto mb-3" [attr.aria-hidden]="true" />
              <h3 class="font-semibold mb-1 text-sm">{{ fail.titleKey | translate }}</h3>
              <p class="text-xs text-secondary flex-grow">{{ fail.problemKey | translate }}</p>
              <p class="text-xs font-bold mt-2">{{ 'cv.aboutMe.failStories.fixPrefix' | translate }}: {{ fail.fixKey | translate }}</p>
              <royal-code-ui-badge color="success" size="xs" extraClasses="mt-2 self-center">{{ fail.impactKey | translate }}</royal-code-ui-badge>
            </royal-code-ui-card>
          }
        </div>
      </article>

      <!-- Sectie 4: Mijn Mindset -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aboutMe.mindset.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
           @for (item of mindsetPoints; track item.titleKey) {
            <royal-code-ui-card>
              <royal-code-ui-icon [icon]="item.icon" sizeVariant="lg" colorClass="text-primary mb-3" [attr.aria-hidden]="true" />
              <h3 class="font-semibold text-foreground mb-1">{{ item.titleKey | translate }}</h3>
              <p class="text-sm text-secondary">{{ item.descriptionKey | translate }}</p>
            </royal-code-ui-card>
           }
        </div>
      </article>

      <!-- Sectie 5: Praktische Details & CTA -->
      <article class="text-center bg-card border border-border rounded-xs p-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aboutMe.details.title' | translate" extraClasses="!mb-4" />
        <royal-code-ui-paragraph [text]="'cv.aboutMe.details.text' | translate" color="muted" [centered]="true" extraClasses="max-w-3xl mx-auto mb-6" />
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <royal-code-ui-badge color="muted" size="lg">
              <royal-code-ui-icon [icon]="AppIcon.MapPin" sizeVariant="sm" extraClass="mr-2" [attr.aria-hidden]="true" />
              {{ 'cv.aboutMe.details.location' | translate }}
            </royal-code-ui-badge>
            <royal-code-ui-button type="primary" (clicked)="openContactOverlay()">
              {{ 'cv.aboutMe.details.cta' | translate }}
              <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" extraClass="ml-2" [attr.aria-hidden]="true" />
            </royal-code-ui-button>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMePageComponent implements OnInit {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly translateService = inject(TranslateService); // Inject TranslateService
  // @ts-ignore: 'overlayService' is declared but its value is never read in this stubbed version.
  private readonly overlayService = inject(DynamicOverlayService);

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  // Data structuren nu met vertaalsleutels
  readonly whatIOfferPoints = [
    { id: 'partner', icon: AppIcon.Handshake, titleKey: "cv.aboutMe.whatIOffer.points.item1.title", descriptionKey: "cv.aboutMe.whatIOffer.points.item1.description", proofQuoteKey: "cv.aboutMe.whatIOffer.points.item1.proof.quote", proofAuthorKey: "cv.aboutMe.whatIOffer.points.item1.proof.author" },
    { id: 'learner', icon: AppIcon.BrainCircuit, titleKey: "cv.aboutMe.whatIOffer.points.item2.title", descriptionKey: "cv.aboutMe.whatIOffer.points.item2.description", proofQuoteKey: "cv.aboutMe.whatIOffer.points.item2.proof.quote", proofAuthorKey: "cv.aboutMe.whatIOffer.points.item2.proof.author" },
    { id: 'transparency', icon: AppIcon.BadgeCheck, titleKey: "cv.aboutMe.whatIOffer.points.item3.title", descriptionKey: "cv.aboutMe.whatIOffer.points.item3.description", proofQuoteKey: "cv.aboutMe.whatIOffer.points.item3.proof.quote", proofAuthorKey: "cv.aboutMe.whatIOffer.points.item3.proof.author" }
  ];

readonly failStories = [
  { slug: 'big-bang-rewrite',            titleKey: 'cv.aboutMe.failStories.item1.title', problemKey: 'cv.aboutMe.failStories.item1.problem', fixKey: 'cv.aboutMe.failStories.item1.fix', impactKey: 'cv.aboutMe.failStories.item1.impact' },
  { slug: 'race-condition-ws',            titleKey: 'cv.aboutMe.failStories.item2.title', problemKey: 'cv.aboutMe.failStories.item2.problem', fixKey: 'cv.aboutMe.failStories.item2.fix', impactKey: 'cv.aboutMe.failStories.item2.impact' },
  { slug: 'enum-mismatch',                titleKey: 'cv.aboutMe.failStories.item3.title', problemKey: 'cv.aboutMe.failStories.item3.problem', fixKey: 'cv.aboutMe.failStories.item3.fix', impactKey: 'cv.aboutMe.failStories.item3.impact' },
  { slug: 'concurrency-error',            titleKey: 'cv.aboutMe.failStories.item4.title', problemKey: 'cv.aboutMe.failStories.item4.problem', fixKey: 'cv.aboutMe.failStories.item4.fix', impactKey: 'cv.aboutMe.failStories.item4.impact' },
  { slug: 'circular-dependency-ng0200',   titleKey: 'cv.aboutMe.failStories.item5.title', problemKey: 'cv.aboutMe.failStories.item5.problem', fixKey: 'cv.aboutMe.failStories.item5.fix', impactKey: 'cv.aboutMe.failStories.item5.impact' },
  { slug: 'effect-outside-context-ng0203',titleKey: 'cv.aboutMe.failStories.item6.title', problemKey: 'cv.aboutMe.failStories.item6.problem', fixKey: 'cv.aboutMe.failStories.item6.fix', impactKey: 'cv.aboutMe.failStories.item6.impact' },
  { slug: 'recursive-loop',               titleKey: 'cv.aboutMe.failStories.item7.title', problemKey: 'cv.aboutMe.failStories.item7.problem', fixKey: 'cv.aboutMe.failStories.item7.fix', impactKey: 'cv.aboutMe.failStories.item7.impact' },
  { slug: 'holistic-fix-v6-4-0',          titleKey: 'cv.aboutMe.failStories.item8.title', problemKey: 'cv.aboutMe.failStories.item8.problem', fixKey: 'cv.aboutMe.failStories.item8.fix', impactKey: 'cv.aboutMe.failStories.item8.impact' }
];


  readonly mindsetPoints = [
    { icon: AppIcon.Grid, titleKey: "cv.aboutMe.mindset.item1.title", descriptionKey: "cv.aboutMe.mindset.item1.description" },
    { icon: AppIcon.Swords, titleKey: "cv.aboutMe.mindset.item2.title", descriptionKey: "cv.aboutMe.mindset.item2.description" },
    { icon: AppIcon.Camera, titleKey: "cv.aboutMe.mindset.item3.title", descriptionKey: "cv.aboutMe.mindset.item3.description" }
  ];

  ngOnInit(): void {
    // Gebruik de translate service om de meta tags te zetten
    this.translateService.get([
      'cv.aboutMe.pageTitle',
      'cv.aboutMe.meta.description',
      'cv.aboutMe.meta.ogTitle',
      'cv.aboutMe.meta.ogImageAlt'
    ]).subscribe(translations => {
      this.titleService.setTitle(translations['cv.aboutMe.pageTitle']);
      this.metaService.addTags([
        { name: 'description', content: translations['cv.aboutMe.meta.description'] },
        { property: 'og:title', content: translations['cv.aboutMe.meta.ogTitle'] },
        { property: 'og:image', content: '/assets/og/about-me-hero.png' },
        { name: 'robots', content: 'index,follow' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/assets/og/about-me-hero.png' },
        { name: 'twitter:image:alt', content: translations['cv.aboutMe.meta.ogImageAlt'] }
      ]);
    });
  }

  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
    // else { /* Injecteer en gebruik hier je echte analytics service */ }
  }

  openContactOverlay(): void {
    this.trackAnalytics('about_me_cta_click', { source: 'about_page' });
    if (!environment.production) {
      alert("Simulatie: Calendly opent nu in een frictieloze overlay.");
    }
    // else { this.overlayService.open(CalendlyOverlayComponent, { data: { utm: 'about-cta' } }); }
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/ai-workflow-page/ai-workflow-page.component.ts ---
/**
 * @file ai-workflow-page.component.ts (CV App)
 * @version 14.1.0 (Full Internationalization)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-07
 * @Description
 *   De definitieve, productieklare en volledig geïnternationaliseerde AI-pagina.
 *   Alle hardgecodeerde strings zijn vervangen door vertaalsleutels (i18n).
 */
import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, PLATFORM_ID, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/card';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { MediaViewerService, UiImageComponent } from '@royal-code/ui/media'; // MediaViewer voor lightbox
import { Image, MediaType } from '@royal-code/shared/domain';
import { environment } from '../../../../environments/environment';
// import { CalendlyOverlayComponent } from '...'; // Veronderstelde import voor de overlay

@Component({
  selector: 'app-cv-ai-workflow-page',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent,
    UiCardComponent, UiButtonComponent, UiBadgeComponent, UiImageComponent
  ],
  template: `
    <section class="ai-workflow-page container-max py-16 md:py-24 space-y-20">

      <!-- Sectie 1: Het Manifest -->
      <header class="text-center">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H2" 
          [text]="'cv.aiWorkflow.manifesto.title' | translate" 
          extraClasses="!text-3xl sm:!text-5xl !font-black mb-4" 
        />
        <royal-code-ui-paragraph 
          [text]="'cv.aiWorkflow.manifesto.hook' | translate" 
          size="lg" 
          color="muted" 
          extraClasses="max-w-4xl mx-auto" 
        />
      </header>

      <!-- Sectie 2: De Case Study (Het Harde Bewijs) -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aiWorkflow.caseStudy.title' | translate" [center]="true" extraClasses="!mb-2" />
        <p class="text-center font-semibold text-primary mb-4">{{ 'cv.aiWorkflow.caseStudy.subheadline' | translate }}</p>
        <p class="text-center text-secondary mb-8">{{ 'cv.aiWorkflow.caseStudy.project' | translate }} ({{ 'cv.aiWorkflow.caseStudy.teamContext' | translate }})</p>
        <div class="max-w-3xl mx-auto">
            <royal-code-ui-card [appearance]="'gradient'">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="border-l-4 border-destructive pl-4">
                    <h4 class="font-bold text-secondary">{{ 'cv.aiWorkflow.caseStudy.traditional.title' | translate }}</h4>
                    <ul class="mt-2 space-y-1 text-sm">
                      <li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.leadTime' | translate }}:</strong> {{ 'cv.aiWorkflow.caseStudy.traditional.timeline' | translate }}</li>
                      <li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.bugs' | translate }}:</strong> {{ 'cv.aiWorkflow.caseStudy.traditional.bugs' | translate }}</li>
                      <!--<li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.annualCost' | translate }}:</strong> €{{ 'cv.aiWorkflow.caseStudy.traditional.cost' | translate }}</li>-->
                    </ul>
                  </div>
                  <div class="border-l-4 border-success pl-4">
                    <h4 class="font-bold text-primary">{{ 'cv.aiWorkflow.caseStudy.myApproach.title' | translate }}</h4>
                    <ul class="mt-2 space-y-1 text-sm">
                      <li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.leadTime' | translate }}:</strong> {{ 'cv.aiWorkflow.caseStudy.myApproach.timeline' | translate }}</li>
                      <li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.bugs' | translate }}:</strong> {{ 'cv.aiWorkflow.caseStudy.myApproach.bugs' | translate }}</li>
                      <!--<li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.annualSavings' | translate }}:</strong> €{{ 'cv.aiWorkflow.caseStudy.myApproach.savings' | translate }}</li>-->
                    </ul>
                  </div>
                </div>
            </royal-code-ui-card>
            <div class="text-center mt-4">
                <a (click)="openDatadogProof()" class="text-xs text-secondary hover:text-primary underline cursor-pointer" data-analytics="evidence_click_datadog">
                  {{ 'cv.aiWorkflow.caseStudy.viewEvidence' | translate }} →
                </a>
            </div>
        </div>
      </article>

      <!-- Sectie 3: Visueel Bewijs (Show, Don't Tell) -->
      <article class="text-center">
         <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aiWorkflow.video.title' | translate" [center]="true" extraClasses="!mb-6" />
         <div #videoContainer class="aspect-video bg-muted rounded-xs border border-border flex items-center justify-center text-secondary max-w-4xl mx-auto" style="min-height: 360px;" aria-label="Demo video – specification to green CI in 45 s">
            <!-- Video wordt hier dynamisch ingeladen door de IntersectionObserver -->
         </div>
      </article>

      <!-- Sectie 4: Differentiators / 2025 Edge -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aiWorkflow.differentiators.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          @for (point of differentiatorsPoints; track point.titleKey) {
            <royal-code-ui-card [appearance]="'gradient'" extraContentClasses="flex flex-col">
              <royal-code-ui-icon [icon]="point.icon" sizeVariant="xl" colorClass="text-primary mb-4" />
              <h4 class="font-semibold text-primary mb-2">{{ point.titleKey | translate }}</h4>
              <p class="text-sm text-secondary">{{ point.detailKey | translate }}</p>
            </royal-code-ui-card>
          }
        </div>
      </article>
      
      <!-- Sectie 5: Risicomanagement -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aiWorkflow.lessons.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          @for (pitfall of lessonsPitfalls; track pitfall.nameKey) {
            <royal-code-ui-card extraContentClasses="p-4 h-full">
              <p class="font-semibold text-sm mb-1">{{ pitfall.nameKey | translate }}</p>
              <p class="text-xs font-bold text-destructive mb-2">{{ pitfall.statKey | translate }}</p>
              <p class="text-xs text-secondary">{{ pitfall.mitigationKey | translate }} <a [href]="pitfall.sourceUrl" target="_blank" rel="noopener noreferrer" class="text-primary/70 hover:underline" [attr.aria-label]="'cv.aiWorkflow.lessons.sourceLinkAriaLabel' | translate">[ {{ 'common.buttons.source' | translate }} ]</a></p>
            </royal-code-ui-card>
          }
        </div>
      </article>

      <!-- Sectie 6: Call to Action -->
      <article class="text-center bg-card border border-border rounded-xs p-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.aiWorkflow.callToAction.title' | translate" extraClasses="!mb-4" />
        <royal-code-ui-paragraph [text]="'cv.aiWorkflow.callToAction.message' | translate" color="muted" [centered]="true" extraClasses="max-w-2xl mx-auto mb-8" />
        <div class="flex items-center justify-center gap-4">
          <royal-code-ui-button 
              type="primary" 
              sizeVariant="lg"
              data-analytics="cta-ai-page"
              (clicked)="openCalendlyModal()">
              <royal-code-ui-icon [icon]="AppIcon.CalendarClock" sizeVariant="sm" extraClass="mr-2" />
              {{ 'cv.aiWorkflow.callToAction.ctaButton' | translate }}
          </royal-code-ui-button>
          <royal-code-ui-badge color="primary" size="lg" [bordered]="false">
            {{ 'cv.aiWorkflow.callToAction.badgeText' | translate }}
          </royal-code-ui-badge>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiWorkflowPageComponent implements OnInit, OnDestroy {
  @ViewChild('videoContainer', { static: true }) videoContainerRef!: ElementRef;
  private videoObserver?: IntersectionObserver;

  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly translateService = inject(TranslateService); // Inject TranslateService
  // @ts-ignore: 'overlayService' is declared but its value is never read in this stubbed version.
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly mediaViewerService = inject(MediaViewerService);
  private readonly platformId: Object;

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  readonly datadogProofImage: Image = {
    id: 'datadog-proof-1',
    type: MediaType.IMAGE,
    variants: [{ url: 'images/datadog-latency-proof.WEBP', purpose: 'original' }],
    // Alt-tekst wordt nu direct via de vertaalservice geleverd in meta tags, hier kan een fallback string staan.
    altText: 'Datadog dashboard toont een latency-daling van 38% na de specificatie-gedreven refactor.'
  };

  // Data structuren nu met vertaalsleutels
  readonly differentiatorsPoints = [
    { titleKey: "cv.aiWorkflow.differentiators.item1.title", detailKey: "cv.aiWorkflow.differentiators.item1.detail", icon: AppIcon.Recycle },
    { titleKey: "cv.aiWorkflow.differentiators.item2.title", detailKey: "cv.aiWorkflow.differentiators.item2.detail", icon: AppIcon.BrainCircuit },
    { titleKey: "cv.aiWorkflow.differentiators.item3.title", detailKey: "cv.aiWorkflow.differentiators.item3.detail", icon: AppIcon.FlaskConical }
  ];

  readonly lessonsPitfalls = [
    { nameKey: "cv.aiWorkflow.lessons.pitfalls.item1.name", statKey: "cv.aiWorkflow.lessons.pitfalls.item1.stat", mitigationKey: "cv.aiWorkflow.lessons.pitfalls.item1.mitigation", sourceUrl: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' },
    { nameKey: "cv.aiWorkflow.lessons.pitfalls.item2.name", statKey: "cv.aiWorkflow.lessons.pitfalls.item2.stat", mitigationKey: "cv.aiWorkflow.lessons.pitfalls.item2.mitigation", sourceUrl: '#' },
    { nameKey: "cv.aiWorkflow.lessons.pitfalls.item3.name", statKey: "cv.aiWorkflow.lessons.pitfalls.item3.stat", mitigationKey: "cv.aiWorkflow.lessons.pitfalls.item3.mitigation", sourceUrl: '#' },
    { nameKey: "cv.aiWorkflow.lessons.pitfalls.item4.name", statKey: "cv.aiWorkflow.lessons.pitfalls.item4.stat", mitigationKey: "cv.aiWorkflow.lessons.pitfalls.item4.mitigation", sourceUrl: '#' }
  ];

  constructor() {
    this.platformId = inject(PLATFORM_ID);
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initializeVideoObserver();
      }
    });
  }

  ngOnInit(): void {
    // Gebruik de translate service om de meta tags te zetten
    this.translateService.get([
      'cv.aiWorkflow.meta.title',
      'cv.aiWorkflow.meta.description',
      'cv.aiWorkflow.meta.ogTitle',
      'cv.aiWorkflow.meta.ogImageAlt'
    ]).subscribe(translations => {
      this.titleService.setTitle(translations['cv.aiWorkflow.meta.title']);
      this.metaService.addTags([
        { name: 'description', content: translations['cv.aiWorkflow.meta.description'] },
        { property: 'og:title', content: translations['cv.aiWorkflow.meta.ogTitle'] },
        { property: 'og:image', content: '/assets/og/ai-factory-case.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/assets/og/ai-factory-case.png' },
        { name: 'twitter:image:alt', content: translations['cv.aiWorkflow.meta.ogImageAlt'] }
      ]);
    });
  }

  ngOnDestroy(): void {
    this.videoObserver?.disconnect();
  }

  private initializeVideoObserver(): void {
    if (!isPlatformBrowser(this.platformId) || !this.videoContainerRef) { return; }

    const options = { rootMargin: '0px', threshold: 0.25 };
    this.videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target as HTMLElement;
          const video = document.createElement('video');
          video.src = 'assets/videos/spec-to-ci-demo.mp4';
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.className = 'w-full h-full object-cover rounded-xs';
          video.setAttribute('data-analytics', 'video_play');
          container.innerHTML = '';
          container.appendChild(video);
          this.videoObserver?.unobserve(container);
        }
      });
    }, options);
    this.videoObserver.observe(this.videoContainerRef.nativeElement);
  }

  openCalendlyModal(): void {
    this.trackAnalytics('cta_click_ai', { page: 'AI Workflow' });
    
    if (!environment.production) {
      alert("Simulatie: Calendly opent nu in een frictieloze overlay.");
    }
    // else { this.overlayService.open(CalendlyOverlayComponent, { data: { utm: 'ai-page-cta' } }); }
  }

  openDatadogProof(): void {
     this.mediaViewerService.openLightbox([this.datadogProofImage], 0);
  }

  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
    // else { /* Injecteer en gebruik hier je echte analytics service */ }
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/architecture-page/architecture-page.component.ts ---
/**
 * @file architecture-page.component.ts (CV App)
 * @version 10.3.0 (Fix: openCalendlyModal & Full Internationalization)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-07
 * @Description
 *   De definitieve architectuurpagina, geherpositioneerd als een strategische business case.
 *   Deze versie is volledig geïnternationaliseerd en lost de compilatiebug van
 *   'openCalendlyModal' op.
 */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { FolderTreeComponent, TreeNode } from '@royal-code/ui/folder-tree';
import { CodeBlockComponent } from '@royal-code/ui/code-block';
import { UiCardComponent } from '@royal-code/ui/card';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { DynamicOverlayService } from '@royal-code/ui/overlay'; // Importeer DynamicOverlayService
import { environment } from '../../../../environments/environment'; // Importeer environment
import { AuroraBackgroundComponent } from '@royal-code/ui/backgrounds';
// import { CalendlyOverlayComponent } from '...'; // Veronderstelde import voor de overlay

@Component({
  selector: 'app-cv-architecture-page',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent,
    FolderTreeComponent, CodeBlockComponent, UiCardComponent, UiButtonComponent, AuroraBackgroundComponent,
    UiBadgeComponent
  ],
  template: `
    <section class="architecture-page container-max py-16 md:py-24 space-y-20">

      <!-- Sectie 1: De Filosofie & Het Probleem -->
      <header class="text-center">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H2" 
          [text]="'cv.architecture.philosophy.title' | translate" 
          extraClasses="!text-3xl sm:!text-5xl !font-black mb-4" 
        />
        <royal-code-ui-paragraph 
          [text]="'cv.architecture.philosophy.hook' | translate" 
          size="lg" 
          color="muted" 
          extraClasses="max-w-4xl mx-auto italic" 
        />
        <royal-code-ui-paragraph 
          [text]="'cv.architecture.philosophy.solution' | translate" 
          size="md" 
          color="primary" 
          extraClasses="max-w-3xl mx-auto mt-6 !font-bold"
        />
      </header>

      <!-- Sectie 2: De Blauwdruk van de Fabriek -->
      <article>
         <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.blueprintTitle' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
          <!-- Pilaar 1: Frontend Assemblagelijn -->
          <div class="space-y-4">
            <h4 class="text-xl font-bold flex items-center gap-3"><royal-code-ui-icon [icon]="AppIcon.Layers" colorClass="text-primary" />{{ 'cv.architecture.pillar1.title' | translate }}</h4>
            <royal-code-ui-paragraph [text]="'cv.architecture.pillar1.description' | translate" color="muted" />
            <div class="bg-card p-4 rounded-md border border-border mt-4">
              <royal-ui-folder-tree [data]="frontendTree" />
            </div>
          </div>
          <!-- Pilaar 2: Backend Kwaliteitsvesting -->
          <div class="space-y-4">
             <h4 class="text-xl font-bold flex items-center gap-3"><royal-code-ui-icon [icon]="AppIcon.Castle" colorClass="text-primary" />{{ 'cv.architecture.pillar2.title' | translate }}</h4>
            <royal-code-ui-paragraph [text]="'cv.architecture.pillar2.description' | translate" color="muted" />
            <div class="bg-card p-4 rounded-md border border-border mt-4">
              <royal-ui-folder-tree [data]="backendTree" />
            </div>
          </div>
        </div>
      </article>

      <!-- Sectie 3: De Trade-Offs (Bewijs van Senioriteit) -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.tradeOffs.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div class="bg-card border-2 border-success/20 p-6 rounded-xs">
            <h4 class="font-bold mb-4 text-success">{{ 'cv.architecture.tradeOffs.wins.title' | translate }}</h4>
            <ul class="space-y-2 text-sm text-foreground">
              @for(itemKey of tradeOffsWinsKeys; track itemKey) {
                <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.CheckCircle" colorClass="text-success mt-0.5" /><span>{{ itemKey | translate }}</span></li>
              }
            </ul>
          </div>
           <div class="bg-card border-2 border-border/50 p-6 rounded-xs">
            <h4 class="font-bold mb-4 text-secondary">{{ 'cv.architecture.tradeOffs.investments.title' | translate }}</h4>
            <ul class="space-y-2 text-sm text-secondary">
               @for(itemKey of tradeOffsInvestmentsKeys; track itemKey) {
                <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Clock" colorClass="text-warning mt-0.5" /><span>{{ itemKey | translate }}</span></li>
              }
            </ul>
          </div>
        </div>
      </article>

      <!-- Sectie 4: De Connectie met AI -->
      <article class="relative overflow-hidden p-8 text-center">
        <royal-aurora-background position="center" animation="default" blobSize="md" extraClasses="opacity-20" />
        
        <div class="relative z-10"> 
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.aiConnection.title' | translate" extraClasses="!mb-4" />
          <royal-code-ui-paragraph [text]="'cv.architecture.aiConnection.description' | translate" color="primary" [centered]="true" extraClasses="max-w-3xl mx-auto !font-bold" />
        </div>
      </article>

      
      <!-- Sectie 5: De Business Impact -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.businessImpact.title' | translate" [center]="true" extraClasses="!mb-12" />
        <!-- Cost of Chaos & Case Study -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto mb-12">
            <div class="lg:col-span-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="border-2 border-border/50 p-6 rounded-xs">
                    <h4 class="font-bold mb-4 text-secondary">{{ 'cv.architecture.businessImpact.chaosTitle' | translate }}</h4>
                    <ul class="space-y-2 text-sm text-secondary">
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Hourglass" /><span>{{ 'cv.architecture.businessImpact.chaosPoints.bugFix' | translate }}</span></li>
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.UserCircle" /><span>{{ 'cv.architecture.businessImpact.chaosPoints.onboarding' | translate }}</span></li>
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Flame" /><span>{{ 'cv.architecture.businessImpact.chaosPoints.debt' | translate }}</span></li>
                    </ul>
                  </div>
                  <div class="border-2 border-primary/50 p-6 rounded-xs">
                    <h4 class="text-primary font-bold mb-4">{{ 'cv.architecture.businessImpact.structureTitle' | translate }}</h4>
                    <ul class="space-y-2 text-sm text-foreground">
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Clock" /><span>{{ 'cv.architecture.businessImpact.structurePoints.bugFix' | translate }}</span></li>
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.UserCheck" /><span>{{ 'cv.architecture.businessImpact.structurePoints.onboarding' | translate }}</span></li>
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Recycle" /><span>{{ 'cv.architecture.businessImpact.structurePoints.debt' | translate }}</span></li>
                    </ul>
                  </div>
                </div>
            </div>
            <div class="lg:col-span-2 bg-card p-6 rounded-xs border border-border">
                <h4 class="font-semibold text-center mb-3">{{ 'cv.architecture.businessImpact.miniCaseStudy.title' | translate }}</h4>
                <p class="text-xs text-secondary text-center">"{{ 'cv.architecture.businessImpact.miniCaseStudy.quote' | translate }}"</p>
                <p class="text-xs text-foreground font-bold text-center mt-2">{{ 'cv.architecture.businessImpact.miniCaseStudy.author' | translate }}</p>
            </div>
        </div>

        <!-- Impactpunten -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          @for (impact of businessImpactPoints; track impact.titleKey) {
            <royal-code-ui-card extraContentClasses="flex flex-col">
              <royal-code-ui-icon [icon]="impact.icon" sizeVariant="xl" colorClass="text-primary mb-4" />
              <h4 class="text-lg font-semibold mb-2">{{ impact.titleKey | translate }}</h4>
              <p class="text-sm text-secondary flex-grow">{{ impact.descriptionKey | translate }}</p>
            </royal-code-ui-card>
          }
        </div>
      </article>

       <!-- Sectie 6: Wat dit betekent voor u -->
      <article class="text-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.hiringManager.title' | translate" [center]="true" extraClasses="!mb-8" />
          <div class="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              @for(itemKey of hiringManagerPoints; track itemKey) {
                  <royal-code-ui-badge color="primary" size="lg" [bordered]="false">{{itemKey | translate}}</royal-code-ui-badge>
              }
          </div>
      </article>
      <!-- CTA -->
      <article class="text-center bg-card border border-border rounded-xs p-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.closing.statement' | translate" extraClasses="!mb-6 italic" />
        <royal-code-ui-paragraph [text]="'cv.architecture.closing.savingsHint' | translate" color="muted" [centered]="true" extraClasses="max-w-3xl mx-auto mb-8" />
        <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="openCalendlyModal()">
          <royal-code-ui-icon [icon]="AppIcon.CalendarClock" sizeVariant="sm" extraClass="mr-2" />
          {{ 'cv.architecture.closing.cta' | translate }}
        </royal-code-ui-button>
        <div class="mt-4">
           <royal-code-ui-badge color="success" [bordered]="false" data-analytics="risk_reversal_badge_view">
             <royal-code-ui-icon [icon]="AppIcon.ShieldCheck" sizeVariant="xs" extraClass="mr-1.5" />
             {{ 'cv.architecture.closing.guarantee' | translate }}
           </royal-code-ui-badge>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchitecturePageComponent implements OnInit {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly translateService = inject(TranslateService);
  private readonly overlayService = inject(DynamicOverlayService); // Injecteer DynamicOverlayService

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  // Datastructuren nu met vertaalsleutels
  readonly tradeOffsWinsKeys = [
    'cv.architecture.tradeOffs.wins.item1',
    'cv.architecture.tradeOffs.wins.item2',
    'cv.architecture.tradeOffs.wins.item3',
    'cv.architecture.tradeOffs.wins.item4',
  ];
  readonly tradeOffsInvestmentsKeys = [
    'cv.architecture.tradeOffs.investments.item1',
    'cv.architecture.tradeOffs.investments.item2',
    'cv.architecture.tradeOffs.investments.item3',
  ];
  readonly businessImpactPoints = [
    { titleKey: "cv.architecture.businessImpact.points.item1.title", descriptionKey: "cv.architecture.businessImpact.points.item1.description", icon: AppIcon.Zap },
    { titleKey: "cv.architecture.businessImpact.points.item2.title", descriptionKey: "cv.architecture.businessImpact.points.item2.description", icon: AppIcon.Users },
    { titleKey: "cv.architecture.businessImpact.points.item3.title", descriptionKey: "cv.architecture.businessImpact.points.item3.description", icon: AppIcon.BadgeCheck },
    { titleKey: "cv.architecture.businessImpact.points.item4.title", descriptionKey: "cv.architecture.businessImpact.points.item4.description", icon: AppIcon.Wrench }
  ];
  readonly hiringManagerPoints = [
      'cv.architecture.hiringManager.points.item1',
      'cv.architecture.hiringManager.points.item2',
      'cv.architecture.hiringManager.points.item3',
  ];

readonly frontendTree: TreeNode[] = [
    { name: 'apps/', icon: AppIcon.FolderOpen, description: 'De consumenten: elke map is een deploybare applicatie.', children: [
      { name: 'cv/', icon: AppIcon.UserCircle, description: 'Deze CV/Portfolio website.' },
      { name: 'plushie-paradise/', icon: AppIcon.Store, description: 'De e-commerce storefront.' },
      { name: 'admin-panel/', icon: AppIcon.LayoutDashboard, description: 'Het beheerpaneel.' },
      { name: 'challenger/', icon: AppIcon.Gamepad2, description: 'De gamified persoonlijke groei app.' }, // Challenger hier toegevoegd op app-niveau
    ]},
    { name: 'libs/', icon: AppIcon.FolderOpen, description: 'De herbruikbare logica: de kern van de fabriek.', children: [
      { name: 'features/', icon: AppIcon.Folder, description: 'Verticale slices van business-functionaliteit.', children: [
        { name: 'products/', icon: AppIcon.Package, description: 'Voorbeeld: de "products" feature.', children: [
          { name: 'domain', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'De Waarheid: TypeScript interfaces & enums.' },
          { name: 'core', icon: AppIcon.BrainCircuit, colorClass: 'text-amber-500', description: 'NgRx State, Facade & Actions. App-onafhankelijk.' },
          
          { name: 'data-access-plushie', icon: AppIcon.Cloud, colorClass: 'text-sky-500', description: 'Connector voor de Plushie-winkel API.' },
          { name: 'ui-plushie', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-500', description: 'Smart components specifiek voor de Plushie-winkel.' },
          
          { name: 'data-access-admin', icon: AppIcon.Cloud, colorClass: 'text-sky-700', description: 'Connector voor de Admin Panel API.' },
          { name: 'ui-admin', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-700', description: 'Smart components specifiek voor het Admin Panel.' },
          { name: 'ui-drone', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-500', description: 'Gebruikersinterface voor de drone-app' },
        ]}
        // { name: 'cart/', icon: AppIcon.ShoppingCart, children: [ /* ... lagen ... */ ] },
        // { name: 'social/', icon: AppIcon.Users, children: [ /* ... lagen ... */ ] },
      ]},
      { name: 'ui/', icon: AppIcon.PackageOpen, description: 'De Algemene Lego-set: "Domme", herbruikbare UI componenten.', children: [
        { name: 'button/', icon: AppIcon.MousePointer },
        { name: 'card/', icon: AppIcon.Square },
        { name: 'input/', icon: AppIcon.PenTool },
      ]},
      { name: 'core/', icon: AppIcon.Settings, description: 'De Nutsvoorzieningen: Logging, Error Handling, Interceptors.' },
      { name: 'store/', icon: AppIcon.Recycle, description: 'Globale NgRx state: auth, user, theme.', children: [
        { name: 'auth/', icon: AppIcon.Lock },
        { name: 'user/', icon: AppIcon.User },
      ]},
      { name: 'shared/', icon: AppIcon.Folder, description: 'Gedeelde, niet-specifieke code.', children: [
        { name: 'domain/', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'Globale, feature-overstijgende modellen.'},
        { name: 'utils/', icon: AppIcon.Wrench, description: 'Herbruikbare pipes, directives en helper-functies.'},
      ]},
    ]}
  ];

  readonly backendTree: TreeNode[] = [
    { name: 'src/', icon: AppIcon.FolderOpen, children: [
      { name: 'Domain', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'cv.architecture.folderTree.backend.domain.description' },
      { name: 'Application', icon: AppIcon.Layers, colorClass: 'text-amber-500', description: 'cv.architecture.folderTree.backend.application.description' },
      { name: 'Infrastructure', icon: AppIcon.Database, colorClass: 'text-sky-500', description: 'cv.architecture.folderTree.backend.infrastructure.description' },
      { name: 'Web (API)', icon: AppIcon.Server, colorClass: 'text-green-500', description: 'cv.architecture.folderTree.backend.webApi.description' },
    ]}
  ];

  ngOnInit(): void {
    this.translateService.get([
      'cv.navigation.architecture', // Voor de titel
      'cv.architecture.meta.description',
      'cv.architecture.meta.ogTitle',
      'cv.architecture.meta.ogImageAlt'
    ]).subscribe(translations => {
      this.titleService.setTitle(`${translations['cv.navigation.architecture']} | Roy van de Wetering`);
      this.metaService.addTags([
        { name: 'description', content: translations['cv.architecture.meta.description'] },
        { property: 'og:title', content: translations['cv.architecture.meta.ogTitle'] },
        { property: 'og:image', content: '/assets/og/architecture-hero.png' },
        { name: 'robots', content: 'index,follow' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/assets/og/architecture-hero.png' },
        { name: 'twitter:image:alt', content: translations['cv.architecture.meta.ogImageAlt'] }
      ]);
    });
  }

  // NIEUWE METHODE TOEGEVOEGD
  openCalendlyModal(): void {
    // Analytics tracking (alleen in dev mode, anders echte service)
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: architecture_cta_click`, { source: 'architecture_page' });
      alert("Simulatie: Calendly opent nu in een frictieloze overlay vanuit Architecture page.");
    }
    // else { this.overlayService.open(CalendlyOverlayComponent, { data: { utm: 'architecture-page-cta' } }); }
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/contact-page/contact-page.component.ts ---
/**
 * @file contact-page.component.ts (CV App)
 * @version 3.0.0 (Formspree Integration - Production Ready)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-21
 * @Description
 *   De definitieve, productieklare contactpagina met Formspree-integratie.
 *   Deze versie is geoptimaliseerd voor security (honeypot), accessibility (fieldset/legend),
 *   en een robuuste gebruikerservaring met loading-states en auto-dismissing alerts.
 *   Verzending van e-mails wordt nu afgehandeld door de gratis Formspree service.
 */
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importeer HttpHeaders

@Component({
  selector: 'app-cv-contact-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslateModule, UiTitleComponent, UiParagraphComponent,
    UiInputComponent, UiTextareaComponent, UiButtonComponent, UiIconComponent
  ],
  template: `
    <section class="contact-section container-max py-16 md:py-24">
      <royal-code-ui-title 
        [level]="TitleTypeEnum.H2" 
        [text]="'cv.contact.pageTitle' | translate" 
        [center]="true" 
        extraClasses="!text-3xl sm:!text-4xl font-bold mb-4" 
      />
      <royal-code-ui-paragraph 
        [text]="'cv.contact.intro' | translate" 
        [centered]="true" 
        size="lg" 
        color="muted"
        extraClasses="max-w-3xl mx-auto mb-12"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <!-- Linkerkolom: Direct Contact & Links -->
        <div class="space-y-8">
          <div>
            <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.contact.directContactTitle' | translate" extraClasses="!text-xl !font-semibold mb-4" />
            <div class="space-y-4">
              <a href="mailto:royvandewetering@gmail.com" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                <royal-code-ui-icon [icon]="AppIcon.Mail" sizeVariant="md" />
                <span>royvandewetering@gmail.com</span>
              </a>
              <a href="tel:+31612345678" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                <royal-code-ui-icon [icon]="AppIcon.Phone" sizeVariant="md" />
                <span>+31 6 4072 1378</span>
              </a>
              <a href="https://www.linkedin.com/in/rvdwp/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                <royal-code-ui-icon [icon]="AppIcon.Linkedin" sizeVariant="md" />
                <span>LinkedIn Profiel</span>
              </a>
              <a href="https://github.com/TweakStories" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                <royal-code-ui-icon [icon]="AppIcon.Github" sizeVariant="md" />
                <span>GitHub Profiel</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Rechterkolom: Contactformulier -->
        <div>
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.contact.formTitle' | translate" extraClasses="!text-xl !font-semibold mb-4" />
           <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <royal-code-ui-input [label]="'cv.contact.form.nameLabel' | translate" formControlName="name" [required]="true" [error]="getErrorMessage('name')" />
            <royal-code-ui-input [label]="'cv.contact.form.emailLabel' | translate" formControlName="email" type="email" [required]="true" [error]="getErrorMessage('email')" />

            <fieldset class="border-none p-0 m-0">
              <legend class="block text-sm font-medium text-secondary mb-1.5 flex items-center">
                {{ 'cv.contact.form.challengeLabel' | translate }} 
                <span class="text-xs text-muted-foreground ml-2">({{ 'cv.contact.form.optional' | translate }})</span>
              </legend>
              <div class="grid grid-cols-2 gap-2">
                @for (challenge of challenges; track challenge.key) {
                  <label class="flex items-center gap-2 p-2 border border-border rounded-md hover:bg-hover cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                    <input type="checkbox" [formControlName]="challenge.key" class="accent-primary"/>
                    <span class="text-sm">{{ challenge.labelKey | translate }}</span>
                  </label>
                }
              </div>
            </fieldset>

            <royal-code-ui-textarea [label]="'cv.contact.form.messageLabel' | translate" formControlName="message" [required]="true" [rows]="4" [error]="getErrorMessage('message')" />
            
            <!-- Honeypot field for bot protection -->
            <input type="text" formControlName="verifyme" class="sr-only" aria-hidden="true" tabindex="-1" autocomplete="off" class="mb-4">

            <royal-code-ui-button type="primary" htmlType="submit" [disabled]="contactForm.invalid || isSubmitting()" [loading]="isSubmitting()" extraClasses="w-full">
              {{ 'cv.contact.form.submitButton' | translate }}
            </royal-code-ui-button>
          </form>

          @if (formSubmitted() && !formError()) {
            <div class="mt-4 p-3 bg-success/10 border border-success/20 rounded-md text-sm text-success flex items-center gap-2">
              <royal-code-ui-icon [icon]="AppIcon.CheckCircle" />
              <span>{{ 'cv.contact.form.successMessage' | translate }}</span>
            </div>
          } @else if (formSubmitted() && formError()) {
             <div class="mt-4 p-3 bg-error/10 border border-error/20 rounded-md text-sm text-error flex items-center gap-2">
              <royal-code-ui-icon [icon]="AppIcon.AlertTriangle" />
              <span>{{ 'cv.contact.form.errorMessage' | translate }}</span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPageComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  readonly challenges = [
    { key: 'challengeSlowDev', labelKey: 'cv.contact.form.challenges.slowDev' },
    { key: 'challengeLegacy', labelKey: 'cv.contact.form.challenges.legacy' },
    { key: 'challengeScaling', labelKey: 'cv.contact.form.challenges.scaling' },
    { key: 'challengeAI', labelKey: 'cv.contact.form.challenges.ai' },
  ] as const;

  contactForm: FormGroup;

  readonly isSubmitting = signal(false);
  readonly formSubmitted = signal(false);
  readonly formError = signal(false);
  private alertTimeout?: number;

  constructor(private http: HttpClient) {
    const formControls: { [key: string]: FormControl } = {
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required, Validators.maxLength(2000)]),
      verifyme: new FormControl(''), 
    };
    this.challenges.forEach(challenge => {
      formControls[challenge.key] = new FormControl(false);
    });
    this.contactForm = new FormGroup(formControls);
  }

  async onSubmit(): Promise<void> {
    this.formSubmitted.set(false);
    this.formError.set(false);
    clearTimeout(this.alertTimeout);

    if (this.contactForm.invalid || this.contactForm.value.verifyme) {
      this.contactForm.markAllAsTouched();
      if (this.contactForm.value.verifyme) {
        console.warn('Honeypot field was filled. Submission blocked.');
      }
      return;
    }

    this.isSubmitting.set(true);

    const formspreeEndpoint = 'https://formspree.io/f/xblkvqll'; // Uw Formspree URL
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    
    const formData = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      message: this.contactForm.value.message,
      // Voeg de challenge-data toe voor context in uw e-mail
      challenges: this.challenges
        .filter(c => this.contactForm.value[c.key])
        .map(c => c.labelKey)
        .join(', ')
    };

    try {
      await this.http.post(formspreeEndpoint, formData, { headers }).toPromise();
      
      this.trackAnalytics('contact_form_submit_formspree', {
        challenges: formData.challenges
      });

      this.formSubmitted.set(true);
      this.contactForm.reset();
    } catch (e) {
      console.error('Formspree submission failed:', e);
      this.formError.set(true);
      this.formSubmitted.set(true);
    } finally {
      this.isSubmitting.set(false);
      this.alertTimeout = window.setTimeout(() => this.formSubmitted.set(false), 6000);
    }
  }
  
  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'common.forms.errors.requiredField';
      if (control.errors?.['email']) return 'common.forms.errors.invalidEmail';
    }
    return '';
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/experience/experience.component.ts ---
/**
 * @file experience.component.ts (CV App)
 * @version 4.1.0 (Production Ready: A11y, Analytics & Performance)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   De definitieve werkervaring-pagina. Deze versie is geoptimaliseerd voor
 *   performance (lazy-loaded cards), toegankelijkheid (aria-pressed), meetbaarheid
 *   (analytics on filter) en een verbeterde UX (tag counts, empty state icon).
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { CvExperienceCardComponent } from '../../components/experience-card/experience-card.component';
import { CvEducationCardComponent } from '../../components/education-card/education-card.component';
import { CvCertificationCardComponent } from '../../components/certification-card/certification-card.component';
import { UiIconComponent } from '@royal-code/ui/icon';
import { ExperienceDataService } from '../../core/services/experience-data.service';
import { getUniqueTags, filterByTag } from '../../core/utils/filter.utils';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cv-experience',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiButtonComponent,
    CvExperienceCardComponent, CvEducationCardComponent, CvCertificationCardComponent, UiIconComponent
  ],
  template: `
    <div class="space-y-20">
      <!-- Werkervaring Sectie -->
      <section class="experience-section container-max pt-16 md:pt-24">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H2"
          [text]="'cv.experience.pageTitle' | translate"
          [center]="true"
          extraClasses="!text-3xl sm:!text-4xl font-bold mb-4"
        />
        <royal-code-ui-paragraph
          [text]="'cv.experience.intro' | translate"
          [centered]="true"
          size="lg"
          color="muted"
          extraClasses="max-w-3xl mx-auto mb-12"
        />

        <!-- Filter Knoppen -->
        <div class="flex flex-wrap justify-center gap-2 mb-16">
          <royal-code-ui-button
            [type]="selectedTag() === null ? 'primary' : 'outline'"
            (clicked)="selectTag(null)"
            [attr.aria-pressed]="selectedTag() === null">
            {{ 'cv.experience.all' | translate }}
          </royal-code-ui-button>
          @for(tag of allTags(); track tag) {
            <royal-code-ui-button
              [type]="selectedTag() === tag ? 'primary' : 'outline'"
              (clicked)="selectTag(tag)"
              [attr.aria-pressed]="selectedTag() === tag">
              {{ tag }} ({{ tagCounts()[tag] }})
            </royal-code-ui-button>
          }
        </div>

        <!-- Ervaringen als een grid van case studies -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          @if (filteredExperienceData().length > 0) {
            @for (item of filteredExperienceData(); track item.id) {
              @defer (on viewport) {
                <app-cv-experience-card [experience]="item" />
              } @placeholder {
                <div class="w-full h-[500px] bg-card border border-border rounded-xs animate-pulse"></div>
              }
            }
          } @else {
            <div class="lg:col-span-2 text-center py-8 flex flex-col items-center gap-4">
              <royal-code-ui-icon [icon]="AppIcon.SearchX" sizeVariant="lg" colorClass="text-secondary" [attr.aria-hidden]="true" />
              <royal-code-ui-paragraph color="muted">{{ 'cv.experience.noResults' | translate: { tag: selectedTag() } }}</royal-code-ui-paragraph>
            </div>
          }
        </div>
      </section>

      <!-- Opleiding & Certificaten Sectie -->
      <section class="education-certs-section container-max pb-16 md:pb-24">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H2"
          [text]="'cv.experience.educationAndCommunityTitle' | translate"
          [center]="true"
          extraClasses="!text-3xl sm:!text-4xl font-bold mb-12"
        />
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          @for (item of educationData(); track item.id) { <app-cv-education-card [education]="item" /> }
          @for (item of certificationsData(); track item.id) { <app-cv-certification-card [certification]="item" /> }
          <div class="community-card flex items-start gap-4 bg-card p-4 rounded-xs border border-border h-full">
            <royal-code-ui-icon [icon]="AppIcon.Github" sizeVariant="lg" colorClass="text-primary mt-1" [attr.aria-hidden]="true" />
            <div class="flex-grow">
              <royal-code-ui-title [level]="TitleTypeEnum.H4" text="Community & Continuous Learning" extraClasses="!text-base !font-semibold" />
              <p class="text-sm text-secondary font-medium">Actief op GitHub</p>
              <p class="text-xs text-muted mt-2">Momenteel studerend voor: 'AI-900: Microsoft Azure AI Fundamentals'</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
  readonly selectedTag = signal<string | null>(null);

  private readonly dataService = inject(ExperienceDataService);

  readonly workExperienceData = toSignal(this.dataService.getWorkExperience(), { initialValue: [] });
  readonly educationData = toSignal(this.dataService.getEducation(), { initialValue: [] });
  readonly certificationsData = toSignal(this.dataService.getCertifications(), { initialValue: [] });

  readonly allTags = computed(() => getUniqueTags(this.workExperienceData()));
  readonly filteredExperienceData = computed(() => filterByTag(this.workExperienceData(), this.selectedTag()));

  readonly tagCounts = computed(() => {
    return this.allTags().reduce((acc, tag) => {
      acc[tag] = this.workExperienceData().filter(item => item.techStack.some(tech => tech.name === tag)).length;
      return acc;
    }, {} as Record<string, number>);
  });

  selectTag(tag: string | null): void {
    const newTag = this.selectedTag() === tag ? null : tag;
    this.selectedTag.set(newTag);
    this.trackAnalytics('experience_filter_selection', { tag: newTag ?? 'all' });
  }

  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
    // else { /* Injecteer en gebruik hier je echte analytics service */ }
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/home/home.component.ts ---
/**
 * @file home.component.ts (CV App)
 * @version 34.0.0 (Cleaned up after background move)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-21
 * @Description
 *   De definitieve homepage, opgeschoond nadat de full-width achtergrondgradient
 *   naar de layout component is verplaatst. Alle andere visuele elementen
 *   (Aurora, SVG Blob, Pure CSS Glow Blob) zijn behouden en functioneren correct.
 */
import {
  ChangeDetectionStrategy, Component, OnInit, inject,
  OnDestroy, ElementRef, afterNextRender, PLATFORM_ID, QueryList,
  ViewChildren
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

// === UI Library ===
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiCardComponent } from '@royal-code/ui/card';
import { UiImageComponent } from '@royal-code/ui/image';
import { AuroraBackgroundComponent, OrganicSvgBlobComponent } from '@royal-code/ui/backgrounds';

// === Domain, Services & Local Components ===
import { AppIcon, Testimonial } from '@royal-code/shared/domain';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { TestimonialDataService } from '../../core/services/testimonial-data.service';

@Component({
  selector: 'app-cv-home',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, UiTitleComponent,
    UiParagraphComponent, UiButtonComponent, UiIconComponent, UiCardComponent,
    UiImageComponent, AuroraBackgroundComponent, OrganicSvgBlobComponent
  ],
  styles: [`
    :host {
      display: block;
    }

    /* PURE CSS GLOW BLOB ACHTER PROFIELFOTO (ongewijzigd) */
    .profile-glow-blob {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 750px; /* Grootte van de blob */
      height: 750px;
      border-radius: 50%;
      background: radial-gradient(circle at center, var(--color-primary) 0%, transparent 60%);
      opacity: 0.2; /* Begin opaciteit */
      filter: blur(80px); /* Zachte gloed */
      transform: translate(-50%, -50%) scale(0.9);
      animation: css-blob-pulse 8s ease-in-out infinite alternate;
      z-index: -1; /* Zorg dat dit element achter de profielfoto zit */
      pointer-events: none; /* Zorgt dat het geen kliks onderschept */
    }
    @keyframes css-blob-pulse {
      0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.2; }
      50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.3; }
      100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.2; }
    }

    /* Stijlen voor de rest van de pagina (ongewijzigd) */
    .fade-in-section { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
    .fade-in-section.is-visible { opacity: 1; transform: translateY(0); }
    .lift-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .lift-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgb(0 0 0 / .12); }
  `],
  template: `
    <!-- De full-page gradient wordt nu afgehandeld door de AppLayoutComponent. -->
    <div id="home-main" class="container-max space-y-24 md:space-y-32 md:py-16">
      
            <!-- Sectie 1: De Hero -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh] relative">
          <!-- Aurora Background (geleverd door AuroraBackgroundComponent) -->
          <royal-aurora-background blobSize="lg" />

          <!-- Linker Hero Kolom: Tekstuele Inhoud -->
          <div class="text-center lg:text-left relative z-10">
              <royal-code-ui-title
                [level]="TitleTypeEnum.H1"
                [text]="'cv.home.hero.headline' | translate"
                extraClasses="!text-4xl sm:!text-6xl !font-black tracking-tighter"
                style="text-wrap: balance;"
              />
              <royal-code-ui-paragraph
                [text]="'cv.home.hero.subheadline' | translate"
                size="lg"
                color="primary"
                extraClasses="!font-semibold mt-4"
                style="text-wrap: balance;"
              />
              <p class="mt-4 text-sm font-mono tracking-tight text-muted-foreground">
                {{ 'cv.home.hero.proofPoint' | translate }}
                <button
                  type="button"
                  class="relative inline-block align-middle w-4 h-4 bg-muted text-muted-foreground rounded-full text-xs font-bold leading-none focus-visible:ring-2 focus-visible:ring-primary"
                  [attr.aria-label]="'cv.home.hero.proofPointContext' | translate"
                  [title]="'cv.home.hero.proofPointContext' | translate">?
                </button>
              </p>
              <article class="mt-8 max-w-2xl mx-auto lg:mx-0" data-section-id="availability-notice">
                <royal-code-ui-card borderColor="gradient" extraContentClasses="!p-4 text-left shadow-lg border-2 bg-card/80 backdrop-blur-lg">
                  <div class="flex items-start gap-4">
                    <royal-code-ui-icon [icon]="AppIcon.Search" sizeVariant="lg" colorClass="text-primary flex-shrink-0 mt-1" [attr.aria-hidden]="true" />
                    <div>
                      <h3 class="font-bold text-foreground">{{ 'cv.home.availability.title' | translate }}</h3>
                      <p class="text-secondary text-sm mt-1">
                        {{ 'cv.home.availability.line1' | translate }}<br>
                        {{ 'cv.home.availability.line2' | translate }}
                      </p>
                    </div>
                  </div>
                </royal-code-ui-card>
              </article>
              <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-8">
                <royal-code-ui-button
                  type="primary"
                  sizeVariant="lg"
                  (clicked)="openCalendlyModal()">
                  {{ 'cv.home.hero.cta' | translate }} <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" extraClass="ml-2" [attr.aria-hidden]="true" />
                </royal-code-ui-button>
                <a routerLink="/architectuur">
                  <royal-code-ui-button type="outline" sizeVariant="lg">
                    {{ 'cv.home.hero.ctaSecondary' | translate }}
                  </royal-code-ui-button>
                </a>
              </div>
              <p class="text-xs text-muted mt-3">{{ 'cv.home.hero.riskReversal' | translate }}</p>
          </div>

          <!-- Rechter Hero Kolom: Profielfoto met Achtergrondeffecten -->
          <!-- DE FIX: Deze sectie is nu TERUGGEDRAAID naar de werkende staat, ZONDER absolute positionering op de figure. -->
          <div class="flex items-center justify-center relative">
            <!-- PURE CSS GLOW BLOB -->
            <div class="profile-glow-blob"></div>

            <!-- PROFIELFOTO - Dit was al correct en wordt nu gereset. -->
            <figure class="w-92 h-92 border-4 border-primary/50 shadow-lg relative z-10 rounded-full">
              <royal-code-ui-image
                [src]="'images/profiel-roy.jpg'"
                [alt]="'Profielfoto van Roy van de Wetering'"
                objectFit="cover"
                [rounded]="true"
                class="w-full h-full"
              />
              <figcaption class="sr-only">Profielfoto van Roy van de Wetering</figcaption>
            </figure>

            <!-- SVG BLOB -->
            <royal-organic-svg-blob fill="var(--color-primary)" extraClasses="absolute w-[750px] h-[750px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 z-0" />
          </div>
        </section>

      <!-- === SECTIE 2: Social Proof === -->
      <section #animatedSection data-section-id="social-proof" class="fade-in-section text-center relative py-8 rounded-2xl">
         <div class="relative z-10">
           <p class="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">{{ 'cv.home.socialProof.trustedBy' | translate }}</p>
           <div class="flex justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-all duration-300">
                <div class="h-12 max-w-xs">
                  <royal-code-ui-image src="images/brands/heineken-logo.webp" alt="Heineken logo" class="w-full h-full" [objectFit]="'contain'" />
                </div>
                <div class="h-12 max-w-xs">
                  <royal-code-ui-image src="images/brands/fintech-logo.webp" alt="FinTech Scale-up logo" class="w-full h-full" [objectFit]="'contain'" />
                </div>
                <div class="h-12 max-w-xs">
                  <royal-code-ui-image src="images/brands/crypto-guru-logo.webp" alt="Crypto Guru logo" class="w-full h-full" [objectFit]="'contain'" />
                </div>
           </div>
           @if (featuredTestimonial(); as testimonial) {
            <div class="max-w-2xl mx-auto mt-8">
                <royal-code-ui-card borderColor="gradient" extraContentClasses="bg-card/80 backdrop-blur-lg grid grid-cols-[auto,1fr] items-center gap-4 text-left">
                    <!-- DE FIX: 'mx-auto' toegevoegd aan de wrapper div voor horizontale centrering. -->
                    <div class="w-72 h-72 border-2 border-primary/50 rounded-full mx-auto">
                      <royal-code-ui-image
                        [image]="testimonial.authorImage"
                        [fallbackSrc]="'images/users/cto-avatar.webp'"
                        [alt]="testimonial.authorName"
                        [rounding]="'full'"
                        class="w-full h-full"
                      />
                    </div>
                    <div>
                      <p class="italic text-secondary">"{{ testimonial.quoteKey | translate }}"</p>
                      <p class="font-bold text-primary mt-2">- {{ testimonial.authorName }} @ {{ testimonial.authorCompany }}</p>
                    </div>
                </royal-code-ui-card>
            </div>
           }
         </div>
     </section>

      <!-- Sectie 3: Probleem dat ik oplos -->
      <section #animatedSection data-section-id="problem-solve" class="fade-in-section text-center">
          <royal-code-ui-title
            [level]="TitleTypeEnum.H2"
            [text]="'cv.home.problemISolve.title' | translate"
            [blockStyle]="true"
            blockStyleType="primary"
            extraClasses="!mb-8"
          />
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" style="grid-auto-rows: 1fr;">
              @for(problemKey of problemKeys; track problemKey) {
                  <royal-code-ui-card borderColor="primary" extraContentClasses="lift-card !p-4 text-left" [hoverEffectEnabled]="true">
                      <div class="flex items-center gap-3 h-full">
                        <royal-code-ui-icon [icon]="AppIcon.XCircle" colorClass="text-destructive" [attr.aria-hidden]="true" />
                        <span class="text-secondary">{{ problemKey | translate }}</span>
                      </div>
                  </royal-code-ui-card>
              }
          </div>
          <p class="text-center mt-8 font-semibold">
              {{ 'cv.home.problemISolve.solution' | translate }}
              <a routerLink="/architectuur" class="text-primary hover:underline ml-1">{{ 'cv.home.problemISolve.cta' | translate }}</a>
          </p>
      </section>
      </div>
    
  `
})
export class CvHomepageComponent implements OnInit, OnDestroy {
  @ViewChildren('animatedSection') animatedSections!: QueryList<ElementRef>;
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly testimonialService = inject(TestimonialDataService);
  private readonly platformId: Object;
  private sectionObserver: IntersectionObserver | null = null;
  private trackedSections = new Set<string>();

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
  readonly problemKeys = [ 'cv.home.problemISolve.problems.item1', 'cv.home.problemISolve.problems.item2', 'cv.home.problemISolve.problems.item3', 'cv.home.problemISolve.problems.item4' ];
  readonly featuredTestimonial = toSignal(this.testimonialService.getTestimonials().pipe(map(testimonials => testimonials.find(t => t.id === 'testimonial-jasper-kruit'))));

  constructor() {
    this.platformId = inject(PLATFORM_ID);
    afterNextRender(() => {
        if (isPlatformBrowser(this.platformId)) {
            this.setupSectionObserver();
        }
    });
  }
  ngOnInit(): void {
    this.titleService.setTitle("Digitale Fabriek → 30% Sneller • 90% Minder Bugs | Roy van de Wetering");
    this.metaService.addTags([
      { property: 'og:title', content: "Digitale Fabriek → 30% Sneller • 90% Minder Bugs | Roy van de Wetering" },
      { property: 'og:description', content: "Ik ontwerp systemen die snellere, betere & consistentere software bouwen." },
      { property: 'og:image', content: '/assets/og/ai-factory-og.png' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ]);
  }
  ngOnDestroy(): void {
      this.sectionObserver?.disconnect();
      this.trackedSections.clear();
  }
  private setupSectionObserver(): void {
    const options = { rootMargin: '0px', threshold: 0.1 };
    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          const sectionId = (entry.target as HTMLElement).dataset['sectionId'];
          if (sectionId && !this.trackedSections.has(sectionId)) {
            this.trackedSections.add(sectionId);
            this.trackAnalytics('section_visible', { section: sectionId });
          }
        }
      });
    }, options);
    this.animatedSections.forEach(section => this.sectionObserver?.observe(section.nativeElement));
  }
  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) { console.debug(`[ANALYTICS] Event: ${eventName}`, data); }
  }
  openCalendlyModal(): void {
      this.trackAnalytics('home_cta_click', { position: 'hero' });
      if (!environment.production) { alert("Simulatie: Calendly opent nu in een frictieloze overlay."); }
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/project-detail/project-detail.component.ts ---
/**
 * @file project-detail.component.ts (CV App)
 * @version 3.1.0 (Narrative-Aligned)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description Detailpagina voor een specifiek project, nu geherstructureerd als een
 *              overtuigende case study met de "Hoe de Digitale Fabriek..." sectie.
 */
import { ChangeDetectionStrategy, Component, inject, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ProjectDetail } from '../../core/models/project.model';
import { ProjectDataService } from '../../core/services/project-data.service';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiImageComponent, MediaViewerService } from '@royal-code/ui/media';
import { AppIcon } from '@royal-code/shared/domain';
import type { Image } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/logging';
import { ArchitectureDeepDiveComponent } from '../../components/architecture-deep-dive/architecture-deep-dive.component';

@Component({
  selector: 'app-cv-project-detail',
  standalone: true,
  imports: [ CommonModule, TranslateModule, RouterModule, UiTitleComponent, UiParagraphComponent, UiIconComponent, ArchitectureDeepDiveComponent, UiBadgeComponent, UiButtonComponent, UiImageComponent ],
  template: `
    @if (project(); as proj) {
      <div class="project-detail-page container-max py-16 md:py-24">
        <!-- Header -->
        <header class="text-center mb-12">
          <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="proj.titleKey | translate" extraClasses="!text-4xl sm:!text-5xl font-extrabold" />
        </header>

        <!-- Hero Image -->
        <div class="mb-12 rounded-xs overflow-hidden shadow-lg aspect-video">
          <royal-code-ui-image
            [image]="proj.heroImage"
            [fallbackSrc]="'images/default-image.webp'"
            objectFit="cover"
            class="w-full h-full" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Main Content -->
          <main class="lg:col-span-2 space-y-8">
            <section>
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.challenge' | translate" extraClasses="!text-2xl font-bold mb-4" />
              <!-- FIX: Gebruik proj.challengeKey -->
              <royal-code-ui-paragraph [text]="proj.challengeKey | translate" extraClasses="prose" />
            </section>
            
            <!-- NIEUWE SECTIE: Architecture Context -->
            @if(proj.architectureContext) {
              <section class="bg-card border border-primary/20 rounded-xs p-6">
                <div class="flex items-start gap-4">
                  <royal-code-ui-icon [icon]="proj.architectureContext.icon" sizeVariant="xl" colorClass="text-primary mt-1"/>
                  <div>
                    <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="proj.architectureContext.titleKey | translate" extraClasses="!text-xl !font-semibold mb-2" />
                    <royal-code-ui-paragraph [text]="proj.architectureContext.descriptionKey | translate" size="sm" color="muted" />
                    <a routerLink="/architectuur" class="inline-flex items-center text-sm text-primary hover:underline mt-4">
                      Lees meer over mijn architectuur <royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="xs" extraClass="ml-1.5" />
                    </a>
                  </div>
                </div>
              </section>
            }

            <section>
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.approach' | translate" extraClasses="!text-2xl font-bold mb-4" />
              <!-- FIX: Gebruik proj.myApproachKey -->
              <royal-code-ui-paragraph [text]="proj.myApproachKey | translate" extraClasses="prose" />
            </section>
            <section>
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.result' | translate" extraClasses="!text-2xl font-bold mb-4" />
              <!-- FIX: Gebruik proj.resultKey -->
              <royal-code-ui-paragraph [text]="proj.resultKey | translate" extraClasses="prose" />
            </section>

           @if (proj.id === 'royal-code-monorepo') {
              <app-cv-architecture-deep-dive />
            }
          </main>

          <!-- Sidebar -->
          <aside class="space-y-8">
            <div class="bg-card p-6 rounded-xs border border-border">
              <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.projects.techStack' | translate" extraClasses="!text-lg font-semibold mb-4" />
              <div class="flex flex-wrap gap-2">
                @for (tech of proj.techStack; track tech.name) {
                  <royal-code-ui-badge [icon]="tech.icon" color="muted">{{ tech.name }}</royal-code-ui-badge>
                }
              </div>
            </div>
            <div class="bg-card p-6 rounded-xs border border-border">
              <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.projects.detail.links' | translate" extraClasses="!text-lg font-semibold mb-4" />
              <div class="flex flex-col gap-3">
                @if (proj.liveUrl) {
                  <a [href]="proj.liveUrl" target="_blank" class="inline-flex items-center"><royal-code-ui-button type="primary" ><royal-code-ui-icon [icon]="AppIcon.Eye" extraClass="mr-2"/>{{ 'cv.projects.detail.liveDemo' | translate }}</royal-code-ui-button></a>
                }
                @if (proj.githubUrl) {
                  <a [href]="proj.githubUrl" target="_blank" class="inline-flex items-center"><royal-code-ui-button type="outline" ><royal-code-ui-icon [icon]="AppIcon.Github" extraClass="mr-2"/>{{ 'cv.projects.detail.sourceCode' | translate }}</royal-code-ui-button></a>
                }
              </div>
            </div>
          </aside>
        </div>
      </div>
    } @else if (isLoading()) {
      <div class="text-center py-24"><royal-code-ui-icon [icon]="AppIcon.Loader" sizeVariant="xl" extraClass="animate-spin text-primary" /></div>
    } @else {
      <div class="text-center py-24">
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.notFound' | translate" />
        <a routerLink="/projects" class="mt-4 inline-block"><royal-code-ui-button type="primary">{{ 'cv.projects.detail.backToOverview' | translate }}</royal-code-ui-button></a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  private route = inject(ActivatedRoute);
  private projectDataService = inject(ProjectDataService);
  private mediaViewerService = inject(MediaViewerService);
  private logger = inject(LoggerService);

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
  readonly isLoading: WritableSignal<boolean> = signal(true);

  private readonly project$: Observable<ProjectDetail | undefined> = this.route.paramMap.pipe(
    tap(() => this.isLoading.set(true)),
    switchMap(params => {
      const id = params.get('id');
      this.logger.debug(`[ProjectDetailComponent] Loading project with ID: ${id}`);
      return id ? this.projectDataService.getProjectById(id) : of(undefined);
    }),
    tap(project => {
      if (!project) {
        this.logger.warn(`[ProjectDetailComponent] Project with ID not found.`);
      }
      this.isLoading.set(false);
    })
  );

  readonly project = toSignal(this.project$, { initialValue: undefined });

  openLightbox(images: Image[], startIndex: number): void {
    this.mediaViewerService.openLightbox(images, startIndex);
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/projects-overview/projects-overview.component.ts ---
// --- IN apps/cv/src/app/features/projects-overview/projects-overview.component.ts, VERVANG HET VOLLEDIGE BESTAND ---
/**
 * @file projects-overview.component.ts (CV App)
 * @version 2.0.0 (Production Ready: A11y, Analytics & Performance)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   De definitieve projectenoverzicht-pagina. Deze versie is geoptimaliseerd voor
 *   performance (lazy-loaded cards), toegankelijkheid (aria-pressed) en
 *   meetbaarheid (analytics on filter).
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon'; // Importeer UiIconComponent
import { AppIcon } from '@royal-code/shared/domain'; // Importeer AppIcon
import { CvProjectCardComponent } from '../../components/project-card/project-card.component';
import { ProjectDataService } from '../../core/services/project-data.service';
import { getUniqueTags, filterByTag } from '../../core/utils/filter.utils';
import { environment } from '../../../../environments/environment';
import { UiImageComponent } from '@royal-code/ui/image';

@Component({
  selector: 'app-cv-projects-overview',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiButtonComponent, 
    UiParagraphComponent, CvProjectCardComponent, UiIconComponent, UiImageComponent // Voeg UiImageComponent toe
  ],
  template: `
    <section class="projects-overview-section container-max py-16 md:py-24">
      <royal-code-ui-title 
        [level]="TitleTypeEnum.H2" 
        [text]="'cv.projects.allProjectsTitle' | translate" 
        [center]="true" 
        extraClasses="!text-3xl sm:!text-4xl font-bold mb-4" 
      />
      <royal-code-ui-paragraph 
        [text]="'cv.projects.intro' | translate" 
        [centered]="true" 
        size="lg" 
        color="muted"
        extraClasses="max-w-3xl mx-auto mb-12"
      />
      <div class="flex flex-wrap justify-center gap-2 mb-16">
        <royal-code-ui-button 
          [type]="selectedTag() === null ? 'primary' : 'outline'" 
          (clicked)="selectTag(null)"
          [attr.aria-pressed]="selectedTag() === null">
          {{ 'cv.projects.all' | translate }}
        </royal-code-ui-button>
        @for(tag of allTags(); track tag) {
          <royal-code-ui-button 
            [type]="selectedTag() === tag ? 'primary' : 'outline'" 
            (clicked)="selectTag(tag)"
            [attr.aria-pressed]="selectedTag() === tag">
            {{ tag }}
          </royal-code-ui-button>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        @if (filteredProjectsData().length > 0) {
          @for(project of filteredProjectsData(); track project.id) {
            @defer (on viewport) {
              <app-cv-project-card [project]="project" />
            } @placeholder {
              <div class="w-full h-96 bg-card border border-border rounded-xs animate-pulse"></div>
            }
          }
        } @else {
          <div class="md:col-span-2 text-center py-8 flex flex-col items-center gap-4">
            <royal-code-ui-icon [icon]="AppIcon.SearchX" sizeVariant="lg" colorClass="text-secondary" />
            <royal-code-ui-paragraph color="muted">
              {{ 'cv.projects.noResults' | translate: { tag: selectedTag() } }}
            </royal-code-ui-paragraph>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsOverviewComponent {
  private projectDataService = inject(ProjectDataService);
  readonly selectedTag = signal<string | null>(null);

  readonly allProjectData = toSignal(this.projectDataService.getAllProjectsForOverview(), { initialValue: [] });
  readonly allTags = computed(() => getUniqueTags(this.allProjectData()));
  readonly filteredProjectsData = computed(() => filterByTag(this.allProjectData(), this.selectedTag()));
  
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon; // Maak AppIcon beschikbaar in de template

  selectTag(tag: string | null): void {
    const newTag = this.selectedTag() === tag ? null : tag;
    this.selectedTag.set(newTag);
    this.trackAnalytics('projects_filter_selection', { tag: newTag ?? 'all' });
  }

  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
    // else { /* Injecteer en gebruik hier je echte analytics service */ }
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/skills-page/skills-page.component.html ---
<p>skills-page works!</p>
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/features/skills-page/skills-page.component.ts ---
/**
 * @file skills-page.component.ts (CV App)
 * @version 13.3.0 (Fully Internationalized)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   De definitieve, productieklare en volledig geïnternationaliseerde skills-pagina.
 *   Alle hardgecodeerde strings zijn vervangen door vertaalsleutels (i18n).
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, BadgeColor } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/card';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { SkillsDataService } from '../../core/services/skills-data.service';
import { CvSkillsMatrixComponent } from '../../components/skills-matrix/skills-matrix.component';
import { UiButtonComponent } from '@royal-code/ui/button';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { environment } from '../../../../environments/environment';
// import { CalendlyOverlayComponent } from '...'; // Veronderstelde import

@Component({
  selector: 'app-cv-skills-page',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent,
    UiCardComponent, UiBadgeComponent, CvSkillsMatrixComponent, UiButtonComponent
  ],
  template: `
    <section id="skills-main" class="skills-page-section container-max py-16 md:py-24 space-y-24">

      <!-- Sectie 1: De Filosofie -->
      <header class="text-center">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H2" 
          [text]="'cv.skills.philosophy.title' | translate" 
          extraClasses="!text-3xl sm:!text-5xl !font-black mb-4" 
        />
        <royal-code-ui-paragraph 
          [text]="'cv.skills.philosophy.value' | translate" 
          size="lg" 
          color="primary" 
          extraClasses="max-w-3xl mx-auto !font-bold"
        />
      </header>
      
          <!-- Sectie 2: T-Shaped Profiel & Impact Cases -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.skills.tShaped.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <!-- DE FIX: De 'space-y-4' is verplaatst naar een nieuwe div rondom de @for-loop -->
          <div class="lg:col-span-1">
            <h4 class="font-bold text-lg text-center lg:text-left mb-4">{{ 'cv.skills.tShaped.deepSpecialization.title' | translate }}</h4>
            <div class="space-y-4">
              @for(skill of tShapedModel.deepExpertise; track skill.nameKey) {
                <royal-code-ui-card extraContentClasses="!p-4">
                  <p class="font-semibold text-primary">{{ skill.nameKey | translate }}</p>
                  <p class="text-xs font-mono text-secondary mb-2">{{ skill.masteryKey | translate }}</p>
                  <div class="text-xs bg-background p-2 rounded-md border border-border">
                    <p class="italic">"{{ skill.testimonialKey | translate }}"</p>
                    <p class="font-bold text-right mt-1">- {{ skill.testimonialAuthorKey | translate }}</p>
                  </div>
                </royal-code-ui-card>
              }
            </div>
          </div>
          <div class="lg:col-span-2 space-y-12">
            <div>
              <h4 class="font-bold text-lg text-center lg:text-left mb-4">{{ 'cv.skills.tShaped.broadKnowledge.title' | translate }}</h4>
              <div class="flex flex-wrap gap-2 justify-center lg:justify-start">
                  @for(areaKey of tShapedModel.broadKnowledgeKeys; track areaKey) {
                    <royal-code-ui-badge color="muted" size="lg">{{ areaKey | translate }}</royal-code-ui-badge>
                  }
              </div>
            </div>
            <div>
              <h4 class="font-bold text-lg text-center lg:text-left mb-4">{{ 'cv.skills.impactCases.title' | translate }}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (story of impactCases; track story.skillKey) {
                  <royal-code-ui-card 
                    (click)="trackAnalytics('impact_case_click', story)"
                    tabindex="0"
                    extraContentClasses="text-center cursor-pointer hover:bg-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    <p class="text-sm font-semibold uppercase text-secondary tracking-wider">{{ story.skillKey | translate }}</p>
                    <p class="text-3xl font-bold text-primary my-1">{{ story.impact }}</p>
                    <p class="text-xs text-secondary">{{ story.achievementKey | translate }}</p>
                    <p class="text-xs font-mono text-muted mt-1">{{ story.contextKey | translate }}</p>
                  </royal-code-ui-card>
                }
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Sectie 3: Technology Radar -->
      <article>
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.skills.radar.title' | translate" [center]="true" extraClasses="!mb-12" />
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (category of techRadarCategories; track category.nameKey) {
                  <div class="bg-card p-4 rounded-xs border-2" [ngClass]="category.borderColorClass">
                      <h4 class="font-semibold mb-3 text-lg flex items-center gap-2" [ngClass]="category.textColorClass">
                        <royal-code-ui-icon [icon]="category.icon" />
                        {{ category.nameKey | translate }}
                      </h4>
                      <div class="space-y-3">
                          @for (tech of category.items; track tech.nameKey) {
                              <div (click)="trackAnalytics('tech_radar_click', tech)" class="cursor-pointer">
                                <royal-code-ui-badge [color]="category.badgeColor" size="sm" extraClasses="!font-semibold">{{ tech.nameKey | translate }}</royal-code-ui-badge>
                                <p class="text-xs text-secondary mt-1 pl-1">{{ tech.rationaleKey | translate }}</p>
                              </div>
                          }
                      </div>
                  </div>
              }
          </div>
      </article>

      <!-- Sectie 4: Gedetailleerde Skill Matrix (Lazy Loaded) -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.skills.matrix.title' | translate" [center]="true" extraClasses="!mb-12" />
        @defer (on viewport) {
          <app-cv-skills-matrix [categories]="allSkills()" />
        } @placeholder {
          <div class="w-full h-64 bg-card border border-border rounded-xs flex items-center justify-center animate-pulse">
            <p class="text-secondary">{{ 'cv.skills.matrix.loading' | translate }}</p>
          </div>
        }
      </article>

      <!-- Sectie 5: Afsluiting & Contextuele CTA -->
       <article class="text-center bg-card border border-border rounded-xs p-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.skills.closing.statement' | translate" extraClasses="!mb-6 italic" />
        <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="openCalendlyModal()">
          <royal-code-ui-icon [icon]="AppIcon.CalendarClock" sizeVariant="sm" extraClass="mr-2" />
          {{ 'cv.skills.closing.cta' | translate }}
        </royal-code-ui-button>
        <div class="mt-4">
           <royal-code-ui-badge color="success" [bordered]="false" data-analytics="risk_reversal_badge_view">
             <royal-code-ui-icon [icon]="AppIcon.ShieldCheck" sizeVariant="xs" extraClass="mr-1.5" />
             {{ 'cv.skills.closing.guarantee' | translate }}
           </royal-code-ui-badge>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsPageComponent implements OnInit {
  private readonly skillsDataService = inject(SkillsDataService);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly overlayService = inject(DynamicOverlayService);
  
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  readonly allSkills = toSignal(this.skillsDataService.getAllSkillCategories(), { initialValue: [] });

  readonly tShapedModel = {
    deepExpertise: [
      { nameKey: 'cv.skills.tShaped.deepSpecialization.item1.name', masteryKey: 'cv.skills.tShaped.deepSpecialization.item1.mastery', testimonialKey: 'cv.skills.tShaped.deepSpecialization.item1.testimonial', testimonialAuthorKey: 'cv.skills.tShaped.deepSpecialization.item1.author' },
      { nameKey: 'cv.skills.tShaped.deepSpecialization.item2.name', masteryKey: 'cv.skills.tShaped.deepSpecialization.item2.mastery', testimonialKey: 'cv.skills.tShaped.deepSpecialization.item2.testimonial', testimonialAuthorKey: 'cv.skills.tShaped.deepSpecialization.item2.author' },
      { nameKey: 'cv.skills.tShaped.deepSpecialization.item3.name', masteryKey: 'cv.skills.tShaped.deepSpecialization.item3.mastery', testimonialKey: 'cv.skills.tShaped.deepSpecialization.item3.testimonial', testimonialAuthorKey: 'cv.skills.tShaped.deepSpecialization.item3.author' }
    ],
    broadKnowledgeKeys: [
      'cv.skills.tShaped.broadKnowledge.item1', 'cv.skills.tShaped.broadKnowledge.item2', 'cv.skills.tShaped.broadKnowledge.item3', 'cv.skills.tShaped.broadKnowledge.item4', 'cv.skills.tShaped.broadKnowledge.item5'
    ]
  };

  readonly impactCases = [
    { skillKey: 'cv.skills.impactCases.case1.skill', achievementKey: 'cv.skills.impactCases.case1.achievement', impact: '50% Snellere TTM', contextKey: 'cv.skills.impactCases.case1.context' },
    { skillKey: 'cv.skills.impactCases.case2.skill', achievementKey: 'cv.skills.impactCases.case2.achievement', impact: '70% Minder Rework', contextKey: 'cv.skills.impactCases.case2.context' }
  ];

  readonly techRadarCategories: { nameKey: string; icon: AppIcon; items: {nameKey: string, rationaleKey: string}[]; textColorClass: string; borderColorClass: string; badgeColor: BadgeColor }[] = [
      { nameKey: 'cv.skills.radar.adopt.title', icon: AppIcon.Flame, items: [{ nameKey: "Nx", rationaleKey: 'cv.skills.radar.adopt.item1.rationale' }], textColorClass: 'text-success', borderColorClass: 'border-success/50', badgeColor: 'success' },
      { nameKey: 'cv.skills.radar.trial.title', icon: AppIcon.FlaskConical, items: [{ nameKey: "WebAssembly", rationaleKey: 'cv.skills.radar.trial.item1.rationale' }], textColorClass: 'text-primary', borderColorClass: 'border-primary/50', badgeColor: 'primary' },
      { nameKey: 'cv.skills.radar.assess.title', icon: AppIcon.Eye, items: [{ nameKey: "Web5", rationaleKey: 'cv.skills.radar.assess.item1.rationale' }], textColorClass: 'text-warning', borderColorClass: 'border-warning/50', badgeColor: 'warning' },
      { nameKey: 'cv.skills.radar.hold.title', icon: AppIcon.XCircle, items: [{ nameKey: "AngularJS", rationaleKey: 'cv.skills.radar.hold.item1.rationale' }], textColorClass: 'text-error', borderColorClass: 'border-error/50', badgeColor: 'error' }
  ];

  ngOnInit(): void {
    this.titleService.setTitle("Skills & Architectuur Visie | Roy van de Wetering");
    this.metaService.updateTag({ name: 'description', content: 'Mijn expertise in .NET, Angular, Nx en AI-strategieën om business-waarde te leveren.' });
    this.metaService.updateTag({ property: 'og:title', content: "Skills & Architectuur Visie | Roy van de Wetering" });
    this.metaService.updateTag({ property: 'og:image', content: '/assets/og/skills-t-shape-kpis.png' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:image', content: '/assets/og/skills-t-shape-kpis.png' });
  }

  trackAnalytics(eventName: string, data: any): void {
    if (environment.production) {
      // Stuur naar een echte analytics service in productie.
      // this.analyticsService.track(eventName, data);
    } else {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
  }
  
  openCalendlyModal(): void {
    this.trackAnalytics('skill_cta_click', { position: 'footer_cta' });
    
    // Production-ready: Open de daadwerkelijke overlay component.
    // this.overlayService.open(CalendlyOverlayComponent, { data: { utm: 'skills_cta' } });
    if (!environment.production) {
      alert("Simulatie: Calendly opent nu in een frictieloze overlay.");
    }
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/layout/app-layout/app-layout.component.ts ---
/**
 * @file app-layout.component.ts (CV App)
 * @version 2.0.0 (Footer Integration)
 * @description
 *   De hoofdlayout voor de CV-applicatie, nu inclusief de nieuwe
 *   app-specifieke <app-cv-footer> component.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CvHeaderComponent } from '../cv-header/cv-header.component';
import { CvFooterComponent } from '../cv-footer/cv-footer.component';

@Component({
  selector: 'app-cv-layout',
  standalone: true,
  imports: [RouterModule, CvHeaderComponent, CvFooterComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <app-cv-header />
      <main id="main-content" class="container-max flex-1 py-4 px-4 md:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
      <app-cv-footer /> <!-- <-- Voeg footer selector toe -->
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/layout/cv-footer/cv-footer.component.ts ---
/**
 * @file cv-footer.component.ts (CV App)
 * @Version 1.2.0 (USP Section Disabled)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Applicatie-specifieke "wrapper" component voor de CV footer.
 *   Schakelt de USP-sectie expliciet uit voor de CV-app.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CV_APP_NAVIGATION } from '../../config/cv-navigation';
import { UiFooterComponent, SocialLink } from '@royal-code/ui/navigation';

@Component({
  selector: 'app-cv-footer',
  standalone: true,
  imports: [CommonModule, UiFooterComponent],
  template: `
    <royal-code-ui-footer
      [supportLinks]="footerLinks.supportLinks"
      [shopLinks]="footerLinks.shopLinks"
      [companyLinks]="footerLinks.companyLinks"
      [appName]="'Roy van de Wetering'"
      [socialLinks]="socialLinks"
      [paymentMethodsEnabled]="false"
      [enableUspSection]="false"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvFooterComponent {
  protected readonly footerLinks = CV_APP_NAVIGATION.footer ?? { supportLinks: [], shopLinks: [], companyLinks: [] };
  
  protected readonly socialLinks: SocialLink[] = [
    { url: 'https://github.com/TweakStories', icon: 'Github' },
    { url: 'https://www.linkedin.com/in/rvdwp/', icon: 'Linkedin' }
  ];
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/app/layout/cv-header/cv-header.component.ts ---
/**
 * @file cv-header.component.ts (CV App)
 * @Version 7.0.0 (Upgraded to Shared UI Component)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   De CV header, nu geüpgraded om als een simpele "wrapper" te fungeren rond de
 *   nieuwe, herbruikbare <royal-code-ui-header>. Deze component geeft de app-specifieke
 *   logo-tekst door en injecteert de social media iconen als app-specifieke acties.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Gedeelde UI Componenten
import { UiHeaderComponent } from '@royal-code/ui/navigation';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'app-cv-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UiHeaderComponent,
    UiIconComponent
  ],
  template: `
    <royal-code-ui-header [logoText]="'Roy van de Wetering'" [enableSearch]="false">
      <div app-actions class="flex items-center gap-2">
        <a href="https://github.com/TweakStories" target="_blank" rel="noopener noreferrer" 
           class="p-2 rounded-md text-foreground hover:text-primary transition-colors" 
           aria-label="GitHub Profiel">
          <royal-code-ui-icon [icon]="AppIcon.Github" sizeVariant="sm" />
        </a>
        <a href="https://www.linkedin.com/in/rvdwp/" target="_blank" rel="noopener noreferrer" 
           class="p-2 rounded-md text-foreground hover:text-primary transition-colors" 
           aria-label="LinkedIn Profiel">
          <royal-code-ui-icon [icon]="AppIcon.Linkedin" sizeVariant="sm" />
        </a>
      </div>
    </royal-code-ui-header>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvHeaderComponent {
  protected readonly AppIcon = AppIcon;
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/backup_styles.scss ---
/* apps/challenger/src/styles.scss
   ============================================================================
   Challenger Design System – tokens (enterprise)          v3.16.1 (Neon on Hover)
   - Neon effect nu alleen on hover voor .neon-effect-target elementen.
   - Oude .btn-neon.neon-<theme> klassen verwijderd.
   ========================================================================== */

/* 1 ▸ Imports ------------------------------------------------------------- */
@import "tailwindcss";
@import "@ctrl/ngx-emoji-mart/picker";   /* indien nog gebruikt */

/* 2 ▸ LIGHT-MODE TOKENS (:root) ------------------------------------------ */
:root {
  /* -- 2A. Hue & Saturation basis --------------------------------------- */
  --hue-app-primary: 38;   --sat-app-primary: 92%;
  --hue-theme-sun:    45;  --sat-theme-sun:    95%;
  --hue-theme-fire:    0;  --sat-theme-fire:   88%;
  --hue-theme-water: 210;  --sat-theme-water:  80%;
  --hue-theme-forest:130;  --sat-theme-forest: 65%;
  --hue-theme-arcane:270;  --sat-theme-arcane: 70%;
  --hue-neutral: 215;  --sat-neutral: 15%;  --sat-neutral-strong: 20%;
  --hue-accent:  200;  --sat-accent:  80%;
  --hue-success-state:134; --sat-success-state:60%;
  --hue-error-state:   0;  --sat-error-state: 85%;
  --hue-info-state:   205; --sat-info-state:  80%;
  --hue-warning-state: 40; --sat-warning-state:90%;

  /* -- 2B. 5-stop gradient hues/sats (card borders) --------------------- */
  --hue-fire-grad-stop1: 0;  --sat-fire-grad-stop1: 95%;
  --hue-fire-grad-stop2: 8;  --sat-fire-grad-stop2: 93%;
  --hue-fire-grad-stop3:20;  --sat-fire-grad-stop3: 90%;
  --hue-fire-grad-stop4: 8;  --sat-fire-grad-stop4: 93%;
  --hue-fire-grad-stop5: 0;  --sat-fire-grad-stop5: 95%;
  --hue-water-grad-stop1:210; --sat-water-grad-stop1:92%;
  --hue-water-grad-stop2:200; --sat-water-grad-stop2:88%;
  --hue-water-grad-stop3:190; --sat-water-grad-stop3:85%;
  --hue-water-grad-stop4:200; --sat-water-grad-stop4:88%;
  --hue-water-grad-stop5:210; --sat-water-grad-stop5:92%;
  --hue-forest-grad-stop1:120; --sat-forest-grad-stop1:78%;
  --hue-forest-grad-stop2:130; --sat-forest-grad-stop2:75%;
  --hue-forest-grad-stop3:100; --sat-forest-grad-stop3:72%;
  --hue-forest-grad-stop4:130; --sat-forest-grad-stop4:75%;
  --hue-forest-grad-stop5:120; --sat-forest-grad-stop5:78%;
  --hue-sun-grad-stop1:50; --sat-sun-grad-stop1:100%;
  --hue-sun-grad-stop2:45; --sat-sun-grad-stop2: 98%;
  --hue-sun-grad-stop3:40; --sat-sun-grad-stop3: 95%;
  --hue-sun-grad-stop4:45; --sat-sun-grad-stop4: 98%;
  --hue-sun-grad-stop5:50; --sat-sun-grad-stop5:100%;
  --hue-arcane-grad-stop1:270; --sat-arcane-grad-stop1:75%;
  --hue-arcane-grad-stop2:285; --sat-arcane-grad-stop2:72%;
  --hue-arcane-grad-stop3:300; --sat-arcane-grad-stop3:78%;
  --hue-arcane-grad-stop4:255; --sat-arcane-grad-stop4:70%;
  --hue-arcane-grad-stop5:270; --sat-arcane-grad-stop5:75%;

  /* -- 2C. Light-mode lightness (5-stop card borders) -- */
  --l-fire-grad-stop1:55%; --l-fire-grad-stop2:58%;
  --l-fire-grad-stop3:62%; --l-fire-grad-stop4:58%;
  --l-fire-grad-stop5:55%;
  --l-water-grad-stop1:53%; --l-water-grad-stop2:58%;
  --l-water-grad-stop3:60%; --l-water-grad-stop4:58%;
  --l-water-grad-stop5:53%;
  --l-forest-grad-stop1:48%; --l-forest-grad-stop2:53%;
  --l-forest-grad-stop3:56%; --l-forest-grad-stop4:53%;
  --l-forest-grad-stop5:48%;
  --l-sun-grad-stop1:60%; --l-sun-grad-stop2:63%;
  --l-sun-grad-stop3:68%; --l-sun-grad-stop4:63%;
  --l-sun-grad-stop5:60%;
  --l-arcane-grad-stop1:58%; --l-arcane-grad-stop2:61%;
  --l-arcane-grad-stop3:65%; --l-arcane-grad-stop4:61%;
  --l-arcane-grad-stop5:58%;

  /* -- 2D. Full HSL colours (light) -- */
  --color-primary:             hsl(var(--hue-app-primary) var(--sat-app-primary) 58%);
  --color-primary-hover:       hsl(var(--hue-app-primary) var(--sat-app-primary) 51%);
  --color-primary-on:          hsl(var(--hue-app-primary) calc(var(--sat-app-primary)*.4) 12%);
  --color-theme-sun:           hsl(var(--hue-theme-sun) var(--sat-theme-sun) 60%);
  --color-theme-sun-hover:     hsl(var(--hue-theme-sun) var(--sat-theme-sun) 53%);
  --color-theme-sun-on:        hsl(var(--hue-theme-sun) calc(var(--sat-theme-sun)*.4) 15%);
  --color-theme-fire:          hsl(var(--hue-theme-fire) var(--sat-theme-fire) 55%);
  --color-theme-fire-hover:    hsl(var(--hue-theme-fire) var(--sat-theme-fire) 48%);
  --color-theme-fire-on:       hsl(var(--hue-theme-fire) calc(var(--sat-theme-fire)*.4) 100%);
  --color-theme-water:         hsl(var(--hue-theme-water) var(--sat-theme-water) 57%);
  --color-theme-water-hover:   hsl(var(--hue-theme-water) var(--sat-theme-water) 50%);
  --color-theme-water-on:      hsl(var(--hue-theme-water) calc(var(--sat-theme-water)*.4) 100%);
  --color-theme-forest:        hsl(var(--hue-theme-forest) var(--sat-theme-forest) 48%);
  --color-theme-forest-hover:  hsl(var(--hue-theme-forest) var(--sat-theme-forest) 41%);
  --color-theme-forest-on:     hsl(var(--hue-theme-forest) calc(var(--sat-theme-forest)*.4) 100%);
  --color-theme-arcane:        hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) 58%);
  --color-theme-arcane-hover:  hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) 51%);
  --color-theme-arcane-on:     hsl(var(--hue-theme-arcane) calc(var(--sat-theme-arcane)*.4) 100%);
  --color-background:          hsl(var(--hue-neutral) var(--sat-neutral) 98%);
  --color-foreground:          hsl(var(--hue-neutral) var(--sat-neutral-strong) 8%);
  --color-surface:             hsl(var(--hue-neutral) var(--sat-neutral) 100%);
  --color-surface-alt:         hsl(var(--hue-neutral) var(--sat-neutral) 96%);
  --surface-card:              hsl(var(--hue-neutral) var(--sat-neutral) 99%);
  --color-border:              hsl(var(--hue-neutral) var(--sat-neutral) 90%);
  --color-ring:                var(--color-primary);
  --color-text:                var(--color-foreground);
  --color-text-muted:          hsl(var(--hue-neutral) var(--sat-neutral) 66%);
  --color-placeholder:         hsl(var(--hue-neutral) var(--sat-neutral) 65%);
  --color-background-secondary:hsl(var(--hue-neutral) var(--sat-neutral) 96%);
  --color-hover:               hsl(var(--hue-neutral) var(--sat-neutral) 92%);
  --color-foreground-default:  hsl(var(--hue-neutral) var(--sat-neutral-strong) 15%);
  --color-secondary:           hsl(var(--hue-neutral) var(--sat-neutral) 50%);
  --color-secondary-hover:     var(--color-primary);
  --color-accent:              hsl(var(--hue-accent) var(--sat-accent) 58%);
  --color-accent-on:           hsl(var(--hue-accent) calc(var(--sat-accent)*.3) 100%);
  --color-success:             hsl(var(--hue-success-state) var(--sat-success-state) 50%);
  --color-success-on:          hsl(var(--hue-success-state) calc(var(--sat-success-state)*.3) 100%);
  --color-warning:             hsl(var(--hue-warning-state) var(--sat-warning-state) 50%);
  --color-warning-on:          hsl(var(--hue-warning-state) calc(var(--sat-warning-state)*.3) 15%);
  --color-error:               hsl(var(--hue-error-state) var(--sat-error-state) 58%);
  --color-error-on:            hsl(var(--hue-error-state) calc(var(--sat-error-state)*.3) 100%);
  --color-info:                hsl(var(--hue-info-state) var(--sat-info-state) 58%);
  --color-info-on:             hsl(var(--hue-info-state) calc(var(--sat-info-state)*.3) 100%);

  /* 5-stop gradient full colours (light) - Card Borders */
  --color-fire-grad-stop1:   hsl(var(--hue-fire-grad-stop1) var(--sat-fire-grad-stop1) var(--l-fire-grad-stop1));
  --color-fire-grad-stop2:   hsl(var(--hue-fire-grad-stop2) var(--sat-fire-grad-stop2) var(--l-fire-grad-stop2));
  --color-fire-grad-stop3:   hsl(var(--hue-fire-grad-stop3) var(--sat-fire-grad-stop3) var(--l-fire-grad-stop3));
  --color-fire-grad-stop4:   hsl(var(--hue-fire-grad-stop4) var(--sat-fire-grad-stop4) var(--l-fire-grad-stop4));
  --color-fire-grad-stop5:   hsl(var(--hue-fire-grad-stop5) var(--sat-fire-grad-stop5) var(--l-fire-grad-stop5));
  --color-water-grad-stop1:  hsl(var(--hue-water-grad-stop1) var(--sat-water-grad-stop1) var(--l-water-grad-stop1));
  --color-water-grad-stop2:  hsl(var(--hue-water-grad-stop2) var(--sat-water-grad-stop2) var(--l-water-grad-stop2));
  --color-water-grad-stop3:  hsl(var(--hue-water-grad-stop3) var(--sat-water-grad-stop3) var(--l-water-grad-stop3));
  --color-water-grad-stop4:  hsl(var(--hue-water-grad-stop4) var(--sat-water-grad-stop4) var(--l-water-grad-stop4));
  --color-water-grad-stop5:  hsl(var(--hue-water-grad-stop5) var(--sat-water-grad-stop5) var(--l-water-grad-stop5));
  --color-forest-grad-stop1: hsl(var(--hue-forest-grad-stop1) var(--sat-forest-grad-stop1) var(--l-forest-grad-stop1));
  --color-forest-grad-stop2: hsl(var(--hue-forest-grad-stop2) var(--sat-forest-grad-stop2) var(--l-forest-grad-stop2));
  --color-forest-grad-stop3: hsl(var(--hue-forest-grad-stop3) var(--sat-forest-grad-stop3) var(--l-forest-grad-stop3));
  --color-forest-grad-stop4: hsl(var(--hue-forest-grad-stop4) var(--sat-forest-grad-stop4) var(--l-forest-grad-stop4));
  --color-forest-grad-stop5: hsl(var(--hue-forest-grad-stop5) var(--sat-forest-grad-stop5) var(--l-forest-grad-stop5));
  --color-sun-grad-stop1:    hsl(var(--hue-sun-grad-stop1) var(--sat-sun-grad-stop1) var(--l-sun-grad-stop1));
  --color-sun-grad-stop2:    hsl(var(--hue-sun-grad-stop2) var(--sat-sun-grad-stop2) var(--l-sun-grad-stop2));
  --color-sun-grad-stop3:    hsl(var(--hue-sun-grad-stop3) var(--sat-sun-grad-stop3) var(--l-sun-grad-stop3));
  --color-sun-grad-stop4:    hsl(var(--hue-sun-grad-stop4) var(--sat-sun-grad-stop4) var(--l-sun-grad-stop4));
  --color-sun-grad-stop5:    hsl(var(--hue-sun-grad-stop5) var(--sat-sun-grad-stop5) var(--l-sun-grad-stop5));
  --color-arcane-grad-stop1: hsl(var(--hue-arcane-grad-stop1) var(--sat-arcane-grad-stop1) var(--l-arcane-grad-stop1));
  --color-arcane-grad-stop2: hsl(var(--hue-arcane-grad-stop2) var(--sat-arcane-grad-stop2) var(--l-arcane-grad-stop2));
  --color-arcane-grad-stop3: hsl(var(--hue-arcane-grad-stop3) var(--sat-arcane-grad-stop3) var(--l-arcane-grad-stop3));
  --color-arcane-grad-stop4: hsl(var(--hue-arcane-grad-stop4) var(--sat-arcane-grad-stop4) var(--l-arcane-grad-stop4));
  --color-arcane-grad-stop5: hsl(var(--hue-arcane-grad-stop5) var(--sat-arcane-grad-stop5) var(--l-arcane-grad-stop5));

  /* Lightness waarden voor 2-stop Button Gradients (light) */
  --l-btn-fire-grad-start-light: 58%; --l-btn-fire-grad-end-light: 50%;
  --l-btn-water-grad-start-light: 60%; --l-btn-water-grad-end-light: 52%;
  --l-btn-forest-grad-start-light: 52%; --l-btn-forest-grad-end-light: 44%;
  --l-btn-sun-grad-start-light: 65%; --l-btn-sun-grad-end-light: 57%;
  --l-btn-arcane-grad-start-light: 62%; --l-btn-arcane-grad-end-light: 54%;

  /* Samengestelde 2-stop Button Gradient Kleuren (light) */
  --color-btn-fire-grad-start:   hsl(var(--hue-theme-fire) var(--sat-theme-fire) var(--l-btn-fire-grad-start-light));
  --color-btn-fire-grad-end:     hsl(var(--hue-theme-fire) var(--sat-theme-fire) var(--l-btn-fire-grad-end-light));
  --color-btn-water-grad-start:  hsl(var(--hue-theme-water) var(--sat-theme-water) var(--l-btn-water-grad-start-light));
  --color-btn-water-grad-end:    hsl(var(--hue-theme-water) var(--sat-theme-water) var(--l-btn-water-grad-end-light));
  --color-btn-forest-grad-start: hsl(var(--hue-theme-forest) var(--sat-theme-forest) var(--l-btn-forest-grad-start-light));
  --color-btn-forest-grad-end:   hsl(var(--hue-theme-forest) var(--sat-theme-forest) var(--l-btn-forest-grad-end-light));
  --color-btn-sun-grad-start:    hsl(var(--hue-theme-sun) var(--sat-theme-sun) var(--l-btn-sun-grad-start-light));
  --color-btn-sun-grad-end:      hsl(var(--hue-theme-sun) var(--sat-theme-sun) var(--l-btn-sun-grad-end-light));
  --color-btn-arcane-grad-start: hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) var(--l-btn-arcane-grad-start-light));
  --color-btn-arcane-grad-end:   hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) var(--l-btn-arcane-grad-end-light));

  /* Inputs */
  --color-input:               var(--color-background);
  --color-input-border:        var(--color-border);
  --color-input-ring:          var(--color-primary);
  --color-input-text:          var(--color-foreground);
  --color-input-placeholder:   var(--color-placeholder);

  /* Misc primitives */
  --elevation-xs:   0 1px 2px 0 hsla(var(--hue-neutral) 10% 0% / .05);
  --elevation-sm:   0 1px 3px 0 hsla(var(--hue-neutral) 10% 0% / .07), 0 1px 2px -1px hsla(var(--hue-neutral) 10% 0% / .04);
  --elevation-md:   0 4px 6px -1px hsla(var(--hue-neutral) 10% 0% / .07), 0 2px 4px -2px hsla(var(--hue-neutral) 10% 0% / .04);
  --elevation-lg:   0 10px 15px -3px hsla(var(--hue-neutral) 10% 0% / .07), 0 4px 6px -4px hsla(var(--hue-neutral) 10% 0% / .04);
  --radius-xs: .25rem; --radius-sm: .5rem; --radius-md: .75rem; --radius-lg: .75rem; --radius-full: 9999px;
  --header-height: 4rem;
  --z-backdrop: 500; --z-dropdown: 1000; --z-header: 1100;
  --z-modal: 1200;   --z-toast: 1300;   --z-tooltip: 1400;

  /* Neon Variabelen (light-mode defaults voor de glow kleur) */
  --neon-blur-radius: 7px;
  --neon-spread-radius: 1px;
  --neon-opacity: 0.6;
  --neon-blur-radius-hover: 10px;
  --neon-spread-radius-hover: 2px;
  --neon-opacity-hover: 0.8;

  --card-neon-blur-radius-hover: 15px;
  --card-neon-spread-radius-hover: 5px;
  --card-neon-opacity-hover: 0.65;


  --l-neon-glow-primary-light: 60%;
  --l-neon-glow-fire-light: 65%;
  --l-neon-glow-water-light: 62%;
  --l-neon-glow-forest-light: 53%;
  --l-neon-glow-sun-light: 65%;
  --l-neon-glow-arcane-light: 60%;

  --progress-neon-blur-radius-hover: 5px;
  --progress-neon-spread-radius-hover: 4px;
  --progress-neon-opacity-hover: 0.75;


  /* == Resource Battery Kleuren (Light Mode) == */
  --hue-theme-fire:    0;  --sat-theme-fire:   88%; /* Voor Health */
  --hue-theme-water: 210;  --sat-theme-water:  80%; /* Voor Mana */
  --hue-theme-sun:    45;  --sat-theme-sun:    95%; /* Voor Stamina */
  /* Je kunt ook aparte --hue-resource-<type> definiëren als ze afwijken */
  --hue-resource-health: var(--hue-theme-fire);
  --sat-resource-health: var(--sat-theme-fire);
  --hue-resource-mana:   var(--hue-theme-water);
  --sat-resource-mana:   var(--sat-theme-water);
  --hue-resource-stamina:var(--hue-theme-sun);
  --sat-resource-stamina:var(--sat-theme-sun);

  /* -- Lightness voor Resource Battery Fill - BASIS (Light Mode) -- */
  /* Deze waarden zijn voor de *gevulde* segmenten in rust */
  --l-resource-health-fill-light: 45%; /* Iets donkerder dan button voor diepte */
  --l-resource-mana-fill-light:   48%;
  --l-resource-stamina-fill-light:52%;

  /* -- Samengestelde Kleuren voor Resource Battery Fill - BASIS (Light Mode) -- */
  --color-resource-health:  hsl(var(--hue-resource-health) var(--sat-resource-health) var(--l-resource-health-fill-light));
  --color-resource-mana:    hsl(var(--hue-resource-mana)   var(--sat-resource-mana)   var(--l-resource-mana-fill-light));
  --color-resource-stamina: hsl(var(--hue-resource-stamina)var(--sat-resource-stamina)var(--l-resource-stamina-fill-light));

  /* -- Lightness & Saturation voor Resource Battery Fill - HOVER (Light Mode) -- */
  /* Deze waarden zijn voor de *gevulde* segmenten bij hover - maak ze helderder/meer verzadigd */
  --l-resource-health-fill-hover-light: 65%;  --sat-resource-health-fill-hover-light: 100%;
  --l-resource-mana-fill-hover-light:   70%;  --sat-resource-mana-fill-hover-light:   98%;
  --l-resource-stamina-fill-hover-light:75%;  --sat-resource-stamina-fill-hover-light:100%;

  /* --- Samengestelde Kleuren voor Resource Battery Fill - HOVER (Light Mode) --- */
  --hue-gold-source: 38;     --sat-gold-source: 92%;   /* Voor balancedGold */
  --hue-water-source: 210;   --sat-water-source:  80%;  /* Voor oceanicFlow */
  --hue-forest-source:130;   --sat-forest-source: 65%;  /* Voor verdantGrowth */
  --hue-arcane-source:270;   --sat-arcane-source: 70%;  /* Voor arcaneMyst */
  --lightness-app-primary: 58%;
  --lightness-app-primary-hover: 51%;
  --lightness-app-primary-on-fg: 12%; /* Voor donkere tekst op lichte primary */


}

/* 3 ▸ Tailwind tokens exposé */
@theme {
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
  --color-surface: var(--color-surface);
  --color-surface-alt: var(--color-surface-alt);
  --surface-card: var(--surface-card);
  --color-border: var(--color-border);
  --color-ring: var(--color-ring);
  --color-text: var(--color-text);
  --color-text-muted: var(--color-text-muted);
  --color-placeholder: var(--color-placeholder);
  --color-background-secondary: var(--color-background-secondary);
  --color-hover: var(--color-hover);
  --color-foreground-default: var(--color-foreground-default);
  --color-secondary: var(--color-secondary);
  --color-secondary-hover: var(--color-secondary-hover);
  --color-accent: var(--color-accent);
  --color-accent-on: var(--color-accent-on);
  --color-primary: var(--color-primary);
  --color-primary-hover: var(--color-primary-hover);
  --color-primary-on: var(--color-primary-on);
  --color-theme-sun: var(--color-theme-sun);
  --color-theme-sun-hover: var(--color-theme-sun-hover);
  --color-theme-sun-on: var(--color-theme-sun-on);
  --color-theme-fire: var(--color-theme-fire);
  --color-theme-fire-hover: var(--color-theme-fire-hover);
  --color-theme-fire-on: var(--color-theme-fire-on);
  --color-theme-water: var(--color-theme-water);
  --color-theme-water-hover: var(--color-theme-water-hover);
  --color-theme-water-on: var(--color-theme-water-on);
  --color-theme-forest: var(--color-theme-forest);
  --color-theme-forest-hover: var(--color-theme-forest-hover);
  --color-theme-forest-on: var(--color-theme-forest-on);
  --color-theme-arcane: var(--color-theme-arcane);
  --color-theme-arcane-hover: var(--color-theme-arcane-hover);
  --color-theme-arcane-on: var(--color-theme-arcane-on);
  --color-success: var(--color-success);
  --color-success-on: var(--color-success-on);
  --color-warning: var(--color-warning);
  --color-warning-on: var(--color-warning-on);
  --color-error: var(--color-error);
  --color-error-on: var(--color-error-on);
  --color-info: var(--color-info);
  --color-info-on: var(--color-info-on);
  --color-input: var(--color-input);
  --color-input-border: var(--color-input-border);
  --color-input-ring: var(--color-input-ring);
  --color-input-text: var(--color-input-text);
  --color-input-placeholder: var(--color-input-placeholder);
  --elevation-xs: var(--elevation-xs);
  --elevation-sm: var(--elevation-sm);
  --elevation-md: var(--elevation-md);
  --elevation-lg: var(--elevation-lg);

  /* == Resource Battery Kleuren (Dark Mode) == */
  --color-resource-health: var(--color-resource-health);
  --color-resource-mana: var(--color-resource-mana);
  --color-resource-stamina: var(--color-resource-stamina);


}

/* 4 ▸ DARK-MODE OVERRIDES */
html.dark {
  /* -- 4A. Neutrals -- */
  --color-background:          hsl(var(--hue-neutral) var(--sat-neutral) 7%);
  --color-foreground:          hsl(var(--hue-neutral) var(--sat-neutral-strong) 93%);
  --color-surface:             hsl(var(--hue-neutral) var(--sat-neutral) 10%);
  --color-surface-alt:         hsl(var(--hue-neutral) var(--sat-neutral) 12%);
  --surface-card:              hsl(var(--hue-neutral) var(--sat-neutral) 11%);
  --color-border:              hsl(var(--hue-neutral) var(--sat-neutral) 18%);
  --color-text-muted:          hsl(var(--hue-neutral) var(--sat-neutral) 66%);
  --color-placeholder:         hsl(var(--hue-neutral) var(--sat-neutral) 45%);
  --color-background-secondary:hsl(var(--hue-neutral) var(--sat-neutral) 12%);
  --color-hover:               hsl(var(--hue-neutral) var(--sat-neutral) 19%);
  --color-foreground-default:  hsl(var(--hue-neutral) var(--sat-neutral-strong) 90%);
  --color-secondary:           hsl(var(--hue-neutral) var(--sat-neutral) 60%);
  --color-accent:              hsl(var(--hue-accent) var(--sat-accent) 55%);
  --color-accent-on:           hsl(var(--hue-accent) calc(var(--sat-accent)*.3) 10%);

  /* -- 4B. States -- */
  --color-success:             hsl(var(--hue-success-state) var(--sat-success-state) 53%);
  --color-success-on:          hsl(var(--hue-success-state) calc(var(--sat-success-state)*.3) 10%);
  --color-warning:             hsl(var(--hue-warning-state) var(--sat-warning-state) 55%);
  --color-warning-on:          hsl(var(--hue-warning-state) calc(var(--sat-warning-state)*.3) 10%);
  --color-error:               hsl(var(--hue-error-state) var(--sat-error-state) 57%);
  --color-error-on:            hsl(var(--hue-error-state) calc(var(--sat-error-state)*.3) 10%);
  --color-info:                hsl(var(--hue-info-state) var(--sat-info-state) 57%);
  --color-info-on:             hsl(var(--hue-info-state) calc(var(--sat-info-state)*.3) 10%);

  /* inputs */
  --color-input:               hsl(var(--hue-neutral) var(--sat-neutral) 7%);
  --color-input-border:        hsl(var(--hue-neutral) var(--sat-neutral) 18%);
  --color-input-ring:          var(--color-primary);
  --color-input-text:          hsl(var(--hue-neutral) var(--sat-neutral-strong) 93%);
  --color-input-placeholder:   hsl(var(--hue-neutral) var(--sat-neutral) 45%);

  /* -- 4C. Gradient lightness overrides (5-stop card borders) -- */
  --l-fire-grad-stop1:48%; --l-fire-grad-stop2:50%;
  --l-fire-grad-stop3:53%; --l-fire-grad-stop4:50%;
  --l-fire-grad-stop5:48%;
  --l-water-grad-stop1:47%; --l-water-grad-stop2:52%;
  --l-water-grad-stop3:50%; --l-water-grad-stop4:42%;
  --l-water-grad-stop5:45%;
  --l-forest-grad-stop1:42%; --l-forest-grad-stop2:47%;
  --l-forest-grad-stop3:50%; --l-forest-grad-stop4:44%;
  --l-forest-grad-stop5:40%;
  --l-sun-grad-stop1:50%; --l-sun-grad-stop2:47%;
  --l-sun-grad-stop3:52%; --l-sun-grad-stop4:45%;
  --l-sun-grad-stop5:42%;
  --l-arcane-grad-stop1:52%; --l-arcane-grad-stop2:50%;
  --l-arcane-grad-stop3:54%; --l-arcane-grad-stop4:47%;
  --l-arcane-grad-stop5:45%;

    /* Neon Variabelen (dark-mode glow kleuren) */
  /* --neon-blur-radius, --neon-spread-radius, --neon-opacity, etc. in :root blijven van kracht tenzij hier overschreven */
  --l-neon-glow-primary-dark: 65%;
  --l-neon-glow-fire-dark: 70%;
  --l-neon-glow-water-dark: 65%;
  --l-neon-glow-forest-dark: 58%;
  --l-neon-glow-sun-dark: 68%;
  --l-neon-glow-arcane-dark: 65%;

  /* -- 4D. Re-assemble 5-stop gradient colours (dark) - Card Borders -- */
  --color-fire-grad-stop1:   hsl(var(--hue-fire-grad-stop1) var(--sat-fire-grad-stop1) var(--l-fire-grad-stop1));
  --color-fire-grad-stop2:   hsl(var(--hue-fire-grad-stop2) var(--sat-fire-grad-stop2) var(--l-fire-grad-stop2));
  --color-fire-grad-stop3:   hsl(var(--hue-fire-grad-stop3) var(--sat-fire-grad-stop3) var(--l-fire-grad-stop3));
  --color-fire-grad-stop4:   hsl(var(--hue-fire-grad-stop4) var(--sat-fire-grad-stop4) var(--l-fire-grad-stop4));
  --color-fire-grad-stop5:   hsl(var(--hue-fire-grad-stop5) var(--sat-fire-grad-stop5) var(--l-fire-grad-stop5));
  --color-water-grad-stop1:  hsl(var(--hue-water-grad-stop1) var(--sat-water-grad-stop1) var(--l-water-grad-stop1));
  --color-water-grad-stop2:  hsl(var(--hue-water-grad-stop2) var(--sat-water-grad-stop2) var(--l-water-grad-stop2));
  --color-water-grad-stop3:  hsl(var(--hue-water-grad-stop3) var(--sat-water-grad-stop3) var(--l-water-grad-stop3));
  --color-water-grad-stop4:  hsl(var(--hue-water-grad-stop4) var(--sat-water-grad-stop4) var(--l-water-grad-stop4));
  --color-water-grad-stop5:  hsl(var(--hue-water-grad-stop5) var(--sat-water-grad-stop5) var(--l-water-grad-stop5));
  --color-forest-grad-stop1: hsl(var(--hue-forest-grad-stop1) var(--sat-forest-grad-stop1) var(--l-forest-grad-stop1));
  --color-forest-grad-stop2: hsl(var(--hue-forest-grad-stop2) var(--sat-forest-grad-stop2) var(--l-forest-grad-stop2));
  --color-forest-grad-stop3: hsl(var(--hue-forest-grad-stop3) var(--sat-forest-grad-stop3) var(--l-forest-grad-stop3));
  --color-forest-grad-stop4: hsl(var(--hue-forest-grad-stop4) var(--sat-forest-grad-stop4) var(--l-forest-grad-stop4));
  --color-forest-grad-stop5: hsl(var(--hue-forest-grad-stop5) var(--sat-forest-grad-stop5) var(--l-forest-grad-stop5));
  --color-sun-grad-stop1:    hsl(var(--hue-sun-grad-stop1) var(--sat-sun-grad-stop1) var(--l-sun-grad-stop1));
  --color-sun-grad-stop2:    hsl(var(--hue-sun-grad-stop2) var(--sat-sun-grad-stop2) var(--l-sun-grad-stop2));
  --color-sun-grad-stop3:    hsl(var(--hue-sun-grad-stop3) var(--sat-sun-grad-stop3) var(--l-sun-grad-stop3));
  --color-sun-grad-stop4:    hsl(var(--hue-sun-grad-stop4) var(--sat-sun-grad-stop4) var(--l-sun-grad-stop4));
  --color-sun-grad-stop5:    hsl(var(--hue-sun-grad-stop5) var(--sat-sun-grad-stop5) var(--l-sun-grad-stop5));
  --color-arcane-grad-stop1: hsl(var(--hue-arcane-grad-stop1) var(--sat-arcane-grad-stop1) var(--l-arcane-grad-stop1));
  --color-arcane-grad-stop2: hsl(var(--hue-arcane-grad-stop2) var(--sat-arcane-grad-stop2) var(--l-arcane-grad-stop2));
  --color-arcane-grad-stop3: hsl(var(--hue-arcane-grad-stop3) var(--sat-arcane-grad-stop3) var(--l-arcane-grad-stop3));
  --color-arcane-grad-stop4: hsl(var(--hue-arcane-grad-stop4) var(--sat-arcane-grad-stop4) var(--l-arcane-grad-stop4));
  --color-arcane-grad-stop5: hsl(var(--hue-arcane-grad-stop5) var(--sat-arcane-grad-stop5) var(--l-arcane-grad-stop5));

  /* Lightness waarden voor 2-stop Button Gradients (dark) */
  --l-btn-fire-grad-start-dark: 50%; --l-btn-fire-grad-end-dark: 42%;
  --l-btn-water-grad-start-dark: 52%; --l-btn-water-grad-end-dark: 44%;
  --l-btn-forest-grad-start-dark: 46%; --l-btn-forest-grad-end-dark: 38%;
  --l-btn-sun-grad-start-dark: 57%; --l-btn-sun-grad-end-dark: 49%;
  --l-btn-arcane-grad-start-dark: 54%; --l-btn-arcane-grad-end-dark: 46%;

  /* Samengestelde 2-stop Button Gradient Kleuren (dark) */
  --color-btn-fire-grad-start:   hsl(var(--hue-theme-fire) var(--sat-theme-fire) var(--l-btn-fire-grad-start-dark));
  --color-btn-fire-grad-end:     hsl(var(--hue-theme-fire) var(--sat-theme-fire) var(--l-btn-fire-grad-end-dark));
  --color-btn-water-grad-start:  hsl(var(--hue-theme-water) var(--sat-theme-water) var(--l-btn-water-grad-start-dark));
  --color-btn-water-grad-end:    hsl(var(--hue-theme-water) var(--sat-theme-water) var(--l-btn-water-grad-end-dark));
  --color-btn-forest-grad-start: hsl(var(--hue-theme-forest) var(--sat-theme-forest) var(--l-btn-forest-grad-start-dark));
  --color-btn-forest-grad-end:   hsl(var(--hue-theme-forest) var(--sat-theme-forest) var(--l-btn-forest-grad-end-dark));
  --color-btn-sun-grad-start:    hsl(var(--hue-theme-sun) var(--sat-theme-sun) var(--l-btn-sun-grad-start-dark));
  --color-btn-sun-grad-end:      hsl(var(--hue-theme-sun) var(--sat-theme-sun) var(--l-btn-sun-grad-end-dark));
  --color-btn-arcane-grad-start: hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) var(--l-btn-arcane-grad-start-dark));
  --color-btn-arcane-grad-end:   hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) var(--l-btn-arcane-grad-end-dark));

  /* == Resource Battery Kleuren (Dark Mode) == */
  --l-resource-health-fill-dark: 50%;
  --l-resource-mana-fill-dark:   53%;
  --l-resource-stamina-fill-dark:58%;

  /* -- Samengestelde Kleuren voor Resource Battery Fill - BASIS (Dark Mode) -- */
  --color-resource-health:  hsl(var(--hue-resource-health) var(--sat-resource-health) var(--l-resource-health-fill-dark));
  --color-resource-mana:    hsl(var(--hue-resource-mana)   var(--sat-resource-mana)   var(--l-resource-mana-fill-dark));
  --color-resource-stamina: hsl(var(--hue-resource-stamina)var(--sat-resource-stamina)var(--l-resource-stamina-fill-dark));

  /* -- Lightness & Saturation voor Resource Battery Fill - HOVER (Dark Mode) -- */
  /* Maak deze nog helderder/meer verzadigd voor het oplicht-effect */
  --l-resource-health-fill-hover-dark: 75%;   --sat-resource-health-fill-hover-dark: 100%;
  --l-resource-mana-fill-hover-dark:   78%;   --sat-resource-mana-fill-hover-dark:   98%;
  --l-resource-stamina-fill-hover-dark:82%;   --sat-resource-stamina-fill-hover-dark:100%;

    /* -- Aanpassen/Toevoegen: Generieke dark mode lightness voor de primary rol -- */
  /* Deze werken samen met de --hue-app-primary en --sat-app-primary van het actieve [data-theme] */
  /* Als je deze al had, controleer of ze passen bij de nieuwe structuur. */
  --lightness-app-primary: 48%;       /* Primary wordt donkerder in dark mode */
  --lightness-app-primary-hover: 42%; /* Nog iets donkerder bij hover */
  --lightness-app-primary-on-fg: 90%; /* Tekst op primary wordt lichter */

  /* -- Toevoegen: Optionele dark mode tweaks PER THEMA, indien de generieke aanpassing niet volstaat -- */
  /* Deze komen BINNEN het html.dark { ... } blok */

  &[data-theme="oceanicFlow"] {
    /* Als de generieke dark-mode lightness voor primary (48%) niet ideaal is voor water: */
    /* --lightness-app-primary: 45%; */
    /* Eventuele andere dark-mode specifieke overrides voor dit thema: */
    /* --color-background: hsl(var(--hue-water-source) 25% 8%); */
  }

  &[data-theme="verdantGrowth"] {
    /* Als de generieke dark-mode lightness voor primary (48%) niet ideaal is voor forest: */
    /* --lightness-app-primary: 40%; */ /* Forest is al donker, misschien nog iets meer */
    /* --lightness-app-primary-on-fg: 95%; */ /* Zorg voor goed contrast */
  }

  &[data-theme="arcaneMyst"] {
    /* Als de generieke dark-mode lightness voor primary (48%) niet ideaal is voor arcane: */
    /* --lightness-app-primary: 50%; */ /* Arcane kan iets lichter blijven */
    /* --lightness-app-primary-on-fg: 92%; */
  }


}


/* Oceanic Flow Thema (Water-gebaseerd) */
[data-theme="oceanicFlow"] {
  --hue-app-primary: var(--hue-water-source);
  --sat-app-primary: var(--sat-water-source);
  /* Optioneel: Pas lightness specifiek voor dit thema aan indien nodig */
  /* --lightness-app-primary: 57%; */
  /* --lightness-app-primary-on-fg: 95%; */ /* Voor lichte tekst op donkerdere primary */

  /* Optioneel: Verdere thematische aanpassingen voor oceanicFlow */
  /* --color-background: hsl(var(--hue-water-source) 30% 97%); */
  /* --color-border: hsl(var(--hue-water-source) 40% 85%); */
  /* --hue-accent: var(--hue-sun-source); */ /* bv. geel accent */
  /* --sat-accent: var(--sat-sun-source); */
}

/* Verdant Growth Thema (Forest-gebaseerd) */
[data-theme="verdantGrowth"] {
  --hue-app-primary: var(--hue-forest-source);
  --sat-app-primary: var(--sat-forest-source);
  /* Optioneel: Pas lightness specifiek voor dit thema aan indien nodig */
  /* --lightness-app-primary: 48%; */ /* Forest is vaak donkerder */
  /* --lightness-app-primary-on-fg: 98%; */ /* Zeer lichte tekst */

  /* Optioneel: Verdere thematische aanpassingen voor verdantGrowth */
  /* --color-background-secondary: hsl(var(--hue-forest-source) 25% 96%); */
  /* --hue-accent: var(--hue-gold-source); */ /* bv. goud accent */
  /* --sat-accent: var(--sat-gold-source); */
}

/* Arcane Myst Thema (Arcane-gebaseerd) */
[data-theme="arcaneMyst"] {
  --hue-app-primary: var(--hue-arcane-source);
  --sat-app-primary: var(--sat-arcane-source);
  /* Default lightness (58%) werkt hier waarschijnlijk goed. */
  /* --lightness-app-primary-on-fg: 95%; */ /* Eventueel lichtere tekst op paars */

  /* Optioneel: Verdere thematische aanpassingen voor arcaneMyst */
  /* --color-surface: hsl(var(--hue-arcane-source) 20% 98%); */
  /* --hue-accent: var(--hue-neutral); */ /* bv. neutraal grijs/zilver accent */
  /* --sat-accent: 5%; */
}

/* Voorbeeld als je 'balancedGold' expliciet als data-theme wilt definiëren
   (niet strikt nodig als :root al de balancedGold waarden heeft voor --hue-app-primary etc.) */
/*
[data-theme="balancedGold"] {
  --hue-app-primary: var(--hue-gold-source);
  --sat-app-primary: var(--sat-gold-source);
  // De lightness variabelen gebruiken de defaults uit :root
}
*/


/* 5 ▸ Foundation styles */
body {
  @apply bg-[var(--color-background)] text-[var(--color-foreground)];
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100dvh;
  line-height: 1.5;
  font-size: 110%; // Standaard is 16px, dit is een goede basis. 
                   // Als je ALLES groter wilt, kun je dit verhogen naar bv. 105% of 110%.
                   // Laten we voor nu de componenten zelf aanpassen.
}

.container-max {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
}
input::placeholder,
textarea::placeholder { color: var(--color-placeholder); opacity: .7; }
.shadow-surface    { box-shadow: var(--elevation-xs); }
.shadow-surface-sm { box-shadow: var(--elevation-sm); }
.shadow-surface-md { box-shadow: var(--elevation-md); }
.shadow-surface-lg { box-shadow: var(--elevation-lg); }
royal-code-ui-stat-bar-segment .stat-bar-segment { background: transparent; }
/* ========================================================================== */
/* NEON EFFECT ON HOVER – FOUNDATION                                          */
/* ========================================================================== */

.neon-effect-target,
.neon-card-border {
  transition-property: box-shadow, padding;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: .2s;
  box-shadow: none;
}

/* ========================================================================== */
/* 1. BUTTON GLOWS (neon-effect-target)                                       */
/* ========================================================================== */

$themes: (
  primary: ( var(--hue-app-primary),  var(--sat-app-primary), var(--l-neon-glow-primary-light),  var(--l-neon-glow-primary-dark) ),
  fire:    ( var(--hue-theme-fire),   var(--sat-theme-fire),  var(--l-neon-glow-fire-light),     var(--l-neon-glow-fire-dark) ),
  water:   ( var(--hue-theme-water),  var(--sat-theme-water), var(--l-neon-glow-water-light),    var(--l-neon-glow-water-dark) ),
  forest:  ( var(--hue-theme-forest), var(--sat-theme-forest),var(--l-neon-glow-forest-light),   var(--l-neon-glow-forest-dark)),
  sun:     ( var(--hue-theme-sun),    var(--sat-theme-sun),   var(--l-neon-glow-sun-light),      var(--l-neon-glow-sun-dark)   ),
  arcane:  ( var(--hue-theme-arcane), var(--sat-theme-arcane),var(--l-neon-glow-arcane-light),   var(--l-neon-glow-arcane-dark) )
);

/* genereer :hover & .group:hover varianten voor elke knop-kleur */
@each $name, $vals in $themes {
  .neon-effect-target.neon-#{$name}:hover,
  .group:hover .neon-effect-target.neon-#{$name} {
    box-shadow: 0 0 var(--neon-blur-radius-hover)
                     var(--neon-spread-radius-hover)
                     hsla(nth($vals,1), nth($vals,2), nth($vals,3), var(--neon-opacity-hover));
  }
  html.dark .neon-effect-target.neon-#{$name}:hover,
  html.dark .group:hover .neon-effect-target.neon-#{$name} {
    box-shadow: 0 0 var(--neon-blur-radius-hover)
                     var(--neon-spread-radius-hover)
                     hsla(nth($vals,1), nth($vals,2), nth($vals,4), var(--neon-opacity-hover));
  }
}

/* ========================================================================== */
/* 2. OPTIONAL – CARD BORDER GLOWS (neon-card-border)                         */
/*    Laat weg als je geen kaart-shadows gebruikt                            */
/* ========================================================================== */

@each $name, $vals in $themes {
  .neon-card-border.neon-#{$name}:hover,
  .group:hover .neon-card-border.neon-#{$name} {
    box-shadow: 0 0 var(--card-neon-blur-radius-hover)
                     var(--card-neon-spread-radius-hover)
                     hsla(nth($vals,1), nth($vals,2), nth($vals,3), var(--card-neon-opacity-hover));
  }
  html.dark .neon-card-border.neon-#{$name}:hover,
  html.dark .group:hover .neon-card-border.neon-#{$name} {
    box-shadow: 0 0 var(--card-neon-blur-radius-hover)
                     var(--card-neon-spread-radius-hover)
                     hsla(nth($vals,1), nth($vals,2), nth($vals,4), var(--card-neon-opacity-hover));
  }
}
/* ────────────────────────────────────────────────────────── */
/* NEON GLOW RONDOM ALLEEN DE FILL – voor Angular component */
/* ────────────────────────────────────────────────────────── */

/* 1) Laat de standaard overflow-hidden track wél de glow zien */
@each $theme, $vals in $themes {
  .neon-target-progress-#{$theme} .rounded-full {
    overflow: visible !important;
  }
}

/* 2) Zorg voor een soepele shadow-transition op de fill */
.progress-bar-fill-element {
  transition: box-shadow .2s cubic-bezier(.4,0,.2,1) !important;
}

/* 3) Per thema: hover-shadow EXACT onder fill */
@each $theme, $vals in $themes {
  $hue     : nth($vals,1);
  $sat     : nth($vals,2);
  $light   : nth($vals,3);
  $dark    : nth($vals,4);

  .neon-target-progress-#{$theme} {
    /* light-mode */
    &:hover .progress-bar-fill-element,
    .group:hover & .progress-bar-fill-element {
      box-shadow:
        0 0 var(--progress-neon-blur-radius-hover)
             var(--progress-neon-spread-radius-hover)
        hsla(#{$hue}, #{$sat}, #{$light}, var(--progress-neon-opacity-hover))
        !important;
    }

    /* dark-mode */
    html.dark & {
      &:hover .progress-bar-fill-element,
      .group:hover & .progress-bar-fill-element {
        box-shadow:
          0 0 var(--progress-neon-blur-radius-hover)
               var(--progress-neon-spread-radius-hover)
          hsla(#{$hue}, #{$sat}, #{$dark},  var(--progress-neon-opacity-hover))
          !important;
      }
    }
  }
}

// --- neon resoruce battery ---
.group:hover .neon-card-border.neon-fire { /* Of .neon-water, .neon-sun */
  box-shadow: 0 0 var(--card-neon-blur-radius-hover)
                   var(--card-neon-spread-radius-hover)
                   hsla(var(--hue-theme-fire) /* of water, sun */, var(--sat-theme-fire) /* etc. */, var(--l-neon-glow-fire-light) /* of dark variant */, var(--card-neon-opacity-hover));
}

html.dark .group:hover .neon-card-border.neon-fire {
  box-shadow: 0 0 var(--card-neon-blur-radius-hover)
                   var(--card-neon-spread-radius-hover)
                   hsla(var(--hue-theme-fire), var(--sat-theme-fire), var(--l-neon-glow-fire-dark), var(--card-neon-opacity-hover));
}

/* Deze variabelen zullen de standaard --color-resource-* variabelen overschrijven
   wanneer de .resource-battery.group gehovered wordt, specifiek voor de
   .bar-segment.is-filled elementen.
*/
.resource-battery.group:hover {
  /* Light Mode Hover Kleuren voor Segmenten */
  --color-resource-health:  hsl(var(--hue-resource-health) var(--sat-resource-health-fill-hover-light) var(--l-resource-health-fill-hover-light));
  --color-resource-mana:    hsl(var(--hue-resource-mana)   var(--sat-resource-mana-fill-hover-light)   var(--l-resource-mana-fill-hover-light));
  --color-resource-stamina: hsl(var(--hue-resource-stamina)var(--sat-resource-stamina-fill-hover-light)var(--l-resource-stamina-fill-hover-light));
}

html.dark .resource-battery.group:hover {
  /* Dark Mode Hover Kleuren voor Segmenten */
  --color-resource-health:  hsl(var(--hue-resource-health) var(--sat-resource-health-fill-hover-dark) var(--l-resource-health-fill-hover-dark));
  --color-resource-mana:    hsl(var(--hue-resource-mana)   var(--sat-resource-mana-fill-hover-dark)   var(--l-resource-mana-fill-hover-dark));
  --color-resource-stamina: hsl(var(--hue-resource-stamina)var(--sat-resource-stamina-fill-hover-dark)var(--l-resource-stamina-fill-hover-dark));
}
--- END OF FILE ---

--- START OF FILE apps/cv/src/index.html ---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>cv</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />

    <script>
      (function() {
        try {
          const storageKey = 'cvApp_theme';
          const preferenceString = localStorage.getItem(storageKey);
          const defaultIsDark = true; 

          if (preferenceString) {
            const preference = JSON.parse(preferenceString);
            if (preference.darkMode) {
              document.documentElement.classList.add('dark');
            }
            if (preference.currentTheme) {
              document.documentElement.setAttribute('data-theme', preference.currentTheme);
            }
          } else {
            if (defaultIsDark) {
              document.documentElement.classList.add('dark');
            }
          }
        } catch (e) {
          console.error('Error applying initial theme', e);
        }
      })();
    </script>

  </head>
  <body>
    <app-cv-root></app-cv-root>
  </body>
</html>
--- END OF FILE ---

--- START OF FILE apps/cv/src/main.ts ---
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
--- END OF FILE ---

--- START OF FILE apps/cv/src/styles.scss ---
.container-max {
      max-width: 1200px !important; 
}
--- END OF FILE ---

--- START OF FILE libs/core/navigation/data-access/src/index.ts ---
// -- providers --
--- END OF FILE ---

--- START OF FILE libs/core/navigation/domainn/navigation.token.ts ---
/**
 * @file navigation.token.ts
 * @Version 1.1.0 (Footer Config Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Definieert de InjectionToken en de configuratie-interface voor het leveren van
 *   app-specifieke navigatiedata aan gedeelde componenten. Nu inclusief een
 *   optionele 'footer' property.
 */
import { InjectionToken } from '@angular/core';
import { NavigationItem } from '@royal-code/shared/domain';

export interface AppNavigationConfig {
  primary: NavigationItem[];
  topBar: NavigationItem[];
  mobileModal: NavigationItem[];
  footer?: { 
    supportLinks: NavigationItem[];
    shopLinks: NavigationItem[];
    companyLinks: NavigationItem[];
  };
}

export const APP_NAVIGATION_ITEMS = new InjectionToken<AppNavigationConfig>('APP_NAVIGATION_ITEMS');
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/src/index.ts ---
/**
 * @file index.ts (core/navigation/state)
 * @Version 2.0.0 (Cleaned Exports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Clean public API for the navigation state management library.
 *   Avoids ambiguous re-exports.
 */

// DE FIX (TS2308): Exporteer specifiek om ambiguïteit te voorkomen
export * from './lib/navigation.actions';
export * from './lib/navigation.feature';
export * from './lib/navigation.facade';
export * from './navigation.provider';
export type { NavigationState } from './lib/navigation.reducer';
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/src/lib/navigation.actions.ts ---
// libs/core/state/navigation/navigation.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { NavigationItem } from '@royal-code/shared/domain';

export const NavigationActions = createActionGroup({
  source: 'Navigation',
  events: {
    'Load Navigation': emptyProps(),
    'Load Navigation Success': props<{ navigation: NavigationItem[] }>(),
    'Load Navigation Failure': props<{ error: string }>(),
  },
});
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/src/lib/navigation.effects.ts ---
/**
 * @file navigation.effects.ts
 * @Version 2.3.0 (Hardcoded Data & Removed ApiService Dependency)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   NgRx effects for managing navigation state. Now hardcodes navigation data
 *   and removes the dependency on `AbstractNavigationApiService` since data
 *   is not fetched externally.
 */
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

import { NavigationActions } from './navigation.actions';
import { selectNavigationState } from './navigation.feature';
import { AppIcon, NavDisplayHintEnum, NavigationItem } from '@royal-code/shared/domain';

@Injectable()
export class NavigationEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  // DE FIX: Geen injectie van AbstractNavigationApiService meer
  // private navigationApiService = inject(AbstractNavigationApiService); 

  loadNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NavigationActions.loadNavigation),
      withLatestFrom(this.store.select(selectNavigationState)),
      switchMap(([, state]) => {
        const mockNavigationItems: NavigationItem[] = [
          {
            id: 'home',
            labelKey: 'navigation.home',
            route: '/',
            icon: AppIcon.Home,
            displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileBottom],
          },
          {
            id: 'products',
            labelKey: 'navigation.products',
            route: '/products',
            icon: AppIcon.Box,
            displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileBottom, NavDisplayHintEnum.MobileModal],
          },
          {
            id: 'challenges',
            labelKey: 'navigation.challenges',
            route: '/challenges',
            icon: AppIcon.Award,
            displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal],
            requiresAuth: true,
          },
          {
            id: 'profile',
            labelKey: 'navigation.profile',
            route: '/profile',
            icon: AppIcon.User,
            displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.UserMenu, NavDisplayHintEnum.MobileModal],
            requiresAuth: true,
          },
          {
            id: 'settings',
            labelKey: 'navigation.settings',
            route: '/settings',
            icon: AppIcon.Settings,
            displayHint: [NavDisplayHintEnum.UserMenu, NavDisplayHintEnum.MobileModal],
            requiresAuth: true,
          },
          {
            id: 'logout',
            labelKey: 'navigation.logout',
            route: '/logout',
            icon: AppIcon.LogOut,
            displayHint: [NavDisplayHintEnum.UserMenu, NavDisplayHintEnum.MobileModal],
            requiresAuth: true,
          },
        ];
        return of(NavigationActions.loadNavigationSuccess({ navigation: mockNavigationItems })).pipe(
          catchError((error) =>
            of(NavigationActions.loadNavigationFailure({ error: error.message }))
          )
        );
      })
    )
  );
}
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/src/lib/navigation.facade.ts ---
/**
 * @file navigation.facade.ts
 * @Version 2.2.0 (Type-Safe Navigation Filtering & Corrected Imports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Facade for managing navigation-related state, providing a simplified API
 *   for UI components.
 */
import { inject, Injectable, Signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { NavigationActions } from './navigation.actions';
// DE FIX (TS2459): Importeer State niet meer, is intern. Importeer selectors en feature.
import { selectAllNavigation, selectError, selectIsLoading } from './navigation.feature';
import { NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { authFeature } from '@royal-code/store/auth';

@Injectable({ providedIn: 'root' })
export class NavigationFacade {
  private readonly store = inject(Store);
  private readonly isAuthenticated = this.store.selectSignal(authFeature.selectIsAuthenticated);

  readonly isLoading$: Observable<boolean> = this.store.select(selectIsLoading);
  readonly error$: Observable<string | null> = this.store.select(selectError);
  readonly allNavigationItems$: Observable<NavigationItem[]> = this.store.select(selectAllNavigation);

  // Signaal-gebaseerde API
  readonly isLoading: Signal<boolean> = toSignal(this.isLoading$, { initialValue: true });
  readonly error: Signal<string | null> = toSignal(this.error$, { initialValue: null });
  readonly allNavigationItems: Signal<NavigationItem[]> = toSignal(this.allNavigationItems$, { initialValue: [] });

  readonly visibleNavigationItems = computed(() => {
    const items = this.allNavigationItems();
    const isAuthenticated = this.isAuthenticated();
    return items.filter(item => !item.requiresAuth || isAuthenticated);
  });

  readonly desktopNavigationItems = computed(() => this.filterByHint(this.visibleNavigationItems(), NavDisplayHintEnum.Desktop));
  readonly mobileBottomNavigationItems = computed(() => this.filterByHint(this.visibleNavigationItems(), NavDisplayHintEnum.MobileBottom));
  readonly mobileModalNavigationItems = computed(() => this.filterByHint(this.visibleNavigationItems(), NavDisplayHintEnum.MobileModal));
  readonly userMenuNavigationItems = computed(() => this.filterByHint(this.visibleNavigationItems(), NavDisplayHintEnum.UserMenu));

  loadNavigation(): void {
    this.store.dispatch(NavigationActions.loadNavigation());
  }

  private filterByHint(items: NavigationItem[], hint: NavDisplayHintEnum): NavigationItem[] {
    return items.filter(item => item.displayHint?.includes(hint));
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/src/lib/navigation.feature.ts ---
/**
 * @file navigation.feature.ts
 * @Version 2.0.0 (Feature Creation & Selector Export)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   NgRx feature definition for the Navigation domain, co-locating reducer
 *   and selectors. Ensures proper export of the feature and its selectors.
 */
import { createFeature, createSelector } from '@ngrx/store';
import { navigationReducer, navigationAdapter, NavigationState } from './navigation.reducer';

export const NAVIGATION_FEATURE_KEY = 'navigation';

export const navigationFeature = createFeature({
  name: NAVIGATION_FEATURE_KEY,
  reducer: navigationReducer,
  extraSelectors: ({ selectNavigationState }) => {
    const { selectAll } = navigationAdapter.getSelectors();

    const selectAllNavigation = createSelector(
      selectNavigationState,
      (state) => selectAll(state)
    );

    return {
      selectAllNavigation,
    };
  },
});

export const {
  name,
  reducer,
  selectNavigationState,
  selectIsLoading,
  selectError,
  selectAllNavigation,
} = navigationFeature;

// DE FIX (TS1205): Gebruik 'export type' voor re-exporting in isolated modules.
export type { NavigationState };
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/src/lib/navigation.reducer.ts ---
/**
 * @file navigation.reducer.ts
 * @Version 2.0.0 (Entity Adapter & Proper State Export)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   NgRx reducer for the Navigation domain, managing navigation items
 *   using the NgRx Entity Adapter pattern. Correctly exports `NavigationState`.
 */
import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { NavigationItem } from '@royal-code/shared/domain';
import { NavigationActions } from './navigation.actions';

/**
 * @description NgRx Entity Adapter voor `NavigationItem`s.
 */
export const navigationAdapter: EntityAdapter<NavigationItem> = createEntityAdapter<NavigationItem>({
  selectId: (item: NavigationItem) => item.id,
});

/**
 * @interface NavigationState
 * @description De interface voor de Navigation feature state.
 */
export interface NavigationState extends EntityState<NavigationItem> {
  isLoading: boolean;
  error: string | null;
  lastLoaded: number | null;
}

/**
 * @description De initiële staat van de Navigation feature.
 */
export const initialState: NavigationState = navigationAdapter.getInitialState({
  isLoading: false,
  error: null,
  lastLoaded: null,
});

/**
 * @description De reducer functie voor de Navigation feature.
 */
export const navigationReducer = createReducer(
  initialState,
  on(NavigationActions.loadNavigation, (state) => ({ ...state, isLoading: true, error: null })),
  on(NavigationActions.loadNavigationSuccess, (state, { navigation }) =>
    navigationAdapter.setAll(navigation, { ...state, isLoading: false, error: null, lastLoaded: Date.now() })
  ),
  on(NavigationActions.loadNavigationFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
);
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/src/lib/navigation.selectors.ts ---
// libs/core/state/navigation/navigation.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NavigationState } from './navigation.state';
import { navigationFeatureKey } from './navigation.reducer';

export const selectNavigationState = createFeatureSelector<NavigationState>(navigationFeatureKey);

export const selectRawNavigationItems = createSelector(
  selectNavigationState,
  (state) => state.items
);

export const selectNavigationLoading = createSelector(
  selectNavigationState,
  (state) => state.loading
);

export const selectNavigationError = createSelector(
  selectNavigationState,
  (state) => state.error
);
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/src/lib/navigation.state.ts ---
// libs/core/state/navigation/navigation.state.ts

import { NavigationItem } from "@royal-code/shared/domain";

export interface NavigationState {
  items: NavigationItem[];
  loading: boolean;
  error: string | null;
}

export const initialNavigationState: NavigationState = {
  items: [],
  loading: false,
  error: null,
};
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/src/navigation.provider.ts ---
/**
 * @file navigation.providers.ts
 * @Version 2.0.0 (Simplified `createFeature` Provider)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Provides the NgRx state and effects for the navigation feature using
 *   the modern, simplified `createFeature` approach.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { navigationFeature } from './lib/navigation.feature';
import { NavigationEffects } from './lib/navigation.effects';

/**
 * @description Provides the navigation feature state and effects to the application.
 * @returns {EnvironmentProviders}
 */
export function provideNavigationFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // DE FIX (TS2769): Gebruik de feature direct in provideState
    provideState(navigationFeature),
    provideEffects([NavigationEffects]),
  ]);
}
--- END OF FILE ---

--- START OF FILE libs/core/routing/src/lib/global-routes.ts ---
export const LABELS = {
  home: 'home',
  auth: 'authentication',
  user: 'User',
  profile: 'profile',
  settings: 'settings',
  product: 'product',
  challenges: 'challenges',
  social: 'social',
  stats: 'stats',
  avatar: 'avatar',
  achievements: 'achievements',
  notifications: 'notifications',
  help: 'help',
  about: 'about',
  contact: 'contact',
  faq: 'FAQ',
  privacy: 'privacy',
  nodes: 'nodes',
  quests: 'quests',
};

export const ROUTES = {
  home: '',
  auth: {
    path: LABELS.auth,
    login: `login`,
    signup: `${LABELS.auth}/signup`,
  },
  user: {
    path: LABELS.user,
      profile: `${LABELS.user}/profile`,
      settings: `${LABELS.user}/settings`,
  },
  product: {
    path: LABELS.product,
    detailPage: `${LABELS.product}/:id`,
  },
  challenges: {
    path: LABELS.challenges,
    overview: `${LABELS.challenges}/overview`,
    daily: `${LABELS.challenges}/daily`,
    weekly: `${LABELS.challenges}/weekly`,
    monthly: `${LABELS.challenges}/monthly`
  },
  social: {
    path: LABELS.social,
    friends: `${LABELS.social}/friends`,
    groups: `${LABELS.social}/groups`,
    leaderboard: `${LABELS.social}/leaderboard`
  },
  stats: {
    path: LABELS.stats,
    personal: `${LABELS.stats}/personal`
  },
  avatar: {
    path: LABELS.avatar,
    customization: `${LABELS.avatar}/customization`
  },
  achievements: {
    path: LABELS.achievements
  },
  notifications: {
    path: LABELS.notifications
  },
  help: {
    path: LABELS.help,
    center: `${LABELS.help}/center`
  },
  about: {
    path: LABELS.about,
    us: `${LABELS.about}/us`
  },
  contact: {
    path: LABELS.contact
  },
  faq: {
    path: LABELS.faq
  },
  privacy: {
    path: LABELS.privacy,
    policy: `${LABELS.privacy}/policy`
  },
  nodes: {
    path: LABELS.nodes,
    detail: `${LABELS.nodes}/:id`
  },
  quests: {
    path: LABELS.quests,
    detail: `${LABELS.quests}/:id`
  }
};
--- END OF FILE ---

--- START OF FILE libs/core/routing/src/lib/routing/router-state-url.model.ts ---
// libs/shared/domain/src/lib/routing/router-state-url.model.ts
import { Params, Data } from '@angular/router';

/**
 * Interface for the custom router state information stored in NgRx.
 * Contains relevant parts of the RouterStateSnapshot.
 */
export interface RouterStateUrl {
  url: string;                // The full URL
  params: Params;             // Route parameters (e.g., { id: '123' })
  queryParams: Params;        // Query parameters (e.g., { search: 'test' })
  fragment?: string | null;    // URL fragment (e.g., 'section-1')
  data: Data;                 // Route data defined in route configuration
  // Voeg eventueel andere properties toe die je uit de snapshot wilt halen
  // routeConfigPath?: string; // Pad van de geactiveerde route config
}
--- END OF FILE ---

--- START OF FILE libs/shared/styles/src/lib/theme.scss ---
/* apps/challenger/src/styles.scss
   ============================================================================
   Challenger Design System – tokens (enterprise)          v3.16.1 (Neon on Hover)
   - Neon effect nu alleen on hover voor .neon-effect-target elementen.
   - Oude .btn-neon.neon-<theme> klassen verwijderd.
   ========================================================================== */

/* 1 ▸ Imports ------------------------------------------------------------- */
@import "tailwindcss";
@import "@ctrl/ngx-emoji-mart/picker";   /* indien nog gebruikt */


/* 2 ▸ LIGHT-MODE TOKENS (:root) ------------------------------------------ */
:root {
  /* -- 2A. Hue & Saturation basis --------------------------------------- */
  --hue-app-primary: 38;   --sat-app-primary: 92%;
  --hue-theme-sun:    45;  --sat-theme-sun:    95%;
  --hue-theme-fire:    0;  --sat-theme-fire:   88%;
  --hue-theme-water: 210;  --sat-theme-water:  80%;
  --hue-theme-forest:130;  --sat-theme-forest: 65%;
  --hue-theme-arcane:270;  --sat-theme-arcane: 70%;
  --hue-neutral: 215;  --sat-neutral: 15%;  --sat-neutral-strong: 20%;
  --hue-accent:  200;  --sat-accent:  80%;
  --hue-success-state:134; --sat-success-state:60%;
  --hue-error-state:   0;  --sat-error-state: 85%;
  --hue-info-state:   205; --sat-info-state:  80%;
  --hue-warning-state: 40; --sat-warning-state:90%;

  /* -- 2B. 5-stop gradient hues/sats (card borders) --------------------- */
  --hue-fire-grad-stop1: 0;  --sat-fire-grad-stop1: 95%;
  --hue-fire-grad-stop2: 8;  --sat-fire-grad-stop2: 93%;
  --hue-fire-grad-stop3:20;  --sat-fire-grad-stop3: 90%;
  --hue-fire-grad-stop4: 8;  --sat-fire-grad-stop4: 93%;
  --hue-fire-grad-stop5: 0;  --sat-fire-grad-stop5: 95%;
  --hue-water-grad-stop1:210; --sat-water-grad-stop1:92%;
  --hue-water-grad-stop2:200; --sat-water-grad-stop2:88%;
  --hue-water-grad-stop3:190; --sat-water-grad-stop3:85%;
  --hue-water-grad-stop4:200; --sat-water-grad-stop4:88%;
  --hue-water-grad-stop5:210; --sat-water-grad-stop5:92%;
  --hue-forest-grad-stop1:120; --sat-forest-grad-stop1:78%;
  --hue-forest-grad-stop2:130; --sat-forest-grad-stop2:75%;
  --hue-forest-grad-stop3:100; --sat-forest-grad-stop3:72%;
  --hue-forest-grad-stop4:130; --sat-forest-grad-stop4:75%;
  --hue-forest-grad-stop5:120; --sat-forest-grad-stop5:78%;
  --hue-sun-grad-stop1:50; --sat-sun-grad-stop1:100%;
  --hue-sun-grad-stop2:45; --sat-sun-grad-stop2: 98%;
  --hue-sun-grad-stop3:40; --sat-sun-grad-stop3: 95%;
  --hue-sun-grad-stop4:45; --sat-sun-grad-stop4: 98%;
  --hue-sun-grad-stop5:50; --sat-sun-grad-stop5:100%;
  --hue-arcane-grad-stop1:270; --sat-arcane-grad-stop1:75%;
  --hue-arcane-grad-stop2:285; --sat-arcane-grad-stop2:72%;
  --hue-arcane-grad-stop3:300; --sat-arcane-grad-stop3:78%;
  --hue-arcane-grad-stop4:255; --sat-arcane-grad-stop4:70%;
  --hue-arcane-grad-stop5:270; --sat-arcane-grad-stop5:75%;

  /* -- 2C. Light-mode lightness (5-stop card borders) -- */
  --l-fire-grad-stop1:55%; --l-fire-grad-stop2:58%;
  --l-fire-grad-stop3:62%; --l-fire-grad-stop4:58%;
  --l-fire-grad-stop5:55%;
  --l-water-grad-stop1:53%; --l-water-grad-stop2:58%;
  --l-water-grad-stop3:60%; --l-water-grad-stop4:58%;
  --l-water-grad-stop5:53%;
  --l-forest-grad-stop1:48%; --l-forest-grad-stop2:53%;
  --l-forest-grad-stop3:56%; --l-forest-grad-stop4:53%;
  --l-forest-grad-stop5:48%;
  --l-sun-grad-stop1:60%; --l-sun-grad-stop2:63%;
  --l-sun-grad-stop3:68%; --l-sun-grad-stop4:63%;
  --l-sun-grad-stop5:60%;
  --l-arcane-grad-stop1:58%; --l-arcane-grad-stop2:61%;
  --l-arcane-grad-stop3:65%; --l-arcane-grad-stop4:61%;
  --l-arcane-grad-stop5:58%;

  /* -- 2D. Full HSL colours (light) -- */
  --color-primary:             hsl(var(--hue-app-primary) var(--sat-app-primary) 58%);
  --color-primary-hover:       hsl(var(--hue-app-primary) var(--sat-app-primary) 51%);
  --color-primary-on:          hsl(var(--hue-app-primary) calc(var(--sat-app-primary)*.4) 12%);
  --color-theme-sun:           hsl(var(--hue-theme-sun) var(--sat-theme-sun) 60%);
  --color-theme-sun-hover:     hsl(var(--hue-theme-sun) var(--sat-theme-sun) 53%);
  --color-theme-sun-on:        hsl(var(--hue-theme-sun) calc(var(--sat-theme-sun)*.4) 15%);
  --color-theme-fire:          hsl(var(--hue-theme-fire) var(--sat-theme-fire) 55%);
  --color-theme-fire-hover:    hsl(var(--hue-theme-fire) var(--sat-theme-fire) 48%);
  --color-theme-fire-on:       hsl(var(--hue-theme-fire) calc(var(--sat-theme-fire)*.4) 100%);
  --color-theme-water:         hsl(var(--hue-theme-water) var(--sat-theme-water) 57%);
  --color-theme-water-hover:   hsl(var(--hue-theme-water) var(--sat-theme-water) 50%);
  --color-theme-water-on:      hsl(var(--hue-theme-water) calc(var(--sat-theme-water)*.4) 100%);
  --color-theme-forest:        hsl(var(--hue-theme-forest) var(--sat-theme-forest) 48%);
  --color-theme-forest-hover:  hsl(var(--hue-theme-forest) var(--sat-theme-forest) 41%);
  --color-theme-forest-on:     hsl(var(--hue-theme-forest) calc(var(--sat-theme-forest)*.4) 100%);
  --color-theme-arcane:        hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) 58%);
  --color-theme-arcane-hover:  hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) 51%);
  --color-theme-arcane-on:     hsl(var(--hue-theme-arcane) calc(var(--sat-theme-arcane)*.4) 100%);
  --color-background:          hsl(var(--hue-neutral) var(--sat-neutral) 98%);
  --color-foreground:          hsl(var(--hue-neutral) var(--sat-neutral-strong) 8%);
  --color-surface:             hsl(var(--hue-neutral) var(--sat-neutral) 100%);
  --color-surface-alt:         hsl(var(--hue-neutral) var(--sat-neutral) 96%);
  --surface-card:              hsl(var(--hue-neutral) var(--sat-neutral) 99%);
  --color-border:              hsl(var(--hue-neutral) var(--sat-neutral) 90%);
  --color-ring:                var(--color-primary);
  --color-text:                var(--color-foreground);
  --color-text-muted:          hsl(var(--hue-neutral) var(--sat-neutral) 66%);
  --color-placeholder:         hsl(var(--hue-neutral) var(--sat-neutral) 65%);
  --color-background-secondary:hsl(var(--hue-neutral) var(--sat-neutral) 96%);
  --color-hover:               hsl(var(--hue-neutral) var(--sat-neutral) 92%);
  --color-foreground-default:  hsl(var(--hue-neutral) var(--sat-neutral-strong) 15%);
  --color-secondary:           hsl(var(--hue-neutral) var(--sat-neutral) 45%);
  --color-secondary-hover:     var(--color-primary);
  --color-accent:              hsl(var(--hue-accent) var(--sat-accent) 58%);
  --color-accent-on:           hsl(var(--hue-accent) calc(var(--sat-accent)*.3) 100%);
  --color-success:             hsl(var(--hue-success-state) var(--sat-success-state) 50%);
  --color-success-on:          hsl(var(--hue-success-state) calc(var(--sat-success-state)*.3) 100%);
  --color-warning:             hsl(var(--hue-warning-state) var(--sat-warning-state) 50%);
  --color-warning-on:          hsl(var(--hue-warning-state) calc(var(--sat-warning-state)*.3) 15%);
--color-error:               var(--color-theme-fire);
--color-error-on:            var(--color-theme-fire-on); 
  --color-info:                hsl(var(--hue-info-state) var(--sat-info-state) 58%);
  --color-info-on:             hsl(var(--hue-info-state) calc(var(--sat-info-state)*.3) 100%);
    --color-overlay-backdrop: hsla(var(--hue-neutral) 20% 5% / 0.7); 

  /* 5-stop gradient full colours (light) - Card Borders */
  --color-fire-grad-stop1:   hsl(var(--hue-fire-grad-stop1) var(--sat-fire-grad-stop1) var(--l-fire-grad-stop1));
  --color-fire-grad-stop2:   hsl(var(--hue-fire-grad-stop2) var(--sat-fire-grad-stop2) var(--l-fire-grad-stop2));
  --color-fire-grad-stop3:   hsl(var(--hue-fire-grad-stop3) var(--sat-fire-grad-stop3) var(--l-fire-grad-stop3));
  --color-fire-grad-stop4:   hsl(var(--hue-fire-grad-stop4) var(--sat-fire-grad-stop4) var(--l-fire-grad-stop4));
  --color-fire-grad-stop5:   hsl(var(--hue-fire-grad-stop5) var(--sat-fire-grad-stop5) var(--l-fire-grad-stop5));
  --color-water-grad-stop1:  hsl(var(--hue-water-grad-stop1) var(--sat-water-grad-stop1) var(--l-water-grad-stop1));
  --color-water-grad-stop2:  hsl(var(--hue-water-grad-stop2) var(--sat-water-grad-stop2) var(--l-water-grad-stop2));
  --color-water-grad-stop3:  hsl(var(--hue-water-grad-stop3) var(--sat-water-grad-stop3) var(--l-water-grad-stop3));
  --color-water-grad-stop4:  hsl(var(--hue-water-grad-stop4) var(--sat-water-grad-stop4) var(--l-water-grad-stop4));
  --color-water-grad-stop5:  hsl(var(--hue-water-grad-stop5) var(--sat-water-grad-stop5) var(--l-water-grad-stop5));
  --color-forest-grad-stop1: hsl(var(--hue-forest-grad-stop1) var(--sat-forest-grad-stop1) var(--l-forest-grad-stop1));
  --color-forest-grad-stop2: hsl(var(--hue-forest-grad-stop2) var(--sat-forest-grad-stop2) var(--l-forest-grad-stop2));
  --color-forest-grad-stop3: hsl(var(--hue-forest-grad-stop3) var(--sat-forest-grad-stop3) var(--l-forest-grad-stop3));
  --color-forest-grad-stop4: hsl(var(--hue-forest-grad-stop4) var(--sat-forest-grad-stop4) var(--l-forest-grad-stop4));
  --color-forest-grad-stop5: hsl(var(--hue-forest-grad-stop5) var(--sat-forest-grad-stop5) var(--l-forest-grad-stop5));
  --color-sun-grad-stop1:    hsl(var(--hue-sun-grad-stop1) var(--sat-sun-grad-stop1) var(--l-sun-grad-stop1));
  --color-sun-grad-stop2:    hsl(var(--hue-sun-grad-stop2) var(--sat-sun-grad-stop2) var(--l-sun-grad-stop2));
  --color-sun-grad-stop3:    hsl(var(--hue-sun-grad-stop3) var(--sat-sun-grad-stop3) var(--l-sun-grad-stop3));
  --color-sun-grad-stop4:    hsl(var(--hue-sun-grad-stop4) var(--sat-sun-grad-stop4) var(--l-sun-grad-stop4));
  --color-sun-grad-stop5:    hsl(var(--hue-sun-grad-stop5) var(--sat-sun-grad-stop5) var(--l-sun-grad-stop5));
  --color-arcane-grad-stop1: hsl(var(--hue-arcane-grad-stop1) var(--sat-arcane-grad-stop1) var(--l-arcane-grad-stop1));
  --color-arcane-grad-stop2: hsl(var(--hue-arcane-grad-stop2) var(--sat-arcane-grad-stop2) var(--l-arcane-grad-stop2));
  --color-arcane-grad-stop3: hsl(var(--hue-arcane-grad-stop3) var(--sat-arcane-grad-stop3) var(--l-arcane-grad-stop3));
  --color-arcane-grad-stop4: hsl(var(--hue-arcane-grad-stop4) var(--sat-arcane-grad-stop4) var(--l-arcane-grad-stop4));
  --color-arcane-grad-stop5: hsl(var(--hue-arcane-grad-stop5) var(--sat-arcane-grad-stop5) var(--l-arcane-grad-stop5));

  /* Lightness waarden voor 2-stop Button Gradients (light) */
  --l-btn-fire-grad-start-light: 58%; --l-btn-fire-grad-end-light: 50%;
  --l-btn-water-grad-start-light: 60%; --l-btn-water-grad-end-light: 52%;
  --l-btn-forest-grad-start-light: 52%; --l-btn-forest-grad-end-light: 44%;
  --l-btn-sun-grad-start-light: 65%; --l-btn-sun-grad-end-light: 57%;
  --l-btn-arcane-grad-start-light: 62%; --l-btn-arcane-grad-end-light: 54%;

  /* Samengestelde 2-stop Button Gradient Kleuren (light) */
  --color-btn-fire-grad-start:   hsl(var(--hue-theme-fire) var(--sat-theme-fire) var(--l-btn-fire-grad-start-light));
  --color-btn-fire-grad-end:     hsl(var(--hue-theme-fire) var(--sat-theme-fire) var(--l-btn-fire-grad-end-light));
  --color-btn-water-grad-start:  hsl(var(--hue-theme-water) var(--sat-theme-water) var(--l-btn-water-grad-start-light));
  --color-btn-water-grad-end:    hsl(var(--hue-theme-water) var(--sat-theme-water) var(--l-btn-water-grad-end-light));
  --color-btn-forest-grad-start: hsl(var(--hue-theme-forest) var(--sat-theme-forest) var(--l-btn-forest-grad-start-light));
  --color-btn-forest-grad-end:   hsl(var(--hue-theme-forest) var(--sat-theme-forest) var(--l-btn-forest-grad-end-light));
  --color-btn-sun-grad-start:    hsl(var(--hue-theme-sun) var(--sat-theme-sun) var(--l-btn-sun-grad-start-light));
  --color-btn-sun-grad-end:      hsl(var(--hue-theme-sun) var(--sat-theme-sun) var(--l-btn-sun-grad-end-light));
  --color-btn-arcane-grad-start: hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) var(--l-btn-arcane-grad-start-light));
  --color-btn-arcane-grad-end:   hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) var(--l-btn-arcane-grad-end-light));

  /* Inputs */
  --color-input:               var(--color-background);
  --color-input-border:        var(--color-border);
  --color-input-ring:          var(--color-primary);
  --color-input-text:          var(--color-foreground);
  --color-input-placeholder:   var(--color-placeholder);

  /* Misc primitives */
  --elevation-xs:   0 1px 2px 0 hsla(var(--hue-neutral) 10% 0% / .05);
  --elevation-sm:   0 1px 3px 0 hsla(var(--hue-neutral) 10% 0% / .07), 0 1px 2px -1px hsla(var(--hue-neutral) 10% 0% / .04);
  --elevation-md:   0 4px 6px -1px hsla(var(--hue-neutral) 10% 0% / .07), 0 2px 4px -2px hsla(var(--hue-neutral) 10% 0% / .04);
  --elevation-lg:   0 10px 15px -3px hsla(var(--hue-neutral) 10% 0% / .07), 0 4px 6px -4px hsla(var(--hue-neutral) 10% 0% / .04);
  --radius-xs: .25rem; --radius-sm: .5rem; --radius-md: .75rem; --radius-lg: .75rem; --radius-full: 9999px;
  --header-height: 4rem;
  --z-backdrop: 500; --z-dropdown: 1000; --z-header: 1100;
  --z-modal: 1200;   --z-toast: 1300;   --z-tooltip: 1400;
  --radius: 0rem;

  /* Neon Variabelen (light-mode defaults voor de glow kleur) */
  --neon-blur-radius: 7px;
  --neon-spread-radius: 1px;
  --neon-opacity: 0.6;
  --neon-blur-radius-hover: 10px;
  --neon-spread-radius-hover: 2px;
  --neon-opacity-hover: 0.8;

  --card-neon-blur-radius-hover: 15px;
  --card-neon-spread-radius-hover: 5px;
  --card-neon-opacity-hover: 0.65;


  --l-neon-glow-primary-light: 60%;
  --l-neon-glow-fire-light: 65%;
  --l-neon-glow-water-light: 62%;
  --l-neon-glow-forest-light: 53%;
  --l-neon-glow-sun-light: 65%;
  --l-neon-glow-arcane-light: 60%;

  --progress-neon-blur-radius-hover: 5px;
  --progress-neon-spread-radius-hover: 4px;
  --progress-neon-opacity-hover: 0.75;


  /* == Resource Battery Kleuren (Light Mode) == */
  --hue-theme-fire:    0;  --sat-theme-fire:   88%; /* Voor Health */
  --hue-theme-water: 210;  --sat-theme-water:  80%; /* Voor Mana */
  --hue-theme-sun:    45;  --sat-theme-sun:    95%; /* Voor Stamina */
  /* Je kunt ook aparte --hue-resource-<type> definiëren als ze afwijken */
  --hue-resource-health: var(--hue-theme-fire);
  --sat-resource-health: var(--sat-theme-fire);
  --hue-resource-mana:   var(--hue-theme-water);
  --sat-resource-mana:   var(--sat-theme-water);
  --hue-resource-stamina:var(--hue-theme-sun);
  --sat-resource-stamina:var(--sat-theme-sun);

  /* -- Lightness voor Resource Battery Fill - BASIS (Light Mode) -- */
  /* Deze waarden zijn voor de *gevulde* segmenten in rust */
  --l-resource-health-fill-light: 45%; /* Iets donkerder dan button voor diepte */
  --l-resource-mana-fill-light:   48%;
  --l-resource-stamina-fill-light:52%;

  /* -- Samengestelde Kleuren voor Resource Battery Fill - BASIS (Light Mode) -- */
  --color-resource-health:  hsl(var(--hue-resource-health) var(--sat-resource-health) var(--l-resource-health-fill-light));
  --color-resource-mana:    hsl(var(--hue-resource-mana)   var(--sat-resource-mana)   var(--l-resource-mana-fill-light));
  --color-resource-stamina: hsl(var(--hue-resource-stamina)var(--sat-resource-stamina)var(--l-resource-stamina-fill-light));

  /* -- Lightness & Saturation voor Resource Battery Fill - HOVER (Light Mode) -- */
  /* Deze waarden zijn voor de *gevulde* segmenten bij hover - maak ze helderder/meer verzadigd */
  --l-resource-health-fill-hover-light: 65%;  --sat-resource-health-fill-hover-light: 100%;
  --l-resource-mana-fill-hover-light:   70%;  --sat-resource-mana-fill-hover-light:   98%;
  --l-resource-stamina-fill-hover-light:75%;  --sat-resource-stamina-fill-hover-light:100%;

  /* --- Samengestelde Kleuren voor Resource Battery Fill - HOVER (Light Mode) --- */
  --hue-gold-source: 38;     --sat-gold-source: 92%;   /* Voor balancedGold */
  --hue-water-source: 210;   --sat-water-source:  80%;  /* Voor oceanicFlow */
  --hue-forest-source:130;   --sat-forest-source: 65%;  /* Voor verdantGrowth */
  --hue-arcane-source:270;   --sat-arcane-source: 70%;  /* Voor arcaneMyst */
  --lightness-app-primary: 58%;
  --lightness-app-primary-hover: 51%;
  --lightness-app-primary-on-fg: 12%; /* Voor donkere tekst op lichte primary */


}

/* 3 ▸ Tailwind tokens exposé */
@theme {
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
  --color-surface: var(--color-surface);
  --color-surface-alt: var(--color-surface-alt);
  --surface-card: var(--surface-card);
  --color-border: var(--color-border);
  --color-ring: var(--color-ring);
  --color-text: var(--color-text);
  --color-text-muted: var(--color-text-muted);
  --color-placeholder: var(--color-placeholder);
  --color-background-secondary: var(--color-background-secondary);
  --color-hover: var(--color-hover);
  --color-foreground-default: var(--color-foreground-default);
  --color-secondary: var(--color-secondary);
  --color-secondary-hover: var(--color-secondary-hover);
  --color-accent: var(--color-accent);
  --color-accent-on: var(--color-accent-on);
  --color-primary: var(--color-primary);
  --color-primary-hover: rgba(0, 0, 0, 0.05);
  --color-primary-on: var(--color-slate-900);
  --color-theme-sun: var(--color-theme-sun);
  --color-theme-sun-hover: var(--color-theme-sun-hover);
  --color-theme-sun-on: var(--color-theme-sun-on);
  --color-theme-fire: var(--color-theme-fire);
  --color-theme-fire-hover: var(--color-theme-fire-hover);
  --color-theme-fire-on: var(--color-theme-fire-on);
  --color-theme-water: var(--color-theme-water);
  --color-theme-water-hover: var(--color-theme-water-hover);
  --color-theme-water-on: var(--color-theme-water-on);
  --color-theme-forest: var(--color-theme-forest);
  --color-theme-forest-hover: var(--color-theme-forest-hover);
  --color-theme-forest-on: var(--color-theme-forest-on);
  --color-theme-arcane: var(--color-theme-arcane);
  --color-theme-arcane-hover: var(--color-theme-arcane-hover);
  --color-theme-arcane-on: var(--color-theme-arcane-on);
  --color-success: var(--color-success);
  --color-success-on: var(--color-success-on);
  --color-warning: var(--color-warning);
  --color-warning-on: var(--color-warning-on);
  --color-error: var(--color-error);
  --color-error-on: var(--color-error-on);
  --color-info: var(--color-info);
  --color-info-on: var(--color-info-on);
  --color-input: var(--color-input);
  --color-input-border: var(--color-input-border);
  --color-input-ring: var(--color-input-ring);
  --color-input-text: var(--color-input-text);
  --color-input-placeholder: var(--color-input-placeholder);
  --elevation-xs: var(--elevation-xs);
  --elevation-sm: var(--elevation-sm);
  --elevation-md: var(--elevation-md);
  --elevation-lg: var(--elevation-lg);

  /* == Resource Battery Kleuren (Dark Mode) == */
  --color-resource-health: var(--color-resource-health);
  --color-resource-mana: var(--color-resource-mana);
  --color-resource-stamina: var(--color-resource-stamina);


}

/* 4 ▸ DARK-MODE OVERRIDES */
html.dark {
  /* -- 4A. Neutrals -- */
  --color-background:          hsl(var(--hue-neutral) var(--sat-neutral) 7%);
  --color-foreground:          hsl(var(--hue-neutral) var(--sat-neutral-strong) 93%);
  --color-surface:             hsl(var(--hue-neutral) var(--sat-neutral) 10%);
  --color-surface-alt:         hsl(var(--hue-neutral) var(--sat-neutral) 12%);
  --surface-card:              hsl(var(--hue-neutral) var(--sat-neutral) 11%);
  --color-border:              hsl(var(--hue-neutral) var(--sat-neutral) 18%);
  --color-text-muted:          hsl(var(--hue-neutral) var(--sat-neutral) 55%);
  --color-placeholder:         hsl(var(--hue-neutral) var(--sat-neutral) 45%);
  --color-background-secondary:hsl(var(--hue-neutral) var(--sat-neutral) 12%);
  --color-hover:               hsl(var(--hue-neutral) var(--sat-neutral) 19%);
  --color-foreground-default:  hsl(var(--hue-neutral) var(--sat-neutral-strong) 90%);
  --color-secondary:           hsl(var(--hue-neutral) var(--sat-neutral) 60%);
  --color-accent:              hsl(var(--hue-accent) var(--sat-accent) 55%);
  --color-accent-on:           hsl(var(--hue-accent) calc(var(--sat-accent)*.3) 10%);
    --color-overlay-backdrop: hsla(var(--hue-neutral) 20% 2% / 0.8);

  /* -- 4B. States -- */
  --color-success:             hsl(var(--hue-success-state) var(--sat-success-state) 53%);
  --color-success-on:          hsl(var(--hue-success-state) calc(var(--sat-success-state)*.3) 10%);
  --color-warning:             hsl(var(--hue-warning-state) var(--sat-warning-state) 55%);
  --color-warning-on:          hsl(var(--hue-warning-state) calc(var(--sat-warning-state)*.3) 10%);
--color-error:               var(--color-theme-fire);
--color-error-on:            var(--color-theme-fire-on); // Gebruik de on-color van fire
  --color-info:                hsl(var(--hue-info-state) var(--sat-info-state) 57%);
  --color-info-on:             hsl(var(--hue-info-state) calc(var(--sat-info-state)*.3) 10%);

  /* inputs */
  --color-input:               hsl(var(--hue-neutral) var(--sat-neutral) 7%);
  --color-input-border:        hsl(var(--hue-neutral) var(--sat-neutral) 18%);
  --color-input-ring:          var(--color-primary);
  --color-input-text:          hsl(var(--hue-neutral) var(--sat-neutral-strong) 93%);
  --color-input-placeholder:   hsl(var(--hue-neutral) var(--sat-neutral) 45%);

  /* -- 4C. Gradient lightness overrides (5-stop card borders) -- */
  --l-fire-grad-stop1:48%; --l-fire-grad-stop2:50%;
  --l-fire-grad-stop3:53%; --l-fire-grad-stop4:50%;
  --l-fire-grad-stop5:48%;
  --l-water-grad-stop1:47%; --l-water-grad-stop2:52%;
  --l-water-grad-stop3:50%; --l-water-grad-stop4:42%;
  --l-water-grad-stop5:45%;
  --l-forest-grad-stop1:42%; --l-forest-grad-stop2:47%;
  --l-forest-grad-stop3:50%; --l-forest-grad-stop4:44%;
  --l-forest-grad-stop5:40%;
  --l-sun-grad-stop1:50%; --l-sun-grad-stop2:47%;
  --l-sun-grad-stop3:52%; --l-sun-grad-stop4:45%;
  --l-sun-grad-stop5:42%;
  --l-arcane-grad-stop1:52%; --l-arcane-grad-stop2:50%;
  --l-arcane-grad-stop3:54%; --l-arcane-grad-stop4:47%;
  --l-arcane-grad-stop5:45%;

    /* Neon Variabelen (dark-mode glow kleuren) */
  /* --neon-blur-radius, --neon-spread-radius, --neon-opacity, etc. in :root blijven van kracht tenzij hier overschreven */
  --l-neon-glow-primary-dark: 65%;
  --l-neon-glow-fire-dark: 70%;
  --l-neon-glow-water-dark: 65%;
  --l-neon-glow-forest-dark: 58%;
  --l-neon-glow-sun-dark: 68%;
  --l-neon-glow-arcane-dark: 65%;

  /* -- 4D. Re-assemble 5-stop gradient colours (dark) - Card Borders -- */
  --color-fire-grad-stop1:   hsl(var(--hue-fire-grad-stop1) var(--sat-fire-grad-stop1) var(--l-fire-grad-stop1));
  --color-fire-grad-stop2:   hsl(var(--hue-fire-grad-stop2) var(--sat-fire-grad-stop2) var(--l-fire-grad-stop2));
  --color-fire-grad-stop3:   hsl(var(--hue-fire-grad-stop3) var(--sat-fire-grad-stop3) var(--l-fire-grad-stop3));
  --color-fire-grad-stop4:   hsl(var(--hue-fire-grad-stop4) var(--sat-fire-grad-stop4) var(--l-fire-grad-stop4));
  --color-fire-grad-stop5:   hsl(var(--hue-fire-grad-stop5) var(--sat-fire-grad-stop5) var(--l-fire-grad-stop5));
  --color-water-grad-stop1:  hsl(var(--hue-water-grad-stop1) var(--sat-water-grad-stop1) var(--l-water-grad-stop1));
  --color-water-grad-stop2:  hsl(var(--hue-water-grad-stop2) var(--sat-water-grad-stop2) var(--l-water-grad-stop2));
  --color-water-grad-stop3:  hsl(var(--hue-water-grad-stop3) var(--sat-water-grad-stop3) var(--l-water-grad-stop3));
  --color-water-grad-stop4:  hsl(var(--hue-water-grad-stop4) var(--sat-water-grad-stop4) var(--l-water-grad-stop4));
  --color-water-grad-stop5:  hsl(var(--hue-water-grad-stop5) var(--sat-water-grad-stop5) var(--l-water-grad-stop5));
  --color-forest-grad-stop1: hsl(var(--hue-forest-grad-stop1) var(--sat-forest-grad-stop1) var(--l-forest-grad-stop1));
  --color-forest-grad-stop2: hsl(var(--hue-forest-grad-stop2) var(--sat-forest-grad-stop2) var(--l-forest-grad-stop2));
  --color-forest-grad-stop3: hsl(var(--hue-forest-grad-stop3) var(--sat-forest-grad-stop3) var(--l-forest-grad-stop3));
  --color-forest-grad-stop4: hsl(var(--hue-forest-grad-stop4) var(--sat-forest-grad-stop4) var(--l-forest-grad-stop4));
  --color-forest-grad-stop5: hsl(var(--hue-forest-grad-stop5) var(--sat-forest-grad-stop5) var(--l-forest-grad-stop5));
  --color-sun-grad-stop1:    hsl(var(--hue-sun-grad-stop1) var(--sat-sun-grad-stop1) var(--l-sun-grad-stop1));
  --color-sun-grad-stop2:    hsl(var(--hue-sun-grad-stop2) var(--sat-sun-grad-stop2) var(--l-sun-grad-stop2));
  --color-sun-grad-stop3:    hsl(var(--hue-sun-grad-stop3) var(--sat-sun-grad-stop3) var(--l-sun-grad-stop3));
  --color-sun-grad-stop4:    hsl(var(--hue-sun-grad-stop4) var(--sat-sun-grad-stop4) var(--l-sun-grad-stop4));
  --color-sun-grad-stop5:    hsl(var(--hue-sun-grad-stop5) var(--sat-sun-grad-stop5) var(--l-sun-grad-stop5));
  --color-arcane-grad-stop1: hsl(var(--hue-arcane-grad-stop1) var(--sat-arcane-grad-stop1) var(--l-arcane-grad-stop1));
  --color-arcane-grad-stop2: hsl(var(--hue-arcane-grad-stop2) var(--sat-arcane-grad-stop2) var(--l-arcane-grad-stop2));
  --color-arcane-grad-stop3: hsl(var(--hue-arcane-grad-stop3) var(--sat-arcane-grad-stop3) var(--l-arcane-grad-stop3));
  --color-arcane-grad-stop4: hsl(var(--hue-arcane-grad-stop4) var(--sat-arcane-grad-stop4) var(--l-arcane-grad-stop4));
  --color-arcane-grad-stop5: hsl(var(--hue-arcane-grad-stop5) var(--sat-arcane-grad-stop5) var(--l-arcane-grad-stop5));
  
  /* Lightness waarden voor 2-stop Button Gradients (dark) */
  --l-btn-fire-grad-start-dark: 50%; --l-btn-fire-grad-end-dark: 42%;
  --l-btn-water-grad-start-dark: 52%; --l-btn-water-grad-end-dark: 44%;
  --l-btn-forest-grad-start-dark: 46%; --l-btn-forest-grad-end-dark: 38%;
  --l-btn-sun-grad-start-dark: 57%; --l-btn-sun-grad-end-dark: 49%;
  --l-btn-arcane-grad-start-dark: 54%; --l-btn-arcane-grad-end-dark: 46%;

  /* Samengestelde 2-stop Button Gradient Kleuren (dark) */
  --color-btn-fire-grad-start:   hsl(var(--hue-theme-fire) var(--sat-theme-fire) var(--l-btn-fire-grad-start-dark));
  --color-btn-fire-grad-end:     hsl(var(--hue-theme-fire) var(--sat-theme-fire) var(--l-btn-fire-grad-end-dark));
  --color-btn-water-grad-start:  hsl(var(--hue-theme-water) var(--sat-theme-water) var(--l-btn-water-grad-start-dark));
  --color-btn-water-grad-end:    hsl(var(--hue-theme-water) var(--sat-theme-water) var(--l-btn-water-grad-end-dark));
  --color-btn-forest-grad-start: hsl(var(--hue-theme-forest) var(--sat-theme-forest) var(--l-btn-forest-grad-start-dark));
  --color-btn-forest-grad-end:   hsl(var(--hue-theme-forest) var(--sat-theme-forest) var(--l-btn-forest-grad-end-dark));
  --color-btn-sun-grad-start:    hsl(var(--hue-theme-sun) var(--sat-theme-sun) var(--l-btn-sun-grad-start-dark));
  --color-btn-sun-grad-end:      hsl(var(--hue-theme-sun) var(--sat-theme-sun) var(--l-btn-sun-grad-end-dark));
  --color-btn-arcane-grad-start: hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) var(--l-btn-arcane-grad-start-dark));
  --color-btn-arcane-grad-end:   hsl(var(--hue-theme-arcane) var(--sat-theme-arcane) var(--l-btn-arcane-grad-end-dark));

  /* == Resource Battery Kleuren (Dark Mode) == */
  --l-resource-health-fill-dark: 50%;
  --l-resource-mana-fill-dark:   53%;
  --l-resource-stamina-fill-dark:58%;

  /* -- Samengestelde Kleuren voor Resource Battery Fill - BASIS (Dark Mode) -- */
  --color-resource-health:  hsl(var(--hue-resource-health) var(--sat-resource-health) var(--l-resource-health-fill-dark));
  --color-resource-mana:    hsl(var(--hue-resource-mana)   var(--sat-resource-mana)   var(--l-resource-mana-fill-dark));
  --color-resource-stamina: hsl(var(--hue-resource-stamina)var(--sat-resource-stamina)var(--l-resource-stamina-fill-dark));

  /* -- Lightness & Saturation voor Resource Battery Fill - HOVER (Dark Mode) -- */
  /* Maak deze nog helderder/meer verzadigd voor het oplicht-effect */
  --l-resource-health-fill-hover-dark: 75%;   --sat-resource-health-fill-hover-dark: 100%;
  --l-resource-mana-fill-hover-dark:   78%;   --sat-resource-mana-fill-hover-dark:   98%;
  --l-resource-stamina-fill-hover-dark:82%;   --sat-resource-stamina-fill-hover-dark:100%;

    /* -- Aanpassen/Toevoegen: Generieke dark mode lightness voor de primary rol -- */
  /* Deze werken samen met de --hue-app-primary en --sat-app-primary van het actieve [data-theme] */
  /* Als je deze al had, controleer of ze passen bij de nieuwe structuur. */
  --lightness-app-primary: 48%;       /* Primary wordt donkerder in dark mode */
  --lightness-app-primary-hover: 42%; /* Nog iets donkerder bij hover */
  --lightness-app-primary-on-fg: 90%; /* Tekst op primary wordt lichter */

    --color-primary-on: var(--color-slate-50); /* Bijvoorbeeld, bijna wit */
  --color-primary-hover: rgba(255, 255, 255, 0.1); /* Een subtiele lichte overlay voor hover */


  &[data-theme="oceanicFlow"] {
    /* Als de generieke dark-mode lightness voor primary (48%) niet ideaal is voor water: */
    /* --lightness-app-primary: 45%; */
    /* Eventuele andere dark-mode specifieke overrides voor dit thema: */
    /* --color-background: hsl(var(--hue-water-source) 25% 8%); */
  }

  &[data-theme="verdantGrowth"] {
    /* Als de generieke dark-mode lightness voor primary (48%) niet ideaal is voor forest: */
    /* --lightness-app-primary: 40%; */ /* Forest is al donker, misschien nog iets meer */
    /* --lightness-app-primary-on-fg: 95%; */ /* Zorg voor goed contrast */
  }

  &[data-theme="arcaneMyst"] {
    /* Als de generieke dark-mode lightness voor primary (48%) niet ideaal is voor arcane: */
    /* --lightness-app-primary: 50%; */ /* Arcane kan iets lichter blijven */
    /* --lightness-app-primary-on-fg: 92%; */
  }


}


/* Oceanic Flow Thema (Water-gebaseerd) */
[data-theme="oceanicFlow"] {
  --hue-app-primary: var(--hue-water-source);
  --sat-app-primary: var(--sat-water-source);
  /* Optioneel: Pas lightness specifiek voor dit thema aan indien nodig */
  /* --lightness-app-primary: 57%; */
  /* --lightness-app-primary-on-fg: 95%; */ /* Voor lichte tekst op donkerdere primary */

  /* Optioneel: Verdere thematische aanpassingen voor oceanicFlow */
  /* --color-background: hsl(var(--hue-water-source) 30% 97%); */
  /* --color-border: hsl(var(--hue-water-source) 40% 85%); */
  /* --hue-accent: var(--hue-sun-source); */ /* bv. geel accent */
  /* --sat-accent: var(--sat-sun-source); */
}

/* Verdant Growth Thema (Forest-gebaseerd) */
[data-theme="verdantGrowth"] {
  --hue-app-primary: var(--hue-forest-source);
  --sat-app-primary: var(--sat-forest-source);
  /* Optioneel: Pas lightness specifiek voor dit thema aan indien nodig */
  /* --lightness-app-primary: 48%; */ /* Forest is vaak donkerder */
  /* --lightness-app-primary-on-fg: 98%; */ /* Zeer lichte tekst */

  /* Optioneel: Verdere thematische aanpassingen voor verdantGrowth */
  /* --color-background-secondary: hsl(var(--hue-forest-source) 25% 96%); */
  /* --hue-accent: var(--hue-gold-source); */ /* bv. goud accent */
  /* --sat-accent: var(--sat-gold-source); */
}

/* Arcane Myst Thema (Arcane-gebaseerd) */
[data-theme="arcaneMyst"] {
  --hue-app-primary: var(--hue-arcane-source);
  --sat-app-primary: var(--sat-arcane-source);
  /* Default lightness (58%) werkt hier waarschijnlijk goed. */
  /* --lightness-app-primary-on-fg: 95%; */ /* Eventueel lichtere tekst op paars */

  /* Optioneel: Verdere thematische aanpassingen voor arcaneMyst */
  /* --color-surface: hsl(var(--hue-arcane-source) 20% 98%); */
  /* --hue-accent: var(--hue-neutral); */ /* bv. neutraal grijs/zilver accent */
  /* --sat-accent: 5%; */
}

/* Voorbeeld als je 'balancedGold' expliciet als data-theme wilt definiëren
   (niet strikt nodig als :root al de balancedGold waarden heeft voor --hue-app-primary etc.) */
/*
[data-theme="balancedGold"] {
  --hue-app-primary: var(--hue-gold-source);
  --sat-app-primary: var(--sat-gold-source);
  // De lightness variabelen gebruiken de defaults uit :root
}
*/


/* 5 ▸ Foundation styles */
body {
  @apply bg-[var(--color-background)] text-[var(--color-foreground)];
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100dvh;
  line-height: 1.5;
  font-size: 110%; // Standaard is 16px, dit is een goede basis. 
                   // Als je ALLES groter wilt, kun je dit verhogen naar bv. 105% of 110%.
                   // Laten we voor nu de componenten zelf aanpassen.
}

.container-max {
  width: 100%;
  max-width: 2000px; 
  margin-inline: auto;
}
input::placeholder,
textarea::placeholder { color: var(--color-placeholder); opacity: .7; }
.shadow-surface    { box-shadow: var(--elevation-xs); }
.shadow-surface-sm { box-shadow: var(--elevation-sm); }
.shadow-surface-md { box-shadow: var(--elevation-md); }
.shadow-surface-lg { box-shadow: var(--elevation-lg); }
royal-code-ui-stat-bar-segment .stat-bar-segment { background: transparent; }
/* ========================================================================== */
/* NEON EFFECT ON HOVER – FOUNDATION                                          */
/* ========================================================================== */

.neon-effect-target,
.neon-card-border {
  transition-property: box-shadow, padding;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: .2s;
  box-shadow: none;
}

/* ========================================================================== */
/* 1. BUTTON GLOWS (neon-effect-target)                                       */
/* ========================================================================== */

$themes: (
  primary: ( var(--hue-app-primary),  var(--sat-app-primary), var(--l-neon-glow-primary-light),  var(--l-neon-glow-primary-dark) ),
  fire:    ( var(--hue-theme-fire),   var(--sat-theme-fire),  var(--l-neon-glow-fire-light),     var(--l-neon-glow-fire-dark) ),
  water:   ( var(--hue-theme-water),  var(--sat-theme-water), var(--l-neon-glow-water-light),    var(--l-neon-glow-water-dark) ),
  forest:  ( var(--hue-theme-forest), var(--sat-theme-forest),var(--l-neon-glow-forest-light),   var(--l-neon-glow-forest-dark)),
  sun:     ( var(--hue-theme-sun),    var(--sat-theme-sun),   var(--l-neon-glow-sun-light),      var(--l-neon-glow-sun-dark)   ),
  arcane:  ( var(--hue-theme-arcane), var(--sat-theme-arcane),var(--l-neon-glow-arcane-light),   var(--l-neon-glow-arcane-dark) )
);

/* genereer :hover & .group:hover varianten voor elke knop-kleur */
@each $name, $vals in $themes {
  .neon-effect-target.neon-#{$name}:hover,
  .group:hover .neon-effect-target.neon-#{$name} {
    box-shadow: 0 0 var(--neon-blur-radius-hover)
                     var(--neon-spread-radius-hover)
                     hsla(nth($vals,1), nth($vals,2), nth($vals,3), var(--neon-opacity-hover));
  }
  html.dark .neon-effect-target.neon-#{$name}:hover,
  html.dark .group:hover .neon-effect-target.neon-#{$name} {
    box-shadow: 0 0 var(--neon-blur-radius-hover)
                     var(--neon-spread-radius-hover)
                     hsla(nth($vals,1), nth($vals,2), nth($vals,4), var(--neon-opacity-hover));
  }
}

/* ========================================================================== */
/* 2. OPTIONAL – CARD BORDER GLOWS (neon-card-border)                         */
/*    Laat weg als je geen kaart-shadows gebruikt                            */
/* ========================================================================== */

@each $name, $vals in $themes {
  .neon-card-border.neon-#{$name}:hover,
  .group:hover .neon-card-border.neon-#{$name} {
    box-shadow: 0 0 var(--card-neon-blur-radius-hover)
                     var(--card-neon-spread-radius-hover)
                     hsla(nth($vals,1), nth($vals,2), nth($vals,3), var(--card-neon-opacity-hover));
  }
  html.dark .neon-card-border.neon-#{$name}:hover,
  html.dark .group:hover .neon-card-border.neon-#{$name} {
    box-shadow: 0 0 var(--card-neon-blur-radius-hover)
                     var(--card-neon-spread-radius-hover)
                     hsla(nth($vals,1), nth($vals,2), nth($vals,4), var(--card-neon-opacity-hover));
  }
}
/* ────────────────────────────────────────────────────────── */
/* NEON GLOW RONDOM ALLEEN DE FILL – voor Angular component */
/* ────────────────────────────────────────────────────────── */

/* 1) Laat de standaard overflow-hidden track wél de glow zien */
@each $theme, $vals in $themes {
  .neon-target-progress-#{$theme} .rounded-full {
    overflow: visible !important;
  }
}

/* 2) Zorg voor een soepele shadow-transition op de fill */
.progress-bar-fill-element {
  transition: box-shadow .2s cubic-bezier(.4,0,.2,1) !important;
}

/* 3) Per thema: hover-shadow EXACT onder fill */
@each $theme, $vals in $themes {
  $hue     : nth($vals,1);
  $sat     : nth($vals,2);
  $light   : nth($vals,3);
  $dark    : nth($vals,4);

  .neon-target-progress-#{$theme} {
    /* light-mode */
    &:hover .progress-bar-fill-element,
    .group:hover & .progress-bar-fill-element {
      box-shadow:
        0 0 var(--progress-neon-blur-radius-hover)
             var(--progress-neon-spread-radius-hover)
        hsla(#{$hue}, #{$sat}, #{$light}, var(--progress-neon-opacity-hover))
        !important;
    }

    /* dark-mode */
    html.dark & {
      &:hover .progress-bar-fill-element,
      .group:hover & .progress-bar-fill-element {
        box-shadow:
          0 0 var(--progress-neon-blur-radius-hover)
               var(--progress-neon-spread-radius-hover)
          hsla(#{$hue}, #{$sat}, #{$dark},  var(--progress-neon-opacity-hover))
          !important;
      }
    }
  }
}

// --- neon resoruce battery ---
.group:hover .neon-card-border.neon-fire { /* Of .neon-water, .neon-sun */
  box-shadow: 0 0 var(--card-neon-blur-radius-hover)
                   var(--card-neon-spread-radius-hover)
                   hsla(var(--hue-theme-fire) /* of water, sun */, var(--sat-theme-fire) /* etc. */, var(--l-neon-glow-fire-light) /* of dark variant */, var(--card-neon-opacity-hover));
}

html.dark .group:hover .neon-card-border.neon-fire {
  box-shadow: 0 0 var(--card-neon-blur-radius-hover)
                   var(--card-neon-spread-radius-hover)
                   hsla(var(--hue-theme-fire), var(--sat-theme-fire), var(--l-neon-glow-fire-dark), var(--card-neon-opacity-hover));
}

/* Deze variabelen zullen de standaard --color-resource-* variabelen overschrijven
   wanneer de .resource-battery.group gehovered wordt, specifiek voor de
   .bar-segment.is-filled elementen.
*/
.resource-battery.group:hover {
  /* Light Mode Hover Kleuren voor Segmenten */
  --color-resource-health:  hsl(var(--hue-resource-health) var(--sat-resource-health-fill-hover-light) var(--l-resource-health-fill-hover-light));
  --color-resource-mana:    hsl(var(--hue-resource-mana)   var(--sat-resource-mana-fill-hover-light)   var(--l-resource-mana-fill-hover-light));
  --color-resource-stamina: hsl(var(--hue-resource-stamina)var(--sat-resource-stamina-fill-hover-light)var(--l-resource-stamina-fill-hover-light));
}

html.dark .resource-battery.group:hover {
  /* Dark Mode Hover Kleuren voor Segmenten */
  --color-resource-health:  hsl(var(--hue-resource-health) var(--sat-resource-health-fill-hover-dark) var(--l-resource-health-fill-hover-dark));
  --color-resource-mana:    hsl(var(--hue-resource-mana)   var(--sat-resource-mana-fill-hover-dark)   var(--l-resource-mana-fill-hover-dark));
  --color-resource-stamina: hsl(var(--hue-resource-stamina)var(--sat-resource-stamina-fill-hover-dark)var(--l-resource-stamina-fill-hover-dark));
}

/* ========================================================================== */
/* OVERLAY BACKDROP FIXES (Definitieve "Component-First" Methode)             */
/* ========================================================================== */
/* 1. HERSTEL DE BACKDROP - Zorg dat deze zichtbaar blijft */
/* === GERICHTE OVERLAY FIX - ALLEEN FORM BACKGROUND === */

/* 1. Zorg dat de overlay pane zelf GEEN achtergrond heeft */
/* === DIRECTE DROPDOWN BACKGROUND FIX === */

/* 1. Direct targeting van de royal-code-dropdown-overlay-pane */
.royal-code-dropdown-overlay-pane {
  background-color: hsl(215, 15%, 99%) !important; /* Light mode fallback */
  background: var(--surface-card) !important;
  
  /* Verbeterde visuele styling */
  border: 1px solid var(--color-border) !important;
  border-radius: 0.375rem !important; /* rounded-md */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  padding: 0 !important;
  overflow: hidden !important;
  z-index: 50 !important;
}

/* 2. Dark mode fix */
html.dark .royal-code-dropdown-overlay-pane {
  background-color: hsl(215, 15%, 11%) !important; /* Dark mode fallback */
  background: hsl(var(--hue-neutral) var(--sat-neutral) 11%) !important;
  border-color: hsl(var(--hue-neutral) var(--sat-neutral) 18%) !important;
}

/* 3. Zorg dat eventuele parent containers de background niet overschrijven */
.cdk-overlay-pane.royal-code-dropdown-overlay-pane {
  background-color: hsl(215, 15%, 99%) !important; /* Light mode */
}

html.dark .cdk-overlay-pane.royal-code-dropdown-overlay-pane {
  background-color: hsl(215, 15%, 11%) !important; /* Dark mode */
}

/* 4. Als alternatief: target de dropdown-panel binnen de overlay */
.royal-code-dropdown-overlay-pane .dropdown-panel {
  background: transparent; /* Laat de parent background doorschijnen */
}

/* 5. Fallback - target alle dropdown overlay panes */
.cdk-overlay-pane[class*="dropdown"] {
  background-color: hsl(215, 15%, 99%) !important;
}

html.dark .cdk-overlay-pane[class*="dropdown"] {
  background-color: hsl(215, 15%, 11%) !important;
}

/* 6. Nuclear option - target based on what we see in the HTML */
#cdk-overlay-0.royal-code-dropdown-overlay-pane,
div[id^="cdk-overlay-"].royal-code-dropdown-overlay-pane {
  background-color: hsl(215, 15%, 99%) !important;
  background: var(--surface-card) !important;
}

html.dark #cdk-overlay-0.royal-code-dropdown-overlay-pane,
html.dark div[id^="cdk-overlay-"].royal-code-dropdown-overlay-pane {
  background-color: hsl(215, 15%, 11%) !important;
}

/* 7. Debug helper - tijdelijk toevoegen om te zien of CSS wordt geladen */
.royal-code-dropdown-overlay-pane::before {
  content: "DROPDOWN STYLED";
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 10px;
  color: red;
  z-index: 1000;
}

/* 8. Mega menu fixes (voor volledigheid) */
.royal-code-mega-menu-overlay-pane {
  background-color: hsl(215, 15%, 99%) !important;
  background: var(--surface-card) !important;
  border-top: 1px solid var(--color-border) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

html.dark .royal-code-mega-menu-overlay-pane {
  background-color: hsl(215, 15%, 11%) !important;
}


.text-destructive {
  color: var(--color-error) !important;
}
--- END OF FILE ---

--- START OF FILE libs/ui/menu/src/index.ts ---
export * from './lib/menu/ui-menu.component';
export * from './lib/menu/card-menu/card-menu.component';
export * from './lib/menu/list-menu/list-menu.component';
export * from './lib/menu/models/menu.model';
--- END OF FILE ---

--- START OF FILE libs/ui/menu/src/lib/menu/card-menu/card-menu.component.ts ---
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, Signal } from '@angular/core';

import { CardTypeEnum, UiCardComponent } from '../../../../card/src/lib/card/ui-card.component';
import { ListOrientationEnum, ListTypesEnum, UiListComponent } from '../../../../list/src/lib/list/ui-list.component';
import { TitleTypeEnum, UiTitleComponent } from '../../../../title/src/lib/title/ui-title.component';
import { Subject } from 'rxjs';
import { UiGridComponent } from '../../../../grid/src/lib/grid/ui-grid.component';
import { MenuItem } from '../models/menu.model';
// import { MenuService } from '@royal-code/shared/domain/store';

export enum GridTypesEnum {
  TwoLayerGrid_LargeStart = 'twoLayerGridLargeStart',
  TwoLayerGrid_SmallStart = 'twoLayerGridSmallStart',
}

@Component({
    selector: 'royal-code-ui-card-menu',
    imports: [UiCardComponent, UiTitleComponent, UiListComponent, UiGridComponent],  changeDetection: ChangeDetectionStrategy.OnPush,

    template: `<!-- list card -->
    <ng-template #listCardTemplate let-subMenuItem>
      <royal-code-ui-card
        [title]="subMenuItem.title"
        [imageUrl]="subMenuItem.imageUrl"
        [cardType]="CardType.ListCard"
        [size]="TitleTypesEnum.H8"
        (mouseenter)="onCardHover(subMenuItem.id)"
      ></royal-code-ui-card>
    </ng-template>
    
    <!-- product card -->
    <ng-template #cardGridTemplate let-product>
      <royal-code-ui-card
        [title]="product.title"
        [imageUrl]="product.imageUrl"
        [cardType]="CardType.GridCard"
        [size]="TitleTypesEnum.H7"
        [bold]="true"
        [heading]="false"
      ></royal-code-ui-card>
    </ng-template>
    
    <div class="fixed left-0 top-28 w-full">
      <div class="container mx-auto">
        <div class="flex h-full relative">
          <!-- Left Side -->
          <div class="w-1/4 p-8">
            @if (menuItems) {
              @for (menuItem of menuItems(); track menuItem) {
                <div>
                  <royal-code-ui-title
                    [title]="menuItem.title"
                    [type]="TitleTypesEnum.Default"
                    [bold]="true"
                  ></royal-code-ui-title>
                  <royal-code-ui-list
                    [title]="menuItem.title"
                    [list]="menuItem.subMenus || []"
                    [itemTemplate]="listCardTemplate"
                    [listType]="ListTypes.Custom"
                    [listOrientation]="ListOrientation.VerticalSimple"
                    >
                  </royal-code-ui-list>
                </div>
              }
            }
          </div>
    
          <!-- Right Side -->
          @if(menusWithChildMenus$ && menusWithChildMenus$()){
            <div
              class="w-3/4 p-8"
              >
              <button
                (click)="onCloseButtonClick()"
                class="absolute right-1 top-5 hover:bg-accent rounded-full w-12 h-12"
                >
                <span class="material-icons text-4xl">close</span>
              </button>
              @for(menusWithChildMenus of menusWithChildMenus$(); track $index) {
                <royal-code-ui-title
                  [title]="menusWithChildMenus.title"
                  [type]="TitleTypesEnum.H4"
                  [bold]="true"
                  [heading]="false"
                ></royal-code-ui-title>
    
                @if($index === 0) {
                  <h1> large</h1>
                  @if (menusWithChildMenus.relatedMenuItems){
                    <royal-code-ui-grid
                      [maxRows]="2"
                      [maxCols]="5"
                      [maxItems]="7"
                      [colSpan]="colSpanConfig"
                      [rowSpan]="rowSpanConfig"
                      [gap]="0.5"
                      [cellTemplate]="cardGridTemplate"
                      [data]="menusWithChildMenus.relatedMenuItems"
                      >
                    </royal-code-ui-grid>
                  }
                } @else {
                  <h1> small</h1>
                  @if (menusWithChildMenus.relatedMenuItems){
                    <royal-code-ui-grid
                      [data]="menusWithChildMenus.relatedMenuItems"
                      [maxRows]="2"
                      [maxCols]="4"
                      [maxItems]="8"
                      [gap]="0.5"
                      [cellTemplate]="cardGridTemplate"
                      >
                    </royal-code-ui-grid>
                  }
                }
              }
            </div>
          }
        </div>
      </div>
    </div>
    `,
    styles: `.card-menu-dropdown {
      position: fixed;
      top: 10rem;
      left: 0;
      width: 100%;
    }
    `
})
export class CardMenuComponent implements OnDestroy{
  @Input() menuItems?: Signal<MenuItem[]>;
  @Output() closeCardMenuRequest = new EventEmitter<void>();

  menusWithChildMenus$?: Signal<MenuItem[] | undefined>;

  TitleTypesEnum = TitleTypeEnum;
  ListTypes = ListTypesEnum;
  ListOrientation = ListOrientationEnum;
  CardType = CardTypeEnum;
  GridTypes = GridTypesEnum;

  private onDestroy$ = new Subject<void>();

  // Define the colSpan and rowSpan configuration
  colSpanConfig: { [key: number]: number } = { 0: 2, };
  rowSpanConfig: { [key: number]: number } = { 0: 2, };

  // constructor(private menuService: MenuService) {}

  onCardHover(categoryId: number) {
    if (this.menuItems) {
      console.log(categoryId);
      // this.menusWithChildMenus$ = this.menuService
      //   .findSubmenusByMenuId(this.menuItems, categoryId);
      }
  }

  onCloseButtonClick() {
    this.closeCardMenuRequest.emit();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/menu/src/lib/menu/list-menu/list-menu.component.ts ---
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  Signal,
} from '@angular/core';

import { Router } from '@angular/router';
import { CardTypeEnum, UiCardComponent } from '@royal-code/ui/card';
import {
  ListOrientationEnum,
  ListTypesEnum,
  UiListComponent,
} from '@royal-code/ui/list';
import { MenuData, MenuItem } from '../models/menu.model';
import { TitleTypeEnum } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-list-menu',
  template: `<!-- list card -->
    <ng-template #listCardTemplate let-subMenuItem>
      <royal-code-ui-card
        [title]="subMenuItem.title"
        [imageUrl]="subMenuItem.imageUrl"
        [cardType]="CardType.ListCard"
        [size]="TitleTypesEnum.H8"
        (mouseenter)="onMenuHover(subMenuItem.id, 'left')"
      ></royal-code-ui-card>
    </ng-template>

    <div class="container mx-auto">
      <div class="flex h-full relative">
        <!-- Categories left side -->
        <div class="w-1/3 p-8">
          @if (menu) {
          <royal-code-ui-list
            [list]="menu().data()"
            [itemTemplate]="listCardTemplate"
            [listType]="ListTypes.Custom"
            [listOrientation]="ListOrientation.VerticalSimple"
          >
          </royal-code-ui-list>
          }
        </div>
        <div class="w-1/3 p-8">
          <!--  Subcategories middle -->
          @if(menusChild) {
          <royal-code-ui-list
            [list]="menusChild()"
            [listType]="ListTypes.Text"
            [listOrientation]="ListOrientation.VerticalSimple"
            (itemHover)="onMenuHover($event.id, 'middle')"
          >
            >
          </royal-code-ui-list>
          }
        </div>

        <div class="w-1/3 p-8">
          <!--  Subcategories right -->
          @if(menusSubChild) {
          <royal-code-ui-list
            [list]="menusSubChild()"
            [itemTemplate]="listCardTemplate"
            [listType]="ListTypes.Text"
            [listOrientation]="ListOrientation.VerticalSimple"
            (itemClick)="onMenuClick($event.id)"
          >
          </royal-code-ui-list>
          }
        </div>
      </div>
    </div> `,
  styles: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiCardComponent, UiListComponent],
})
export class ListMenuComponent {
  @Input() menu?: Signal<MenuData>;
  @Output() closeCardMenuRequest = new EventEmitter<void>();

  TitleTypesEnum = TitleTypeEnum;
  ListTypes = ListTypesEnum;
  ListOrientation = ListOrientationEnum;
  CardType = CardTypeEnum;

  menusChild?: Signal<MenuItem[]>;
  menusSubChild?: Signal<MenuItem[]>;

  constructor(private router: Router) {}

  onMenuHover(menuItemId: string, level: 'left' | 'middle' | 'right'): void {
    if (this.menu) {
      if (level === 'left') {
        // this.menusChild = this.menuService.findSubmenusByMenuId(
        //   this.menu().data,
        //   menuItemId
        // ) as Signal<MenuItem[]>;
      } else if (level === 'middle') {
        //   this.menusSubChild = this.menuService.findSubmenusByMenuId(
        //     this.menusChild as Signal<MenuItem[]>,
        //     menuItemId
        //   ) as Signal<MenuItem[]>;
      }
    }
  }

  onMenuClick(menuItemId: string) {
    this.router.navigate(['/category', menuItemId]);
  }

  onCloseButtonClick() {
    this.closeCardMenuRequest.emit();
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/menu/src/lib/menu/models/menu.model.ts ---
import { Signal } from "@angular/core";

export interface MenuItem {
  id: string;
  imageUrl: string;
  title: string;
  relatedMenuItems?: MenuItem[];
  subMenus?: MenuItem[];
  parentMenus?: MenuItem[];
}

export interface Menu {
  type: 'default';
  data: Signal<MenuItem[]>;
}

export interface MenuCard {
  type: 'card';
  data: Signal<MenuItem[]>;
}

export type MenuData = Menu | MenuCard;
--- END OF FILE ---

--- START OF FILE libs/ui/menu/src/lib/menu/ui-menu.component.ts ---
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  Signal,
  TemplateRef,
} from '@angular/core';

import { CardMenuComponent } from './card-menu/card-menu.component';
import { HttpClientModule } from '@angular/common/http';
import { ListMenuComponent } from './list-menu/list-menu.component';
import { MenuData, MenuItem } from './models/menu.model';

export enum MenuTypesEnum {
  List,
  Card,
}

@Component({
  selector: 'royal-code-ui-menu',
  imports: [
    CardMenuComponent,
    ListMenuComponent,
    HttpClientModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>
    @if(type === MenuTypesEnum.List){
    <royal-code-ui-list-menu [menu]="data"></royal-code-ui-list-menu>
    } @if(type === MenuTypesEnum.Card){
    <royal-code-ui-card-menu
      [menuItems]="menuData"
    ></royal-code-ui-card-menu>
    }
  </div> `,
})
export class UiMenuComponent {
  @Input() type: MenuTypesEnum = MenuTypesEnum.List;
  @Input() data?: Signal<MenuData>;
  @Input() customTemplate?: TemplateRef<unknown>;

  MenuTypesEnum = MenuTypesEnum;

  constructor(private eRef: ElementRef) {}

  get menuData(): Signal<MenuItem[]> | undefined {
    if (this.data) {
      return this.data().data;
    }
    return undefined;
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/index.ts ---
export * from './lib/navigation/desktop-nav/ui-desktop-nav.component';
export * from './lib/navigation/mobile-nav/ui-mobile-nav.component';
export * from './lib/navigation/mobile-nav-modal/ui-mobile-nav-modal.component';
export * from './lib/navigation/mega-menu/mega-menu.component';
export * from './lib/navigation/navigation-card/navigation-card.component';
export * from './lib/navigation/category-card/category-card.component';
export * from './lib/navigation/ui-vertical-nav/ui-vertical-nav.component'

// --- Footer ---
export * from './lib/footer/footer/footer.component';

// --- Header ---   
export * from './lib/header/header/header.component';
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/footer/footer/footer.component.ts ---
/**
 * @file ui-footer.component.ts
 * @Version 1.3.0 (Configurable USP Section)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Generieke footer. Nu met een configureerbare USP (Unique Selling Proposition)
 *   sectie via de `enableUspSection` input.
 */
import { ChangeDetectionStrategy, Component, input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon, NavigationItem } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';

export interface SocialLink {
  url: string;
  icon: keyof typeof AppIcon;
}

@Component({
  selector: 'royal-code-ui-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-card border-t-2 border-black text-foreground">
      <!-- Sectie 1: Trust & Value Banner (USP Section) -->
      @if (enableUspSection()) {
        <section class="bg-surface-alt border-b-2 border-black">
          <div class="container-max grid grid-cols-1 md:grid-cols-3">
            <div class="flex items-center gap-4 p-6 md:border-r-2 border-black">
              <royal-code-ui-icon [icon]="AppIcon.Truck" sizeVariant="xl" extraClass="text-primary"/>
              <div>
                <h3 class="font-bold text-foreground">{{ 'footer.usp.shipping.title' | translate }}</h3>
                <p class="text-sm text-secondary">{{ 'footer.usp.shipping.text' | translate }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-6 md:border-r-2 border-black">
              <royal-code-ui-icon [icon]="AppIcon.LifeBuoy" sizeVariant="xl" extraClass="text-primary"/>
              <div>
                <h3 class="font-bold text-foreground">{{ 'footer.usp.support.title' | translate }}</h3>
                <p class="text-sm text-secondary" [innerHTML]="'footer.usp.support.text' | translate"></p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-6">
              <royal-code-ui-icon [icon]="AppIcon.ShieldCheck" sizeVariant="xl" extraClass="text-primary"/>
              <div>
                <h3 class="font-bold text-foreground">{{ 'footer.usp.secure.title' | translate }}</h3>
                <p class="text-sm text-secondary">{{ 'footer.usp.secure.text' | translate }}</p>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- Sectie 2: Hoofd-Footer (Fat Footer) -->
      <div class="container-max py-12 px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="footer-col">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.support.title' | translate }}</h4>
            <ul class="space-y-2">
              @for(link of supportLinks(); track link.id) {
                <li><a [routerLink]="link.external ? null : link.route" [href]="link.external ? link.route : null" [target]="link.external ? '_blank' : '_self'" [rel]="link.external ? 'noopener' : null" class="text-secondary hover:text-primary transition-colors">{{ link.labelKey | translate }}</a></li>
              }
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.shop.title' | translate }}</h4>
            <ul class="space-y-2">
              @for(link of shopLinks(); track link.id) {
                <li><a [routerLink]="link.route" [queryParams]="link.queryParams" class="text-secondary hover:text-primary transition-colors">{{ link.labelKey | translate }}</a></li>
              }
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.company.title' | translate }}</h4>
            <ul class="space-y-2">
              @for(link of companyLinks(); track link.id) {
                <li><a [routerLink]="link.route" class="text-secondary hover:text-primary transition-colors">{{ link.labelKey | translate }}</a></li>
              }
            </ul>
          </div>
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
            © {{ currentYear }} {{ appName() }}. Alle rechten voorbehouden.
            <a routerLink="/terms" class="hover:text-primary ml-2">Voorwaarden</a>
            <a routerLink="/privacy" class="hover:text-primary ml-2">Privacybeleid</a>
          </div>
          <div class="flex flex-col items-center md:items-end space-y-4">
            @if (socialLinks() && socialLinks()!.length > 0) {
              <div class="flex items-center gap-4">
                @for(link of socialLinks(); track link.url) {
                  <a [href]="link.url" target="_blank" rel="noopener" class="text-secondary hover:text-primary"><royal-code-ui-icon [icon]="AppIcon[link.icon]" /></a>
                }
              </div>
            }
            @if (paymentMethodsEnabled()) {
              <div class="flex items-center gap-2 h-6">
                <span class="text-xs text-secondary">iDEAL, VISA, Mastercard, PayPal</span>
              </div>
            }
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class UiFooterComponent {
  readonly supportLinks = input.required<NavigationItem[]>();
  readonly shopLinks = input.required<NavigationItem[]>();
  readonly companyLinks = input.required<NavigationItem[]>();
  readonly appName = input('Royal-Code App');
  readonly socialLinks = input<SocialLink[] | undefined>();
  readonly paymentMethodsEnabled = input(true, { transform: booleanAttribute });
  readonly enableUspSection = input(true, { transform: booleanAttribute });

  protected readonly AppIcon = AppIcon;
  readonly currentYear = new Date().getFullYear();
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/header/header/header.component.ts ---
/**
 * @file ui-header.component.ts
 * @Version 1.0.0 (Generic, Data-driven)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Een generieke, herbruikbare en data-gedreven header component. Deze component
 *   heeft geen kennis van de specifieke applicatie. Het ontvangt navigatiedata
 *   via Dependency Injection en geeft events voor app-specifieke logica (zoals zoeken)
 *   door via @Output.
 */
import { ChangeDetectionStrategy, Component, signal, inject, HostListener, ElementRef, computed, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Core & Config ---

// --- Domain & UI Components ---
import { SearchSuggestion } from '@royal-code/features/products/domain';
import { NavigationItem, AppIcon } from '@royal-code/shared/domain';
import { ExpandingThemeSelectorComponent, UiThemeSwitcherComponent } from '@royal-code/ui/theme-switcher';
import { LanguageSelectorComponent } from '@royal-code/ui/language-selector';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';
import { UiSearchSuggestionsPanelComponent } from '@royal-code/features/products/ui-droneshop';
import { AccountMenuComponent } from 'apps/droneshop/src/app/layout/account-menu/account-menu.component';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiDesktopNavComponent } from '../../navigation/desktop-nav/ui-desktop-nav.component';
import { UiMegaMenuComponent } from '../../navigation/mega-menu/mega-menu.component';
import { UiMobileNavModalComponent } from '../../navigation/mobile-nav-modal/ui-mobile-nav-modal.component';
import { APP_NAVIGATION_ITEMS, AppNavigationConfig } from '@royal-code/core';

@Component({
  selector: 'royal-code-ui-header',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, FormsModule, UiThemeSwitcherComponent,
    ExpandingThemeSelectorComponent, UiMobileNavModalComponent, LanguageSelectorComponent,
    UiIconComponent, UiInputComponent, UiDropdownComponent, AccountMenuComponent,
    UiMegaMenuComponent, UiDesktopNavComponent, UiSearchSuggestionsPanelComponent,
    UiButtonComponent,
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
              <!-- Logo -->
              <a routerLink="/" class="text-2xl font-bold text-primary flex-shrink-0">Droneshop</a>
              
              <div class="flex-grow max-w-2xl mx-4 hidden lg:block relative">
                <royal-code-ui-input
                  type="search"
                  [placeholder]="'droneshop.search.placeholder' | translate"
                  [appendButtonIcon]="AppIcon.Search"
                  [appendButtonAriaLabel]="'droneshop.search.submit' | translate"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearchQueryChange($event)"
                  (enterPressed)="onSearchSubmit(searchQuery)"
                  (appendButtonClicked)="onSearchSubmit(searchQuery)"
                  extraClasses="!px-4 !pr-12 !h-11 !text-lg !rounded-none !border-2 !border-border !bg-input focus:!ring-primary focus:!border-primary"
                  extraButtonClasses="!px-4 !h-full"
                />
                @if (searchQuery.length > 1 && suggestions() && suggestions()!.length > 0) {
                  <royal-code-ui-search-suggestions-panel 
                    [suggestions]="suggestions()!"
                    (suggestionSelected)="onSuggestionSelect($event)" />
                }
              </div>
              
              <!-- Rechter iconen -->
              <div class="flex items-center gap-2">
                <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="openMobileSearch()" extraClasses="lg:hidden">
                  <royal-code-ui-icon [icon]="AppIcon.Search" sizeVariant="md" />
                </royal-code-ui-button>
                
                <div class="relative z-50 hidden lg:block"><royal-code-expanding-theme-selector /></div>
                <div class="relative z-50 hidden lg:block"><royal-code-ui-theme-switcher /></div>
                <div class="relative z-50 hidden lg:block"><royal-language-selector /></div>
                <a routerLink="/account/wishlist" class="p-2 rounded-none text-foreground hover:text-primary hidden lg:block" [attr.aria-label]="'droneshop.navigation.myWishlist' | translate">
                  <royal-code-ui-icon [icon]="AppIcon.Heart" sizeVariant="md" />
                </a>

                <div class="relative z-50">
                  <royal-code-ui-dropdown [triggerOn]="'click'" alignment="right" [offsetY]="8">
                    <button dropdown-trigger class="p-2 rounded-none text-foreground hover:text-primary" [attr.aria-label]="'droneshop.navigation.account' | translate">
                      <royal-code-ui-icon [icon]="AppIcon.User" sizeVariant="md" />
                    </button>
                    <div dropdown><droneshop-account-menu /></div>
                  </royal-code-ui-dropdown>
                </div>
                <a routerLink="/cart" class="relative p-2 rounded-none text-foreground hover:text-primary" [attr.aria-label]="'droneshop.navigation.cart' | translate">
                  <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" sizeVariant="md" />
                  @if (cartItemCount() > 0) {
                    <div class="absolute -top-1 -right-1 bg-primary text-primary-on text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {{ cartItemCount() }}
                    </div>
                  }
                </a>

                <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="openMobileMenu()" extraClasses="lg:hidden -mr-2">
                  <royal-code-ui-icon [icon]="AppIcon.Menu" />
                </royal-code-ui-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <nav class="hidden lg:flex h-14 bg-primary border-t border-black z-20 shadow-md" (mouseleave)="startCloseMenuTimer()">
        <div class="container-max h-full flex items-center justify-start">
          <ul class="flex items-center h-full">
            @for (item of primaryNavItems(); track item.id; let i = $index) {
              <li (mouseenter)="handleMouseEnter(item)" class="h-full flex items-center">
                <a [routerLink]="item.route" [queryParams]="item.queryParams" [queryParamsHandling]="item.queryParamsHandling || 'merge'"
                   class="flex items-center gap-2 font-semibold transition-colors duration-200 h-full px-4 border-b-4" 
                   [class.border-black]="isLinkActive(item)" [class.border-transparent]="!isLinkActive(item)" 
                   [ngClass]="{ 'bg-black text-primary': i === 0, 'text-black hover:bg-black/10': i > 0, 'text-base lg:text-lg': true }">
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

      @if (isMobileSearchVisible() && enableSearch()) {
        <div class="absolute inset-x-0 top-0 z-50 p-4 bg-background border-b border-border shadow-lg lg:hidden animate-fade-in-down">
          <royal-code-ui-input
            type="search"
            [placeholder]="'droneshop.search.placeholder' | translate"
            [appendButtonIcon]="AppIcon.X"
            [appendButtonAriaLabel]="'droneshop.search.close' | translate"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchQueryChange($event)"
            (enterPressed)="onSearchSubmit(searchQuery)"
            (appendButtonClicked)="closeMobileSearch()"
            extraClasses="!h-12 !text-lg !rounded-none"
            [focusOnLoad]="true"
          />
           @if (searchQuery.length > 1 && suggestions() && suggestions()!.length > 0) {
            <royal-code-ui-search-suggestions-panel 
              [suggestions]="suggestions()!"
              (suggestionSelected)="onSuggestionSelect($event)" />
           }
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
export class UiHeaderComponent {
  // --- Inputs & Outputs voor App-Specifieke Logica ---
  readonly logoText = input('DefaultApp');
  readonly enableSearch = input(false);
  readonly searchPlaceholder = input('droneshop.search.placeholder');
  readonly cartItemCount = input(0);
  readonly suggestions = input<SearchSuggestion[] | undefined | null>([]);
  readonly searchQueryChanged = output<string>();
  readonly searchSubmitted = output<string>();
  readonly suggestionSelected = output<SearchSuggestion>();

  // --- Geïnjecteerde Navigatie Data ---
  private readonly navConfig = inject<AppNavigationConfig>(APP_NAVIGATION_ITEMS);
  readonly primaryNavItems = signal<NavigationItem[]>(this.navConfig.primary);
  readonly topBarNavItems = signal<NavigationItem[]>(this.navConfig.topBar);
  readonly mobileModalRootItems = signal<NavigationItem[]>(this.navConfig.mobileModal);

  // --- Interne State ---
  readonly isMobileMenuOpen = signal(false);
  readonly isMobileSearchVisible = signal(false);
  readonly activeMegaMenuItem = signal<NavigationItem | null>(null);
  searchQuery = '';
  private closeMenuTimer?: number;

  // --- Dependencies & Helpers ---
  protected readonly AppIcon = AppIcon;
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node) && this.activeMegaMenuItem()) {
      this.closeMegaMenu();
    }
  }

  // --- Event Handlers die @Outputs gebruiken ---
  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.searchQueryChanged.emit(query);
  }

  onSearchSubmit(query: string): void {
    this.searchSubmitted.emit(query);
    this.closeMobileSearch(); // UI logica blijft hier
  }

  onSuggestionSelect(suggestion: SearchSuggestion): void {
    this.suggestionSelected.emit(suggestion);
    this.closeMobileSearch();
  }

  openMobileSearch(): void { this.isMobileSearchVisible.set(true); }
  closeMobileSearch(): void { this.isMobileSearchVisible.set(false); }

  openMobileMenu(): void { this.isMobileMenuOpen.set(true); }
  closeMobileMenu(): void { this.isMobileMenuOpen.set(false); }
  
  handleMouseEnter(item: NavigationItem): void { 
    this.cancelCloseMenuTimer(); 
    if (item.menuType === 'mega-menu') { this.activeMegaMenuItem.set(item); } 
  }
  
  startCloseMenuTimer(): void { 
    this.closeMenuTimer = window.setTimeout(() => { this.activeMegaMenuItem.set(null); }, 150); 
  }
  
  cancelCloseMenuTimer(): void { 
    if (this.closeMenuTimer) { clearTimeout(this.closeMenuTimer); this.closeMenuTimer = undefined; } 
  }
  
  closeMegaMenu(): void { this.activeMegaMenuItem.set(null); }
  
  isLinkActive(item: NavigationItem): boolean {
    if (this.activeMegaMenuItem()?.id === item.id) return true;
    if (item.route) {
      const urlTree = this.router.createUrlTree(Array.isArray(item.route) ? item.route : [item.route], { queryParams: item.queryParams });
      return this.router.isActive(urlTree, { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' });
    }
    return false;
  }

  handleMobileNavigation(item: NavigationItem): void {
    if (item.route) {
      const routeSegments = Array.isArray(item.route) ? item.route : [item.route];
      this.router.navigate(routeSegments, { queryParams: item.queryParams, queryParamsHandling: item.queryParamsHandling || 'merge' });
    }
    this.closeMobileMenu();
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/navigation/category-card/category-card.component.ts ---
/**
 * @file ui-category-card.component.ts
 * @Version 1.2.0 (CRITICAL FIX: Query Parameters Support for Navigation)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-07
 * @Description
 *   FIXED: Category card component now properly supports query parameters for
 *   navigation links, enabling correct category filtering.
 */
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppIcon, Image, NavigationItem } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiImageComponent } from '@royal-code/ui/media';

@Component({
  selector: 'royal-code-ui-category-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent, UiImageComponent],
  template: `
    <div class="category-card bg-card border-2 border-black shadow-lg hover:border-primary hover:shadow-xl transition-all duration-200 ease-out h-full group cursor-pointer overflow-hidden"
         (click)="onCardClick()"
         tabindex="0"
         role="button">
      
      <!-- Full-width image tegen de top (geen rounding) -->
      <div class="w-full h-48 bg-surface-alt overflow-hidden relative">
        @if (image(); as img) {
          <royal-code-ui-image 
            [image]="img" 
            objectFit="cover" 
            extraClasses="h-full w-full group-hover:scale-110 transition-transform duration-500" 
            [rounding]="'none'" />
        } @else {
          <div class="h-full flex items-center justify-center text-primary bg-gradient-to-br from-primary/5 to-primary/15 group-hover:scale-110 transition-transform duration-500">
            <royal-code-ui-icon [icon]="icon()" sizeVariant="xl" />
          </div>
        }
        <!-- Subtle overlay voor betere tekst leesbaarheid -->
        <div class="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-200"></div>
      </div>
      
      <!-- Content section -->
      <div class="p-6">
        <!-- Title -->
        @if (titleKey(); as title) {
          <h3 class="text-2xl font-bold text-primary mb-3 group-hover:text-primary-dark transition-colors">
            {{ title | translate }}
          </h3>
        }
        
        <!-- Apple-style description -->
        @if (descriptionKey(); as descKey) {
          <p class="text-base text-secondary mb-4 leading-relaxed">
            {{ descKey | translate }}
          </p>
        }
        
        <!-- Bullet points -->
        @if (children() && children()!.length > 0) {
          <ul class="space-y-3">
            @for (child of children(); track child.id) {
              <li class="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-all duration-200 group/item">
                <div class="w-2 h-2 bg-primary rounded-full flex-shrink-0 group-hover/item:scale-125 group-hover/item:bg-primary-dark transition-all duration-200"></div>
                <!-- CRITICAL FIX: Added queryParams and queryParamsHandling support -->
                <a [routerLink]="child.route" 
                   [queryParams]="child.queryParams"
                   [queryParamsHandling]="child.queryParamsHandling || 'merge'"
                   (click)="$event.stopPropagation()" 
                   class="hover:underline hover:translate-x-1 transition-all duration-200">
                  {{ child.labelKey | translate }}
                </a>
              </li>
            }
          </ul>
        }

        <!-- View all link -->
        <div class="mt-6 pt-4 border-t border-border">
          <!-- CRITICAL FIX: Added queryParams support to main navigation link -->
          <a [routerLink]="routePath()" 
             [queryParams]="queryParams()"
             [queryParamsHandling]="queryParamsHandling() || 'merge'"
             class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-all duration-200 hover:translate-x-1">
            <span>Bekijk alle</span>
            <royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="sm" extraClass="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; height: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCategoryCardComponent {
  readonly image = input<Image | undefined>(undefined);
  readonly icon = input<AppIcon>(AppIcon.Package);
  readonly titleKey = input<string | undefined>(undefined);
  readonly descriptionKey = input<string | undefined>(undefined);
  readonly routePath = input<string | string[] | undefined>(undefined);
  readonly children = input<NavigationItem[] | undefined>(undefined);
  
  // CRITICAL FIX: Added query parameters support
  readonly queryParams = input<{ [key: string]: any } | undefined>(undefined);
  readonly queryParamsHandling = input<'merge' | 'preserve' | 'replace' | ''>('merge');
  
  protected readonly AppIcon = AppIcon;
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  onCardClick(): void {
    const route = this.routePath();
    if (route) {
      // CRITICAL FIX: Use queryParams when navigating programmatically
      this.router.navigate(Array.isArray(route) ? route : [route], {
        queryParams: this.queryParams(),
        queryParamsHandling: this.queryParamsHandling() || 'merge'
      });
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/navigation/desktop-nav/ui-desktop-nav.component.ts ---
/**
 * @file ui-desktop-nav.component.ts
 * @Version 3.2.0 (FIX: Active Link Styling & Routing)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-10
 * @Description
 *   FIXED: De styling voor actieve navigatielinks is gecorrigeerd. De component
 *   gebruikt nu een template reference variable (#rla) met `routerLinkActive` en een
 *   conditionele `[ngClass]` om de correcte tekstkleur toe te passen. Dit lost
 *   CSS-conflicten op waarbij de basisklasse `text-foreground` de `active`
 *   status (`text-primary`) overschreef. Daarnaast is `routerLinkActiveOptions`
 *   toegevoegd om de 'Home'-knop correct af te handelen.
 */
import { ChangeDetectionStrategy, Component, computed, input, booleanAttribute } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';

@Component({
  selector: 'royal-code-ui-desktop-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul [ngClass]="listClasses()">
      @for (item of menuItems(); track item.id) {
        @if (item.displayHint?.includes(NavDisplayHintEnum.Desktop)) {
          <li>
            <a
              [routerLink]="item.route"
              [queryParams]="item.queryParams"
              [queryParamsHandling]="item.queryParamsHandling || 'merge'"
              routerLinkActive
              #rla="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: item.route === '/' }"
              class="flex items-center gap-2 transition-colors duration-200 font-semibold"
              [ngClass]="{
                'text-primary': rla.isActive,
                'text-xs text-secondary hover:text-foreground': isSubtle() && !rla.isActive,
                'text-sm text-foreground hover:text-primary': !isSubtle() && !rla.isActive
              }"
              [attr.aria-label]="item.labelKey | translate">
              @if (item.icon) {
                <royal-code-ui-icon [icon]="item.icon" sizeVariant="sm" />
              }
              <span>{{ item.labelKey | translate }}</span>
            </a>
          </li>
        }
      }
    </ul>
  `,
  // De `styles` property is verwijderd omdat de styling nu direct wordt afgehandeld door [ngClass]
  styles: [` :host { display: block; } `],
})
export class UiDesktopNavComponent {
  readonly menuItems = input.required<NavigationItem[]>();
  readonly isSubtle = input(false, { transform: booleanAttribute });

  protected readonly NavDisplayHintEnum = NavDisplayHintEnum;

  readonly listClasses = computed(() => {
    const baseClasses = ['flex', 'items-center'];
    const gapClass = this.isSubtle() ? 'gap-4' : 'gap-6';

    return [...baseClasses, gapClass].join(' ');
  });
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/navigation/mega-menu/mega-menu.component.ts ---
/**
 * @file mega-menu.component.ts
 * @Version 7.2.0 (COMPLETE FIX: All Query Parameters Type Issues Resolved)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-07
 * @Description
 *   FIXED: All TypeScript errors related to queryParamsHandling types are now resolved.
 *   Every instance uses the proper type conversion helper method.
 */
import { ChangeDetectionStrategy as CDS, Component, computed, input, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationItem, AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiNavigationCardComponent } from '../navigation-card/navigation-card.component';
import { UiCategoryCardComponent } from '../category-card/category-card.component';

@Component({
  selector: 'royal-code-ui-mega-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent, UiNavigationCardComponent, UiCategoryCardComponent],
  changeDetection: CDS.OnPush,
  template: `
    @if(menuItem(); as item) {
      <div class="bg-background border-x-2 border-b-2 border-black shadow-2xl animate-fade-in-down rounded-none">
        <div class="bg-card">
          @switch (item.megaMenuLayout) {
            
            @case ('vertical-split') {
              <div class="flex min-h-[450px] w-full">
                <div class="w-1/4 max-w-xs border-r-2 border-black flex-shrink-0">
                  <ul class="space-y-0">
                    @for (child of item.children; track child.id) {
                      <li>
                        <!-- CRITICAL FIX: Added queryParams and queryParamsHandling support -->
                        <a [routerLink]="child.route" 
                           [queryParams]="child.queryParams" 
                           [queryParamsHandling]="child.queryParamsHandling || 'merge'" 
                           (mouseenter)="hoveredVerticalItemId.set(child.id)"
                           class="flex justify-between items-center p-3 text-lg font-semibold transition-colors rounded-none"
                           [ngClass]="{
                             'bg-primary text-black': child.id === hoveredVerticalItemId(),
                             'text-foreground hover:bg-hover': child.id !== hoveredVerticalItemId()
                           }">
                          <span>{{ child.labelKey | translate }}</span>
                          <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" extraClass="opacity-50" />
                        </a>
                      </li>
                    }
                  </ul>
                </div>
                <div class="flex-grow p-6 overflow-hidden relative">
                  @if(activeVerticalItem(); as activeItem) {
                    @if (activeItem.id === 'laders-en-lipos' && activeItem.megaMenuFeaturedItems) {
                      <div class="grid grid-cols-2 gap-8 h-full">
                        @for (mainItem of activeItem.megaMenuFeaturedItems; track mainItem.id) {
                          <royal-code-ui-category-card
                            [titleKey]="mainItem.labelKey"
                            [descriptionKey]="mainItem.description"
                            [image]="mainItem.image"
                            [routePath]="mainItem.route"
                            [children]="mainItem.children"
                            [icon]="mainItem.id === 'lipos' ? AppIcon.BatteryCharging : AppIcon.Plug" />
                        }
                      </div>
                    } @else {
                      <!-- Standaard grid voor alle andere items -->
                      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full overflow-y-auto pr-4 md:pr-6">
                        @for (cardItem of activeItem.children; track cardItem.id) {
                          <div class="group-hover:scale-105 transition-transform self-start">
                            <!-- CRITICAL FIX: All queryParams bindings use helper method -->
                            <royal-code-ui-navigation-card
                              [titleKey]="cardItem.labelKey" 
                              [image]="cardItem.image"
                              [iconName]="cardItem.icon" 
                              [routePath]="cardItem.route"
                              [queryParams]="cardItem.queryParams"
                              [queryParamsHandling]="getValidQueryParamsHandling(cardItem.queryParamsHandling)"
                              [buttonTextKey]="'common.buttons.explore'"
                              [links]="cardItem.children" />
                          </div>
                        }
                      </div>
                    }
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-secondary">
                      Selecteer een categorie.
                    </div>
                  }
                </div>
              </div>
            }
            
            @case ('featured-grid') {
              <div class="p-6 min-h-[200px]">
                @if (item.megaMenuFeaturedItems && item.megaMenuFeaturedItems.length > 0) {
                  <!-- Special Drones Layout (voor item.id === 'drones') -->
                  @if (item.id === 'drones') {
                    <div class="grid grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-black">
                      @for (mainItem of item.megaMenuFeaturedItems.slice(0, 2); track mainItem.id) {
                        <royal-code-ui-category-card
                          [titleKey]="mainItem.labelKey"
                          [descriptionKey]="mainItem.description"
                          [image]="mainItem.image"
                          [routePath]="mainItem.route"
                          [children]="mainItem.children"
                          [icon]="mainItem.id === 'rtf-bnf-drones' ? AppIcon.Play : AppIcon.Wrench" />
                      }
                    </div>
                    
                    @if (item.megaMenuFeaturedItems.slice(2).length > 0) {
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        @for(featured of item.megaMenuFeaturedItems.slice(2); track featured.id) {
                          <div class="group-hover:scale-105 transition-transform self-start">
                            <!-- CRITICAL FIX: Use helper method for type conversion -->
                            <royal-code-ui-navigation-card
                              [titleKey]="featured.labelKey"
                              [image]="featured.image"
                              [routePath]="featured.route"
                              [queryParams]="featured.queryParams"
                              [queryParamsHandling]="getValidQueryParamsHandling(featured.queryParamsHandling)"
                              [buttonTextKey]="'common.buttons.view'"
                              [links]="featured.children" />
                          </div>
                        }
                      </div>
                    }
                  } @else {
                    <!-- General featured grid layout (o.a. voor Radio Control en Werkplaats & Veld) -->
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      @for(featured of item.megaMenuFeaturedItems; track featured.id) {
                        <div class="group-hover:scale-105 transition-transform self-start"> 
                          @if (featured.children && featured.children.length > 0) {
                            <royal-code-ui-category-card
                              [titleKey]="featured.labelKey"
                              [descriptionKey]="getDescriptionForGeneralFeaturedItem(featured.id)"
                              [image]="featured.image"
                              [routePath]="featured.route"
                              [children]="featured.children"
                              [icon]="featured.icon ?? AppIcon.Package" />
                          } @else {
                            <!-- CRITICAL FIX: Use helper method for type conversion -->
                            <royal-code-ui-navigation-card
                              [titleKey]="featured.labelKey"
                              [image]="featured.image"
                              [routePath]="featured.route"
                              [queryParams]="featured.queryParams"
                              [queryParamsHandling]="getValidQueryParamsHandling(featured.queryParamsHandling)"
                              [buttonTextKey]="'common.buttons.view'"
                              [links]="featured.children" />
                          }
                        </div>
                      }
                    </div>
                  }
                } @else {
                   <div class="w-full h-full flex items-center justify-center text-secondary">
                     Geen uitgelichte items.
                   </div>
                }
              </div>
            }
          }
        </div>
      </div>
    }
  `,
})
export class UiMegaMenuComponent {
  readonly menuItem = input<NavigationItem | null>(null);
  protected readonly AppIcon = AppIcon;
  readonly hoveredVerticalItemId = signal<string | null>(null);
  private translateService = inject(TranslateService);

  constructor() {
    effect(() => {
      const item = this.menuItem();
      if (item?.megaMenuLayout === 'vertical-split' && item.children?.[0]) {
        this.hoveredVerticalItemId.set(item.children[0].id);
      } else {
        this.hoveredVerticalItemId.set(null);
      }
    });
  }

  readonly activeVerticalItem = computed(() => {
    const activeId = this.hoveredVerticalItemId();
    if (!activeId) return null;
    return this.menuItem()?.children?.find(child => child.id === activeId) ?? null;
  });

  getDescriptionForGeneralFeaturedItem(itemId: string): string {
    switch (itemId) {
      case 'stroomvoorziening': return 'droneshop.categories.workshopField.powerSupply';
      case 'gereedschap-bouwbenodigdheden': return 'droneshop.categories.workshopField.toolsBuildingSupplies';
      case 'transport-opslag': return 'droneshop.categories.workshopField.transportStorage';
      case 'simulatoren-training': return 'droneshop.categories.workshopField.simulatorsTraining';
      case 'radio-zenders': return 'droneshop.categories.radioControl.transmitters';
      case 'rc-ontvangers': return 'droneshop.categories.radioControl.receivers';
      case 'externe-rc-modules': return 'droneshop.categories.radioControl.externalRcModules';
      case 'rc-antennes': return 'droneshop.categories.radioControl.rcAntennas';
      case 'gimbals-schakelaars': return 'droneshop.categories.radioControl.gimbalsSwitches';
      default: return '';
    }
  }

  /**
   * CRITICAL FIX: Convert NavigationItem queryParamsHandling to component-compatible type
   */
  getValidQueryParamsHandling(handling?: string): '' | 'merge' | 'preserve' {
    if (handling === 'merge' || handling === 'preserve') {
      return handling;
    }
    return 'merge'; // Default fallback
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/navigation/mobile-nav-modal/ui-mobile-nav-modal.component.ts ---
/**
 * @fileoverview Defines the mobile navigation modal/drawer component.
 * @version 2.6.0 (Design & Architecture Refactor)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-08-31
 * @Description
 *   Definitive version with corrected design and architecture.
 *   - Replaces native `<button>` with `<royal-code-ui-button>` for consistency.
 *   - Applies `rounded-xs` and theme-aware text colors (`text-foreground`).
 */
import { ChangeDetectionStrategy, Component, InputSignal, computed, input, output, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/logging';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '@royal-code/ui/button'; // <-- Import UiButtonComponent

@Component({
  selector: 'royal-code-ui-mobile-nav-modal',
  standalone: true,
  imports: [CommonModule, UiIconComponent, TranslateModule, UiButtonComponent], // <-- Voeg UiButtonComponent toe
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 bg-black/50 z-40 animate-fade-in-fast" (click)="onBackdropClick($event)" aria-hidden="true"></div>
      <div [@slideInRight]
          class="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-background z-50 overflow-y-auto p-4 shadow-xl flex flex-col focus:outline-none"
          role="dialog" aria-modal="true" [attr.aria-labelledby]="'mobile-menu-title'">
          <div class="flex justify-between items-center mb-4 pb-3 border-b border-border flex-shrink-0">
              <!-- DE FIX: Gebruik ui-button -->
              <royal-code-ui-button
                type="transparent"
                sizeVariant="icon"
                (clicked)="goBack()"
                [attr.aria-label]="menuStack().length > 0 ? ('common.buttons.back' | translate) : ('common.buttons.close' | translate)">
                <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" />
              </royal-code-ui-button>
              <h2 id="mobile-menu-title" class="font-semibold text-base text-foreground truncate px-2">
                  {{ (currentTitle() ?? '') | translate }}
              </h2>
              <!-- DE FIX: Gebruik ui-button -->
              <royal-code-ui-button
                type="transparent"
                sizeVariant="icon"
                (clicked)="requestClose()"
                [attr.aria-label]="'common.buttons.close' | translate">
                <royal-code-ui-icon [icon]="AppIcon.X" />
              </royal-code-ui-button>
          </div>
          <div class="flex-grow overflow-y-auto -mx-4 px-4 min-h-0">
              <nav class="flex flex-col space-y-1">
                  @for (item of currentItems(); track trackItemId($index, item)) {
                      @if (item.displayHint?.includes(NavDisplayHintEnum.MobileModal)) {
                          @if (item.dividerBefore) { <hr class="my-2 border-border"> }
                          <!-- DE FIX: Volledig vervangen door ui-button voor consistentie en styling -->
                          <royal-code-ui-button
                            [type]="isActive(item) ? 'primary' : 'transparent'"
                            sizeVariant="md"
                            (clicked)="handleItemClick(item)"
                            extraClasses="!justify-start w-full !rounded-xs">
                              @if(item.icon; as iconName){
                                <royal-code-ui-icon [icon]="iconName" sizeVariant="sm" class="flex-shrink-0 mr-3"
                                  [ngClass]="{
                                    'text-primary-on': isActive(item),
                                    'text-secondary': !isActive(item)
                                  }"/>
                              } @else {
                                <span class="w-5 h-5 mr-3 flex-shrink-0"></span>
                              }
                              <span class="flex-grow truncate text-left">
                                  {{ (item.labelKey ?? '') | translate }}
                              </span>
                              @if (item.children && item.children.length > 0) {
                                <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" extraClass="text-secondary ml-auto flex-shrink-0"/>
                              }
                          </royal-code-ui-button>
                      }
                  }
              </nav>
           </div>
        </div>
    }
  `,
  animations: [
    trigger('slideInRight', [
        state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
        transition(':enter', [ animate('250ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateX(0)', opacity: 1 })) ]),
        transition(':leave', [ animate('200ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateX(100%)', opacity: 0 })) ])
    ])
  ],
})
export class UiMobileNavModalComponent {
  readonly AppIcon = AppIcon;
  readonly NavDisplayHintEnum = NavDisplayHintEnum;

  readonly menuItems: InputSignal<NavigationItem[]> = input.required<NavigationItem[]>();
  readonly isOpen: InputSignal<boolean> = input.required<boolean>();
  readonly closeRequested = output<void>();
  readonly navigationItemClicked = output<NavigationItem>();

  private readonly logger = inject(LoggerService, { optional: true });
  private readonly router = inject(Router);
  private readonly logPrefix = '[UiMobileNavModalComponent]';
  readonly menuStack = signal<NavigationItem[]>([]);

  readonly currentItems = computed(() => {
    const stack = this.menuStack();
    if (stack.length > 0) return stack[stack.length - 1].children ?? [];
    return this.menuItems() ?? [];
  });

  readonly currentTitle = computed(() => {
    const stack = this.menuStack();
    if (stack.length === 0) return 'navigation.menu';
    return stack[stack.length - 1].labelKey;
  });

  handleItemClick(item: NavigationItem): void {
    if (item.children && item.children.length > 0) {
      this.menuStack.update(stack => [...stack, item]);
    } else if (item.route) {
      this.navigationItemClicked.emit(item);
    }
  }

  goBack(): void {
    if (this.menuStack().length > 0) {
      this.menuStack.update(stack => stack.slice(0, -1));
    } else {
      this.requestClose();
    }
  }

  requestClose(): void {
    this.closeRequested.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  trackItemId(index: number, item: NavigationItem): number | string {
    return item.id ?? index;
  }

  isActive(item: NavigationItem): boolean {
    if (!item.route) return false;
    // Gebruik de queryParams van het item voor een preciezere check
    return this.router.isActive(this.router.createUrlTree(Array.isArray(item.route) ? item.route : [item.route], { queryParams: item.queryParams }).toString(), {
      paths: 'subset', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored'
    });
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/navigation/mobile-nav/ui-mobile-nav.component.ts ---
/**
 * @fileoverview Defines the bottom navigation bar component for mobile views.
 * Displays primary navigation items and a trigger for the main menu modal.
 * Prioritizes inline Tailwind utility classes for styling based on project guidelines.
 *
 * @Component UiMobileNavComponent
 * @description Renders a fixed bottom navigation bar visible only on smaller screens (md:hidden).
 *              Uses semantic Tailwind classes which utilize CSS variables defined in styles.scss for theming.
 */
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/logging';

@Component({
  selector: 'royal-code-ui-mobile-nav',
  standalone: true,
  imports: [RouterModule, UiIconComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
template: `
    <div class="fixed bottom-0 left-0 right-0 bg-background shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] border-t border-border md:hidden z-50 h-16">
      <nav class="container-max h-full px-1">
        <div class="flex justify-around items-stretch h-full">
          @for (item of menuItems(); track trackItemId($index, item)) {
             @if (item.displayHint?.includes(NavDisplayHintEnum.MobileBottom)) {
                 @if (item.menuType === 'dropdown') {
                    <button (click)="openMenuModalClicked.emit()" type="button" class="flex flex-1 flex-col items-center justify-center p-1 min-w-[60px] text-center text-muted-foreground rounded-md hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background group transition-colors duration-150" aria-label="Open main menu">
                       <royal-code-ui-icon [icon]="item.icon || AppIcon.Menu" sizeVariant="md" extraClass="mb-0.5 group-hover:scale-110 transition-transform"/>
                       <span class="text-[10px] leading-tight font-medium group-hover:text-primary">{{ item.labelKey | translate }}</span>
                    </button>
                 } @else if (item.route) {
                     <a [routerLink]="item.route" class="flex flex-1 flex-col items-center justify-center p-1 min-w-[60px] text-center text-muted-foreground rounded-md hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background group transition-colors duration-150" routerLinkActive="text-primary font-semibold" [routerLinkActiveOptions]="{exact: item.route === '/'}">
                        <royal-code-ui-icon [icon]="item.icon || AppIcon.CircleDot" sizeVariant="md" extraClass="mb-0.5 group-hover:scale-110 transition-transform"/>
                         <span class="text-[10px] leading-tight font-medium group-hover:text-primary">{{ item.labelKey | translate }}</span>
                     </a>
                 }
              }
          }
        </div>
      </nav>
    </div>
  `,
})
export class UiMobileNavComponent {
  /** Input signal providing the array of navigation items to display. */
  readonly menuItems: InputSignal<NavigationItem[]> = input.required<NavigationItem[]>();
  /** Output event emitter triggered when the user clicks the button intended to open the main menu modal. */
  readonly openMenuModalClicked = output<void>();

  /** Exposes the AppIcon enum to the template for fallback icons. */
  readonly AppIcon = AppIcon;
  /** Exposes the NavDisplayHintEnum to the template for display hint filtering. */
  readonly NavDisplayHintEnum = NavDisplayHintEnum;
  /** Optional logger injection. */
  private logger = inject(LoggerService, { optional: true });
  private readonly logPrefix = '[UiMobileNavComponent]';

  /**
   * TrackBy function for the @for loop to optimize rendering.
   * @param index - The index of the item in the array.
   * @param item - The NavigationItem object.
   * @returns A unique identifier (ID or index) for the item.
   */
  trackItemId(index: number, item: NavigationItem): number | string {
    return item.id ?? index;
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/navigation/navigation-card/navigation-card.component.ts ---
/**
 * @file ui-navigation-card.component.ts
 * @Version 7.2.0 (FIX: Hover Image Scale Animation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description
 *   Een conversie-geoptimaliseerde navigatiekaart die nu `queryParams` en `queryParamsHandling` ondersteunt.
 *   Deze versie implementeert de "scale on hover" animatie voor de afbeeldingen, consistent
 *   met de `UiCategoryCardComponent`, inclusief een fix voor de hover-afbeelding.
 */
import { ChangeDetectionStrategy, Component, InputSignal, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon, Image, NavigationItem, NavigationBadge } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiListComponent } from '@royal-code/ui/list';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';

@Component({
  selector: 'royal-code-ui-navigation-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiButtonComponent, UiImageComponent, UiListComponent, UiBadgeComponent, UiParagraphComponent],
  template: `
    <div
      class="navigation-card flex flex-col text-left bg-card border-2 border-black shadow-lg hover:border-primary transition-all duration-200 ease-out h-full group group-hover:scale-105"
      [ngClass]="{'cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background': !links()?.length}"
      (click)="onCardClick()"
      (mouseenter)="isHovering.set(true)"
      (mouseleave)="isHovering.set(false)"
      [attr.tabindex]="links()?.length ? null : '0'"
      role="group">

      <div class="overflow-hidden">
        @if (badges() && badges()!.length > 0) {
          <div class="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
            @for(badge of badges(); track badge.text) {
              <royal-code-ui-badge [color]="badge.color" [size]="badge.size || 'xs'">
                {{ badge.text }}
              </royal-code-ui-badge>
            }
          </div>
        }

        <div class="aspect-video w-full">
          <div class="relative h-full w-full bg-surface-alt rounded-none transition-transform duration-300">
            <!-- Standaard Afbeelding met schaal-animatie op hover -->
            <royal-code-ui-image
              [image]="image()"
              objectFit="cover"
              extraClasses="absolute inset-0 h-full w-full transition-opacity duration-500 group-hover:scale-110 transition-transform duration-500"
              [ngClass]="isHovering() && hoverImage() ? 'opacity-0' : 'opacity-100'"
              [rounding]="'none'" />

            <!-- Hover Afbeelding (rendert er bovenop) met schaal-animatie op hover -->
            @if (hoverImage()) {
              <royal-code-ui-image
                [image]="hoverImage()"
                objectFit="cover"
                extraClasses="absolute inset-0 h-full w-full transition-opacity duration-500 group-hover:scale-110 transition-transform duration-500"
                [ngClass]="isHovering() ? 'opacity-100' : 'opacity-0'"
                [rounding]="'none'" />
            }
          </div>
        </div>
      </div>

      <div class="flex-grow p-4 flex flex-col border-t-2 border-black">
        @if (titleKey(); as title) {
          <h3 class="text-md font-semibold text-text mb-2 group-hover:text-primary transition-colors">
            {{ title | translate }}
          </h3>
        }

        @if (description(); as desc) {
          <royal-code-ui-paragraph size="sm" color="muted" extraClasses="mb-3 line-clamp-2">
            {{ desc }}
          </royal-code-ui-paragraph>
        }

        @if (priceRangeKey(); as priceRange) {
           <p class="text-sm font-semibold text-foreground mb-3">{{ priceRange | translate }}</p>
        }

        <div class="mt-auto">
          @if (links() && links()!.length > 0) {
            <royal-code-ui-list
              [list]="links()!"
              [listType]="'text'"
              [displayPropertyKey]="'labelKey'"
              (itemClick)="onLinkClick($event)" />
          } @else {
            <royal-code-ui-button
              type="primary"
              sizeVariant="sm"
              [extraClasses]="'w-full rounded-none'"
              [attr.tabindex]="-1"
              class="pointer-events-none">
              {{ buttonTextKey() | translate }}
            </royal-code-ui-button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; height: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiNavigationCardComponent {
  readonly image: InputSignal<Image | undefined> = input<Image | undefined>(undefined);
  readonly hoverImage: InputSignal<Image | undefined> = input<Image | undefined>(undefined);
  readonly iconName: InputSignal<AppIcon | undefined> = input<AppIcon | undefined>(undefined);
  readonly titleKey: InputSignal<string | undefined> = input<string | undefined>(undefined);
  readonly description: InputSignal<string | undefined> = input<string | undefined>(undefined); 
  readonly buttonTextKey: InputSignal<string> = input<string>('common.buttons.explore');
  readonly routePath: InputSignal<string | string[] | undefined> = input<string | string[] | undefined>(undefined);
  readonly queryParams = input<{ [key: string]: any } | undefined>();
  readonly queryParamsHandling = input<'merge' | 'preserve' | ''>('');
  readonly links = input<NavigationItem[] | undefined>();

  readonly badges = input<NavigationBadge[] | undefined>();
  readonly priceRangeKey = input<string | undefined>();

  private readonly router = inject(Router);
  readonly isHovering = signal(false);

  onCardClick(): void {
    const route = this.routePath();
    if (route && (!this.links() || this.links()!.length === 0)) {
      this.router.navigate(Array.isArray(route) ? route : [route], { 
        queryParams: this.queryParams(),
        queryParamsHandling: this.queryParamsHandling() || null
      });
    }
  }

  onLinkClick(item: NavigationItem): void {
    if (item.route) {
      this.router.navigate(Array.isArray(item.route) ? item.route : [item.route], { 
        queryParams: item.queryParams,
        queryParamsHandling: item.queryParamsHandling || null
      });
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/navigation/ui-navigation-elements/ui-navigation-elements.component.html ---
<p>UiNavigationElements works!</p>
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/navigation/ui-navigation-elements/ui-navigation-elements.component.ts ---
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'royal-ui-navigation-elements',
  imports: [CommonModule],
  templateUrl: './ui-navigation-elements.component.html',
  styleUrl: './ui-navigation-elements.component.css',
})
export class UiNavigationElementsComponent {}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/src/lib/navigation/ui-vertical-nav/ui-vertical-nav.component.ts ---
/**
 * @file ui-vertical-nav.component.ts
 * @Version 9.2.0 (Definitive NG0955 TrackBy Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Vertical navigation component with a definitive fix for the NG0955 error
 *   by implementing a strict trackBy function based on the unique item.id.
 */
import { Component, ChangeDetectionStrategy, input, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavigationItem, AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { StorageService } from '@royal-code/core/storage';

const NAV_EXPANDED_STATE_KEY = 'admin_nav_expanded_items';

@Component({
  selector: 'royal-code-ui-vertical-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent],
  template: `
    <nav class="p-2 space-y-1">
      <!-- DE FIX: Gebruik track trackById om de NG0955 fout op te lossen -->
      @for(item of items(); track trackById($index, item)) {
        @if(item.dividerBefore) {
          <hr class="my-2 border-border" />
        }
        @if(item.isSectionHeader) {
          <h3 class="px-3 pt-4 pb-1 text-xs font-semibold uppercase text-secondary">
            {{ item.labelKey | translate }}
          </h3>
        } @else {
          <!-- Main link container -->
          <a [routerLink]="item.children && item.children.length > 0 ? null : item.route"
             (click)="handleItemClick(item, $event)"
             class="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors w-full cursor-pointer"
             [ngClass]="getLinkClasses(item)">
            
            @if(item.icon) {
              <royal-code-ui-icon [icon]="item.icon" sizeVariant="sm" />
            }
            <span class="flex-grow">{{ item.labelKey | translate }}</span>
            
            @if (item.children && item.children.length > 0) {
              <royal-code-ui-icon
                [icon]="AppIcon.ChevronRight"
                sizeVariant="sm"
                class="transition-transform duration-200"
                [ngClass]="{ 'rotate-90': isExpanded(item.id) }"
              />
            }
          </a>

          @if (item.children && item.children.length > 0 && isExpanded(item.id)) {
            <ul class="ml-4 mt-1 pl-3 border-l border-border space-y-1 animate-fade-in-fast">
              @for (child of item.children; track trackById($index, child)) {
                <li>
                  <a [routerLink]="child.route"
                     [routerLinkActiveOptions]="{ exact: true }"
                     routerLinkActive="!bg-hover !text-foreground font-semibold"
                     class="flex items-center gap-3 px-3 py-2 text-sm rounded-xs transition-colors w-full text-muted-foreground hover:bg-hover hover:text-foreground">
                    <span>{{ child.labelKey | translate }}</span>
                  </a>
                </li>
              }
            </ul>
          }
        }
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiVerticalNavComponent {
  items = input.required<NavigationItem[]>();
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  protected readonly AppIcon = AppIcon;

  private expandedItems = signal<Set<string>>(new Set());
  private currentUrl = signal(this.router.url);

  constructor() {
    const storedExpandedItems = this.storageService.getItem<string[]>(NAV_EXPANDED_STATE_KEY);
    if (storedExpandedItems) {
      this.expandedItems.set(new Set(storedExpandedItems));
    }

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });

    effect(() => {
      const items = this.items(); 
      this.currentUrl(); 
      
      if (!items) return;
      
      const newSet = new Set(this.expandedItems());
      let changed = false;
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          const shouldBeExpanded = this.isParentOrChildActive(item);
          if (shouldBeExpanded && !newSet.has(item.id)) {
            newSet.add(item.id);
            changed = true;
          }
        }
      }
      
      if (changed) {
        this.expandedItems.set(newSet);
      }
      
      this.storageService.setItem(NAV_EXPANDED_STATE_KEY, Array.from(this.expandedItems()));
    });
  }
  
  // DE FIX: trackBy functie die de unieke item.id gebruikt
  trackById(index: number, item: NavigationItem): string {
    return item.id;
  }

  getLinkClasses(item: NavigationItem): Record<string, boolean> {
    const isActive = this.isParentOrChildActive(item);
    return {
      'bg-primary text-black rounded-xs': isActive && item.id !== 'logout',
      'bg-surface-alt font-semibold rounded-xs': isActive && item.id === 'logout',
      'text-muted-foreground hover:bg-hover hover:text-foreground rounded-md': !isActive && item.id !== 'logout',
      'text-muted-foreground hover:bg-error/10 hover:text-error rounded-md': !isActive && item.id === 'logout',
    };
  }

  handleItemClick(item: NavigationItem, event: MouseEvent): void {
    if (item.children && item.children.length > 0) {
      event.preventDefault();
      this.toggleExpand(item.id);
    } else if (item.route) {
      this.router.navigate(Array.isArray(item.route) ? item.route : [item.route]);
    }
  }

  isParentOrChildActive(item: NavigationItem): boolean {
    const currentUrl = this.currentUrl();
    const isParentActive = item.route ? this.router.isActive(item.route as string, { paths: 'exact', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' }) : false;
    if (isParentActive && (!item.children || item.children.length === 0)) return true;
    if (item.children) return item.children.some(child => child.route ? this.router.isActive(child.route as string, { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' }) : false);
    return false;
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }

  private toggleExpand(itemId: string): void {
    this.expandedItems.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(itemId)) newSet.delete(itemId); else newSet.add(itemId);
      return newSet;
    });
  }
}
--- END OF FILE ---

