// libs/features/character-progression/src/lib/components/skills/skill-category-card/skill-category-card.component.ts
/**
 * @fileoverview Defines the SkillCategoryCardComponent for displaying a summary of a skill category.
 * This component shows the category name, icon, a brief description or progress summary,
 * and a button/link to view all skills within that category.
 * Features a theme-aware dark background, and a multi-hue gradient border effect using CSS variables
 * applied via inline style to the outer container. A neon glow can be enabled on hover.
 *
 * @Component SkillCategoryCardComponent
 * @description Renders a card summarizing a skill category with a themed gradient border and a consistently themed button.
 * @version 1.8.0 - Neon effect on hover via .neon-effect-target.
 * @author ChallengerAppDevAI
 */
import { Component, ChangeDetectionStrategy, InputSignal, OutputEmitterRef, computed, inject, input, output, Signal, booleanAttribute } from '@angular/core';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// --- UI Component Imports ---
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiPercentageBarComponent } from '@royal-code/ui/meters';

// --- Domain Model Imports ---
import { AppIcon, StatType, ButtonType, ThemeHueName} from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

/**
 * @interface SkillCategorySummary
 * @description Defines the data structure expected by the SkillCategoryCardComponent.
 */
export interface SkillCategorySummary {
  id: StatType | string; // string is fallback for non-StatType categories
  nameKeyOrText: string;
  icon: AppIcon;
  descriptionKeyOrText?: string;
  skillsInTierCount?: number;
  totalSkillsInTier?: number;
  requiredStatValueForNextTier?: number;
  currentStatValue?: number;
  routeLink?: string;
}

