/**
 * @file slider.component.ts
 * @Version 2.5.0 (Definitive Layout Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-03
 * @Description
 *   A reusable slider component for numerical input. This version provides a
 *   definitive fix for the visual layout bug by creating an isolated relative
 *   container for the slider elements, ensuring correct absolute positioning
 *   of the fill-bar and value-label, independent of the component's main label.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-03
 * @PromptSummary Corrected slider layout by isolating slider elements in a new relative container.
 */
import { Component, ChangeDetectionStrategy, input, model, output, computed, signal, effect, OnChanges, SimpleChanges, Injector, inject, forwardRef, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'royal-code-ui-slider',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="w-full">
      @if (label()) {
        <label [for]="sliderId()" class="block text-sm font-medium text-foreground mb-2">{{ label() }}</label>
      }
      <!-- === HIER IS DE FIX: Een nieuwe relatieve container voor de slider-elementen === -->
      <div class="relative w-full h-6 flex items-center">
        <!-- Zichtbare achtergrond-balk -->
        <div class="absolute w-full h-2 bg-input-border rounded-xs pointer-events-none"></div>
        
        <!-- Zichtbare fill-balk -->
        <div class="absolute h-2 bg-primary rounded-xs pointer-events-none" [style.width.%]="fillPercentage()"></div>
        
        <!-- De functionele, maar grotendeels onzichtbare, input -->
        <input
          type="range"
          [id]="sliderId()"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="currentValue()"
          (input)="onSliderInput($event)"
          (change)="onSliderChange($event)"
          [disabled]="isDisabled()"
          class="absolute w-full h-2 appearance-none cursor-pointer bg-transparent slider-thumb"
          [attr.aria-label]="label()"
        >
        
        <!-- Het waarde-label, gepositioneerd relatief aan deze container -->
        @if (showValueLabel()) {
          <div class="absolute top-[-1.25rem] text-xs font-semibold bg-primary text-primary-on px-2 py-0.5 rounded-md -translate-x-1/2 pointer-events-none"
               [style.left.%]="valueLabelPosition()">
            {{ valueLabel() !== null ? valueLabel() : currentValue() }}
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* Styling voor de 'thumb' (het sleepbare rondje) */
    .slider-thumb {
      /* Zorg ervoor dat de thumb klikbaar is over de hele hoogte */
      height: 100%;
    }
    .slider-thumb::-webkit-slider-thumb {
      -webkit-appearance: none; /* Verwijder default styling */
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 9999px; /* Maak het perfect rond */
      background: var(--color-primary);
      cursor: grab;
      /* Een border met de achtergrondkleur creëert een 'losstaand' effect */
      border: 3px solid var(--color-background);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      margin-top: 0; /* Geen extra margin nodig door de nieuwe layout */
    }
    .slider-thumb::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 9999px;
      background: var(--color-primary);
      cursor: grab;
      border: 3px solid var(--color-background);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .slider-thumb:disabled::-webkit-slider-thumb,
    .slider-thumb:disabled::-moz-range-thumb {
      background: var(--color-secondary);
      cursor: not-allowed;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSliderComponent),
      multi: true
    }
  ]
})
export class UiSliderComponent implements ControlValueAccessor, OnChanges, OnInit {
  // Inputs
  readonly label = input<string | null>(null);
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly showValueLabel = input(true);
  readonly valueLabel = input<string | number | null>(null);

  // ControlValueAccessor properties
  private onChange = (value: number) => {};
  private onTouched = () => {};
  private _isDisabled = signal(false);
  readonly isDisabled = this._isDisabled.asReadonly();

  // Internal state
  private _currentValue = signal(this.min());
  readonly currentValue = this._currentValue.asReadonly();
  readonly sliderId = signal(`slider-${Math.random().toString(36).substring(2, 9)}`);

  // Computed properties
  readonly fillPercentage = computed(() => {
    const value = this._currentValue();
    const minVal = this.min();
    const maxVal = this.max();
    if (maxVal === minVal) return 0; // Voorkom delen door nul
    return ((value - minVal) / (maxVal - minVal)) * 100;
  });

  readonly valueLabelPosition = computed(() => {
    const percentage = this.fillPercentage();
    // Clamp de positie om te voorkomen dat het label buiten de balk valt
    return Math.max(0, Math.min(100, percentage));
  });

  private ngControl: NgControl | null = null;
  private destroyRef = inject(DestroyRef);

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      if (this.ngControl.control) {
        this.ngControl.control.statusChanges.pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {});
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['min'] || changes['max']) {
      this._currentValue.set(Math.max(this.min(), Math.min(this.max(), this.currentValue())));
    }
  }

  writeValue(value: any): void {
    const clampedValue = Math.max(this.min(), Math.min(this.max(), Number(value)));
    if (value !== null && !isNaN(clampedValue)) {
      this._currentValue.set(clampedValue);
    } else {
      this._currentValue.set(this.min());
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this._isDisabled.set(isDisabled); }

  onSliderInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this._currentValue.set(value);
    this.onChange(value);
  }

  onSliderChange(event: Event): void {
    this.onTouched();
  }
}