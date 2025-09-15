// libs/features/character-progression/src/lib/components/skills/skill-card/skill-card.component.ts
/**
 * @fileoverview Defines the SkillCardComponent for displaying individual skill information.
 * This component shows skill details like name, icon, current level, XP progression,
 * and provides an option to upgrade the skill if possible.
 *
 * @Component SkillCardComponent
 * @description Renders a card for a single character skill, including its progress and upgrade options.
 *              It consumes a `SkillDisplay` object which combines static skill definitions with
 *              user-specific progression data. It uses `UiSegmentedBarComponent` for XP visualization.
 * @version 1.1.0 - Adapted to use UiSegmentedBarComponent from @royal-code/ui/meters.
 * @author ChallengerAppDevAI
 */
import { Component, ChangeDetectionStrategy, inject, input, computed, Signal, OutputEmitterRef, output, InputSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// --- UI Component Imports ---
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
// --- NIEUWE IMPORTS vanuit @royal-code/ui/meters ---
import { UiSegmentedBarComponent } from '@royal-code/ui/meters';
import { SegmentedBarConfig, SegmentStyle } from '@royal-code/ui/meters';

// --- Domain Model Imports ---
import { AppIcon, SkillId, SkillDisplay } from '@royal-code/shared/domain';

// --- Core Service Imports ---
import { LoggerService } from '@royal-code/core/core-logging';

@Component({
  selector: 'royal-code-skill-card',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DecimalPipe,
    UiIconComponent,
    UiButtonComponent,
    UiSegmentedBarComponent, // Hernoemd van UiStatBarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (skillData(); as skill) {
      <div class="skill-card flex flex-col bg-card-secondary p-3 rounded-xs shadow-md border border-border h-full text-foreground transition-all duration-200 ease-out hover:shadow-lg hover:border-primary/50">
        <!-- Header: Icon & Name -->
        <div class="flex items-center gap-2 mb-2">
      <div class="flex-shrink-0 p-1.5 bg-primary/10 rounded-md">
        @if(skill.iconPath) {
          <img [src]="skill.iconPath" [alt]="skill.nameKeyOrText | translate" class="w-6 h-6"
               [ngClass]="skill.canUpgrade ? 'filter-primary-pulse' : ''" /> <!-- filter-primary-pulse is een placeholder voor een pulse animatie, kan via CSS -->
        } @else {
          <royal-code-ui-icon [icon]="skill.icon" sizeVariant="md" [colorClass]="skill.canUpgrade ? 'text-primary animate-pulse' : 'text-primary/70'" />
        }
      </div>
      <h4 class="text-sm font-semibold text-foreground truncate" [title]="skill.nameKeyOrText | translate">
        {{ skill.nameKeyOrText | translate }}
      </h4>
    </div>

        <!-- Level Display -->
        <div class="text-xs text-secondary mb-1 text-center">
          Level <span class="font-bold text-text">{{ skill.currentLevel | number }}</span> / {{ skill.maxLevel | number }}
        </div>

        <!-- XP Progress Bar -->
        <div class="mb-1.5">
          @if (skillExperienceBarConfig(); as barConfig) {
            <!-- Gebruik de nieuwe UiSegmentedBarComponent -->
            <royal-code-ui-segmented-bar [config]="barConfig" />
          } @else if (skill.currentLevel < skill.maxLevel) {
            <div class="h-[8px] bg-muted rounded-full border border-border"></div>
          } @else {
             <div class="h-[8px]"></div>
          }
        </div>
         @if (skill.currentLevel < skill.maxLevel) {
          <p class="text-[10px] text-secondary text-center mb-2">
            XP: {{ skill.currentExperience | number }} / {{ skill.experienceForNextLevel | number }}
          </p>
         } @else {
           <p class="text-[10px] text-success text-center font-semibold mb-2">MAX LEVEL</p>
         }

        <p class="text-xs text-text-secondary mb-3 flex-grow min-h-[2.5rem] line-clamp-2" [title]="currentOrNextLevelEffectDescription() | translate">
          {{ currentOrNextLevelEffectDescription() | translate }}
        </p>

        <div class="mt-auto">
          @if (skill.currentLevel < skill.maxLevel) {
            <royal-code-ui-button
              type="primary"
              sizeVariant="xs"
              extraclasses="font-semibold"
              [disabled]="!skill.canUpgrade"
              (clicked)="handleUpgradeClick(skill.id)">
              @if (skill.canUpgrade) {
                <royal-code-ui-icon [icon]="AppIcon.ChevronUp" sizeVariant="xs" extraClass="mr-1" />
                {{ 'common.buttons.upgrade' | translate }} ({{ upgradeCost() | number }} SP)
              } @else if (skillPointsAvailable() < upgradeCost()) {
                {{ 'charProgression.skills.noSkillPoints' | translate }}
              } @else {
                {{ 'charProgression.skills.cannotUpgrade' | translate }}
              }
            </royal-code-ui-button>
          }
        </div>
      </div>
    } @else {
      <div class="skill-card flex flex-col items-center justify-center bg-muted p-3 rounded-xs border border-border h-full min-h-[150px] text-secondary">
        <royal-code-ui-icon [icon]="AppIcon.HelpCircle" sizeVariant="lg" colorClass="text-muted-foreground opacity-50 mb-2" />
        <p class="text-xs">{{ 'common.messages.noDataAvailable' | translate }}</p>
      </div>
    }
  `
})
export class SkillCardComponent {
  /**
   * @Input skillData
   * @description The combined skill data (definition + user progress) to display.
   */
  readonly skillData: InputSignal<SkillDisplay | undefined> = input<SkillDisplay | undefined>(undefined);
  /**
   * @Input skillPointsAvailable
   * @description Number of skill points the user currently has available.
   */
  readonly skillPointsAvailable: InputSignal<number> = input<number>(0);

  /**
   * @Output requestUpgrade
   * @description Emits the SkillId when the user requests to upgrade a skill.
   */
  readonly requestUpgrade: OutputEmitterRef<SkillId> = output<SkillId>();


  private logger = inject(LoggerService);
  private readonly logPrefix = '[SkillCardComponent]';

  /** Exposes AppIcon enum to the template. */
  readonly AppIcon = AppIcon;

  constructor() {
    this.logger.debug(`${this.logPrefix} Initialized.`);
  }

  /**
   * @Signal skillExperienceBarConfig
   * @description Computes the configuration for the `UiSegmentedBarComponent`
   *              to visualize the skill's current experience towards the next level.
   * @returns {SegmentedBarConfig | undefined} The configuration object or undefined.
   */
  readonly skillExperienceBarConfig: Signal<SegmentedBarConfig | undefined> = computed(() => {
    const skill = this.skillData();
    if (!skill || skill.currentLevel >= skill.maxLevel || skill.experienceForNextLevel <= 0) {
      return undefined;
    }

    const totalSegmentsForXpBar = 5; // Example: 5 visual segments for the XP bar
    const valuePerSegment = skill.experienceForNextLevel / totalSegmentsForXpBar;
    const filledSegments = Math.floor(skill.currentExperience / valuePerSegment);

    return {
      filledValue: skill.currentExperience, // Huidige XP
      totalValue: skill.experienceForNextLevel,   // XP nodig voor volgende level
      numberOfSegments: totalSegmentsForXpBar, // Aantal visuele blokjes
      displayStyle: SegmentStyle.Block, // Gebruik 'Block' voor een vlakkere, progress-achtige balk
      ariaLabel: `XP for ${skill.nameKeyOrText}`,
      segmentColorPattern: 'xp', // Specifiek kleurpatroon voor XP (definieer in styles.scss)
    };
  });

  /**
   * @Signal currentOrNextLevelEffectDescription
   * @description Determines which skill effect description to show based on upgrade possibility.
   * @returns {string} The translation key or direct text for the relevant effect description.
   */
  readonly currentOrNextLevelEffectDescription: Signal<string> = computed(() => {
    const skill = this.skillData();
    if (!skill) return 'No information available';

    const targetLevel = (skill.canUpgrade && skill.currentLevel < skill.maxLevel)
      ? skill.currentLevel + 1
      : skill.currentLevel;

    const effect = skill.effectsPerLevel?.find(e => e.level === targetLevel);
    return effect?.descriptionKeyOrText || skill.descriptionKeyOrText || 'No specific effect description.';
  });

  /**
   * @Signal upgradeCost
   * @description Determines the cost in skill points to upgrade this skill.
   * For now, it's a placeholder value of 1.
   * @returns {number} The cost to upgrade.
   */
  readonly upgradeCost: Signal<number> = computed(() => {
    return 1; // Placeholder
  });

  /**
   * Handles the click event of the upgrade button.
   * Emits the `requestUpgrade` event with the skill's ID.
   * @param {SkillId} skillId - The ID of the skill to be upgraded.
   */
  handleUpgradeClick(skillId: SkillId): void {
    this.logger.info(`${this.logPrefix} Upgrade requested for skill: ${skillId}`);
    this.requestUpgrade.emit(skillId);
  }
}
