// libs/features/character-progression/src/lib/pages/skill-categories-preview/skill-categories-preview.component.ts
/**
 * @fileoverview Defines the SkillCategoriesPreviewComponent for displaying a preview
 *               of skill categories. Uses UiTitleComponent for its section title and
 *               a responsive CSS Grid layout for category cards.
 * @Component SkillCategoriesPreviewComponent
 * @description Renders a collection of `SkillCategoryCardComponent` instances.
 *              The grid layout dynamically adjusts the number of columns based on available
 *              width and a minimum card width, ensuring cards do not become too narrow.
 * @version 1.2.0 - Integrated UiTitleComponent and responsive grid with auto-fit.
 * @author ChallengerAppDevAI
 */
import { Component, ChangeDetectionStrategy, inject, Signal, OnInit } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// --- UI Component Imports ---
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { TitleTypeEnum } from '@royal-code/shared/domain'; // Import UiTitleComponent
import { SkillCategoryCardComponent, SkillCategorySummary } from '../../components/skills/skill-category-card/skill-category-card.component';

// --- State & Facade Imports ---
import { CharacterProgressionFacade } from '../../state/character-progression.facade';

// --- Domain Model Imports ---
import { AppIcon, StatType } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

@Component({
  selector: 'royal-code-skill-categories-preview',
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    UiIconComponent,
    UiButtonComponent,
    SkillCategoryCardComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      Main container for the skill categories preview section.
      Includes a title and a responsive grid for displaying skill category cards.
    -->
    <section class="skills-preview-section" aria-labelledby="skill-categories-preview-title-id">
      <!-- Loading state: Displayed if data is loading and no categories are yet available. -->
      @if (isLoading() && skillCategories().length === 0) {
        <div class="text-center my-4 text-secondary italic">{{ 'common.messages.loading' | translate }}</div>
      } @else if (skillCategories().length > 0) {
        <!--
          Responsive Grid for Skill Category Cards:
          - Uses 'auto-fit' to automatically adjust the number of columns.
          - Each column has a minimum width of 180px (configurable) and can grow to fill available space (1fr).
          - 'gap-3 sm:gap-4' provides consistent spacing between cards.
        -->
        <div
          class="grid gap-3 sm:gap-4"
          style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
          @for (category of skillCategories(); track trackById($index, category)) {
            <royal-code-skill-category-card
              [categorySummary]="category"
              [enableNeonEffectOnHover]="true"
              (viewDetailsClicked)="navigateToSkillsPage($event)"
              class="h-full"
            />
          }
        </div>
        <!-- Call to Action: Button to view all skills. -->
        <div class="mt-6 text-center">
          <royal-code-ui-button
            type="primary"
            sizeVariant="md"
            (clicked)="navigateToSkillsPage()">
            {{ 'home.buttons.viewAllSkills' | translate }}
            <royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="xs" extraClass="ml-1.5"/>
          </royal-code-ui-button>
        </div>
      } @else if (!isLoading()) {
        <!-- Empty state: Displayed if no skill categories are available after loading. -->
        <p class="text-center my-4 text-secondary italic">{{ 'charProgression.skills.noCategoriesAvailable' | translate }}</p>
      }
    </section>
  `,
  // No component-specific styles needed if Tailwind utilities and global styles suffice.
  // styles: [` :host { display: block; } `]
})
export class SkillCategoriesPreviewComponent implements OnInit {
  // --- Injected Dependencies ---
  private charProgFacade = inject(CharacterProgressionFacade);
  private logger = inject(LoggerService);
  private router = inject(Router);
  private readonly logPrefix = '[SkillCategoriesPreviewComponent]';

  // --- State Signals from Facade ---
  /**
   * Signal containing an array of `SkillCategorySummary` objects.
   * These summaries are fetched via the facade and are tailored for display in this preview section.
   */
  readonly skillCategories: Signal<SkillCategorySummary[]> = this.charProgFacade.skillCategorySummaries;
  /**
   * Signal indicating if any skill-related data (definitions or user progression) is currently loading.
   * Used to display a loading indicator for this section.
   */
  readonly isLoading: Signal<boolean> = this.charProgFacade.isLoadingSkills;

  // --- Constants for Template ---
  /** Exposes the AppIcon enum to the template for icon bindings. */
  readonly AppIcon = AppIcon;
  /** Exposes the TitleTypeEnum to the template for the UiTitleComponent. */
  readonly TitleTypeEnum = TitleTypeEnum;

  /**
   * @constructor
   * Logs component initialization.
   */
  constructor() {
    this.logger.debug(`${this.logPrefix} Initialized.`);
  }

  /**
   * @Lifecycle ngOnInit
   * @description Ensures that necessary data (skill definitions, user skills, and character stats)
   *              is requested via the facade when the component initializes.
   *              The facade and effects should handle deduplication of these requests.
   */
  ngOnInit(): void {
    this.logger.info(`${this.logPrefix} ngOnInit: Requesting data for skill categories preview.`);
    this.charProgFacade.loadSkillDefinitions();
    this.charProgFacade.loadUserSkills();
    this.charProgFacade.loadCharacterStats(); // Needed for currentStatValue in the summary
  }

  /**
   * Navigates to the main skills page, optionally to a specific category tab.
   * @param {StatType | string} [categoryId] - Optional ID of the category to navigate to.
   *                                           If provided, the skills page should open on this category's tab.
   */
  navigateToSkillsPage(categoryId?: StatType | string): void {
    const routeParts = ['/character-progression', 'skills'];
    if (categoryId) {
      // Convert StatType enum value to lowercase string path if necessary
      const categoryPath = typeof categoryId === 'string' ? categoryId.toLowerCase() : categoryId;
      routeParts.push(categoryPath);
    }
    this.logger.info(`${this.logPrefix} Navigating to Skills Page. Route: ${routeParts.join('/')}`);
    this.router.navigate(routeParts);
  }

  /**
   * TrackBy function for the @for loop over skill categories.
   * @param {number} index - The index of the item in the array.
   * @param {SkillCategorySummary} category - The skill category summary object.
   * @returns {StatType | string} The unique ID of the category.
   */
  trackById(index: number, category: SkillCategorySummary): StatType | string {
    return category.id;
  }
}
