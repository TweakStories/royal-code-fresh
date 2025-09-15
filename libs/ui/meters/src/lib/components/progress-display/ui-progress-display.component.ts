// libs/ui/meters/src/lib/components/progress-display/ui-progress-display.component.ts
/**
 * @fileoverview
 * Defines the UiProgressDisplayComponent, a foundational UI component for
 * rendering various types of progress indicators or statistical displays.
 * This component is part of the `@royal-code/ui/meters` library.
 *
 * @Component UiProgressDisplayComponent
 * @description
 * A generic container component that standardizes the layout for progress displays.
 * It accepts `currentValue` and `maxValue` to calculate progress and provides slots
 * for custom progress visualization and value text overrides.
 * @version 1.0.2 - Corrected translate pipe usage for optional label.
 * @author ChallengerAppDevAI
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  TemplateRef,
  ViewEncapsulation,
  InputSignal,
  Signal,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'royal-code-ui-progress-display',
  standalone: true,
  imports: [CommonModule, UiIconComponent, TranslateModule, DecimalPipe],
  template: `
    <div class="progress-display-container {{ extraContainerClasses() }}"
         role="group"
         [attr.aria-label]="(label() || '') | translate"> <!-- Fallback naar lege string -->

      @if (label() || icon()) {
        <div class="progress-display-header mb-1 flex items-center gap-x-1.5">
          @if (icon(); as iconName) {
            <royal-code-ui-icon
              [icon]="iconName"
              sizeVariant="sm"
              [colorClass]="iconColorClass() ?? 'text-secondary'"
              aria-hidden="true" />
          }
          @if (label(); as labelText) {
            <span class="text-xs font-medium text-text">{{ (labelText || '') | translate }}</span> <!-- Fallback -->
          }
        </div>
      }

      <div class="progress-visualization-wrapper relative">
        @if (progressVisualizationTemplate(); as visTpl) {
          <ng-container *ngTemplateOutlet="visTpl; context: {
              $implicit: {
                currentValue: currentValue(),
                maxValue: maxValue(),
                percentage: percentage(),
                normalizedPercentage: normalizedPercentage()
              }
            }">
          </ng-container>
        } @else {
          <div class="h-4 bg-muted rounded animate-pulse"
               [attr.aria-label]="((label() || '') | translate) + ' progress bar loading'"> <!-- Fallback -->
          </div>
        }
      </div>

      @if (valueTextVisible()) {
        <div class="progress-value-text-wrapper mt-0.5 text-xs text-secondary text-right">
          @if (valueTextOverrideTemplate(); as overrideTpl) {
            <ng-container *ngTemplateOutlet="overrideTpl; context: {
                $implicit: {
                  currentValue: currentValue(),
                  maxValue: maxValue(),
                  percentage: percentage(),
                  normalizedPercentage: normalizedPercentage(),
                  unit: valueUnit()
                }
              }">
            </ng-container>
          } @else {
            <span>{{ currentValue() | number }} / {{ maxValue() | number }} {{ valueUnit() }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [` :host { display: block; } `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UiProgressDisplayComponent {
  readonly label: InputSignal<string | null | undefined> = input<string | null | undefined>();
  readonly currentValue: InputSignal<number> = input.required<number>();
  readonly maxValue: InputSignal<number> = input.required<number>();
  readonly valueTextVisible: InputSignal<boolean> = input<boolean>(true);
  readonly valueUnit: InputSignal<string | undefined> = input<string | undefined>();
  readonly icon: InputSignal<AppIcon | null | undefined> = input<AppIcon | null | undefined>();
  readonly iconColorClass: InputSignal<string | undefined> = input<string | undefined>('text-secondary');
  readonly extraContainerClasses: InputSignal<string | undefined> = input<string | undefined>();
  readonly progressVisualizationTemplate: InputSignal<TemplateRef<any> | undefined> = input<TemplateRef<any> | undefined>();
  readonly valueTextOverrideTemplate: InputSignal<TemplateRef<any> | undefined> = input<TemplateRef<any> | undefined>();

  readonly percentage: Signal<number> = computed(() => {
    const max = this.maxValue();
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (this.currentValue() / max) * 100));
  });

  readonly normalizedPercentage: Signal<number> = computed(() => {
    const max = this.maxValue();
    if (max <= 0) return 0;
    return Math.min(1, Math.max(0, this.currentValue() / max));
  });

  constructor() { }
}