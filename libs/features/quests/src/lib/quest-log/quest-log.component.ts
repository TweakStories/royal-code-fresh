// libs/features/quests/src/lib/quest-log/quest-log.component.ts
/**
 * @fileoverview Displays the user's Quest Log, categorized into Active, Available, and Completed sections.
 * @Component QuestLogComponent
 * @description
 * This component fetches and displays the user's quests using the QuestFacade.
 * It organizes quests into sections based on their status (Active, Available, Completed/Claimed).
 * Provides UI elements for interacting with quests, such as accepting available quests,
 * viewing details (placeholder), and potentially claiming rewards for completed quests.
 * Uses signals for reactive data display and existing UI components for consistency.
 */
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  Signal,
  OnInit,
} from '@angular/core';

import { Router } from '@angular/router'; // For potential navigation to quest details
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

// --- Domain Imports ---
// Why: Define the shape of the quest data being displayed.
import { Quest, QuestStatus, AppIcon } from '@royal-code/shared/domain';

// --- Facade Imports ---
// Why: The primary way to interact with quest state and actions.
import { QuestFacade } from '../state/quests.facade';

// --- UI Component Imports ---
// Why: Leverage existing UI components for consistent look & feel.
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
// Consider adding UiAccordion for the Completed section if it can become long
// import { UiAccordionComponent, UiAccordionItemComponent } from '@royal-code/ui/accordion';

// --- Core Imports ---
// Why: For logging and potentially showing notifications.
import { LoggerService } from '@royal-code/core/core-logging';
import { NotificationService } from '@royal-code/ui/notifications'; // Optional: for feedback

