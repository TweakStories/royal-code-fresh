// libs/features/character-progression/src/lib/components/character-stats-preview/character-stats-preview.component.ts
import { Component, ChangeDetectionStrategy, inject, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, StatType } from '@royal-code/shared/domain';
import { CharacterProgressionFacade } from '../../../state/character-progression.facade'; // Pad naar facade

// Interface voor de data die deze preview component verwacht
export interface CoreStatDisplayItem {
  type: StatType | string;
  name: string; // Kan translatie key zijn
  value: number;
  maxValue: number;
  icon?: AppIcon;
}

@Component({
  selector: 'royal-code-character-stats-preview',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent],
  template:
  `
  <div class="stats-preview-container p-3 bg-card-secondary rounded-xs shadow">
  <h4 class="text-sm font-semibold text-text mb-2">{{ 'charProgression.titles.coreStatsPreview' | translate }}</h4>
  @if (statsToDisplay().length > 0) {
    <div class="grid grid-cols-2 gap-x-3 gap-y-1.5">
      @for (stat of statsToDisplay(); track stat.type) {
        <div class="stat-item text-xs">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-secondary font-medium flex items-center">
              <royal-code-ui-icon *ngIf="stat.icon" [icon]="stat.icon" sizeVariant="xs" extraClass="mr-1 opacity-70"></royal-code-ui-icon>
              {{ stat.name | translate }}
            </span>
            <span class="text-text font-semibold">{{ stat.value }}</span>
          </div>
          <!-- Mini progress bar (optioneel) -->
           <div class="w-full bg-muted rounded-full h-1.5">
             <div class="bg-primary h-1.5 rounded-full" [style.width.%]="(stat.value / stat.maxValue) * 100"></div>
           </div>
        </div>
      }
    </div>
    <div class="mt-3 text-center">
      <a routerLink="/character/progression/stats" class="text-xs font-medium text-primary hover:underline">
        {{ 'common.buttons.viewAllStats' | translate }} →
      </a>
    </div>
  } @else {
    <p class="text-xs text-secondary italic">{{ 'charProgression.messages.noStatsAvailable' | translate }}</p>
  }
</div>
`,
   styles: ['./character-stats-preview.component.scss'], // Voeg toe als je SCSS hebt
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterStatsPreviewComponent {
  private charProgFacade = inject(CharacterProgressionFacade);

  /**
   * Input signal, verwacht een subset van de 'statsForDisplay' van de facade.
   * Deze component is presentational en ontvangt zijn data.
   * Of, als het slimmer moet zijn:
   * De facade kan een selector hebben `selectPreviewStats` die dit direct levert.
   */
  // Voor nu maken we het zo dat het de data van de facade direct kan gebruiken.
  readonly statsToDisplay: Signal<CoreStatDisplayItem[]> = computed(() => {
    // Transformeer de `statsForDisplay` van de facade naar wat deze component nodig heeft.
    // Dit is een voorbeeld, de selectie van "belangrijkste" stats kan complexer zijn.
    return this.charProgFacade.statsForDisplay()
      .slice(0, 4) // Neem bijvoorbeeld de eerste 4 (Strength, Dexterity, etc.)
      .map(stat => ({
        type: stat.type,
        name: stat.name, // Aanname dat 'name' al de key/tekst is
        value: stat.value,
        maxValue: stat.maxValue,
        icon: stat.icon,
      }));
  });

  readonly AppIcon = AppIcon; // Voor template
}