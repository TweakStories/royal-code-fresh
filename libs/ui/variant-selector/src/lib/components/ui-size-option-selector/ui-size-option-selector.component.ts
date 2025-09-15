/**
 * @file ui-size-option-selector.component.ts
 * @Version 1.0.0 - Initial size selector component
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-07-30
 * @PromptSummary Initial generation of a standalone UI component for selecting size options,
 *                displaying them as buttons using UiButtonComponent.
 * @Description A standalone Angular component that displays a list of size options
 *              as interactive buttons. Users can select a size, and the component
 *              emits an event when a selection is made.
 */
import { Component, ChangeDetectionStrategy, InputSignal, OutputEmitterRef, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { UiButtonComponent } from '@royal-code/ui/button';

// Size option interface
export interface SizeOption {
  id: string;
  displayName: string;
  value: string; // The actual size value (e.g., "Small (20cm)", "Large")
  isAvailable: boolean;
  priceModifier?: number; // Optional price adjustment for this size
}

@Component({
  selector: 'royal-code-ui-size-option-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiButtonComponent],
  template: `
    @if (options().length > 0) {
      <div class="size-option-selector-wrapper">
        @if (label(); as lbl) {
          <span [id]="labelIdComputed()" class="block text-sm font-medium text-secondary mb-1.5">
            {{ lbl | translate }}: {{ selectedOptionComputed()?.displayName ?? (defaultSelectionTextKey() | translate) }}
          </span>
        }
        <div class="flex flex-wrap gap-2"
             role="radiogroup"
             [attr.aria-labelledby]="label() ? labelIdComputed() : null"
             [attr.aria-label]="!label() ? ('ui.sizeSelector.defaultAriaLabel' | translate) : null">
          @for (option of options(); track option.id) {
            <royal-code-ui-button
              [type]="isSelected(option.id) ? 'primary' : 'outline'"
              sizeVariant="sm"
              (clicked)="selectOption(option)"
              [disabled]="!option.isAvailable"
              [extraClasses]="'transition-all duration-150 ease-out px-2.5 py-1 text-xs' +
                              (option.isAvailable ? '' : ' opacity-50 cursor-not-allowed')"
              [attr.aria-label]="('ui.sizeSelector.selectAriaLabel' | translate : { sizeName: option.displayName })"
              [attr.aria-checked]="isSelected(option.id)"
              [attr.aria-pressed]="isSelected(option.id)"
              role="radio">
              {{ option.displayName }}
              @if (!option.isAvailable) {
                <span class="text-xs italic text-error-foreground ml-1">
                  ({{ 'ui.sizeSelector.notAvailable' | translate }})
                </span>
              }
              @if (option.priceModifier && showPriceModifier()) {
                <span class="text-xs ml-1"
                      [class]="isSelected(option.id) ? 'text-primary-on/80' : 'text-success'">
                  (+{{ option.priceModifier | number:'1.2-2' }} {{ currency() }})
                </span>
              }
            </royal-code-ui-button>
          }
        </div>
      </div>
    } @else {
      @if (showEmptyState()) {
        <p class="text-sm text-secondary italic">{{ 'ui.sizeSelector.noOptions' | translate }}</p>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSizeOptionSelectorComponent {
  options: InputSignal<SizeOption[]> = input.required<SizeOption[]>();
  selectedOptionId: InputSignal<string | undefined> = input<string | undefined>();
  label: InputSignal<string | undefined> = input<string | undefined>();
  defaultSelectionTextKey: InputSignal<string> = input<string>('ui.sizeSelector.pleaseSelect');
  showEmptyState: InputSignal<boolean> = input<boolean>(false);
  showPriceModifier: InputSignal<boolean> = input<boolean>(true);
  currency: InputSignal<string> = input<string>('EUR');

  optionSelected: OutputEmitterRef<SizeOption> = output<SizeOption>();

  private readonly uniqueIdPart = Math.random().toString(36).substring(2, 9);
  protected labelIdComputed = computed(() => this.label() ? `size-selector-label-${this.uniqueIdPart}` : null);

  protected selectedOptionComputed = computed(() => {
    const currentId = this.selectedOptionId();
    return currentId ? this.options().find(opt => opt.id === currentId) : undefined;
  });

  isSelected(optionId: string): boolean {
    return this.selectedOptionId() === optionId;
  }

  selectOption(option: SizeOption): void {
    if (option.isAvailable) {
      this.optionSelected.emit(option);
    }
  }
}
