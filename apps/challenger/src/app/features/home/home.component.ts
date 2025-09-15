// apps/challenger/src/app/features/home/home.component.ts
/**
 * @fileoverview Defines the HomeComponent, serving as the primary user dashboard after authentication.
 * It integrates key application features such as 3D avatar display, resource monitoring,
 * AI coach interaction, character progression overview, and social feed previews.
 * The component uses a responsive layout, adapting to different screen sizes, and
 * employs an accordion-style UI for toggling the visibility of detailed sections like
 * AI Chat and Character Stats.
 *
 * @Component HomeComponent
 * @description
 * The HomeComponent orchestrates the display of several child components and data streams:
 * - Renders an interactive 3D avatar using `AiAvatarComponent`.
 * - Displays player resource bars (HP, MP, Stamina) overlaid on the avatar scene.
 * - Provides an input for direct interaction with the AI Coach, positioned below the avatar.
 * - Utilizes `UiAccordionComponent` to manage collapsible sections for the full AI Chat
 *   interface (`AiChatComponent`) and the detailed character progression summary
 *   (`CharacterProgressionSummaryPageComponent`).
 * - Leverages NgRx Facades (`AuthFacade`, `CharacterProgressionFacade`, `ChatFacade`)
 *   for reactive state management and data fetching.
 * - Implements responsive design principles for optimal viewing across devices.
 *
 * @version 1.3.2 - Increased avatar scene height and added permanent fallback sections.
 * @author ChallengerAppDevAI
 */
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  Signal,
  effect,
  Injector,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// UI Components
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiAccordionComponent, UiAccordionItemComponent } from '@royal-code/ui/accordion';
import { UiResourceBatteryComponent } from '@royal-code/ui/meters';
import { UiTitleComponent } from '@royal-code/ui/title';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { TitleTypeEnum } from '@royal-code/shared/domain';

// Feature Components
import { AiAvatarComponent, AvatarModelConfig, WorldLightingConfig } from '@royal-code/features/avatar';
import { CharacterProgressionSummaryPageComponent } from '@royal-code/features/character-progression';
import { FeedInputComponent, CommentInputComponent } from "@royal-code/features/social/ui";

// State & Facades
import { AuthFacade } from '@royal-code/store/auth';
import { CharacterProgressionFacade } from '@royal-code/features/character-progression';

// Models & Routes
import { AppIcon, Profile, ChallengeSummary, Quest, CharacterStats } from '@royal-code/shared/domain';
import { ROUTES } from '@royal-code/core/routing';
import { LoggerService } from '@royal-code/core/core-logging';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { FeedComponent } from "@royal-code/features/social/ui";
import { FeedFacade } from "@royal-code/features/social/core";

// Simple types for the component
interface SendMessagePayload {
  content: string;
  media?: File[];
  gifUrl?: string;
}

interface ChatMessageSubmitData {
  text: string;
  files?: File[];
  gifUrl?: string;
}

// Simple Chat Input Component (inline template)
// eslint-disable-next-line @nx/enforce-module-boundaries
@Component({
  selector: 'lib-chat-input',
  standalone: true,
  imports: [FormsModule, TranslateModule, UiButtonComponent, UiTextareaComponent],
  template: `
    <div class="flex flex-col space-y-2 p-3 border border-border rounded-lg">
      <royal-code-ui-textarea
        [(ngModel)]="inputText"
        [placeholder]="placeholder"
        [maxHeightPx]="200">
      </royal-code-ui-textarea>
      <div class="flex justify-end space-x-2">
        <royal-code-ui-button
          [disabled]="isSending || !inputText.trim()"
          (clicked)="onSubmit()">
          {{ isSending ? 'Sending...' : 'Send' }}
        </royal-code-ui-button>
      </div>
    </div>
  `
})
export class ChatInputComponent {
  @Input() placeholder = 'Type a message...';
  @Input() isSending = false;
  @Output() submitted = new EventEmitter<ChatMessageSubmitData>();
  