@Component({
  selector: 'royal-code-quest-log', // Project-specific selector
  standalone: true, // Marked as standalone
  imports: [
    TranslateModule,
    UiIconComponent,
    UiButtonComponent
],
  template: `
    <!-- libs/features/quests/src/lib/quest-log/quest-log.component.html -->
    <div class="quest-log-container p-4 md:p-6">
      <!-- Container with padding -->

      <!-- Main Title -->
      <h1
        class="text-2xl md:text-3xl font-bold text-foreground mb-6 border-b border-border pb-3"
      >
        {{ 'quests.log.title' | translate }}
      </h1>

      <!-- Loading State -->
      @if (isLoading() && activeQuests().length === 0 &&
      availableQuests().length === 0 && completedQuests().length === 0) {
      <div class="flex justify-center items-center py-10">
        <span class="text-secondary animate-pulse"
          >{{ 'common.messages.loading' | translate }}...</span
        >
        <!-- TODO: Consider adding a spinner component -->
      </div>
      }

      <!-- Error State -->
      @if (error(); as errorMsg) {
      <div
        class="p-4 mb-6 rounded-md bg-destructive/10 text-destructive border border-destructive/30 text-center"
      >
        <p>{{ 'common.errors.errorOccurred' | translate }}</p>
        <p class="text-sm">{{ errorMsg }}</p>
        <!-- TODO: Add a retry button that calls questFacade.loadQuests() -->
      </div>
      }

      <!-- Main Content Sections (Displayed when not initially loading or no error) -->
      @if (!isLoading() || activeQuests().length > 0 || availableQuests().length
      > 0 || completedQuests().length > 0) {
      <div class="space-y-8">
        <!-- Add vertical space between sections -->

        <!-- == Active Quests Section == -->
        <section aria-labelledby="active-quests-heading">
          <h2
            id="active-quests-heading"
            class="text-xl font-semibold text-primary mb-3"
          >
            {{ 'quests.log.active' | translate }}
          </h2>
          @if (activeQuests().length > 0) {
          <ul class="space-y-3">
            @for (quest of activeQuests(); track trackById($index, quest)) {
            <li
              class="quest-item flex items-center gap-3 p-3 border border-border rounded-xs bg-card hover:bg-accent transition-colors"
            >
              <!-- Icon -->
              <div class="flex-shrink-0">
                <royal-code-ui-icon
                  [icon]="quest.icon ?? AppIcon.HelpCircle"
                  sizeVariant="md"
                  colorClass="text-primary"
                ></royal-code-ui-icon>
              </div>
              <!-- Text Content -->
              <div class="flex-grow min-w-0">
                <h3 class="text-sm font-medium text-foreground truncate">
                  {{ quest.titleKeyOrText | translate }}
                </h3>
                <p class="text-xs text-secondary truncate">
                  {{ quest.descriptionKeyOrText | translate }}
                </p>
                <!-- Progress Display -->
                @if(getFirstObjectiveProgress(quest); as progressText) {
                <p class="text-xs text-accent-foreground font-mono mt-1">
                  {{ progressText }}
                </p>
                <!-- TODO: Add visual progress bar? -->
                }
              </div>
              <!-- Reward & Action -->
              <div
                class="flex-shrink-0 ml-auto flex flex-col items-end space-y-1"
              >
                <span
                  class="text-xs font-semibold text-success whitespace-nowrap"
                  >{{ quest.reward?.xp ?? 0 }} XP</span
                >
                <royal-code-ui-button
                  type="outline"
                  sizeVariant="xs"
                  (clicked)="viewQuestDetails(quest.id)"
                >
                  {{ 'common.buttons.view' | translate }}
                </royal-code-ui-button>
              </div>
            </li>
            }
          </ul>
          } @else {
          <p
            class="text-sm text-secondary italic p-3 border border-dashed border-border rounded-xs"
          >
            {{ 'quests.messages.noActive' | translate }}
          </p>
          }
        </section>

        <!-- == Available Quests Section == -->
        <section aria-labelledby="available-quests-heading">
          <h2
            id="available-quests-heading"
            class="text-xl font-semibold text-primary mb-3"
          >
            {{ 'quests.log.available' | translate }}
          </h2>
          @if (availableQuests().length > 0) {
          <ul class="space-y-3">
            @for (quest of availableQuests(); track trackById($index, quest)) {
            <li
              class="quest-item flex items-center gap-3 p-3 border border-border rounded-xs bg-card hover:bg-accent transition-colors"
            >
              <!-- Icon -->
              <div class="flex-shrink-0">
                <royal-code-ui-icon
                  [icon]="quest.icon ?? AppIcon.HelpCircle"
                  sizeVariant="md"
                  colorClass="text-secondary"
                ></royal-code-ui-icon>
              </div>
              <!-- Text Content -->
              <div class="flex-grow min-w-0">
                <h3 class="text-sm font-medium text-foreground truncate">
                  {{ quest.titleKeyOrText | translate }}
                </h3>
                <p class="text-xs text-secondary truncate">
                  {{ quest.descriptionKeyOrText | translate }}
                </p>
                @if(quest.requiredLevel) {
                <p class="text-xs text-warning mt-1">
                  Req. Level: {{ quest.requiredLevel }}
                </p>
                }
              </div>
              <!-- Reward & Action -->
              <div
                class="flex-shrink-0 ml-auto flex flex-col items-end space-y-1"
              >
                <span
                  class="text-xs font-semibold text-success whitespace-nowrap"
                  >{{ quest.reward?.xp ?? 0 }} XP</span
                >
                <royal-code-ui-button
                  type="primary"
                  sizeVariant="xs"
                  (clicked)="acceptQuest(quest.id)"
                >
                  {{ 'common.buttons.accept' | translate }}
                </royal-code-ui-button>
              </div>
            </li>
            }
          </ul>
          } @else {
          <p
            class="text-sm text-secondary italic p-3 border border-dashed border-border rounded-xs"
          >
            {{ 'quests.messages.noAvailable' | translate }}
          </p>
          }
        </section>

        <!-- == Completed Quests Section == -->
        <!-- Consider using UiAccordionComponent here if the list can get long -->
        <section aria-labelledby="completed-quests-heading">
          <h2
            id="completed-quests-heading"
            class="text-xl font-semibold text-primary mb-3"
          >
            {{ 'quests.log.completed' | translate }}
          </h2>
          @if (completedQuests().length > 0) {
          <ul class="space-y-3">
            @for (quest of completedQuests(); track trackById($index, quest)) {
            <!-- Apply different styling for completed quests -->
            <li
              class="quest-item flex items-center gap-3 p-3 border border-border/50 rounded-xs bg-card opacity-70"
            >
              <!-- Icon (dimmed) -->
              <div class="flex-shrink-0">
                <royal-code-ui-icon
                  [icon]="quest.icon ?? AppIcon.CheckCheck"
                  sizeVariant="md"
                  colorClass="text-secondary"
                ></royal-code-ui-icon>
              </div>
              <!-- Text Content (dimmed) -->
              <div class="flex-grow min-w-0">
                <h3
                  class="text-sm font-medium text-secondary line-through truncate"
                >
                  {{ quest.titleKeyOrText | translate }}
                </h3>
                <p class="text-xs text-muted-foreground truncate">
                  {{ quest.descriptionKeyOrText | translate }}
                </p>
              </div>
              <!-- Reward & Action (Claim/Claimed) -->
              <div
                class="flex-shrink-0 ml-auto flex flex-col items-end space-y-1"
              >
                <span
                  class="text-xs font-semibold text-success/70 whitespace-nowrap"
                  >{{ quest.reward?.xp ?? 0 }} XP</span
                >
                @if (quest.status === QuestStatus.Completed) {
                <!-- Claim Button - Only if status is Completed -->
                <royal-code-ui-button
                  type="primary"
                  sizeVariant="xs"
                  (clicked)="claimReward(quest.id)"
                >
                  {{ 'common.buttons.claim' | translate }}
                </royal-code-ui-button>
                } @else if (quest.status === QuestStatus.Claimed) {
                <!-- Claimed Indicator - Disabled button style -->
                <royal-code-ui-button
                  type="default"
                  sizeVariant="xs"
                  [disabled]="true"
                  extraClasses="!opacity-100"
                >
                  <!-- Prevent dimming -->
                  <royal-code-ui-icon
                    [icon]="AppIcon.CheckCircle"
                    sizeVariant="xs"
                    extraClass="mr-1 text-success"
                  ></royal-code-ui-icon>
                  {{ 'common.status.claimed' | translate }}
                </royal-code-ui-button>
                }
              </div>
            </li>
            }
          </ul>
          } @else {
          <p
            class="text-sm text-secondary italic p-3 border border-dashed border-border rounded-xs"
          >
            {{ 'quests.messages.noCompleted' | translate }}
          </p>
          }
        </section>
      </div>
      <!-- End main content sections -->
      }
    </div>
    <!-- End quest-log-container -->
  `,
  styles: [
    `
      /* libs/features/quests/src/lib/quest-log/quest-log.component.css */
      :host {
        display: block; /* Ensure the component takes up space */
      }

      /* Optional: Add custom styles for quest items if needed beyond Tailwind utilities */
      .quest-item {
        /* Example: Add a subtle transition on hover if not already covered by hover:bg-accent */
        /* transition: background-color 0.15s ease-in-out; */
      }

      /* Placeholder for a potential progress bar */
      .progress-bar-container {
        /* Styles for the container */
        height: 6px;
        background-color: var(--color-muted); /* Use theme variable */
        border-radius: 3px;
        overflow: hidden;
        margin-top: 4px;
      }

      .progress-bar-fill {
        /* Styles for the fill element */
        height: 100%;
        background-color: var(--color-primary); /* Use theme variable */
        transition: width 0.3s ease;
        border-radius: 3px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimize change detection
})
export class QuestLogComponent implements OnInit {
  // --- Injected Dependencies ---
  // Why: Use inject() for dependency injection according to Angular v17+ best practices.
  private questFacade = inject(QuestFacade);
  private logger = inject(LoggerService);
  private router = inject(Router); // Inject router for navigation actions
  private notificationService = inject(NotificationService); // Optional: for user feedback
  private readonly logPrefix = '[QuestLogComponent]';

  // --- State Signals from Facade ---
  // Why: Use toSignal() to convert facade observables into reactive signals for the template.
  /** Signal holding the list of quests currently marked as 'Active'. */
  readonly activeQuests: Signal<Quest[]> = this.questFacade.activeQuests;
  /** Signal holding the list of quests marked as 'Available' for the user to accept. */
  readonly availableQuests: Signal<Quest[]> = this.questFacade.availableQuests;
  /** Signal holding the list of quests marked as 'Completed' or 'Claimed'. */
  readonly completedQuests: Signal<Quest[]> = this.questFacade.completedQuests;
  /** Signal indicating if any quest data is currently being loaded. */
  readonly isLoading: Signal<boolean> = this.questFacade.isLoading;
  /** Signal holding the last error message related to quests, or null. */
  readonly error: Signal<string | null> = this.questFacade.error;

  // --- Constants for Template ---
  // Why: Make enums available in the template for comparisons and icon mapping.
  /** Exposes the AppIcon enum for icon bindings. */
  readonly AppIcon = AppIcon;
  /** Exposes the QuestStatus enum for status checks. */
  readonly QuestStatus = QuestStatus;

  /**
   * @Lifecycle ngOnInit
   * @description Dispatches the action to load quests when the component initializes.
   */
  ngOnInit(): void {
    this.logger.info(
      `${this.logPrefix} Initializing and requesting quest load.`
    );
    // Why: Ensure quest data is fetched when the log is opened. The facade/effects might have logic
    //      to prevent redundant loading if data is already fresh.
    this.questFacade.loadQuests();
  }

  // --- Action Methods ---
  // Why: Provide methods called by the template to trigger actions via the facade.

  /**
   * Dispatches an action to accept an available quest.
   * @param {string} questId - The ID of the quest to accept.
   */
  acceptQuest(questId: string): void {
    this.logger.info(
      `${this.logPrefix} Requesting to accept quest: ${questId}`
    );
    // TODO: Add check if quest is already being accepted (using a quest-specific loading state if implemented).
    this.questFacade.acceptQuest(questId);
    // Optionally show optimistic feedback, real feedback comes from effects (e.g., notification on success/failure).
  }

  /**
   * Placeholder for navigating to a detailed view of a specific quest.
   * @param {string} questId - The ID of the quest to view.
   */
  viewQuestDetails(questId: string): void {
    this.logger.info(
      `${this.logPrefix} Requesting to view details for quest: ${questId}`
    );
    // TODO: Implement navigation logic. This might involve:
    // 1. Setting the selectedQuestId in the store: this.questFacade.selectQuest(questId);
    // 2. Navigating to a dedicated quest detail route: this.router.navigate(['/quests', questId]);
    // 3. Or opening a quest detail overlay.
    this.notificationService.showInfo(
      `Navigatie naar quest ${questId} details nog niet geïmplementeerd.`
    );
  }

  /**
   * Dispatches an action to claim the reward for a completed (but not yet claimed) quest.
   * @param {string} questId - The ID of the quest whose reward is being claimed.
   */
  claimReward(questId: string): void {
    this.logger.info(
      `${this.logPrefix} Requesting to claim reward for quest: ${questId}`
    );
    // TODO: Add check if quest is already being claimed (using a quest-specific loading state if implemented).
    this.questFacade.claimQuestReward(questId);
    // Optimistic feedback could be shown here. Effects handle actual success/failure notifications.
  }

  /**
   * TrackBy function for optimizing `@for` loops over quests.
   * @param {number} index - The index of the item in the loop.
   * @param {Quest} quest - The quest object.
   * @returns {string} The unique ID of the quest.
   */
  trackById(index: number, quest: Quest): string {
    // Why: Helps Angular efficiently update the DOM when the quest list changes.
    return quest.id;
  }

  /**
   * Helper function to get the progress string for the first objective.
   * @param {Quest} quest - The quest object.
   * @returns {string | null} The progress string (e.g., "1 / 3") or null.
   */
  getFirstObjectiveProgress(quest: Quest): string | null {
    // Why: Provides a concise progress summary for the quest list view. Assumes first objective is most relevant for display.
    const firstObjective = quest.objectives?.[0];
    if (
      firstObjective &&
      firstObjective.currentProgress !== undefined &&
      firstObjective.targetProgress
    ) {
      return `${firstObjective.currentProgress} / ${firstObjective.targetProgress}`;
    }
    return null; // Return null if no progress info is available for the first objective.
  }
}