@Component({
  selector: 'royal-code-skill-category-card',
  standalone: true,
  imports: [ CommonModule, RouterModule, TranslateModule, UiIconComponent, UiButtonComponent, UiPercentageBarComponent, TitleCasePipe, DecimalPipe ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Template in apart bestand
  template:
  `
  @if (categorySummary(); as summary) {
    <div
      [ngClass]="gradientBorderContainerClasses()"
      [style.backgroundImage]="gradientBackgroundImageStyle()">
      <div class="skill-category-card flex flex-col bg-[var(--surface-card)] p-3 sm:p-4 rounded-[calc(var(--radius-lg)-3px)] h-full text-[var(--color-foreground)] shadow-md group-hover:shadow-lg">
          <div class="flex items-center gap-2 mb-2">
            <div class="flex-shrink-0 p-1.5 rounded-md" [ngClass]="iconWrapperBgClass()">
              <royal-code-ui-icon [icon]="summary.icon" sizeVariant="lg" [colorClass]="iconColorClass()" />
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-[var(--color-foreground)] truncate" [title]="summary.nameKeyOrText | translate">
              {{ summary.nameKeyOrText | translate }}
            </h3>
          </div>

          @if (summary.descriptionKeyOrText) {
            <p class="text-xs sm:text-sm text-[var(--color-text-muted)] mb-3 flex-grow line-clamp-2 min-h-[2.5rem]" [title]="summary.descriptionKeyOrText | translate">
              {{ summary.descriptionKeyOrText | translate }}
            </p>
          }

          @if (summary.skillsInTierCount !== undefined && summary.totalSkillsInTier !== undefined && summary.totalSkillsInTier > 0) {
            <div class="mb-2" [ngClass]="'neon-target-progress-' + cardThemeHue()">
              <div class="flex justify-between items-baseline text-xs text-[var(--color-foreground)] mb-0.5">
                <span>{{ 'charProgression.skills.tierProgress' | translate }}</span>
                <span>{{ summary.skillsInTierCount | number }} / {{ summary.totalSkillsInTier | number }}</span>
              </div>
              <royal-code-ui-percentage-bar
                [currentValue]="summary.skillsInTierCount"
                [maxValue]="summary.totalSkillsInTier"
                [showValueText]="false" heightClass="h-1.5"
                [barColorClass]="categoryBarColorClass()" trackColorClass="bg-[var(--color-muted)]" />
            </div>
          } @else if (summary.requiredStatValueForNextTier && summary.currentStatValue !== undefined) {
             <div class="mb-2" [ngClass]="'neon-target-progress-' + cardThemeHue()">
               <div class="flex justify-between items-baseline text-xs text-[var(--color-foreground)] mb-0.5">
                  <span>{{ 'charProgression.skills.nextTierAtStat' | translate: { stat: (summary.id | titlecase) } }} {{ summary.requiredStatValueForNextTier | number }}</span>
                  <span>{{ summary.currentStatValue | number }} / {{ summary.requiredStatValueForNextTier | number }}</span>
               </div>
               <royal-code-ui-percentage-bar
                  [currentValue]="summary.currentStatValue"
                  [maxValue]="summary.requiredStatValueForNextTier"
                  [showValueText]="false" heightClass="h-1.5"
                  [barColorClass]="categoryBarColorClass()" trackColorClass="bg-[var(--color-muted)]" />
             </div>
          }
        @if(!hideButton()){
          <royal-code-ui-button
                [type]="buttonTypeForCategory()"
                [useHueGradient]="true"
                sizeVariant="xs"
                extraclasses="mt-2"
                [enableNeonEffect]="true"
                (clicked)="viewDetailsClicked.emit(summary.id)">
                {{ 'common.buttons.viewDetails' | translate }}
                <royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="xs" extraClass="ml-1.5"/>
          </royal-code-ui-button>
        }
        </div>
      </div>
  } @else {
    <div class="skill-category-card flex flex-col items-center justify-center bg-muted p-3 rounded-xs border border-border h-full min-h-[150px] text-secondary">
      <royal-code-ui-icon [icon]="AppIcon.HelpCircle" sizeVariant="xl" colorClass="text-muted-foreground opacity-50 mb-2" />
      <p class="text-xs">{{ 'common.messages.noDataAvailable' | translate }}</p>
    </div>
  }
  `,
  styles: [` :host { display: block; height: 100%; } `]
})
export class SkillCategoryCardComponent {
  readonly categorySummary: InputSignal<SkillCategorySummary | undefined> = input<SkillCategorySummary | undefined>(undefined);
  readonly viewDetailsClicked: OutputEmitterRef<StatType | string> = output<StatType | string>();
  /** Input om het neon border effect AAN TE ZETTEN BIJ HOVER. */
  readonly enableNeonEffectOnHover = input(false, { transform: booleanAttribute });
  readonly hideButton = input(true, { transform: booleanAttribute });

  private logger = inject(LoggerService);
  private readonly logPrefix = '[SkillCategoryCardComponent]';
  readonly AppIcon = AppIcon;

  private readonly statTypeToThemeKeyMap: Record<string, ThemeHueName | 'default'> = {
    [StatType.Strength]:     'fire',
    [StatType.Dexterity]:    'water',
    [StatType.Intelligence]: 'forest',
    [StatType.Luck]:         'sun',
    [StatType.Arcane]:       'arcane',
  };

  readonly cardThemeHue: Signal<ThemeHueName | 'default'> = computed(() => {
    const categoryId = this.categorySummary()?.id;
    if (!categoryId) return 'default';
    const key = categoryId.toString();
    return this.statTypeToThemeKeyMap[key] || 'default';
  });

  readonly gradientBorderContainerClasses: Signal<string> = computed(() => {
    const base = ['gradient-border-container', 'rounded-xs', 'p-[4px]', 'group-hover:p-[3px]', 'transition-all', 'duration-300', 'ease-out', 'group'];
    const themeHue = this.cardThemeHue();

    if (this.enableNeonEffectOnHover() && themeHue !== 'default') {
      base.push('neon-card-border');
      base.push(`neon-${themeHue}`);
    }
    return base.join(' ');
  });

  readonly iconWrapperBgClass: Signal<string> = computed(() => {
    const themeHue = this.cardThemeHue();
    if (themeHue === 'default') return 'bg-[var(--color-primary-on)]/20';
    return `bg-[var(--color-theme-${themeHue}-on)]/20`;
  });

  readonly iconColorClass: Signal<string> = computed(() => {
    const themeHue = this.cardThemeHue();
    if (themeHue === 'default') return 'text-primary';
    return `text-[var(--color-theme-${themeHue})]`;
  });

  readonly gradientBackgroundImageStyle: Signal<string> = computed(() => {
    const themeHue = this.cardThemeHue();
    if (themeHue === 'default') {
      return 'linear-gradient(to bottom right,var(--color-primary),var(--color-accent),var(--color-surface))';
    }
    // Gebruikt de 5-stop card border gradient variabelen
    return `linear-gradient(to bottom right,
              var(--color-${themeHue}-grad-stop1),
              var(--color-${themeHue}-grad-stop2),
              var(--color-${themeHue}-grad-stop3),
              var(--color-${themeHue}-grad-stop4),
              var(--color-${themeHue}-grad-stop5)
            )`;
  });

  readonly categoryBarColorClass: Signal<string> = computed(() => {
    const themeHue = this.cardThemeHue();
    if (themeHue === 'default') return 'bg-primary';
    return `bg-[var(--color-theme-${themeHue})]`;
  });

  readonly buttonTypeForCategory: Signal<ButtonType> = computed(() => {
    const categoryId = this.categorySummary()?.id;
    switch (categoryId) {
      case StatType.Strength:     return 'theme-fire';
      case StatType.Dexterity:    return 'theme-water';
      case StatType.Intelligence: return 'theme-forest';
      case StatType.Luck:         return 'primary'; // Luck gebruikt primary button (met sun neon effect)
      case StatType.Arcane:       return 'theme-arcane';
      default: return 'default';
    }
  });

  // buttonActiveThemeHueForCategory is niet direct meer nodig als de button
  // zelf zijn neon class (`neon-sun` voor `primary` type met `cardThemeHue` 'sun')
  // en gradient (`--color-btn-sun-grad-*`) correct afleidt.
  // De UiButtonComponent moet mogelijk intern de `activeThemeHue` input gebruiken om
  // de neon-* klasse correct te zetten als type='primary' en `enableNeonEffect` true is.

  constructor() {
    this.logger.debug(`${this.logPrefix} Initialized.`);
  }
}