  inputText = '';
  
  onSubmit() {
    if (this.inputText.trim()) {
      this.submitted.emit({
        text: this.inputText.trim(),
        files: [],
        gifUrl: undefined
      });
      this.inputText = '';
    }
  }
}

// Simple AI Chat Component placeholder (inline)
// eslint-disable-next-line @nx/enforce-module-boundaries
@Component({
  selector: 'royal-code-ai-chat',
  standalone: true,
  template: `
    <div class="p-4 border border-border rounded-lg bg-card">
      <p class="text-muted-foreground">AI Chat component will be implemented here</p>
    </div>
  `
})
export class AiChatComponent {
}

@Component({
  selector: 'app-royal-code-home',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    UiButtonComponent,
    UiIconComponent,
    UiTitleComponent,
    UiAccordionComponent,
    UiAccordionItemComponent,
    AiAvatarComponent,
    FeedInputComponent,
    CommentInputComponent,
    CharacterProgressionSummaryPageComponent,
    FeedComponent,
    UiResourceBatteryComponent,
    ChatInputComponent,
    AiChatComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      Main container for the Home page.
      Provides overall padding and vertical spacing for its sections.
    -->
    <div class="home-page-container p-4 md:p-6 space-y-6 md:space-y-8">

      <!-- Section: Hero area containing Avatar, Resource Bars, and quick AI Chat input. -->
      <section class="hero-section relative" aria-labelledby="hero-section-title">
        <h2 id="hero-section-title" class="sr-only">{{ 'home.hero.title' | translate }}</h2>

        <!-- Container for the 3D Avatar scene and overlaid UI elements. -->
        <!-- HEIGHT ADJUSTMENT: From h-[60vh] md:h-[70vh] to h-[85vh] md:h-[90vh] -->
        <div class="ai-avatar-scene-container relative h-[85vh] md:h-[90vh] min-h-[450px] md:min-h-[500px] bg-muted rounded-xs shadow-lg flex items-center justify-center border border-border overflow-hidden">

          <!-- Renders the 3D Avatar. -->
          @if(homeAvatarConfigSignal(); as avatarConfig){
            <royal-code-ai-avatar
              class="w-full h-full"
              [avatarConfig]="avatarConfig"
              [lightingConfig]="homeLightingConfigSignal()"
              [displayMode]="avatarEquipmentViewMode()"
              [interactive]="true"
            />
          } @else {
            <!-- Fallback content while avatar is loading or unavailable. -->
            <div class="w-full h-full flex items-center justify-center text-secondary">
              Laden van avatar...
            </div>
          }

          <!-- Overlay: Player Resource Bars (HP, MP, Stamina) using UiResourceBatteryComponent, positioned top-left. -->
          <div class="absolute top-4 left-4 z-10 flex flex-col space-y-2 items-start">
            <!-- Health Battery -->
            <royal-code-ui-resource-battery
                class="min-w-[100px] sm:min-w-[120px]"
                [type]="'health'"
                [currentValue]="currentHealth()"
                [maxValue]="maxHealth()"
                sizeVariant="md"
                label="HP"
                [showValueText]="true"
                [enableNeonEffect]="true"
                />
            <!-- Mana Battery -->
            <royal-code-ui-resource-battery
                class="min-w-[100px] sm:min-w-[120px]"
                [type]="'mana'"
                [currentValue]="currentMana()"
                [maxValue]="maxMana()"
                sizeVariant="md"
                label="MP"
                [showValueText]="true"
                [enableNeonEffect]="true"
                />
            <!-- Stamina Battery -->
            <royal-code-ui-resource-battery
                class="min-w-[100px] sm:min-w-[120px]"
                [type]="'stamina'"
                [currentValue]="currentStamina()"
                [maxValue]="maxStamina()"
                sizeVariant="md"
                label="STA"
                [showValueText]="true"
                [enableNeonEffect]="true"
                />
          </div>

          <!-- Overlay: Quick AI Chat Input, positioned bottom-center. -->
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-3">
              <div class="bg-background/80 backdrop-blur-sm p-2 rounded-xs shadow-xl border border-border">
                  <lib-chat-input
                    (submitted)="handleAiChatMessage($event)"
                    [isSending]="isSendingAiMessage()"
                    [placeholder]="'home.hero.askAiPlaceholder' | translate"/>
              </div>
          </div>

          <!-- Controls for toggling Avatar/Equipment view, positioned bottom-right. -->
          <div class="hero-scene-controls absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10">
            <royal-code-ui-button type="primary" sizeVariant="sm" (click)="toggleAvatarEquipmentView()">
              <royal-code-ui-icon [icon]="avatarEquipmentViewMode() === 'avatar' ? AppIcon.Shirt : AppIcon.User" extraClass="mr-1.5" sizeVariant="sm"/>
              {{ (avatarEquipmentViewMode() === 'avatar' ? 'home.hero.showEquipment' : 'home.hero.showAvatar') | translate }}
            </royal-code-ui-button>
          </div>
        </div>
      </section>

      <!-- Section: Accordion for Interactive Panels (AI Coach & Character Stats) -->
      <section class="interactive-panels-section" aria-labelledby="interactive-panels-title">
        <h2 id="interactive-panels-title" class="sr-only">{{ 'home.interactivePanels.title' | translate }}</h2>
        <royal-code-ui-accordion
    [multiple]="true"
    [initialOpenItems]="['ai-coach-panel']"
    [persistStateKey]="'homePageAccordion'">  <!-- <<<< DEZE MOET ER ZIJN! -->

  <royal-code-ui-accordion-item itemId="ai-coach-panel" [transparent]="true">
    <div accordion-item-title class="flex items-center justify-between w-full">
      <div class="flex items-center">
        <royal-code-ui-icon [icon]="AppIcon.Sparkles" sizeVariant="sm" colorClass="text-primary mr-2"/>
        <span>{{ 'home.accordion.aiCoachTitle' | translate }}</span>
      </div>
      @if (aiHasNotification()) {
          <span class="relative flex h-2 w-2 ml-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
      }
    </div>
    <div accordion-item-content>
      <div class="h-[60vh] max-h-[450px] min-h-[300px] overflow-hidden">
        <royal-code-ai-chat />
      </div>
    </div>
  </royal-code-ui-accordion-item>

  <royal-code-ui-accordion-item itemId="character-stats-panel" [transparent]="true">
    <div accordion-item-title class="flex items-center justify-between w-full">
      <div class="flex items-center">
          <royal-code-ui-icon [icon]="AppIcon.UserCircle" sizeVariant="sm" colorClass="text-primary mr-2"/>
          <span>{{ 'home.accordion.characterStatsTitle' | translate }}</span>
      </div>
      @if (skillPointsAvailable() > 0) {
        <span class="ml-auto px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full animate-pulse">
          {{ skillPointsAvailable() }} {{ 'home.accordion.skillPointsAvailable' | translate }}!
        </span>
      }
    </div>
    <div accordion-item-content>
      <royal-code-character-progression-summary-page />
    </div>
  </royal-code-ui-accordion-item>
</royal-code-ui-accordion>
      </section>

      <royal-code-ui-icon [icon]="AppIcon.Sparkles" sizeVariant="sm" colorClass="text-primary mr-2"/>


      <!-- Oorspronkelijke "andere secties" blijven hieronder -->
      <section class="adventures-section card-section" aria-labelledby="adventures-section-title">
        <royal-code-ui-title
            [text]="'home.titles.currentAdventures' | translate"
            [level]="TitleTypeEnum.H2" [heading]="true"
            extraClasses="section-title"
            id="adventures-section-title" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="active-item-placeholder p-3 bg-card-secondary rounded-xs text-center">
            <p class="text-sm font-semibold text-text mb-1">Actieve Uitdaging</p>
            <p class="text-xs text-secondary italic">Placeholder ChallengeCard</p>
          </div>
          <div class="active-item-placeholder p-3 bg-card-secondary rounded-xs text-center">
            <p class="text-sm font-semibold text-text mb-1">Actieve Quest</p>
            <p class="text-xs text-secondary italic">Placeholder QuestCard</p>
          </div>
        </div>
      </section>

      <section class="world-news-section card-section" aria-labelledby="world-news-section-title">
        <royal-code-ui-title
            [text]="'home.titles.worldNews' | translate"
            [level]="TitleTypeEnum.H2" [heading]="true"
            extraClasses="section-title"
            id="world-news-section-title" />
         <p class="text-xs text-secondary italic">Placeholder nieuws.</p>
      </section>

      <section id="feed" class="mb-6 card-section" aria-labelledby="feed-section-title">
          <royal-code-ui-title
            [text]="'common.titles.discussion' | translate"
            [level]="TitleTypeEnum.H2"
            [heading]="true"
            id="feed-section-title"
            extraClasses="section-title !mb-3"
          />
            <royal-code-feed
                [feedId]="feedId()"
                [hideFeedReply]="true"
                [hideCommentReply]="true"
                [maximumNumberOfFeedItems]="0" />
      </section>

      <section class="quick-actions-section" aria-labelledby="quick-actions-title">
        <royal-code-ui-title
            [text]="'home.titles.quickActions' | translate"
            [level]="TitleTypeEnum.H2" [heading]="true"
            extraClasses="section-title"
            id="quick-actions-title" />
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <button class="quick-action-placeholder">Start Random Uitdaging</button>
          <button class="quick-action-placeholder">Maak Challenge</button>
          <button class="quick-action-placeholder">Inventaris</button>
          <button class="quick-action-placeholder">Achievements</button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .card-section { @apply p-3 md:p-4 bg-card rounded-xs shadow-sm border border-border; }
    .section-title { /* Styling for main page title is now handled by UiTitleComponent's extraClasses */ }
    .subsection-title-alt { /* Styling for subsection titles is now handled by UiTitleComponent's extraClasses */ }
    .quick-action-placeholder { @apply p-3 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm text-center hover:bg-primary/90 transition-colors h-20 sm:h-24 flex items-center justify-center; }
    .active-item-placeholder, .news-item-placeholder { @apply min-h-[80px] flex flex-col justify-center items-center; }
    .attribute-item-loading { @apply h-9 bg-muted rounded animate-pulse; }
  `]
})
export class HomeComponent implements OnInit {
  /** Facade for authentication state and actions. */
  readonly authFacade = inject(AuthFacade);
  /** Facade for character progression state and actions. */
  readonly charProgFacade = inject(CharacterProgressionFacade);
  /** Facade for chat state and actions. */
  private readonly feedFacade = inject(FeedFacade);
  /** Service for application-wide logging. */
  private readonly logger = inject(LoggerService);
  /** Service for managing dynamic overlays. */
  private readonly dynamicOverlayService = inject(DynamicOverlayService);
  /** Angular injector instance, used for effects. */
  private readonly injector = inject(Injector);

  // --- Local UI State Signals ---
  /** Configuration for the 3D avatar display. Updated when user authenticates. */
  readonly homeAvatarConfigSignal = signal<AvatarModelConfig | undefined>(undefined);
  /** Lighting configuration for the 3D avatar scene. */
  readonly homeLightingConfigSignal = signal<WorldLightingConfig | undefined>(undefined);
  /** Placeholder signal indicating if the user is currently in a party. */
  readonly userIsInParty = signal(false);
  /** Current display mode for the avatar ('avatar' or 'equipment'). */
  readonly avatarEquipmentViewMode = signal<'avatar' | 'equipment'>('avatar');
  /** Placeholder signal for an AI-suggested challenge. */
  readonly aiChallengeSuggestion = signal<ChallengeSummary | null>(null);
  /**
   * Controls whether the full AI chat interface is shown within its accordion item,
   * or if a compact chat input is shown beneath the avatar scene.
   * Defaults to `true` (chat in accordion).
   */
  readonly showAiChatInAccordion = signal(true);
  /** Placeholder signal to indicate if the AI Coach has unread messages or important updates. */
  readonly aiHasNotification = signal(false);
  /** Signal indicating if a message is currently being sent via the compact AI chat input. */
  readonly isSendingAiMessage = signal(false);

  // --- State Signals from Facades ---
  /** The profile of the currently authenticated user, or null. */
  readonly currentUser: Signal<Profile | null> = this.authFacade.currentUser;
  /** The current core statistics of the character, or null. */
  readonly currentStats: Signal<CharacterStats | null> = this.charProgFacade.stats;
  /** The number of skill points available for the character to spend. */
  readonly skillPointsAvailable: Signal<number> = computed(() => this.currentStats()?.skillPointsAvailable ?? 0);

  // --- Computed Signals for Resource Bar Display ---
  /** Current health points of the character. */
  readonly currentHealth: Signal<number> = computed(() => this.currentStats()?.currentHealth ?? 0);
  /** Maximum health points of the character. */
  readonly maxHealth: Signal<number> = computed(() => this.currentStats()?.maxHealth ?? 100);
  /** Current mana points of the character. */
  readonly currentMana: Signal<number> = computed(() => this.currentStats()?.currentMana ?? 0);
  /** Maximum mana points of the character. */
  readonly maxMana: Signal<number> = computed(() => this.currentStats()?.maxMana ?? 50);
  /** Current stamina points of the character. */
  readonly currentStamina: Signal<number> = computed(() => this.currentStats()?.currentStamina ?? 0);
  /** Maximum stamina points of the character. */
  readonly maxStamina: Signal<number> = computed(() => this.currentStats()?.maxStamina ?? 120);

  // --- Placeholders for Dynamic Content ---
  /** Placeholder for the primary active challenge. */
  readonly primaryActiveChallenge = signal<ChallengeSummary | null>(null);
  /** Placeholder for the primary active quest. */
  readonly primaryActiveQuest = signal<Quest | null>(null);

  // --- Constants for Template ---
  /** Exposes AppIcon enum for icon bindings in the template. */
  readonly AppIcon = AppIcon;
  /** Exposes route constants for `routerLink` directives. */
  readonly ROUTES = ROUTES;
  /** Exposes TitleTypeEnum for UiTitleComponent type binding. */
  readonly TitleTypeEnum = TitleTypeEnum;
  /** Signal for the ID of the feed to be displayed on the home page. */
  readonly feedId = signal('global-social-feed-001');

  // --- Computed AI Greeting (onveranderd) ---
  readonly aiGreeting = computed(() => { /* ... */ });
  readonly aiGreetingFull = computed(() => { /* ... */ });

  /**
   * @constructor
   * Initializes the component and sets up an Angular `effect` to react to
   * authentication state changes, updating avatar configuration accordingly.
   */
  constructor() {
    this.logger.info('[HomeComponent] Initialized.');
    effect(() => {
      const isAuth = this.authFacade.isAuthenticated();
      const user = this.currentUser();
      if (isAuth && user) {
        this.homeAvatarConfigSignal.set({
          modelUrl: 'assets/models/my-hero/free_mmo_rpg_female_4k_high-contrast.glb',
          environmentSceneUrl: 'assets/hdri/autumnal_forest.glb',
          scale: 1, position: { x: 0, y: -0.8, z: 0 }, defaultAnimationClipName: 'Idle'
        });
        this.homeLightingConfigSignal.set({
          ambientLightIntensity: 0.7,
          directionalLight: { intensity: 1.5, direction: { x: 2, y: 5, z: 3 }, color: '#FFFBF0' }
        });
      } else {
        this.homeAvatarConfigSignal.set(undefined);
        this.homeLightingConfigSignal.set(undefined);
        this.resetHomeState();
      }
    }, { injector: this.injector });
  }

  /**
   * @Lifecycle ngOnInit
   * Dispatches actions to load essential character progression data (stats and definitions)
   * required for displaying resource bars and other summary information on this page.
   */
  ngOnInit(): void {
    this.logger.debug('[HomeComponent] ngOnInit executed: Requesting character stats and definitions.');
    this.charProgFacade.loadCharacterStats();
    this.charProgFacade.loadStatDefinitions();
  }

  /**
   * Toggles the display mode of the 3D avatar between showing the character model
   * and showing the character's equipped items.
   */
  toggleAvatarEquipmentView(): void {
    this.avatarEquipmentViewMode.update(current => (current === 'avatar' ? 'equipment' : 'avatar'));
    this.logger.debug(`[HomeComponent] Avatar/Equipment view toggled to: ${this.avatarEquipmentViewMode()}`);
  }

  /**
   * Handles message submission from the compact AI chat input located beneath the avatar.
   * This input is only active if the full AI chat interface is not displayed within its accordion item.
   * The message is sent to the AI bot via the `ChatFacade`.
   * @param {ChatMessageSubmitData} data - The chat message data containing text, and optional GIF or files.
   */
  handleAiChatMessage(data: ChatMessageSubmitData): void {
    // Verwijder de check voor showAiChatInAccordion, de input is er altijd
    // if (this.showAiChatInAccordion()) {
    //     this.logger.warn("[HomeComponent] AI Chat message submitted from under-avatar input, but accordion chat is active. Ignoring.");
    //     return;
    // }
    if (this.isSendingAiMessage()) {
        this.logger.warn("[HomeComponent] AI Chat message submission prevented: Already sending a message.");
        return;
    }

    const { text, gifUrl, files } = data;
    if (!text.trim() && !gifUrl && (!files || files.length === 0)) {
        this.logger.warn("[HomeComponent] Attempted to send an empty message to AI via direct input.");
        return;
    }

    this.isSendingAiMessage.set(true);
    // Use FeedFacade to add a feed item instead of chat
    // Note: files would need proper conversion from File[] to Media[] - using empty array for now
    this.feedFacade.addFeedItem(
      'main-feed', // feedId
      text, // content
      [], // media files - TODO: implement proper File to Media conversion
      gifUrl // gifUrl
    );

    // Simulate message sending state reset; actual state driven by NgRx store.
    setTimeout(() => this.isSendingAiMessage.set(false), 1500);
  }

  /**
   * Placeholder method for opening an AI recommendations interface.
   * @param {ChallengeSummary | null} [preselectedChallenge] - Optional challenge to pre-select or highlight.
   */
  openAiRecommendations(preselectedChallenge?: ChallengeSummary | null): void {
    this.logger.info(`[HomeComponent] Opening AI Recommendations. Preselected: ${preselectedChallenge?.title ?? 'None'}`);
    this.logger.warn('[HomeComponent] AiRecommendationsOverlayComponent opening not yet implemented.');
    // Example: this.dynamicOverlayService.open({ component: AiRecommendationsOverlayComponent, data: { preselectedChallenge } });
  }

  /**
   * Resets local UI state specific to the HomeComponent, typically called on user logout.
   * @private
   */
  private resetHomeState(): void {
    this.logger.debug('[HomeComponent] Resetting local home state elements.');
    this.userIsInParty.set(false);
    this.avatarEquipmentViewMode.set('avatar');
    this.aiChallengeSuggestion.set(null);
  }
}
