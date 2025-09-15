/**
 * @file ui-color-option-selector.component.ts
 * @Version 3.0.0 (Complete with Base Color Support & Primary Border)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-01-09
 * @Description
 *   Een robuuste component voor kleurselectie met ondersteuning voor base/standaard
 *   variant, correcte primary border styling, en intuïtieve UX.
 */
import { Component, ChangeDetectionStrategy, InputSignal, OutputEmitterRef, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { ColorOption } from '../../models/color-option-selector.model';

@Component({
  selector: 'royal-code-ui-color-option-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiButtonComponent, UiIconComponent],
  template: `
    @if (options().length > 0) {
      <div class="color-option-selector-wrapper">
        <div class="flex flex-wrap items-center gap-2" role="radiogroup" [attr.aria-labelledby]="labelIdComputed()">
          @for (option of options(); track option.id) {
            <royal-code-ui-button
              type="none"
              sizeVariant="none"
              [isRound]="true"
              [isSelected]="isSelected(option.id)"
              [isAnimated]="true"
              [disabled]="option.isAvailable === false"
              (clicked)="selectOption(option)"
              [extraClasses]="getColorSwatchBaseClasses(option)"
              [backgroundColor]="option.id !== 'none' ? option.colorValue : null"
              [attr.aria-label]="getAriaLabel(option)"
              [attr.aria-checked]="isSelected(option.id)"
              role="radio">

              <!-- Logic for displaying content inside the swatch -->
              @if (isSelected(option.id) && showCheckmarkOnSelected() && option.id !== 'none') {
                <royal-code-ui-icon
                  [icon]="AppIcon.Check"
                  sizeVariant="xs"
                  extraClass="text-foreground mix-blend-difference"
                />
              } @else if (option.id === 'none') {
                <royal-code-ui-icon
                  [icon]="AppIcon.LayoutGrid" 
                  sizeVariant="sm"
                  extraClass="text-gray-400"
                />
              }
            </royal-code-ui-button>
          }
        </div>
      </div>
    } @else {
      @if (showEmptyState()) {
        <p class="text-sm text-secondary italic">{{ 'ui.colorSelector.noOptions' | translate }}</p>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiColorOptionSelectorComponent {
  options: InputSignal<ColorOption[]> = input.required<ColorOption[]>();
  selectedOptionId: InputSignal<string | undefined | null> = input<string | undefined | null>();
  label: InputSignal<string | undefined> = input<string | undefined>();
  defaultSelectionTextKey: InputSignal<string> = input<string>('ui.colorSelector.pleaseSelect');
  showEmptyState: InputSignal<boolean> = input<boolean>(false);
  showCheckmarkOnSelected: InputSignal<boolean> = input<boolean>(true);

  optionSelected: OutputEmitterRef<ColorOption> = output<ColorOption>();

  public readonly AppIcon = AppIcon;

  private readonly uniqueIdPart = Math.random().toString(36).substring(2, 9);
  protected labelIdComputed = computed(() => this.label() ? `color-selector-label-${this.uniqueIdPart}` : null);

  protected selectedOptionComputed = computed(() => {
    const currentId = this.selectedOptionId();
    return currentId ? this.options().find(opt => opt.id === currentId) : undefined;
  });

  isSelected(optionId: string): boolean {
    const selectedId = this.selectedOptionId();
    
    if (optionId === 'none') {
      // FIXED: Ook checken op 'none' string waarde
      return selectedId === null || selectedId === undefined || selectedId === 'none';
    }
    return selectedId === optionId;
  }

  selectOption(option: ColorOption): void {
    if (option.isAvailable !== false) {
      this.optionSelected.emit(option);
    }
  }

  protected getColorSwatchBaseClasses(option: ColorOption): string {
    const baseClasses = 'w-7 h-7 p-0 border-2';
    const isOptionSelected = this.isSelected(option.id);
    
    if (option.id === 'none') {
      // FIXED: Primary border wanneer geselecteerd, anders grijze rand
      const borderClass = isOptionSelected ? 'border-primary' : 'border-gray-400';
      return `${baseClasses} bg-gray-100 ${borderClass}`;
    }
    
    // Voor kleurvarianten: primary border wanneer geselecteerd, anders standaard
    const borderClass = isOptionSelected ? 'border-primary' : 'border-gray-300';
    return `${baseClasses} ${borderClass}`;
  }

  protected getAriaLabel(option: ColorOption): string {
    const key = option.id === 'none'
      ? `Selecteer standaard weergave (alle opties)`
      : `Selecteer kleur: ${option.displayName}`;
    return key;
  }
}