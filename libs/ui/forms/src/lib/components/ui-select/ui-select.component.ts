/**
 * @file ui-select.component.ts
 * @Version 2.2.0 (Definitive CVA with Error Handling)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-07
 * @Description A reusable select component, fully upgraded to Angular v21+ syntax.
 *              This version adds an 'error' input for displaying validation messages,
 *              aligning its API with other form components like UiInputComponent.
 */
import { Component, ChangeDetectionStrategy, forwardRef, input, model, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { SelectOption } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      @if (label()) {
        <label [for]="id()" class="block text-sm font-medium text-foreground mb-1">
          {{ label() }}
          @if (required()) {
            <span class="text-destructive">*</span>
          }
        </label>
      }
      <select
        [id]="id()"
        [value]="value()"
        (blur)="onTouched()"
        (change)="onChange($event)"
        [disabled]="disabled()"
        [ngClass]="{ 'border-destructive': hasErrors() }"
        class="w-full p-2 border border-input rounded-xs bg-background text-sm focus:ring-primary focus:border-primary ring-1 ring-inset ring-border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        [attr.aria-required]="required()"
      >
        @for (option of options(); track option.value) {
          <option [ngValue]="option.value">{{ option.label }}</option>
        }
      </select>
      <!-- === HIER IS DE TOEGEVOEGDE LOGICA VOOR FOUTMELDINGEN === -->
      @if (hasErrors()) {
        <p class="mt-2 text-sm text-destructive" [attr.id]="id() + '-error'">
          {{ error() }}
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
})
export class UiSelectComponent implements ControlValueAccessor {
  // === Inputs ===
  label = input<string | undefined>();
  options = input<SelectOption[]>([]);
  required = input<boolean>(false);
  error = input<string | undefined>(); // <-- TOEGEVOEGD

  // === Value Model ===
  value = model<any>('');

  // === Internal State ===
  readonly id = computed(() => `select-${Math.random().toString(36).substring(2)}`);
  protected readonly disabled = signal<boolean>(false);
  readonly hasErrors = computed(() => !!this.error()); // <-- TOEGEVOEGD

  // === ControlValueAccessor Callbacks ===
  private onChangeFn: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  // === CVA Implementation ===
  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // === Event Handlers ===
  onChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = this.options().find(opt => String(opt.value) === selectElement.value);
    const newValue = selectedOption ? selectedOption.value : selectElement.value;
    
    this.value.set(newValue);
    this.onChangeFn(newValue);
  }
}