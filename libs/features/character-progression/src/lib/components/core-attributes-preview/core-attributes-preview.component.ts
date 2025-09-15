// libs/features/character-progression/src/lib/components/core-attributes-preview/core-attributes-preview.component.ts
/**
 * @fileoverview Defines the CoreAttributesPreviewComponent, responsible for displaying
 * core character statistics like Strength, Dexterity, etc., in a compact preview format.
 * This component uses the UiMeterDisplayComponent to arrange an icon, textual information
 * (name, value/max), and a UiSegmentedBarComponent for the visual bar.
 *
 * @Component CoreAttributesPreviewComponent
 * @description
 * Renders a list of core character attributes. Each attribute is displayed using the
 * `UiMeterDisplayComponent`, which in turn projects a `UiSegmentedBarComponent`.
 * This component fetches necessary data (current stats, stat definitions) via the
 * CharacterProgressionFacade.
 * @version 2.1.0 - Adapted to use UiMeterDisplayComponent and UiSegmentedBarComponent.
 * @author ChallengerAppDevAI
 */
import { Component, ChangeDetectionStrategy, inject, computed, Signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// Importeer de nieuwe UI componenten
import { UiMeterDisplayComponent, MeterDisplayLayoutMode } from '@royal-code/ui/meters'; // Nieuwe component
import { UiSegmentedBarComponent } from '@royal-code/ui/meters';      // Nieuwe component
import { SegmentedBarConfig, SegmentStyle } from '@royal-code/ui/meters'; // Pad naar model in meters lib

import { CharacterProgressionFacade } from '../../state/character-progression.facade';
import { StatType, AppIcon, StatDefinition } from '@royal-code/shared/domain';

/**
 * @interface DisplayAttributeData
 * @description Internal interface to structure all data needed to configure UiMeterDisplayComponent
 *              and the projected UiSegmentedBarComponent for one attribute.
 * @internal
 */
interface DisplayAttributeData {
  type: StatType;
  labelKey: string;
  icon: AppIcon;
  iconColorClass: string;
  valueText: string;
  // Context object for the UiMeterDisplayComponent's visualizationTemplate
  visualizationContext: {
    barConfig: SegmentedBarConfig; // Config specifically for UiSegmentedBarComponent
  };
}

@Component({
  selector: 'royal-code-core-attributes-preview',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DecimalPipe,
    UiMeterDisplayComponent,   // Nieuwe layout component
    UiSegmentedBarComponent, // De balk zelf (wordt geprojecteerd)
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="core-attributes-card bg-card-secondary p-3 rounded-xs shadow-sm border border-border space-y-3">
      <h4 class="text-sm font-semibold text-text mb-2">{{ 'home.progression.coreAttributes' | translate }}</h4>

      @if (isLoading()) {
        @for (_ of [0,1,2,3,4]; track _) {
          <div class="stat-display-item flex items-center gap-x-3 p-1 rounded bg-muted animate-pulse h-[36px]">
            <div class="w-5 h-5 bg-muted-foreground/30 rounded-sm"></div>
            <div class="flex flex-col gap-1 flex-grow">
              <div class="h-3 w-20 bg-muted-foreground/30 rounded"></div>
              <div class="h-2 w-12 bg-muted-foreground/30 rounded"></div>
            </div>
            <div class="h-4 w-24 bg-muted-foreground/30 rounded-full ml-auto"></div>
          </div>
        }
      } @else if (attributesToDisplay().length > 0) {
        @for (attr of attributesToDisplay(); track attr.type) {
          <royal-code-ui-meter-display
            [labelKey]="attr.labelKey"
            [valueText]="attr.valueText"
            [icon]="attr.icon"
            [iconColorClass]="attr.iconColorClass"
            iconSize="sm"
            layoutMode="icon-text-left-vis-right"
            [visualizationTemplate]="barVisualizationTpl"
            [visualizationContext]="attr.visualizationContext"
          />
        }
      } @else {
        <p class="text-xs text-secondary italic py-2">{{ 'charProgression.messages.noStatsAvailable' | translate }}</p>
      }
    </div>

    <!-- Template for the segmented bar, to be projected into UiMeterDisplayComponent -->
    <ng-template #barVisualizationTpl let-ctx>
      @if (ctx.barConfig) {
        <royal-code-ui-segmented-bar [config]="ctx.barConfig" />
      }
    </ng-template>
  `
})
export class CoreAttributesPreviewComponent {
  private charProgFacade = inject(CharacterProgressionFacade);

  /**
   * @Signal isLoading
   * @description True if core stats or their definitions are currently being fetched.
   */
  readonly isLoading: Signal<boolean> = computed(() =>
    this.charProgFacade.isLoadingStats() || this.charProgFacade.isLoadingDefinitions()
  );

  /**
   * @Signal attributesToDisplay
   * @description Transforms raw stats and definitions into a display-ready array.
   * Each object contains configuration for `UiMeterDisplayComponent` and the
   * `SegmentedBarConfig` for the projected `UiSegmentedBarComponent`.
   */
  readonly attributesToDisplay: Signal<DisplayAttributeData[]> = computed(() => {
    const stats = this.charProgFacade.stats();
    const definitions = this.charProgFacade.statDefinitions();

    if (!stats || !definitions || definitions.length === 0) {
      return [];
    }

    const attributeOrder: StatType[] = [
      StatType.Strength, StatType.Dexterity, StatType.Intelligence, StatType.Arcane, StatType.Luck
    ];

    return attributeOrder.map(statType => {
      const definition = definitions.find(d => d.id === statType);
      const currentValue = (stats as any)[statType.toLowerCase() as keyof typeof stats] as number | undefined;

      if (!definition || currentValue === undefined) {
        return null;
      }

      // Config specific for the UiSegmentedBarComponent
      const segmentedBarConfigForStat: SegmentedBarConfig = {
        filledValue: currentValue,
        totalValue: definition.maxValue,
        numberOfSegments: definition.uiSegments || definition.maxValue, // Fallback for numberOfSegments
        ariaLabel: definition.nameKeyOrText, // For ARIA on the bar
        segmentColorPattern: `attribute_${statType.toLowerCase()}`, // For segment styling
        displayStyle: SegmentStyle.Chevron, // Or SegmentStyle.Block, or from definition
      };

      return {
        type: statType,
        labelKey: definition.nameKeyOrText,
        icon: definition.icon || AppIcon.HelpCircle,
        iconColorClass: this.getStatIconColorClass(statType),
        valueText: `${currentValue} / ${definition.maxValue}`,
        visualizationContext: { // Data to pass to the #barVisualizationTpl
          barConfig: segmentedBarConfigForStat
        }
      };
    }).filter((attr): attr is DisplayAttributeData => attr !== null);
  });

  /**
   * Provides a Tailwind CSS color class string for the icon based on the stat type.
   * @param statType The type of the statistic.
   * @returns A string of Tailwind CSS color classes for the icon.
   */
  private getStatIconColorClass(statType: StatType): string {
    switch (statType) {
      case StatType.Strength:     return 'text-[var(--color-theme-fire)]';
      case StatType.Dexterity:    return 'text-[var(--color-theme-forest)]';
      case StatType.Intelligence: return 'text-[var(--color-theme-water)]';
      case StatType.Arcane:       return 'text-[var(--color-theme-arcane)]';
      case StatType.Luck:         return 'text-[var(--color-theme-sun)]';
      default: return 'text-secondary';
    }
  }

  constructor() {
    // Data loading is expected to be handled by a parent or resolver.
  }
}