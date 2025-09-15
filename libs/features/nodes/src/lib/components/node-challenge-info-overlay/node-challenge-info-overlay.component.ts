// libs/features/nodes/src/lib/components/node-challenge-info-overlay/node-challenge-info-overlay.component.ts
/**
 * @fileoverview Displays detailed, context-rich information about a specific Node and its
 *               potentially associated Challenge within a dynamic overlay.
 * @Component NodeChallengeInfoOverlayComponent
 * @description
 * This component acts as a smart container rendered within an overlay (e.g., bottom sheet, popover).
 * It receives a `nodeId` via dependency injection using `DYNAMIC_OVERLAY_DATA`.
 * It then orchestrates data fetching from multiple NgRx feature states via injected Facades
 * (Nodes, Challenges, User, Feed, Quests) to present a comprehensive summary according to the specified mockup design.
 * Key features include:
 * - Displaying core node and challenge details (title, description/summary, rating, status).
 * - Showing key requirements using reusable Stat Cards (mode, difficulty, duration, rewards).
 * - Providing a preview of required equipment.
 * - Listing relevant active quests for the user (mocked data for now).
 * - Displaying recent social feed posts related to the node/challenge via the FeedComponent.
 * - Offering contextual primary and secondary actions (Start/Join Party, Navigate, Save, Share).
 * - Implementing error handling and loading states for data fetching.
 * - Utilizing Angular Signals for reactive state management within the component.
 * - Adhering to project styling guidelines via Tailwind CSS utility classes.
 * - Includes ChangeDetectorRef.detectChanges() as a workaround for potential external change detection issues.
 * @version 6.2.5 - Complete component code with extensive comments and ChangeDetectorRef workaround.
 */

// --- Angular Core Imports ---
// Why: Essential Angular modules and functions for component creation, lifecycle, dependency injection, change detection.
import {
  Component, ChangeDetectionStrategy, inject, signal, computed, effect,
  OnInit, DestroyRef, Injector, HostListener,
  ChangeDetectorRef, // <<< Import ChangeDetectorRef for manual change detection trigger.
  Signal
} from '@angular/core';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common'; // Provides directives like @if, @for and standard pipes.
import { Router, RouterModule } from '@angular/router'; // Needed for programmatic navigation actions.

// --- Third-Party Imports ---
// Why: Internationalization support using ngx-translate.
import { TranslateModule } from '@ngx-translate/core';
// Why: RxJS operators are used to manage and transform asynchronous data streams from Facades/Observables.
import { catchError, of, take, tap, filter, finalize } from 'rxjs';
// Why: Angular Signals interop utilities, specifically `takeUntilDestroyed` for automatic observable unsubscription.
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// --- Domain Model Imports ---
// Why: Define the structure and types of data used within the component (Node, Challenge, Quest, etc.). Ensures type safety.
import {
  AppIcon, NodeFull, NodeType,
  ChallengeSummary, ModeOfCompletion,
  EquipmentItem, Quest} from '@royal-code/shared/domain';
import { MediaType, Image } from '@royal-code/shared/domain'; // Media model for images and media handling.

// --- Facade Imports ---
// Why: Facades provide a clean, abstracted API for interacting with specific NgRx feature states.
import { NodesFacade } from '../../state/nodes.facade'; // Interacts with Node state.
import { ChallengesFacade } from '@royal-code/features/challenges'; // Interacts with Challenge state.
import { UserFacade } from '@royal-code/store/user'; // Interacts with User state (bookmarks, status).
import { FeedFacade } from '@royal-code/features/social'; // Interacts with Feed state (recent posts).
import { QuestFacade } from '@royal-code/features/quests'; // Facade for Quest interactions.

// --- UI Component Imports ---
// Why: Utilize pre-built, reusable UI components for consistency and maintainability.
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { UiStatCardComponent } from '@royal-code/ui/card'; // Reusable card for displaying stats.
import { UiImageComponent } from '@royal-code/ui/media'; // Component for optimized image loading.
import { FeedComponent } from '@royal-code/features/social'; // Component to display the social feed.

