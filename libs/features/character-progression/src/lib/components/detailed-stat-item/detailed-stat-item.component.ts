// libs/features/character-progression/src/lib/components/detailed-stat-item/detailed-stat-item.component.ts
import { Component, ChangeDetectionStrategy, input, InputSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; // DecimalPipe voor percentage
import { TranslateModule } from '@ngx-translate/core';
import { DetailedStat, AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon'; // Import UiIconComponent

@Component({
  selector: 'royal-code-detailed-stat-item',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiIconComponent, DecimalPipe], // Voeg DecimalPipe toe
  template:
  `
  <div class="detailed-stat-item flex items-center justify-between py-1.5 px-2 bg-muted/50 rounded-md hover:bg-muted transition-colors" [title]="(stat()?.descriptionKeyOrText ?? '') | translate">
    <div class="flex items-center gap-1.5 min-w-0">
      @if (stat()?.icon) {
        <royal-code-ui-icon [icon]="stat()!.icon!" sizeVariant="xs" colorClass="text-secondary"></royal-code-ui-icon>
      }
      <span class="text-sm text-text-secondary truncate">{{ (stat()?.nameKeyOrText ?? '') | translate }}</span>
    </div>
  
    @if (stat()?.uiHint === 'bar' && stat()?.value !== undefined && stat()?.maxValue !== undefined) {
      <div class="w-1/2 ml-2"> <!-- Geef de bar wat ruimte -->
        <div class="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
          <div class="bg-primary h-full rounded-full" [style.width.%]="(toNumber(stat()!.value) / stat()!.maxValue!) * 100"></div>
        </div>
      </div>
      <span class="text-sm font-semibold text-text ml-2 whitespace-nowrap">
        {{ stat()?.value }} / {{ stat()?.maxValue }} {{ stat()?.unit || '' }}
      </span>
    } @else if (stat()?.uiHint === 'percentage' && stat()?.value !== undefined) {
      <span class="text-sm font-semibold text-primary">{{ toNumber(stat()!.value) | number:'1.0-1' }}{{ stat()?.unit || '%' }}</span>
    } @else if (stat()?.uiHint === 'valueMax' && stat()?.value !== undefined && stat()?.maxValue !== undefined) {
      <span class="text-sm font-semibold text-text whitespace-nowrap">
        {{ stat()?.value }} / {{ stat()?.maxValue }} {{ stat()?.unit || '' }}
      </span>
    } @else {
      <span class="text-sm font-semibold text-text whitespace-nowrap">
        {{ stat()?.value }} {{ stat()?.unit || '' }}
      </span>
    }
  
    <button
      class="info-icon absolute top-1 right-1 text-secondary hover:text-primary transition-colors"
      [title]="(stat()?.descriptionKeyOrText ?? '') | translate">
      <royal-code-ui-icon [icon]="AppIcon.Info" sizeVariant="xs" />
    </button>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailedStatItemComponent {
  readonly stat: InputSignal<DetailedStat | undefined> = input<DetailedStat>();
  readonly AppIcon = AppIcon; // Make AppIcon available to the template

  /** Helper om de waarde naar een nummer te converteren voor de progress bar. */
  toNumber(value: string | number): number {
    return Number(value);
  }
}
