// libs/features/character-progression/src/lib/components/stats/character-stats-display/character-stats-display.component.ts
/**
 * @fileoverview Standalone UI component to display the user's core character statistics
 *              (Strength, Dexterity, Intelligence, Luck, Arcane) using the UiMeterDisplayComponent
 *              which projects a UiSegmentedBarComponent for the visual bar.
 * @version 2.2.0 - Correctly uses CharacterStatDisplayItem and UiMeterDisplayComponent inputs.
 * @author ChallengerAppDevAI
 */
import {
  Component, ChangeDetectionStrategy, inject, computed, OnInit,
  Signal, effect, Injector
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store, select } from '@ngrx/store';

// --- UI Component Imports ---
import { UiMeterDisplayComponent, UiSegmentedBarComponent } from '@royal-code/ui/meters';

// --- State & Facade Imports ---
import { CharacterProgressionFacade } from '../../../state/character-progression.facade';
import * as CharacterProgressionSelectors from '../../../state/character-progression.selectors';
// --- Domain Model Imports ---
import { LoggerService } from '@royal-code/core/core-logging';
import { CharacterStatDisplayItem } from '../../../state/character-progression.types';
import { StatType } from '@royal-code/shared/domain';

// Lokale interface DisplayAttributeData is VERWIJDERD. We gebruiken CharacterStatDisplayItem.

@Component({
  selector: 'royal-code-character-stats-display',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, NgClass,
    UiMeterDisplayComponent,
    UiSegmentedBarComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="character-stats-display" role="region" aria-labelledby="character-stats-heading">
       <h3 id="character-stats-heading" class="text-md font-semibold text-foreground mb-3">
          {{ 'charProgression.titles.coreStats' | translate }}
       </h3>

       @if (isLoading()) {
        @for (_ of [0,1,2,3,4]; track _) {
          <div class="stat-display-item flex items-center gap-x-3 p-1 rounded bg-muted animate-pulse h-[36px] mb-3">
            <div class="w-5 h-5 bg-muted-foreground/30 rounded-sm"></div>
            <div class="flex flex-col gap-1 flex-grow">
              <div class="h-3 w-20 bg-muted-foreground/30 rounded"></div>
              <div class="h-2 w-12 bg-muted-foreground/30 rounded"></div>
            </div>
            <div class="h-4 w-24 bg-muted-foreground/30 rounded-full ml-auto"></div>
          </div>
        }
       } @else if (attributesToDisplay().length > 0) {
         <div class="stats-container space-y-3">
          @for (attr of attributesToDisplay(); track attr.type) {
            <div class="p-2 rounded bg-muted border border-border/50" [ngClass]="getStatContainerClass(attr.type)">
              <royal-code-ui-meter-display
                [labelKey]="attr.labelKey"
                [valueText]="attr.valueText"
                [icon]="attr.icon"
                [iconColorClass]="attr.iconColorClass"
                iconSize="sm"
                layoutMode="icon-text-left-vis-right"
                [visualizationTemplate]="barVisualizationTpl"
                [visualizationContext]="{ barConfig: attr.barConfig }"
              />
              @if (attr.effectDescriptionKey) {
                  <p class="text-xs text-secondary mt-0.5 italic pl-[calc(1.25rem+0.375rem)]">
                    {{ 'charProgression.stats.effectPrefix' | translate }}: {{ attr.effectDescriptionKey | translate }}
                  </p>
                }
            </div>
          }
         </div>
       } @else if (!isLoading() && !error()) {
            <p class="text-center text-sm text-secondary italic">{{ 'charProgression.messages.noStatsAvailable' | translate }}</p>
       } @if (error(); as errorMsg) {
          <div class="mt-3 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/30 text-sm text-center">
             {{ 'charProgression.errors.loadStatsFailed' | translate }}
          </div>
       }
    </div>

    <!-- Template for the segmented bar, to be projected into UiMeterDisplayComponent -->
    <ng-template #barVisualizationTpl let-ctx>
      @if (ctx.barConfig) {
        <royal-code-ui-segmented-bar [config]="ctx.barConfig" />
      }
    </ng-template>
  `,
  styles: [ ` :host { display: block; } ` ]
})
export class CharacterStatsDisplayComponent implements OnInit {
  private charProgFacade = inject(CharacterProgressionFacade);
  private logger = inject(LoggerService);
  private store = inject(Store);
  private readonly injector = inject(Injector);

  readonly isLoading: Signal<boolean> = computed(() =>
    this.charProgFacade.isLoadingStats() || this.charProgFacade.isLoadingDefinitions()
  );
  readonly error: Signal<string | null> = this.charProgFacade.error;

  // --- Gebruik CharacterStatDisplayItem[] als type ---
  readonly attributesToDisplay: Signal<CharacterStatDisplayItem[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectCharacterStatsForDisplay)),
    { initialValue: [] }
  );

  constructor() {
    this.logger.debug('[CharacterStatsDisplayComponent] Initializing...');
    effect(() => {
        const attrs = this.attributesToDisplay();
        if (attrs.length > 0) {
            this.logger.debug('[CharacterStatsDisplayComponent] Effect: Attributes for display updated.', attrs.map(s => ({ type: s.type, val: s.valueText, conf: s.barConfig }) ));
        }
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.logger.info('[CharacterStatsDisplayComponent] ngOnInit: Requesting character stats and stat definitions load.');
    this.charProgFacade.loadCharacterStats();
    this.charProgFacade.loadStatDefinitions();
  }

  getStatContainerClass(statType: StatType | string): string {
    const safeStatType = statType.toString().toLowerCase().replace(/[^a-z0-9-]/g, '');
    return `stat-item-container-${safeStatType}`;
  }
}
