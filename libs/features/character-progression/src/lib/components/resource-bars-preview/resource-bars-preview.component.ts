// libs/features/character-progression/src/lib/components/resource-bars-preview/resource-bars-preview.component.ts
import { Component, ChangeDetectionStrategy, inject, computed, Signal, input, InputSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
// Vervang UiResourceBlocksComponent met UiResourceBatteryComponent
import { UiResourceBatteryComponent, ResourceBatteryType } from '@royal-code/ui/meters'; // Aangepast pad
import { CharacterProgressionFacade } from '../../state/character-progression.facade';
import { AppIcon } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

@Component({
  selector: 'royal-code-resource-bars-preview',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiResourceBatteryComponent, DecimalPipe], // UiResourceBatteryComponent hier
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="resource-bars-preview-container space-y-3">
      @if (showLabel()) {
        <h4 class="text-sm font-semibold text-text mb-1">
          {{ 'home.progression.resources' | translate }}
        </h4>
      }

      @if (isLoading()) {
        <!-- Flex container voor placeholders zodat ze ook horizontaal staan -->
        <div class="flex flex-row space-x-2 sm:space-x-3 justify-around items-end w-full">
          <div class="resource-bar-item-loading">
            <p class="text-xs text-secondary italic">{{ 'common.messages.loading' | translate }}...</p>
          </div>
          <div class="resource-bar-item-loading">
            <p class="text-xs text-secondary italic">{{ 'common.messages.loading' | translate }}...</p>
          </div>
          <div class="resource-bar-item-loading">
            <p class="text-xs text-secondary italic">{{ 'common.messages.loading' | translate }}...</p>
          </div>
        </div>
      } @else if (hasData()) {
        <!-- Gebruik flexbox voor horizontale layout -->
        <div class="flex flex-row space-x-2 sm:space-x-3 justify-around items-stretch w-full">
          <!-- Health Battery -->
          <royal-code-ui-resource-battery
            class="flex-1 min-w-0"
            type="health"
            [currentValue]="currentHealth()"
            [maxValue]="maxHealth()"
            sizeVariant="xl"
            label="HP"
            [showValueText]="true"
            [enableNeonEffect]="true"
          />
          <!-- Mana Battery -->
          <royal-code-ui-resource-battery
            class="flex-1 min-w-0"
            type="mana"
            [currentValue]="currentMana()"
            [maxValue]="maxMana()"
            sizeVariant="xl"
            label="MP"
            [showValueText]="true"
            [enableNeonEffect]="true"
          />
          <!-- Stamina Battery -->
          <royal-code-ui-resource-battery
            class="flex-1 min-w-0"
            type="stamina"
            [currentValue]="currentStamina()"
            [maxValue]="maxStamina()"
            sizeVariant="xl"
            label="STA"
            [showValueText]="true"
            [enableNeonEffect]="true"
          />
        </div>
      } @else {
        <p class="text-xs text-secondary italic">
          {{ 'charProgression.messages.noStatsAvailable' | translate }}
        </p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .resource-bar-item-loading { @apply p-2 rounded bg-muted border border-border/50 animate-pulse min-h-[60px] flex-1; } /* Iets hoger voor batterij look */
    /* Zorg ervoor dat de flex container voor de batterijen zich goed gedraagt */
    .flex.flex-row.justify-around.items-stretch { /* items-stretch voor gelijke hoogte indien mogelijk */
      /* Je kunt hier eventueel min-height of andere styling toevoegen als nodig */
    }
  `],
})
export class ResourceBarsPreviewComponent {
  readonly showLabel: InputSignal<boolean> = input<boolean>(true);
  private charProgFacade = inject(CharacterProgressionFacade);
  private logger = inject(LoggerService);

  readonly isLoading: Signal<boolean> = this.charProgFacade.isLoading;
  readonly hasData: Signal<boolean> = computed(() => !!this.charProgFacade.stats());
  readonly currentHealth: Signal<number> = computed(() => this.charProgFacade.stats()?.currentHealth ?? 0);
  readonly maxHealth: Signal<number> = computed(() => this.charProgFacade.stats()?.maxHealth ?? 100);
  readonly currentMana: Signal<number> = computed(() => this.charProgFacade.stats()?.currentMana ?? 0);
  readonly maxMana: Signal<number> = computed(() => this.charProgFacade.stats()?.maxMana ?? 50);
  readonly currentStamina: Signal<number> = computed(() => this.charProgFacade.stats()?.currentStamina ?? 0);
  readonly maxStamina: Signal<number> = computed(() => this.charProgFacade.stats()?.maxStamina ?? 120);
  // AppIcon is niet meer direct nodig in de template van deze component als de batterij geen icon input heeft.

  constructor() {
    this.logger.debug('[ResourceBarsPreviewComponent] Initialized.');
  }
}
