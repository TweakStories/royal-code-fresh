/**
 * @file ui-input.component.ts
 * @Version 9.3.0 (Definitive CVA - focusOnLoad Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description
 *   A reusable input component designed as a definitive, pure ControlValueAccessor.
 *   This version adds the `focusOnLoad` input property to programmatically
 *   focus the input element when it becomes visible.
 */
import {
  Component, ChangeDetectionStrategy, input, model, forwardRef, booleanAttribute, computed, signal, output, OutputEmitterRef, viewChild, ElementRef, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel' | 'date' | 'datetime-local' | 'month' | 'time' | 'week' | 'color' | 'range' | 'file';
export type IconPosition = 'left' | 'right';
export type InputSize = 'sm' | 'md' | 'lg' | 'none';

@Component({
  selector: 'royal-code-ui-input',
  standalone: true,
  imports: [CommonModule, UiIconComponent],
  template: `
    <div class="group relative" [ngClass]="extraContainerClasses()">
      @if (label()) {
        <label [for]="inputId()" [ngClass]="['block text-sm font-medium text-foreground mb-1', labelClasses()]">
          {{ label() }}
          @if (required()) { <span class="text-destructive">*</span> }
        </label>
      }
      <div class="relative">
        @if (icon() && iconPosition() === 'left') {
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <royal-code-ui-icon [icon]="icon()!" sizeVariant="sm" colorClass="text-secondary" />
          </div>
        }
        <!-- DE FIX: #inputElement toegevoegd voor ViewChild -->
        <input
          #inputElement
          [type]="type()"
          [id]="inputId()"
          [value]="value()"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
          (keydown.enter)="onEnterPressed($event)"
          [placeholder]="placeholder()"
          [attr.aria-label]="ariaLabel() || label()"
          [attr.aria-describedby]="ariaDescribedBy()"
          [attr.aria-required]="required()"
          [attr.min]="min()"
          [attr.max]="max()"
          [attr.step]="step()"
          [attr.multiple]="multiple()"
          [attr.accept]="accept()"
          [readonly]="readonly()"
          [autocomplete]="autocomplete()"
          [disabled]="isDisabled()"
          [ngClass]="inputClasses()">
        @if (appendButtonIcon()) {
          <button
            type="button"
            (click)="onAppendButtonClick($event)"
            [attr.aria-label]="appendButtonAriaLabel() || 'Actie'"
            [ngClass]="appendButtonClasses()">
            <royal-code-ui-icon [icon]="appendButtonIcon()!" sizeVariant="sm" />
          </button>
        } @else if (icon() && iconPosition() === 'right') {
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <royal-code-ui-icon [icon]="icon()!" sizeVariant="sm" colorClass="text-secondary" />
          </div>
        }
      </div>
      @if (hasErrors() && !hideValidationMessages()) {
        <p class="mt-2 text-sm text-destructive" [attr.id]="inputId() + '-error'">
          {{ error() }}
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true
    }
  ]
})
export class UiInputComponent implements ControlValueAccessor {
  readonly label = input<string | undefined>();
  readonly placeholder = input<string>('');
  readonly type = input<InputType>('text');
  readonly icon = input<AppIcon | undefined>();
  readonly iconPosition = input<IconPosition>('left');
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly autocomplete = input<string>('off');
  readonly extraClasses = input<string>('');
  readonly extraContainerClasses = input<string>('');
  readonly min = input<number | undefined>();
  readonly max = input<number | undefined>();
  readonly step = input<number | undefined>();
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly accept = input<string | undefined>();
  readonly sizeVariant = input<InputSize>('md');
  readonly error = input<string | undefined>();
  readonly hideValidationMessages = input(false, { transform: booleanAttribute });
  readonly explicitId = input<string | undefined>();
  readonly ariaLabel = input<string | undefined>();
  readonly ariaDescribedBy = input<string | undefined>();
  readonly labelClasses = input<string>('');
  
  readonly appendButtonIcon = input<AppIcon | undefined>();
  readonly appendButtonAriaLabel = input<string | undefined>();
  readonly extraButtonClasses = input<string>('');
  readonly enterPressed: OutputEmitterRef<string> = output<string>();
  readonly appendButtonClicked: OutputEmitterRef<string> = output<string>();

  // DE FIX: Nieuwe input property
  readonly focusOnLoad = input(false, { transform: booleanAttribute });

  value = model<any>(null);

  readonly isDisabled = signal(false);
  readonly inputId = computed(() => this.explicitId() || `input-${Math.random().toString(36).substring(2, 9)}`);
  readonly hasErrors = computed(() => !!this.error());

  // DE FIX: ViewChild om het native input element te krijgen
  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');

  private onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    // DE FIX: Effect om de focus in te stellen wanneer de component laadt en focusOnLoad true is.
    effect(() => {
      if (this.focusOnLoad() && this.inputElement()) {
        // Gebruik een kleine timeout om er zeker van te zijn dat het element volledig
        // in de DOM is gerenderd en zichtbaar is, vooral na een animatie.
        setTimeout(() => {
          this.inputElement().nativeElement.focus();
        }, 0);
      }
    });
  }

  writeValue(value: any): void { this.value.set(value); }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
  
  onInputChange(event: Event): void {
    const newValue = (event.target as HTMLInputElement).value;
    this.value.set(newValue);
    this.onChange(newValue);
  }

  onEnterPressed(event: Event): void {
    event.preventDefault();
    this.enterPressed.emit(this.value());
  }

  onAppendButtonClick(event: Event): void {
    event.preventDefault();
    this.appendButtonClicked.emit(this.value());
  }

  readonly inputClasses = computed(() => {
    const commonClasses = 'block w-full rounded-xs shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary disabled:opacity-75 disabled:cursor-not-allowed transition-colors ease-in-out';
    const textInputClasses = 'bg-background text-text placeholder:text-placeholder';
    let sizeClass = '';
    const size = this.sizeVariant();
    if (size !== 'none') {
      sizeClass = { sm: 'py-1.5 px-3 text-sm sm:leading-6', md: 'py-2 px-3 text-sm sm:leading-6', lg: 'py-2.5 px-4 text-base' }[size] || '';
    }
    const paddingLeft = (this.icon() && this.iconPosition() === 'left') ? 'pl-10' : '';
    const paddingRight = (this.icon() && this.iconPosition() === 'right') || this.appendButtonIcon() ? 'pr-10' : ''; 
    return `${commonClasses} ${textInputClasses} ${sizeClass} ${paddingLeft} ${paddingRight} ${this.extraClasses()}`;
  });

  readonly appendButtonClasses = computed(() => {
    const baseClasses = 'absolute right-0 top-0 h-full px-3 text-secondary hover:text-primary focus:outline-none focus:text-primary rounded-none';
    return `${baseClasses} ${this.extraButtonClasses()}`;
  });
}