/**
 * @fileoverview Defines the UiPercentageBarComponent, a lightweight component
 * for displaying progress as a simple, continuous filled bar.
 *
 * @Component UiPercentageBarComponent
 * @description
 * Renders a horizontal progress bar. It takes a current value and a maximum value
 * to calculate and display the percentage fill. The component now supports predefined
 * size variants for consistent height control.
 * This component is part of the `@royal-code/ui/meters` library.
 * @version 1.1.0 - Refactored to use semantic size variants instead of direct height classes.
 * @author Royal-Code MonorepoAppDevAI
 */
import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

/**
 * @type PercentageBarSize
 * @description Defines the available size variants for the percentage bar's height.
 */
export type PercentageBarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Interne mapping van size-variant naar de corresponderende Tailwind CSS-klasse.
const SIZE_TO_CLASS_MAP: Record<PercentageBarSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
  xl: 'h-4',
};

@Component({
  selector: 'royal-code-ui-percentage-bar',
  standalone: true,
  imports: [CommonModule, NgClass, DecimalPipe, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-percentage-bar flex items-center w-full gap-x-2"
         role="group"
         [attr.aria-label]="label() || 'Percentage bar'">

      @if (label()) {
        <span class="text-xs font-medium text-foreground shrink-0 whitespace-nowrap">
          {{ (label() || '') | translate }}:
        </span>
      }

      <div class="relative flex-grow"
           role="progressbar"
           [attr.aria-valuenow]="currentValue()"
           aria-valuemin="0"
           [attr.aria-valuemax]="maxValue()">

        <!-- Track for the progress bar -->
        <div class="rounded-full overflow-hidden border"
             [ngClass]="[_heightClass(), trackColorClass()]"
             [style.border-color]="'var(--color-border)'">

          <!-- Fill element of the progress bar -->
          <div
            class="h-full progress-bar-fill-element"
            [ngClass]="[ barColorClass(), _heightClass() ]"
            [style.width.%]="percentage() * 100">
          </div>
        </div>
      </div>

      @if (showValueText()) {
        <span class="text-xs font-semibold text-muted-foreground shrink-0 whitespace-nowrap">
          {{ currentValue() | number }} / {{ maxValue() | number }}{{ valueUnit() ? ' ' + valueUnit() : '' }}
        </span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .progress-bar-fill-element {
      transition: width 0.3s ease-out;
      border-radius: inherit;
    }
  `]
})
export class UiPercentageBarComponent {
  // --- CORE INPUTS ---
  /**
   * @Input currentValue
   * @description The current value to be represented by the filled portion of the bar. Required.
   */
  readonly currentValue = input.required<number>();
  /**
   * @Input maxValue
   * @description The maximum value the bar can represent (i.e., 100% fill). Required.
   */
  readonly maxValue = input.required<number>();

  // --- STYLING & TEXT INPUTS ---
  /**
   * @Input size
   * @description Defines the height of the bar using predefined size variants. Defaults to 'md'.
   */
  readonly size = input<PercentageBarSize>('md'); // <-- NIEUW: Semantische size input
  /**
   * @Input label
   * @description Optional text label displayed to the side or above the bar. Can be a translation key.
   */
  readonly label = input<string | undefined>(undefined);
  /**
   * @Input valueUnit
   * @description Optional unit to append to the value text (e.g., "XP", "%"). Defaults to an empty string.
   */
  readonly valueUnit = input<string>('');
  /**
   * @Input showValueText
   * @description Whether to display the "currentValue / maxValue unit" text. Defaults to true.
   */
  readonly showValueText = input<boolean>(true);
  /**
   * @Input barColorClass
   * @description Tailwind CSS class for the background color of the filled portion of the bar.
   * Defaults to 'bg-primary'.
   */
  readonly barColorClass = input<string>('bg-primary');
  /**
   * @Input trackColorClass
   * @description Tailwind CSS class for the background color of the bar's track.
   * Defaults to 'bg-muted'.
   */
  readonly trackColorClass = input<string>('bg-muted');

  // --- INTERNAL COMPUTED SIGNALS ---
  /**
   * @Signal percentage
   * @description Computes the fill percentage (0 to 1).
   * @internal
   */
  readonly percentage: Signal<number> = computed(() => {
    const max = this.maxValue();
    if (max <= 0) return 0;
    return Math.max(0, Math.min(1, this.currentValue() / max));
  });

  /**
   * @Signal _heightClass
   * @description Internally computes the correct Tailwind height class based on the `size` input.
   * @internal
   */
  readonly _heightClass: Signal<string> = computed(() => {
    return SIZE_TO_CLASS_MAP[this.size()] ?? SIZE_TO_CLASS_MAP['md'];
  });
}
