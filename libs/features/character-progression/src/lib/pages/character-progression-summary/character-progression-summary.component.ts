// libs/features/character-progression/src/lib/pages/character-progression-summary/character-progression-summary.component.ts
/**
 * @fileoverview Defines the CharacterProgressionSummaryPageComponent.
 * Displays an overview of the character's progression, including core attributes,
 * level, experience, resources, and previews for lifeskills and skill categories.
 * Core attributes are rendered using a direct CSS Grid layout for consistent alignment.
 * Titles are rendered using UiTitleComponent.
 * @version 2.4.0 - Corrected CSS Grid for core attributes for 2-column layout per attribute.
 * @author ChallengerAppDevAI
 */
import {
  Component, ChangeDetectionStrategy, inject, signal, computed, Signal, OnInit, effect, Injector,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store, select } from '@ngrx/store';

import { UiIconComponent } from '@royal-code/ui/icon';
// UiMeterDisplayComponent is nu *niet* meer nodig voor de core attributes hier.
// import { UiMeterDisplayComponent, MeterDisplayLayoutMode } from '@royal-code/ui/meters';
import { UiSegmentedBarComponent, UiPercentageBarComponent } from '@royal-code/ui/meters';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';

import { LifeskillsPreviewComponent } from '../../components/lifeskills-preview/lifeskills-preview.component';
import { SkillCategoriesPreviewComponent } from '../skill-categories-preview/skill-categories-preview.component';
import { CharacterProgressionFacade } from '../../state/character-progression.facade';
import { AppIcon, Lifeskill, CharacterStats } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import * as CharacterProgressionSelectors from '../../state/character-progression.selectors';
import { CharacterStatDisplayItem } from '../../state/character-progression.types';