// --- Overlay Service Imports ---
// Why: Required for this component to function as an overlay; provides data injection and close control.
import { DYNAMIC_OVERLAY_DATA, DynamicOverlayRef, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';

// --- Core Service Imports ---
// Why: Essential cross-cutting services like logging and notifications.
import { LoggerService } from '@royal-code/core/logging';
import { NotificationService } from '@royal-code/ui/notifications';

/**
 * @interface NodeInfoOverlayData
 * @description Defines the shape of the data object expected to be injected into this component
 *              when it's opened via the `DynamicOverlayService`.
 */
export interface NodeInfoOverlayData {
  nodeId: string; // The mandatory ID of the Node whose information should be displayed.
}

@Component({
  selector: 'royal-code-node-challenge-info-overlay', // Component selector adhering to project prefix convention.
  standalone: true, // Component manages its own dependencies.
  imports: [
    CommonModule, RouterModule, TranslateModule, TitleCasePipe, DecimalPipe,
    UiButtonComponent, UiIconComponent, UiRatingComponent, UiStatCardComponent, UiImageComponent,
    FeedComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimize performance by limiting change detection runs.
  // --- Component Template ---
  // Defines the HTML structure based on the mockup, utilizing Angular's template syntax (@if, @for),
  // data binding (signals, pipes), event binding (click), and reusable UI components.
  template: `
    <!-- Main Overlay Container: Flex column layout, constrained height, themed background/text, shadow -->
    <div class="node-challenge-info-overlay flex flex-col h-full max-h-[90vh] w-full bg-card text-foreground shadow-lg"
         role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId()">

      <!-- 1. Header Section (Fixed): Non-scrollable, contains only the close button -->
      <header class="flex-shrink-0 px-4 py-3 flex items-center justify-end border-b border-border relative">
        <!-- Close Button: Uses UI components for consistency, positioned top-right -->
        <royal-code-ui-button
          type="transparent" sizeVariant="icon" extraClasses="text-muted-foreground hover:text-foreground"
          (clicked)="closeOverlay()" [title]="'common.buttons.close' | translate">
          <royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="md"></royal-code-ui-icon>
        </royal-code-ui-button>
      </header>

      <!-- Loading/Error/No Data States: Conditional rendering before showing the main content -->
      @if (isLoadingNodeDetails() && !node()) {
        <!-- Initial Loading State: Displayed only when fetching the primary node data -->
        <div class="flex-1 flex items-center justify-center p-8 text-center">
          <span class="text-secondary animate-pulse">{{ 'common.messages.loading' | translate }}...</span>
        </div>
      } @else if (nodeError()) {
        <!-- Node Loading Error: Displayed if fetching the node failed -->
        <div class="flex-1 p-8 text-center text-destructive">
          <p class="font-semibold mb-2">{{ 'common.errors.errorOccurred' | translate }}</p>
          <p class="text-sm">{{ nodeError() }}</p>
          <!-- TODO: Implement a retry button that calls loadData(nodeId()) again -->
        </div>
      } @else if (!node()) {
         <!-- Node Not Found: Displayed if the node doesn't exist or the ID was invalid -->
         <div class="flex-1 p-8 text-center text-secondary">
           {{ 'nodes.errors.notFound' | translate }}
         </div>
      } @else {
        <!-- **** START: Main Content (Rendered when node data is loaded) **** -->
        <!-- 2. Scrollable Content Area: Contains all detailed sections -->
        <div class="flex-1 overflow-y-auto bg-card">

          <!-- 2a. Challenge Cover Media: Displayed only if a challenge is associated -->
           @if (challenge(); as currentChallenge) {
            <!-- Container ensures correct aspect ratio and background for loading/missing images -->
            <div class="relative w-full bg-muted aspect-video">
               <!-- Loading state specifically for the challenge media/details -->
               @if (isLoadingChallenge()) {
                  <div class="absolute inset-0 flex items-center justify-center bg-muted/80">
                     <span class="text-secondary text-xs animate-pulse">{{ 'common.messages.loading' | translate }}...</span>
                  </div>
               } @else if (coverMedia()) {
                 <!-- Image displayed using UiImageComponent -->
                 <royal-code-ui-image [image]="coverMedia()" [alt]="(currentChallenge.title || 'Challenge') + ' cover'" objectFit="cover" sizePreset="auto" class="w-full h-full" />
               } @else {
                  <!-- Fallback icon if no cover image is available -->
                  <div class="absolute inset-0 flex items-center justify-center bg-muted">
                      <royal-code-ui-icon [icon]="challengeTypeIcon()" sizeVariant="xl" colorClass="text-secondary opacity-30"></royal-code-ui-icon>
                   </div>
               }
             </div>
           }

           <!-- 2b. Core Info Section: Title, Rating (if challenge), User Status (if challenge) -->
           <div class="px-4 pt-4 pb-3 border-b border-border">
            <!-- Icon and Title: Uses challenge title primarily, falls back to node title -->
            <div class="flex items-center gap-2 mb-1">
              <royal-code-ui-icon [icon]="challengeTypeIcon()" sizeVariant="sm" colorClass="text-primary"></royal-code-ui-icon>
              <h2 [id]="titleId()" class="text-xl font-semibold text-foreground line-clamp-2">
                 {{ challenge()?.title ?? node()?.title }}
              </h2>
            </div>
             <!-- Challenge-Specific Info: Rating and Review Count -->
             @if (challenge(); as currentChallenge) {
                <div class="flex items-center gap-2 text-xs text-secondary mb-1 flex-wrap">
                   <!-- Reusable rating component -->
                   <royal-code-ui-rating [rating]="currentChallenge.rating" [readonly]="true" size="small"></royal-code-ui-rating>
                   <!-- Clickable review count -->
                   <button (click)="navigateToDetail('reviews')" class="hover:underline">
                     ({{ (reviewCount() | number) }} {{ 'common.units.reviews' | translate }})
                   </button>
                </div>
                <!-- User's participation status -->
                <p class="text-sm text-secondary">{{ 'nodes.challenge.yourStatus' | translate }}: {{ userChallengeStatus() }}</p>
             }
           </div>

           <!-- 2c. Description Section: Shows challenge summary or node description -->
            <div class="px-4 py-3">
              <!-- Use computed signal to decide which description to show -->
              @if (nodeDescriptionToShow(); as desc) {
                <!-- Display truncated description -->
                <p class="text-sm text-text-secondary line-clamp-3 mb-1"> {{ desc }} </p>
                <!-- "Read More" button links to the full challenge description if available -->
                @if(challenge()) {
                   <button (click)="navigateToDetail('description')" class="text-xs font-medium text-primary hover:underline">
                     {{ 'common.buttons.readMore' | translate }} →
                   </button>
                 }
               }
           </div>

          <!-- 2d. Key Requirements & Info Section: Uses Stat Cards -->
           <div class="px-4 py-3 border-t border-border">
             <!-- Section Title -->
             <h3 class="section-title">{{ 'nodes.sections.requirements' | translate }}</h3>
              <!-- Loading state for challenge requirements -->
              @if (isLoadingChallenge()) {
                 <div class="grid grid-cols-2 gap-2 mt-2">
                    <!-- Skeleton placeholders matching Stat Card dimensions -->
                    <div class="h-16 skeleton-box"></div> <div class="h-16 skeleton-box"></div>
                    <div class="h-16 skeleton-box"></div> <div class="h-16 skeleton-box"></div>
                 </div>
              } @else if (challenge()) {
                 <!-- Stat Cards when challenge data is loaded -->
                 <div class="grid grid-cols-2 gap-2 mt-2">
                    @if (challengeMode(); as mode) { <royal-code-ui-stat-card [icon]="getModeIcon(mode)" [label]="'nodes.challenge.mode' | translate" [value]="mode.category" [iconSize]="'md'" /> }                    @if (challenge()?.difficultyLevel; as level) { <royal-code-ui-stat-card [icon]="AppIcon.Target" [label]="'nodes.challenge.difficultyLevel' | translate" [value]="(level.level | titlecase) ?? 'N/A'" [iconSize]="'md'" /> }
                    @if (challenge()?.estimatedDuration) { <royal-code-ui-stat-card [icon]="AppIcon.Clock" [label]="'nodes.challenge.duration' | translate" [value]="formatDuration(challenge()?.estimatedDuration)" [iconSize]="'md'" /> }
                    @if (formattedReward(); as rewardText) { <royal-code-ui-stat-card [icon]="AppIcon.Gift" [label]="'nodes.challenge.reward' | translate" [value]="rewardText" [iconSize]="'md'" /> }
                 </div>
              } @else if (node()) {
                  <!-- Message if no challenge is linked to the node -->
                  <p class="text-sm text-secondary italic">{{ 'nodes.messages.noChallengeLinked' | translate }}</p>
              }
             <!-- Start Point Info: Displayed only if the startNode data is successfully loaded -->
              @if(startNode()){
                <div class="mt-3 text-sm">
                    <span class="font-medium">{{ 'nodes.challenge.startPoint' | translate }}: </span>
                    <royal-code-ui-icon [icon]="AppIcon.MapPin" sizeVariant="xs" extraClass="inline-block mx-1 text-primary"></royal-code-ui-icon>
                    <!-- Clickable address to trigger external navigation -->
                    <button class="text-primary hover:underline cursor-pointer" (click)="startExternalNavigation()">
                      {{ startLocationAddress() }}
                    </button>
                </div>
                <!-- Button to navigate to the node detail page or center map -->
                <button (click)="navigateToNodeDetail()" class="text-xs font-medium text-primary hover:underline mt-1">
                    {{ 'nodes.actions.viewOnMap' | translate }} →
                </button>
              } @else if (challenge()) {
                  <!-- Indicator while start node is loading -->
                  <p class="text-xs text-secondary italic mt-2">{{ 'nodes.messages.loadingStartPoint' | translate }}...</p>
              }
           </div>

           <!-- 2e. Equipment Preview Section: Displays first 4 equipment items -->
            @if (equipmentPreview().length > 0) {
              <div class="px-4 py-3 border-t border-border">
                <!-- Section Title with count -->
                <h3 class="section-title">{{ 'nodes.sections.equipment' | translate }} ({{ equipmentPreview().length }})</h3>
                <!-- Grid layout for equipment items -->
                <div class="grid grid-cols-4 gap-2 mt-2">
                   <!-- Loop through preview items -->
                   @for(item of equipmentPreview(); track trackById($index, item)) { <!-- Use trackById -->
                     <!-- Individual equipment item display -->
                     <div class="flex flex-col items-center text-center p-1 border border-border rounded bg-muted text-xs">
                         <!-- Use helper function to get the correct icon -->
                         <royal-code-ui-icon [icon]="getEquipmentIcon(item)" sizeVariant="sm" colorClass="text-secondary mb-0.5"></royal-code-ui-icon>
                         <span class="line-clamp-1 font-medium">{{ item.name }}</span>
                     </div>
                   }
                </div>
                <!-- Button to navigate to the full equipment/rules section -->
                <button (click)="navigateToDetail('equipment')" class="text-xs font-medium text-primary hover:underline mt-2">
                  {{ 'nodes.actions.viewAllEquipment' | translate }} →
                </button>
              </div>
            }

            <!-- 2f. Relevant Quests Section -->
            <div class="px-4 py-3 border-t border-border">
                <h3 class="section-title">{{ 'nodes.sections.quests' | translate }}</h3>
                 <!-- Quest Loading State -->
                 @if (isLoadingQuests()) {
                   <p class="text-xs text-secondary italic">{{ 'common.messages.loading' | translate }}...</p>
                 } @else if (questError()) {
                   <!-- Quest Error State -->
                    <p class="text-xs text-destructive">{{ questError() }}</p>
                 } @else if (relevantQuests().length > 0) {
                   <!-- Quest List -->
                  <div class="space-y-1 mt-2">
                      @for(quest of relevantQuests(); track trackById($index, quest)) { <!-- Use trackById -->
                         <div class="flex items-center text-xs border border-border rounded p-1.5 bg-muted gap-1.5">
                            <!-- Placeholder Checkbox -->
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary shrink-0" [id]="'quest-accept-' + quest.id" aria-labelledby="'quest-title-' + quest.id" disabled>
                            <!-- Quest Icon -->
                            <royal-code-ui-icon [icon]="quest.icon ?? AppIcon.HelpCircle" sizeVariant="sm" colorClass="text-primary shrink-0"></royal-code-ui-icon>
                            <!-- Quest Title (as label for checkbox) & Progress -->
                            <div class="flex-grow flex flex-col min-w-0">
                               <label [for]="'quest-accept-' + quest.id" [id]="'quest-title-' + quest.id" class="font-medium truncate cursor-pointer hover:text-primary">{{ quest.titleKeyOrText | translate }}</label>
                               <!-- Display progress of first objective -->
                               @if(quest.objectives && quest.objectives[0]; as firstObjective) {
                                 @if(firstObjective.currentProgress !== undefined && firstObjective.targetProgress !== undefined) {
                                    <span class="text-secondary text-[10px]">
                                      {{ firstObjective.currentProgress }} / {{ firstObjective.targetProgress }}
                                    </span>
                                 }
                               }
                            </div>
                            <!-- Quest Reward -->
                            <span class="text-secondary whitespace-nowrap shrink-0 ml-auto pl-1">{{ quest.reward?.xp ?? 0 }} XP</span>
                         </div>
                      }
                   </div>
                   <!-- Link to Quest Log -->
                   <button (click)="navigateToQuestLog()" class="text-xs font-medium text-primary hover:underline mt-2">
                     {{ 'nodes.actions.viewAllQuests' | translate }} →
                   </button>
                 } @else {
                    <!-- Message when no relevant quests are found -->
                    <p class="text-xs text-secondary italic">{{ 'nodes.messages.noRelevantQuests' | translate }}</p>
                 }
              </div>

           <!-- 2g. Recent Posts Section: Uses FeedComponent -->
             @if (showFeedSection()) {
               <div class="px-4 py-3 border-t border-border">
                 <h3 class="section-title">{{ 'nodes.sections.recentPosts' | translate }}</h3>
                 <!-- Wrapper for centering button -->
                 <div class="flex flex-col items-center">
                    <!-- Conditional rendering for feed loading/error (optional) -->
                    @if (isLoadingPosts()) {
                       <p class="text-xs text-secondary italic my-4">{{ 'common.messages.loading' | translate }}...</p>
                    } @else if (postsError()) {
                       <p class="text-xs text-destructive my-4">{{ postsError() }}</p>
                    } @else {
                        <!-- Embed FeedComponent, passing the required feedId -->
                        <!-- Assume FeedComponent handles its own data and display limit -->
                        <royal-code-feed
                            class="w-full mb-3"
                            [feedId]="effectiveFeedId()!"
                            [maximumNumberOfFeedItems]="4" />
                        <!-- Button to view the full discussion -->
                        <royal-code-ui-button
                          type="primary"
                          sizeVariant="sm"
                          (click)="navigateToDetail('feed')">
                           {{ 'nodes.actions.viewDiscussion' | translate }}
                        </royal-code-ui-button>
                   }
                 </div> <!-- End centering wrapper -->
               </div> <!-- End section div -->
             }

        </div> <!-- End Scrollable Content -->

        <!-- 3. Footer Action Buttons (Fixed): Sticky footer -->
        <footer class="flex-shrink-0 border-t border-border p-4 space-y-3 bg-background">
           <!-- Primary Action Button -->
           <royal-code-ui-button
             type="primary"
             
             (clicked)="handlePrimaryAction()"
             [disabled]="isLoadingNodeDetails() || !node() || (primaryActionRequiresChallenge() && (!challenge() || isLoadingChallenge()))">
             <royal-code-ui-icon [icon]="primaryAction().icon" sizeVariant="sm" extraClass="mr-1.5"></royal-code-ui-icon>
             {{ primaryAction().text | translate }}
           </royal-code-ui-button>
           <!-- Secondary Actions Row -->
           <div class="flex justify-between items-center gap-2">
             <!-- Navigate Button -->
             <royal-code-ui-button type="outline" extraClasses="flex-1 justify-center" (clicked)="startExternalNavigation()" [disabled]="isLoadingNodeDetails() || !startNode()">
                <royal-code-ui-icon [icon]="AppIcon.Navigation" sizeVariant="sm" extraClass="mr-1"></royal-code-ui-icon>
                {{ 'nodes.actions.navigate' | translate }}
             </royal-code-ui-button>
             <!-- Save/Bookmark Button -->
             <royal-code-ui-button type="outline" [ngClass]="{'!border-primary !text-primary bg-primary/10': isChallengeSaved()}" (clicked)="toggleBookmark()" [disabled]="isLoadingNodeDetails() || !node()">
                <royal-code-ui-icon [icon]="isChallengeSaved() ? AppIcon.BookmarkCheck : AppIcon.Bookmark" sizeVariant="sm"></royal-code-ui-icon>
             </royal-code-ui-button>
             <!-- Share Button -->
             <royal-code-ui-button type="outline" (clicked)="shareChallenge()" [disabled]="isLoadingNodeDetails() || !node()">
               <royal-code-ui-icon [icon]="AppIcon.Share" sizeVariant="sm"></royal-code-ui-icon>
             </royal-code-ui-button>
           </div>
        </footer>
      } <!-- End Conditional Render for Loaded Node -->
    </div> <!-- End Main Overlay Container -->
  `,
  styles: [`
     .section-title { @apply text-xs font-semibold uppercase tracking-wide text-secondary mb-2; }
     /* Basic skeleton style for loading placeholders */
     .skeleton-box { @apply bg-muted rounded animate-pulse; }
  `]
})
export class NodeChallengeInfoOverlayComponent implements OnInit {

  // --- Dependencies & Data Injection ---
  /** @property {NodeInfoOverlayData | null} data - Injected data containing the required nodeId. Optional injection. */
  readonly data: NodeInfoOverlayData | null = inject(DYNAMIC_OVERLAY_DATA, { optional: true });
  /** @property {DynamicOverlayRef} overlayRef - Reference to control the overlay instance (e.g., for closing). Required. */
  private overlayRef = inject<DynamicOverlayRef<any, NodeInfoOverlayData>>(DYNAMIC_OVERLAY_REF);
  /** @property {Router} router - Angular Router service for programmatic navigation. */
  private router = inject(Router);
  /** @property {LoggerService} logger - Service for application logging. Optional injection for flexibility. */
  private logger = inject(LoggerService, { optional: true }); // Made optional for safety
  /** @property {NodesFacade} nodesFacade - Facade for interacting with Node state. */
  private nodesFacade = inject(NodesFacade);
  /** @property {ChallengesFacade} challengesFacade - Facade for interacting with Challenge state. */
  private challengesFacade = inject(ChallengesFacade);
  /** @property {UserFacade} userFacade - Facade for interacting with User state (bookmarks, status). */
  private userFacade = inject(UserFacade);
  /** @property {FeedFacade} feedFacade - Facade for interacting with Feed state (recent posts). */
  private feedFacade = inject(FeedFacade);
  /** @property {QuestFacade} questsFacade - Facade for interacting with Quest state. */
  private questsFacade = inject(QuestFacade); // Inject QuestFacade
  /** @property {NotificationService} notificationService - Service for displaying user feedback (snackbars, dialogs). */
  private notificationService = inject(NotificationService);
  /** @property {DestroyRef} destroyRef - Angular's mechanism for automatic observable unsubscription tied to the component's lifecycle. */
  private destroyRef = inject(DestroyRef);
  /** @property {Injector} injector - The component's injector context, necessary for using `effect` outside the constructor. */
  private injector = inject(Injector);
  /** @property {ChangeDetectorRef} cdr - Reference to manually trigger change detection if needed (workaround). */
  private cdr = inject(ChangeDetectorRef);

  // --- Input & Core State Signals ---
  /** @signal {string | null} nodeId - Holds the ID of the node being displayed, derived from injected data. Initialized to null. */
  readonly nodeId = signal<string | null>(null);
  /** @signal {NodeFull | undefined} node - Holds the detailed data for the primary node. `undefined` initially or if not found. */
  readonly node = signal<NodeFull | undefined>(undefined);
  /** @signal {ChallengeSummary | null | undefined} challenge - Holds the summary of the associated challenge. `null` if no challenge linked, `undefined` initially. */
  readonly challenge = signal<ChallengeSummary | null | undefined>(undefined);
  /** @signal {NodeFull | null | undefined} startNode - Holds the details for the challenge's starting node. `null` if no start node, `undefined` means loading. */
  readonly startNode = signal<NodeFull | null | undefined>(undefined);

  // --- Related State Signals ---
  /** @signal {Quest[]} relevantQuests - Holds summaries of quests relevant to this context, loaded via facade. */
  readonly relevantQuests = signal<Quest[]>([]);
  /** @signal {string} userChallengeStatus - Placeholder for the user's status in the current challenge. TODO: Integrate with User/Challenge state. */
  readonly userChallengeStatus = signal<string>('Laden...'); // Default placeholder
  /** @signal {boolean} userIsInParty - Placeholder indicating party membership. TODO: Integrate with User/Party state. */
  readonly userIsInParty = signal<boolean>(false); // Default placeholder
  /** @signal {boolean} isChallengeSaved - Indicates if the user has saved/bookmarked this node or challenge, loaded via facade. */
  readonly isChallengeSaved = signal<boolean>(false); // Default placeholder

  // --- Loading & Error State Signals ---
  /** @signal {boolean} isLoadingNodeDetails - True while fetching the main node details. */
  readonly isLoadingNodeDetails = signal<boolean>(true);
  /** @signal {boolean} isLoadingChallenge - True while fetching the associated challenge summary. */
  readonly isLoadingChallenge = signal<boolean>(false);
  /** @signal {boolean} isLoadingQuests - True while fetching relevant quests. */
  readonly isLoadingQuests = signal<boolean>(false);
  /** @signal {boolean} isLoadingPosts - Loading state for the recent posts section (FeedComponent might handle its own). */
  readonly isLoadingPosts = signal<boolean>(false);
  /** @signal {string | null} nodeError - Holds error message if loading node details fails. */
  readonly nodeError = signal<string | null>(null);
  /** @signal {string | null} challengeError - Holds error message if loading the challenge summary fails. */
  readonly challengeError = signal<string | null>(null);
  /** @signal {string | null} questError - Holds error message if loading quests fails. */
  readonly questError = signal<string | null>(null);
  /** @signal {string | null} postsError - Error message if loading recent posts fails. */
  readonly postsError = signal<string | null>(null);

  // --- Computed Signals (Derived State for Template/Logic) ---
  /** @computed {string} logPrefix - Dynamic logging prefix including the Node ID. */
  private readonly logPrefix = computed(() => `[NodeChallengeInfoOverlay ${this.nodeId() ?? 'NO_ID'}]`);
  /** @computed {string} titleId - Unique ID for the main title element (ARIA). */
  readonly titleId = computed(() => `node-overlay-title-${this.nodeId() ?? 'unknown'}`);
  /** @computed {Image | undefined} coverMedia - Selects the primary image for the cover area. */
  readonly coverMedia: Signal<Image | undefined> = computed(() => {
    const chal = this.challenge();
    // Geeft voorrang aan mainImageUrl, valt terug op coverImageUrl, en retourneert undefined als beide niet bestaan.
    return chal?.mainImageUrl ?? chal?.coverImageUrl;
  });
  /** @computed {boolean} isGroupChallenge - Checks if the challenge is group-based. */
  readonly isGroupChallenge = computed(() => this.challenge()?.isGroupChallenge ?? false);
  /** @computed {string | null} effectiveFeedId - Determines the feed ID for the FeedComponent. */
  readonly effectiveFeedId = computed(() => this.node()?.socialFeedId ?? this.challenge()?.feedId ?? null);
  /** @computed {string} startLocationAddress - Gets the start node's address. */
  readonly startLocationAddress = computed(() => this.startNode()?.location?.address ?? 'Adres onbekend');
  /** @computed {ModeOfCompletion | undefined} challengeMode - Gets the primary mode of completion. */
  readonly challengeMode = computed(() => this.challenge()?.modeOfCompletions?.[0]);
  /** @computed {EquipmentItem[]} equipmentPreview - Creates a limited list of equipment items. */
  readonly equipmentPreview = computed((): EquipmentItem[] => {
    return this.challenge()?.equipment?.flatMap(group => group.list).slice(0, 4) ?? [];
  });
  /** @computed {number} reviewCount - Calculates the number of reviews. */
  readonly reviewCount = computed(() => this.challenge()?.reviews?.length ?? 0);
  /** @computed {string | null} formattedReward - Creates a display string for rewards. */
  readonly formattedReward = computed((): string | null => {
    const chal = this.challenge(); if (!chal) return null;
    const parts: string[] = [];
    if (chal.rewardXP) parts.push(`${chal.rewardXP} XP`);
    if (chal.hasItemReward) parts.push(`+ [${AppIcon.Package}] Item`); // Indicate item reward with an icon.
    return parts.length > 0 ? parts.join(' ') : null;
  });
  /** @computed {{text: string, icon: AppIcon}} primaryAction - Determines the primary button's text and icon. */
  readonly primaryAction = computed(() => {
    // TODO: Enhance logic with userChallengeStatus()
    if (this.isGroupChallenge() && !this.userIsInParty()) {
      return { text: 'nodes.challenge.formParty', icon: AppIcon.Users };
    }
    return { text: 'nodes.challenge.start', icon: AppIcon.Play };
  });
  /** @computed {boolean} primaryActionRequiresChallenge - Checks if primary action depends on challenge data. */
  readonly primaryActionRequiresChallenge = computed(() => {
    return this.isGroupChallenge() || this.primaryAction().text === 'nodes.challenge.start';
  });
  /** @computed {AppIcon} challengeTypeIcon - Determines the icon for the node/challenge type. */
  readonly challengeTypeIcon = computed((): AppIcon => {
     // TODO: Implement proper mapping based on challenge.type or node.type.
     if (this.challenge()) return AppIcon.Trophy;
     switch (this.node()?.type) {
        case NodeType.QUEST: return AppIcon.HelpCircle;
        case NodeType.POI: return AppIcon.Eye;
        default: return AppIcon.MapPin;
     }
  });
  /** @computed {boolean} showFeedSection - Controls visibility of the feed section. */
  readonly showFeedSection = computed((): boolean => !!this.effectiveFeedId());
  /** @computed {string | undefined} nodeDescriptionToShow - Selects the most relevant description. */
  readonly nodeDescriptionToShow = computed((): string | undefined => {
      const n = this.node(); if (!n) return undefined;
      return (!this.challenge() || n.type === NodeType.POI) ? n.description : this.challenge()?.summary;
  });

  // --- Constants for Template ---
  /** @constant AppIcon - Exposes the AppIcon enum for template bindings. */
  readonly AppIcon = AppIcon;
  /** @constant MediaType - Exposes the MediaType enum. */
  readonly MediaType = MediaType;

  /**
   * @constructor
   * Sets up effects to react to input changes and trigger data loading.
   */
  constructor() {
    this.logger?.debug(`${this.logPrefix()} Constructor: Instance created.`);
    // Effect 1: Trigger initial data load when nodeId is available.
    effect(() => {
        const injectedData = this.data;
        const currentId = injectedData?.nodeId;
        if (currentId && this.nodeId() !== currentId) {
            this.logger?.info(`${this.logPrefix()} Effect: Node ID detected: ${currentId}. Triggering loadData.`);
            this.nodeId.set(currentId);
            this.loadData(currentId);
        } else if (injectedData && !currentId) { this.handleInitializationError('Node ID missing in provided data.'); }
        else if (!injectedData) { this.handleInitializationError('Overlay data not provided.'); }
    }, { injector: this.injector, allowSignalWrites: true });

    // Effect 2: Reload start node when challenge changes.
    effect(() => {
        const currentChallenge = this.challenge();
        this.loadStartNode(currentChallenge?.starterNodeId);
    }, { injector: this.injector, allowSignalWrites: true });
  }

  /**
   * @Lifecycle ngOnInit
   * Logs component initialization. Data loading is handled by the constructor's effect.
   */
  ngOnInit(): void {
    this.logger?.debug(`${this.logPrefix()} ngOnInit: Component initialized.`);
  }

  /**
   * @Lifecycle ngOnDestroy
   * Logs component destruction.
   */
  ngOnDestroy(): void {
    this.logger?.debug(`${this.logPrefix()} Destroyed.`);
  }

  /**
   * @method loadData
   * @description Orchestrates fetching Node details and dependent data (Challenge, User context, Quests).
   * @param {string} nodeId - The ID of the node to load.
   * @private
   */
  private loadData(nodeId: string): void {
    // --- Reset State ---
    this.isLoadingNodeDetails.set(true); this.nodeError.set(null);
    this.challenge.set(undefined); this.startNode.set(undefined);
    this.isLoadingChallenge.set(false); this.challengeError.set(null);
    this.relevantQuests.set([]); this.isLoadingQuests.set(false); this.questError.set(null);
    this.userChallengeStatus.set('Laden...'); this.isChallengeSaved.set(false); this.userIsInParty.set(false);
    this.isLoadingPosts.set(false); this.postsError.set(null);

    this.logger?.info(`${this.logPrefix()} loadData: Starting data fetch sequence for Node ID ${nodeId}`);

    // --- Fetch Node Details ---
    this.nodesFacade.selectOrLoadNodeDetails(nodeId).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(loadedNode => {
          this.logger?.debug(`${this.logPrefix()} loadData: Node stream emitted. Node ID: ${loadedNode?.id}`);
          if (loadedNode && loadedNode.id === nodeId) {
            this.node.set(loadedNode);
            this.isLoadingNodeDetails.set(false); // Set state signals
            this.logger?.info(`${this.logPrefix()} loadData: Node ${nodeId} loaded/found.`);

            // *** FORCE CHANGE DETECTION WORKAROUND ***
            this.cdr.detectChanges(); // Trigger detection *immediately* after setting signals
            this.logger?.debug(`${this.logPrefix()} Manually triggered change detection after node set.`);
            // *** END WORKAROUND ***

            // Trigger dependent loads AFTER detection trigger
            this.loadChallengeSummary(loadedNode.challengeId);
            this.loadRelatedUserData(nodeId, loadedNode.challengeId);
            this.loadRelevantQuestsIfApplicable();
          } else if (!this.isLoadingNodeDetails()) {
            // Handle case where node not found after load attempt
             if (!this.nodeError()) this.nodeError.set('Node details kon niet geladen worden.');
             this.isLoadingNodeDetails.set(false);
             this.cdr.detectChanges(); // Trigger detection for error state
             this.logger?.warn(`${this.logPrefix()} loadData: Node details mismatch or not found for ${nodeId}.`);
          }
      }),
      catchError(err => {
          this.logger?.error(`${this.logPrefix()} loadData: Error in node details stream for ${nodeId}:`, err);
          this.nodeError.set('Fout bij laden node details.');
          this.isLoadingNodeDetails.set(false);
          this.cdr.detectChanges(); // Trigger detection for error state
          return of(undefined);
      })
    ).subscribe();
  }

  /**
   * @method loadChallengeSummary
   * @description Fetches challenge summary data via the facade.
   * @param {string | null | undefined} challengeId - The challenge ID.
   * @private
   */
  private loadChallengeSummary(challengeId: string | null | undefined): void {
    if (!challengeId) { this.challenge.set(null); return; }
    this.isLoadingChallenge.set(true); this.challengeError.set(null);
    this.logger?.debug(`${this.logPrefix()} Requesting challenge summary for ID: ${challengeId}`);
    this.challengesFacade.selectOrLoadChallengeSummaryById(challengeId).pipe(
      filter(summary => summary !== undefined), take(1), takeUntilDestroyed(this.destroyRef),
      tap(summary => this.logger?.debug(`${this.logPrefix()} Received challenge summary update: ${summary?.id ?? 'null'}`)),
      catchError(err => { this.logger?.error(`${this.logPrefix()} Error loading challenge summary ${challengeId}:`, err); this.challengeError.set('Fout bij laden challenge info.'); return of(null); }),
      finalize(() => this.isLoadingChallenge.set(false))
    ).subscribe(summary => { this.challenge.set(summary); });
  }

  /**
   * @method loadStartNode
   * @description Fetches start node details via the facade.
   * @param {string | null | undefined} startNodeId - The start node ID.
   * @private
   */
   private loadStartNode(startNodeId: string | null | undefined): void {
    if (!startNodeId) { this.startNode.set(null); return; }
    if (this.startNode()?.id === startNodeId) { return; }
    this.logger?.debug(`${this.logPrefix()} Requesting start node details for ID: ${startNodeId}`);
    this.startNode.set(undefined);
    this.nodesFacade.selectOrLoadNodeDetails(startNodeId).pipe(
        filter(node => node !== undefined), take(1), takeUntilDestroyed(this.destroyRef),
        tap(node => this.logger?.debug(`${this.logPrefix()} Received start node update: ${node?.id ?? 'null'}`)),
        catchError(err => { this.logger?.error(`${this.logPrefix()} Error loading start node ${startNodeId}:`, err); return of(null); })
    ).subscribe(node => { this.startNode.set(node ?? null); });
   }

  /**
   * @method loadRelatedUserData
   * @description Fetches user-specific context (status, bookmark). Placeholder.
   * @param {string} nodeId - The node ID.
   * @param {string | null | undefined} challengeId - The challenge ID.
   * @private
   */
  private loadRelatedUserData(nodeId: string, challengeId: string | null | undefined): void {
    this.logger?.debug(`${this.logPrefix()} Placeholder: Loading user-specific data`);
    // TODO: Implement actual fetching logic using UserFacade / PartyFacade etc.
    this.userChallengeStatus.set('Not Started');
    this.userIsInParty.set(false);
    // Load Bookmark Status
    const entityId = challengeId ?? nodeId;
    this.logger?.debug(`${this.logPrefix()} Loading bookmark status for entity ${entityId}`);
    this.userFacade.selectIsBookmarked(entityId).pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(isMarked => this.isChallengeSaved.set(isMarked ?? false));
  }

  /**
   * @method loadRelevantQuestsIfApplicable
   * @description Fetches relevant quests using the QuestFacade.
   * @private
   */
  private loadRelevantQuestsIfApplicable(): void {
      const currentChallengeId = this.challenge()?.id;
      const currentNodeId = this.nodeId();

      if (!currentNodeId && !currentChallengeId) { /* ... handle no context ... */ return; }

      this.logger?.debug(`${this.logPrefix()} Requesting relevant quests via Facade. Context: Node=${currentNodeId}, Chal=${currentChallengeId}`);
      this.isLoadingQuests.set(true); this.questError.set(null);

      this.questsFacade.selectOrLoadRelevantQuests(currentNodeId, currentChallengeId)
          .pipe(
              takeUntilDestroyed(this.destroyRef),
              tap(quests => this.logger?.debug(`${this.logPrefix()} Received relevant quests update from Facade. Count: ${quests?.length ?? 0}`)),
              catchError(err => { /* ... error handling ... */ return of([]); }),
              finalize(() => this.isLoadingQuests.set(false))
          )
          .subscribe(quests => {
            this.relevantQuests.set(quests ?? []);
            this.cdr.detectChanges();
          });
  }

  /**
   * @method handleInitializationError
   * @description Central handler for initialization errors.
   * @param {string} message - The error message.
   * @private
   */
  private handleInitializationError(message: string): void {
    this.logger?.error(`${this.logPrefix()} Initialization Error: ${message}`);
    this.nodeError.set(message);
    this.isLoadingNodeDetails.set(false); /* ... reset other flags ... */
  }

  // --- Action Handlers ---
  // Why: Methods bound to template events (clicks) to trigger component actions or navigation.

  /** Closes the overlay panel using the injected overlay reference. */
  closeOverlay(): void {
    this.logger?.debug(
      `${this.logPrefix()} Closing overlay via closeOverlay().`
    );
    this.overlayRef.close();
  }

  /** Handles the click on the primary action button (Start/Join Party). */
  handlePrimaryAction(): void {
    const action = this.primaryAction(); // Get context-specific action.
    this.logger?.info(
      `${this.logPrefix()} Primary action clicked: ${action.text}`
    );
    // TODO: Implement actual logic based on action.text.
    if (action.text === 'nodes.challenge.start') {
      this.startChallenge(); // Call placeholder start method.
    } else {
      this.joinOrFormParty(); // Call placeholder party method.
    }
    this.notificationService.showInfo(
      'Primaire actie nog niet geïmplementeerd.'
    ); // User feedback.
  }

  /** Placeholder for initiating challenge participation. */
  startChallenge(): void {
    const challengeId = this.challenge()?.id;
    this.logger?.info(
      `${this.logPrefix()} TODO: Implement start challenge: ${challengeId}`
    );
    // TODO: Call facade (e.g., challengesFacade.startParticipation(challengeId)).
    // TODO: Navigate to tracking screen on success.
  }

  /** Placeholder for initiating the party joining/formation process. */
  joinOrFormParty(): void {
    this.logger?.info(`${this.logPrefix()} TODO: Implement join/form party.`);
    // TODO: Open party finder/creation modal or navigate to party screen.
  }

  /** Opens the device's native map application to navigate to the start node. */
  startExternalNavigation(): void {
    const coords = this.startNode()?.location?.coordinates;
    const locationName =
      this.challenge()?.title ?? this.startNode()?.title ?? 'Startpunt';
    this.logger?.info(
      `${this.logPrefix()} Attempting external navigation to:`,
      coords
    );

    if (coords) {
      const geoUri = `geo:${coords.lat},${coords.lng}?q=${coords.lat},${
        coords.lng
      }(${encodeURIComponent(locationName)})`;
      this.logger?.debug(`${this.logPrefix()} Opening geo URI: ${geoUri}`);
      try {
        window.open(geoUri, '_system'); // Attempt to open native map app.
      } catch (e) {
        this.notificationService.showError('Fout bij openen navigatie-app.');
        this.logger?.error(`${this.logPrefix()} Failed to open geo URI:`, e);
      }
    } else {
      this.notificationService.showError(
        'nodes.errors.startLocationUnavailable'
      );
      this.logger?.warn(
        `${this.logPrefix()} Cannot start external navigation: Start node coordinates missing.`
      );
    }
    // Optional: Close overlay automatically after initiating navigation.
    // this.closeOverlay();
  }

  /** Placeholder for toggling the bookmark/saved state of the node/challenge. */
  toggleBookmark(): void {
    const entityId = this.challenge()?.id ?? this.node()?.id;
    if (!entityId) {
      this.logger?.warn(
        `${this.logPrefix()} Cannot toggle bookmark: No entity ID found.`
      );
      return;
    }
    const newState = !this.isChallengeSaved();
    // Optimistic UI Update: Update the signal immediately for responsiveness.
    this.isChallengeSaved.set(newState);
    this.logger?.info(
      `${this.logPrefix()} TODO: Dispatch toggle bookmark action for ${entityId} to ${newState}`
    );
    this.notificationService.showInfo(
      newState ? 'Opgeslagen!' : 'Opslaan ongedaan gemaakt.'
    );
    // TODO: Dispatch UserFacade.setBookmarkStatus(entityId, newState) action.
    // TODO: Implement error handling in an effect to revert the optimistic update if the backend call fails.
  }

  /** Placeholder for initiating the share functionality. */
  shareChallenge(): void {
    this.logger?.info(
      `${this.logPrefix()} TODO: Implement share challenge/node.`
    );
    this.notificationService.showInfo('Delen nog niet geïmplementeerd.');
    // TODO: Use Web Share API (navigator.share) or implement a fallback (e.g., copy link).
  }

  /** Navigates to the full detail page (Challenge or Node), optionally focusing a specific section via URL fragment. */
  navigateToDetail(section?: string): void {
    const chalId = this.challenge()?.id;
    const nodeId = this.node()?.id;
    // Determine the primary route based on available IDs.
    const baseRoute = chalId
      ? `/challenges/${chalId}`
      : nodeId
      ? `/nodes/${nodeId}`
      : null;

    if (baseRoute) {
      // Use the fragment option for scrolling to a section.
      const extras = section ? { fragment: section } : {};
      this.logger?.info(
        `${this.logPrefix()} Navigating to detail view: ${baseRoute}${
          section ? '#' + section : ''
        }`
      );
      this.router
        .navigate([baseRoute], extras)
        .then(() => this.closeOverlay()) // Close overlay on successful navigation.
        .catch((err) =>
          this.logger?.error(
            `${this.logPrefix()} Navigation to detail failed:`,
            err
          )
        );
    } else {
      this.logger?.warn(
        `${this.logPrefix()} Cannot navigate to detail: No valid base route found.`
      );
    }
  }

  /** Navigates specifically to the detail page of the start node. */
  navigateToNodeDetail(): void {
    const startNodeId = this.startNode()?.id;
    if (startNodeId) {
      this.logger?.info(
        `${this.logPrefix()} Navigating to Start Node Detail page: ${startNodeId}`
      );
      this.router
        .navigate(['/nodes', startNodeId])
        .then(() => this.closeOverlay())
        .catch((err) =>
          this.logger?.error(
            `${this.logPrefix()} Navigation to start node detail failed:`,
            err
          )
        );
    } else {
      this.logger?.warn(
        `${this.logPrefix()} Cannot navigate to start node detail: Start node ID missing.`
      );
    }
  }

  /** Placeholder for navigating to the main Quest Log screen. */
  navigateToQuestLog(): void {
    this.logger?.info(
      `${this.logPrefix()} TODO: Implement navigation to Quest Log.`
    );
    this.notificationService.showInfo(
      'Navigatie naar Quest Log nog niet geïmplementeerd.'
    );
    this.closeOverlay();
    // TODO: this.router.navigate(['/quests']); // Use the defined route for the quest log.
  }

  // --- Template Helper Functions ---
  // Why: Provide simple utility functions for use within the template for display logic or mappings.

  /** Maps a ModeOfCompletion object to a corresponding AppIcon. */
  getModeIcon(mode: ModeOfCompletion | undefined): AppIcon {
    const iconKey = mode?.iconName as keyof typeof AppIcon | undefined;
    // Return the mapped icon or a default Activity icon.
    return iconKey && AppIcon[iconKey] ? AppIcon[iconKey] : AppIcon.Activity;
  }

  /** Maps an EquipmentItem object to a corresponding AppIcon. */
  getEquipmentIcon(item: EquipmentItem | undefined): AppIcon {
    const iconKey = item?.iconName as keyof typeof AppIcon | undefined;
    // Return the mapped icon or a default Package icon.
    return iconKey && AppIcon[iconKey] ? AppIcon[iconKey] : AppIcon.Package;
  }

  /** Formats a duration (in seconds) into a readable string (e.g., "~45 min"). */
  formatDuration(seconds: number | undefined): string {
    if (seconds === undefined || seconds === null) return '~? min'; // Handle missing data.
    const minutes = Math.round(seconds / 60); // Calculate minutes.
    return `~${minutes} min`; // Return formatted string.
  }

  /** Listens for the Escape key press on the document to close the overlay. */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    event.stopPropagation(); // Prevent the event from propagating further.
    this.logger?.debug(
      `${this.logPrefix()} Escape key pressed, closing overlay.`
    );
    this.closeOverlay(); // Trigger the close action.
  }

  /** TrackBy function for Angular's @for directive to optimize list rendering. */
  trackById(index: number, item: { id: string }): string {
    // Why: Helps Angular identify list items uniquely, improving performance during updates.
    return item.id;
  }
}
