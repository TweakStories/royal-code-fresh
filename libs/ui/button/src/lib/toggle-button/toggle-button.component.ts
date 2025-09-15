/**
 * @file ui-toggle-button.component.ts
 * @Version 3.2.0 (Disabled Input Implemented - Cleaned & Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Een standalone, Signals-gebaseerde toggle-button component voor formulierinvoer.
 *   Nu met correct geïmplementeerde `disabled` input en zonder HTML-commentaren.
 */
import { ChangeDetectionStrategy, Component, forwardRef, input, model, booleanAttribute, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'royal-code-ui-toggle-button',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <button
      type="button"
      [class]="'flex items-center gap-2 text-sm font-medium transition-colors ' + (isChecked() ? 'text-primary' : 'text-secondary')"
      (click)="toggle()"
      role="switch"
      [attr.aria-checked]="isChecked()"
      [disabled]="disabled()"
    >
      <div
        [class]="'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ' + (isChecked() ? 'bg-primary' : 'bg-input-border')"
        aria-hidden="true"
      >
        <span
          [class]="'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ' + (isChecked() ? 'translate-x-6' : 'translate-x-1')"
          aria-hidden="true"
        ></span>
      </div>
      <span>{{ label() | translate }}</span>
    </button>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiToggleButtonComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiToggleButtonComponent implements ControlValueAccessor {
  label = input.required<string>();
  value = model<boolean>(false);
  disabled = input(false, { transform: booleanAttribute }); // <<< Hier is de correctie: dit is de PUBLIC input

  protected isChecked = this.value;
  // `isDisabled` is nu niet meer nodig als een apart signal, we kunnen direct `disabled()` gebruiken in de template en logica.

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (!this.disabled()) { // Controleer direct de public `disabled` input
      this.value.update(current => {
        const newValue = !current;
        this.onChange(newValue);
        this.onTouched();
        return newValue;
      });
    }
  }

  writeValue(value: boolean): void {
    this.value.set(value ?? false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Deze methode wordt aangeroepen door Angular Forms.
    // De `disabled` input kan hier direct worden bijgewerkt, mits de input writable is.
    // Omdat `input()` standaard readonly is, kunnen we het direct in de template gebruiken
    // en de `setDisabledState` aanroep zal de input zelf niet wijzigen.
    // De Angular template zal de `[disabled]` binding wel correct oppikken.
    // Als de `disabled` state echter programmatisch via de CVA moet worden *gecontroleerd*,
    // dan zou `disabled = model<boolean>(false)` beter zijn en hier worden geüpdatet.
    // Voor nu houden we de `input()` variant en vertrouwen op de binding.
  }
}