@Component({
  selector: 'royal-code-character-progression-summary-page',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, RouterModule, DecimalPipe,
    UiIconComponent, UiTitleComponent,
    UiSegmentedBarComponent, UiPercentageBarComponent,
    LifeskillsPreviewComponent, SkillCategoriesPreviewComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<!--
  Main container for the character progression summary page.
  Provides overall padding and vertical spacing for its sections.
-->
<div class="character-progression-summary-container p-4 md:p-6 space-y-6 md:space-y-8">


  <!-- Main Grid: Organizes Core Stats/Resources and Skill Categories side-by-side on larger screens. -->
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

    <!-- Left Column: Contains Character Resources and Core Attributes. Spans 2 of 5 columns on large screens. -->
    <section class="lg:col-span-2 card-like-panel space-y-4">
    <!-- Section: Level, Experience Points -->
      <!-- This section is displayed full-width at the top. -->
      <section class="level-xp-top-section space-y-4 md:space-y-6" aria-labelledby="level-xp-top-title-id">
        <div class="level-xp-card card-like-panel">
          <div class="flex items-center space-x-2 mb-1 ">
            <span class="text-3xl md:text-4xl font-bold text-primary">Level {{ currentUserLevel() }}</span>
            <span class="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full shadow-sm">{{ currentUserRank() }} ✨</span>
          </div>
          <royal-code-ui-percentage-bar
            [currentValue]="currentUserXP()" [maxValue]="xpForNextLevel()"
            [label]="undefined" [showValueText]="false" heightClass="h-3"
            barColorClass="bg-gradient-to-r from-amber-400 to-orange-500" trackColorClass="bg-muted" />
          <p class="text-xs text-secondary text-right mt-1">{{ currentUserXP() | number }} / {{ xpForNextLevel() | number }} XP</p>
        </div>
      </section>

      <!-- Subsection: Core Character Attributes (Strength, Dexterity, etc.) -->
      <div aria-labelledby="core-attributes-title-id">
        <royal-code-ui-title
          [text]="'charProgression.titles.coreStats' | translate"
          [level]="TitleTypeEnum.H2"
          [heading]="true"
          extraClasses="subsection-title !mb-2"
          id="core-attributes-title-id"
        />
        @if (isLoadingData() && !coreAttributesForDisplay().length) {
          @for (_ of [0,1,2,3,4]; track _) {
            <div class="attribute-item-loading h-9"></div>
          }
        } @else if (coreAttributesForDisplay().length > 0) {
          <!--
            Grid for displaying individual core attributes.
            Each attribute (icon, label, value, bar) is rendered as a two-column row.
            Column 1: 'max-content' width for icon and text.
            Column 2: '1fr' width, taking remaining space for the segmented bar.
          -->
          <div class="core-attributes-direct-grid grid grid-cols-[max-content_1fr] items-center gap-x-3 gap-y-1.5">
            @for (attr of coreAttributesForDisplay(); track attr.type) {
              <!-- Attribute Icon and Text Labels (First grid cell) -->
              <div class="icon-text-block flex items-center flex-shrink-0 gap-x-1.5">
                <royal-code-ui-icon [icon]="attr.icon" [sizeVariant]="'sm'" [colorClass]="attr.iconColorClass" />
                <div class="flex flex-col text-left">
                  <span class="text-xs font-medium text-text leading-tight">{{ attr.labelKey | translate }}</span>
                  <span class="text-[10px] text-secondary leading-tight">{{ attr.valueText }}</span>
                </div>
              </div>
              <!-- Attribute Segmented Bar Visualization (Second grid cell) -->
              <div class="visualization-block min-w-0 flex items-center">
                <royal-code-ui-segmented-bar [config]="attr.barConfig" />
              </div>
            }
          </div>
        } @else if (!isLoadingData()) {
          <p class="text-sm text-secondary italic p-3">
            {{ 'charProgression.messages.noStatsAvailable' | translate }}
          </p>
        }
      </div>
    </section>

    <!-- Right Column: Contains Skill Categories. Spans 3 of 5 columns on large screens. -->
    <section class="lg:col-span-3 space-y-4 md:space-y-6">
        @if (skillPointsAvailable() > 0) {
          <div class="card-like-panel" aria-labelledby="skill-categories-title-id">
              <royal-code-ui-title
                [text]="'charProgression.titles.skillCategories' | translate"
                [level]="TitleTypeEnum.H2"
                [heading]="true"
                id="skill-categories-title-id"
                extraClasses="subsection-title-alt !mb-3"
              />
              <royal-code-skill-categories-preview/>
          </div>
        } @else {
          <!-- Optional: Placeholder or message if no skill points are available -->
           <div class="card-like-panel text-center p-6">
                <p class="text-sm text-secondary italic">
                    {{ 'charProgression.skills.noSkillPointsToSpend' | translate }}
                </p>
           </div>
        }
    </section>
  </div>

  <!-- Section: Lifeskills (Full-width, displayed below the main two-column grid) -->
  <section class="lifeskills-section card-like-panel" aria-labelledby="lifeskills-section-title-id">
    <royal-code-ui-title
      [text]="'home.titles.lifeskills' | translate"
      [level]="TitleTypeEnum.H2"
      [heading]="true"
      extraClasses="subsection-title-alt !mb-3"
      id="lifeskills-section-title-id"
    />
    <royal-code-lifeskills-preview />
  </section>

  <!-- General Loading/Error Fallback Area -->
  @if (isLoadingData() && !currentStatsSignal() && lifeskills().length === 0) {
    <p class="text-center text-secondary italic py-4">{{ 'common.messages.loading' | translate }}...</p>
  }
  @if (error() && (!currentStatsSignal() || lifeskills().length === 0)) {
    <p class="text-center text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/30">
      {{ 'common.errors.errorOccurred' | translate }}: {{ error() }}
    </p>
  }
</div>
  `,
  styles: [`
    :host { display: block; }
    .subsection-title { @apply text-lg font-semibold text-foreground mb-3 pb-1.5 border-b border-border/70; }
    .subsection-title-alt { @apply text-base font-semibold text-primary mb-2 text-center; }
    .card-like-panel { @apply bg-card-secondary p-3 md:p-4 rounded-xs shadow-md border border-border; }
    .attribute-item-loading { @apply h-9 bg-muted rounded animate-pulse; }
    .core-attributes-direct-grid {
      display: grid;
      grid-template-columns: max-content 1fr;
      /* … */
    }
    .icon-text-block {
      /* Dit is nu een directe grid cel */
    }
    .visualization-block {
      /* Dit is nu een directe grid cel */
    }
  `],
})
export class CharacterProgressionSummaryPageComponent implements OnInit {
  // --- Dependencies ---
  private charProgFacade = inject(CharacterProgressionFacade);
  private logger = inject(LoggerService);
  private store = inject(Store);
  private readonly injector = inject(Injector);

  // --- Enums & Constants for Template ---
  readonly AppIcon = AppIcon;
  readonly TitleTypeEnum = TitleTypeEnum;

  // --- State Signals ---
  readonly isLoadingData: Signal<boolean> = this.charProgFacade.isLoading;
  readonly error: Signal<string | null> = this.charProgFacade.error;
  readonly currentStatsSignal: Signal<CharacterStats | null> = computed(() => this.charProgFacade.stats());
  readonly lifeskills: Signal<Lifeskill[]> = this.charProgFacade.lifeskills;
  readonly currentUserLevel: Signal<number> = computed(() => this.currentStatsSignal()?.level ?? 1);
  readonly currentUserRank: Signal<string> = signal('Avonturier');
  readonly currentUserXP: Signal<number> = computed(() => this.currentStatsSignal()?.currentExperience ?? 0);
  readonly xpForNextLevel: Signal<number> = computed(() => this.currentStatsSignal()?.experienceForNextLevel ?? 1000);
  readonly skillPointsAvailable: Signal<number> = computed(() => this.currentStatsSignal()?.skillPointsAvailable ?? 0);

  readonly coreAttributesForDisplay: Signal<CharacterStatDisplayItem[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectCharacterStatsForDisplay)),
    { initialValue: [] }
  );

  constructor() {
    this.logger.debug('[CharacterProgressionSummaryPageComponent] Initialized.');
    effect(() => {
        this.logger.debug('[CharacterProgressionSummaryPageComponent] isLoadingData changed:', this.isLoadingData());
        this.logger.debug('[CharacterProgressionSummaryPageComponent] Core attributes for display (count):', this.coreAttributesForDisplay().length);
    }, {injector: this.injector});
  }

  ngOnInit(): void {
    this.logger.info('[CharacterProgressionSummaryPageComponent] ngOnInit: Requesting initial data load.');
    this.charProgFacade.loadCharacterStats();
    this.charProgFacade.loadStatDefinitions();
    this.charProgFacade.loadLifeskills();
  }
}
