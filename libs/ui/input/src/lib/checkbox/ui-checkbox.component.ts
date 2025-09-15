/**
 * @file ui-checkbox.component.ts
 * @Version 1.3.0 (Styling Fix: text-primary for accent color)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-07
 * @Description
 *   Een robuuste, opzichzelfstaande checkbox component. Deze versie gebruikt nu
 *   `[ngClass]` met `text-primary` om te garanderen dat de vink en focus-ring
 *   altijd de correcte themakleur gebruiken.
 */
import { Component, ChangeDetectionStrategy, input, model, forwardRef, output, computed, booleanAttribute, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'royal-code-ui-checkbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="flex items-center gap-2 group"
           [for]="inputId()"
           [class.cursor-pointer]="!disabled()"
           [class.cursor-not-allowed]="disabled()">
      <input
        type="checkbox"
        [id]="inputId()"
        [checked]="value()"
        [disabled]="disabled()"
        (change)="onCheckboxChange($event)"
        (blur)="onTouched()"
        class="h-4 w-4 rounded border-border bg-background focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        [ngClass]="{'accent-primary': true, 'text-primary': true}">
      @if (label()) {
        <span class="select-none text-sm font-medium text-foreground transition-colors"
              [class.group-hover:text-primary]="!disabled()"
              [class.opacity-50]="disabled()"
              [class]="labelClasses()">
          {{ label() }}
        </span>
      }
    </label>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiCheckboxComponent),
      multi: true
    }
  ]
})
export class UiCheckboxComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly labelClasses = input<string>('');
  readonly explicitId = input<string | undefined>();
  readonly checked = input<boolean | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly changed = output<boolean>();

  value = model<boolean>(false);
  readonly inputId = computed(() => this.explicitId() || `checkbox-${Math.random().toString(36).substring(2, 9)}`);
  
  private onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};
  
  constructor() {
    effect(() => {
        const externalChecked = this.checked();
        if (externalChecked !== undefined && externalChecked !== this.value()) {
            this.value.set(externalChecked);
        }
    });
  }

  writeValue(value: any): void {
    if (this.checked() === undefined) {
      this.value.set(!!value);
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void {}

  onCheckboxChange(event: Event): void {
    if (this.disabled()) return;
    const isChecked = (event.target as HTMLInputElement).checked;
    this.value.set(isChecked);
    this.onChange(isChecked);
    this.changed.emit(isChecked);
    this.onTouched();
  }
}