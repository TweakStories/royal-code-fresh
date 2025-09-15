// libs/features/character-progression/src/lib/pages/skills-page/skills-page.component.ts
/**
 * @fileoverview Defines the SkillsPageComponent, the main page for viewing and managing character skills.
 * It displays skills categorized by core stats (Strength, Dexterity, etc.), allows users to
 * view skill details, and upgrade skills using available skill points.
 *
 * @Component SkillsPageComponent
 * @description The central hub for all character skills. It uses tabs to switch between
 *              skill categories associated with core stats. Within each category, it lists
 *              skills (potentially in tiers) using `SkillCardComponent`. Users can see their
 *              available skill points and interact with skills to learn or upgrade them.
 * @version 1.0.0
 * @author ChallengerAppDevAI
 */
import { Component, ChangeDetectionStrategy, inject, Signal, computed, OnInit, Injector, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// --- UI Component Imports ---
import { UiIconComponent } from '@royal-code/ui/icon';
import { SkillCardComponent } from '../../components/skills/skill-card/skill-card.component';

// --- State & Facade Imports ---
import { CharacterProgressionFacade } from '../../state/character-progression.facade';

// --- Domain Model Imports ---
import { AppIcon, StatType, SkillDisplay, SkillId, CharacterStats } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

/**
 * @interface SkillCategoryTab
 * @description Defines the structure for a tab representing a skill category.
 */
interface SkillCategoryTab {
  id: StatType;
  nameKey: string;
  icon: AppIcon;
}

@Component({
  selector: 'royal-code-skills-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    UiIconComponent,
    SkillCardComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skills-page-container p-4 md:p-6 space-y-6">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row justify-between items-center mb-6 pb-3 border-b border-border">
        <h1 class="text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-0">
          {{ 'charProgression.skills.pageTitle' | translate }}
        </h1>
        <div class="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-md">
          {{ 'charProgression.skills.availableSkillPoints' | translate }}:
          <span class="text-lg">{{ skillPointsAvailable() | number }} SP</span>
        </div>
      </header>

      <!-- Tabs voor Categorieën -->
      <nav class="mb-6">
        <ul class="flex flex-wrap border-b border-border -mb-px">
          @for (tab of categoryTabs; track tab.id) {
            <li class="mr-1">
              <button
                type="button"
                class="tab-button inline-flex items-center justify-center px-3 py-2.5 border-b-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                [ngClass]="selectedCategoryTabId() === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'"
                (click)="selectCategory(tab.id)"
                role="tab"
                [attr.aria-selected]="selectedCategoryTabId() === tab.id">
                <royal-code-ui-icon [icon]="tab.icon" sizeVariant="sm" extraClass="mr-2"/>
                {{ tab.nameKey | translate }}
              </button>
            </li>
          }
        </ul>
      </nav>

      <!-- Huidige Geselecteerde Categorie Info -->
      @if (selectedCategoryDetails(); as categoryDetails) {
        <div class="selected-category-info mb-6 p-3 bg-card-secondary rounded-xs border border-border">
          <h2 class="text-xl font-semibold text-primary mb-1 flex items-center">
            <royal-code-ui-icon [icon]="categoryDetails.icon" sizeVariant="md" extraClass="mr-2"/>
            {{ categoryDetails.nameKey | translate }}
          </h2>
          <p class="text-sm text-secondary mb-1">
            {{ 'charProgression.skills.currentStatValue' | translate }}:
            <span class="font-semibold text-text">{{ categoryDetails.currentStatValue | number }}</span>
          </p>
          <!-- TODO: Implement Tier logic and display: -->
          <!-- <p class="text-xs text-muted-foreground">Next Tier unlocks at {{ categoryDetails.id | titlecase }} {{ categoryDetails.nextTierRequirement }}</p> -->
        </div>
      }

      <!-- Skills Grid/Lijst voor de geselecteerde categorie -->
      @if (isLoadingSkills() && filteredSkillsForDisplay().length === 0) {
        <div class="text-center my-8 text-secondary italic">{{ 'common.messages.loading' | translate }}...</div>
      } @else if (filteredSkillsForDisplay().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          @for (skill of filteredSkillsForDisplay(); track skill.id) {
            <royal-code-skill-card
              [skillData]="skill"
              [skillPointsAvailable]="skillPointsAvailable()"
              (requestUpgrade)="handleSkillUpgrade($event)"
              class="h-full" />
          }
        </div>
      } @else if (!isLoadingSkills()) {
        <p class="text-center my-8 text-secondary italic">
          {{ 'charProgression.skills.noSkillsInCategory' | translate }}
        </p>
      } @else {
         <p class="text-center my-8 text-secondary italic">Selecteer een skill categorie.</p>
      }
      <!-- TODO: Knop voor "Reset Skills" indien van toepassing -->
    </div>
  `,
  styles: [`
    /* :host { display: block; } */
    /* .tab-button.active is nu direct in ngClass */
  `]
})
export class SkillsPageComponent implements OnInit {
  // --- Dependencies ---
  private charProgFacade = inject(CharacterProgressionFacade);
  private logger = inject(LoggerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector); // Voor effect indien nodig
  private readonly logPrefix = '[SkillsPageComponent]';

  // --- State Signals from Facade ---
  /** All skills combined with user progression, ready for display. */
  readonly allSkillsForDisplay: Signal<SkillDisplay[]> = this.charProgFacade.skillsForDisplay;
  /** Number of skill points the user currently has available. */
  readonly skillPointsAvailable: Signal<number> = computed(() => this.charProgFacade.stats()?.skillPointsAvailable ?? 0);
  /** Loading state for any skill-related data (definitions or user skills). */
  readonly isLoadingSkills: Signal<boolean> = this.charProgFacade.isLoadingSkills;
  /** Current character stats, used to display the relevant core stat value for the selected category. */
  readonly currentStats: Signal<CharacterStats | null> = this.charProgFacade.stats;

  // --- Local UI State ---
  /** The ID (StatType) of the currently selected skill category tab. Defaults to Strength. */
  readonly selectedCategoryTabId = signal<StatType>(StatType.Strength);

  /**
   * Defines the tabs for skill categories. Each tab corresponds to a core stat.
   */
  readonly categoryTabs: SkillCategoryTab[] = [
    { id: StatType.Strength, nameKey: 'charProgression.stats.strength.name', icon: AppIcon.Sword },
    { id: StatType.Dexterity, nameKey: 'charProgression.stats.dexterity.name', icon: AppIcon.BowArrow },
    { id: StatType.Intelligence, nameKey: 'charProgression.stats.intelligence.name', icon: AppIcon.Book },
    { id: StatType.Luck, nameKey: 'charProgression.stats.luck.name', icon: AppIcon.Clover },
    { id: StatType.Arcane, nameKey: 'charProgression.stats.arcane.name', icon: AppIcon.Space },
  ];

  // --- Computed Signals for Display ---
  /**
   * Filters the `allSkillsForDisplay` array based on the `selectedCategoryTabId`.
   * Assumes `SkillDisplay.skillTreeId` matches a pattern like 'strength_skills'.
   * @returns {SkillDisplay[]} An array of skills belonging to the currently selected category.
   */
  readonly filteredSkillsForDisplay: Signal<SkillDisplay[]> = computed(() => {
    const selectedCatId = this.selectedCategoryTabId();
    const allSkills = this.allSkillsForDisplay();
    if (!selectedCatId || !allSkills) return [];

    // Example filtering: SkillDefinition.skillTreeId is 'strength_skills', 'dexterity_skills' etc.
    // Or adapt if SkillDefinition has a direct `associatedStatType: StatType`.
    const expectedSkillTreeId = `${selectedCatId.toLowerCase()}_skills`;
    return allSkills.filter(skill => skill.skillTreeId === expectedSkillTreeId);
  });

  /**
   * Provides details for the currently selected category tab, including the user's current value for the associated core stat.
   * @returns {SkillCategoryTab & { currentStatValue: number } | null} Details of the selected category or null.
   */
  readonly selectedCategoryDetails = computed(() => {
      const selectedId = this.selectedCategoryTabId();
      const tabInfo = this.categoryTabs.find(tab => tab.id === selectedId);
      const stats = this.currentStats();
      // Dynamically access the stat value based on the selected category ID (which is a StatType)
      const statValue = stats ? (stats as any)[selectedId.toLowerCase() as keyof CharacterStats] as number ?? 0 : 0;

      if (!tabInfo) return null;
      return {
          ...tabInfo,
          currentStatValue: statValue
      };
  });

  /**
   * @constructor
   */
  constructor() {
    this.logger.debug(`${this.logPrefix} Initialized.`);
  }

  /**
   * @Lifecycle ngOnInit
   * @description Ensures necessary data (skill definitions, user skills, character stats) is loaded
   *              via the facade. It also subscribes to route parameters to set the initial
   *              active skill category tab if a 'category' parameter is present in the URL.
   */
  ngOnInit(): void {
    this.logger.info(`${this.logPrefix} ngOnInit: Requesting initial data for skills page.`);
    // Data is likely already being loaded by `loadProgressionDataAfterAuth$` effect.
    // These calls ensure data is fetched if this page is accessed directly or if state isn't populated.
    this.charProgFacade.loadSkillDefinitions();
    this.charProgFacade.loadUserSkills();
    this.charProgFacade.loadCharacterStats(); // For skill points and current stat values

    // Subscribe to route parameter changes to set the active tab.
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef) // Automatically unsubscribe on component destruction
    ).subscribe(params => {
      const categoryFromUrl = params.get('category') as string | null;
      if (categoryFromUrl && Object.values(StatType).map(st => st.toLowerCase()).includes(categoryFromUrl.toLowerCase())) {
        // Find the StatType enum member that matches the string from the URL (case-insensitive)
        const matchedStatType = Object.entries(StatType)
                                     .find(([, value]) => value.toLowerCase() === categoryFromUrl.toLowerCase())
                                     ?.[1] as StatType | undefined;
        if (matchedStatType) {
            this.selectedCategoryTabId.set(matchedStatType);
            this.logger.debug(`${this.logPrefix} Initial category set from URL: ${matchedStatType}`);
        } else {
             this.setDefaultCategoryAndUpdateUrl();
        }
      } else {
        this.setDefaultCategoryAndUpdateUrl();
      }
    });
  }

  /** Helper to set default category and update URL if no valid category in URL. */
  private setDefaultCategoryAndUpdateUrl(): void {
      const defaultCategory = StatType.Strength;
      this.selectedCategoryTabId.set(defaultCategory);
      this.logger.debug(`${this.logPrefix} Defaulting to ${defaultCategory} category.`);
      // Update the URL to reflect the default category, without adding to browser history.
      this.updateUrlForCategory(defaultCategory, true);
  }

  /**
   * Changes the selected skill category tab and updates the URL.
   * @param {StatType} categoryId - The ID (StatType) of the category tab to select.
   */
  selectCategory(categoryId: StatType): void {
    this.logger.debug(`${this.logPrefix} Category tab selected: ${categoryId}`);
    this.selectedCategoryTabId.set(categoryId);
    this.updateUrlForCategory(categoryId);
  }

  /**
   * Updates the browser URL to reflect the currently selected skill category.
   * @param {StatType} categoryId - The ID of the selected category.
   * @param {boolean} [replaceUrl=false] - Whether to replace the current history entry.
   */
  private updateUrlForCategory(categoryId: StatType, replaceUrl = false): void {
    const categoryPath = categoryId.toLowerCase(); // StatType values are already lowercase strings
    this.router.navigate(['/character-progression/skills', categoryPath], {
      replaceUrl: replaceUrl
    });
  }

  /**
   * Handles the `requestUpgrade` event emitted from a `SkillCardComponent`.
   * Dispatches the `upgradeSkill` action via the facade if skill points are available.
   * @param {SkillId} skillId - The ID of the skill requested for an upgrade.
   */
  handleSkillUpgrade(skillId: SkillId): void {
    this.logger.info(`${this.logPrefix} Upgrade requested for skill ID: ${skillId}`);
    // The `canUpgrade` logic is primarily handled within the SkillCardComponent based on `skillsForDisplay`.
    // An additional check for available points here is a safeguard.
    if ((this.charProgFacade.stats()?.skillPointsAvailable ?? 0) > 0) {
      this.charProgFacade.upgradeSkill(skillId);
    } else {
      this.logger.warn(`${this.logPrefix} Attempted to upgrade skill ${skillId} but no skill points are available according to facade.`);
      // Notification for "no skill points" should ideally be handled by the effect upon failure if that's the reason.
    }
  }
}
