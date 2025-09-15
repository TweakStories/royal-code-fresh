/**
 * @file quantity-input.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-15
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-06-15
 * @PromptSummary Generate a reusable UiQuantityInputComponent for managing item quantities.
 * @Description
 *   A standalone, reusable UI component for incrementing and decrementing a numerical value.
 *   It provides a user-friendly interface with plus/minus buttons, enforces min/max boundaries,
 *   and emits value changes. This component is essential for features like shopping carts and inventory management.
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  booleanAttribute,
  InputSignal,
  InputSignalWithTransform,
  OutputEmitterRef,
  Signal,
} from '@angular/core';

import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-quantity-input',
  standalone: true,
  imports: [UiButtonComponent, UiIconComponent],
  template: `
    <div class="flex items-center justify-center gap-2">
      <!-- Decrement knop -->
      <royal-code-ui-button
        type="outline"
        sizeVariant="icon"
        [isRound]="true"
        [disabled]="isDecrementDisabled()"
        (clicked)="decrement()"
        aria-label="Decrement quantity"
      >
        <royal-code-ui-icon [icon]="AppIcon.Minus" />
      </royal-code-ui-button>

      <!-- Weergave van de huidige waarde -->
      <span
        class="min-w-[2.5rem] text-center text-lg font-semibold tabular-nums text-foreground"
        aria-live="polite"
      >
        {{ value() }}
      </span>

      <!-- Increment knop -->
      <royal-code-ui-button
        type="outline"
        sizeVariant="icon"
        [isRound]="true"
        [disabled]="isIncrementDisabled()"
        (clicked)="increment()"
        aria-label="Increment quantity"
      >
        <royal-code-ui-icon [icon]="AppIcon.Plus" />
      </royal-code-ui-button>
    </div>
  `,
  styles: `
    :host {
    display: inline-block;
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiQuantityInputComponent {
  /** The current numerical value of the input. */
  readonly value: InputSignal<number> = input.required<number>();

  /** The minimum allowed value (inclusive). */
  readonly min: InputSignal<number> = input(1);

  /** The maximum allowed value (inclusive). */
  readonly max: InputSignal<number> = input(99);

  /** Disables all interactive elements of the component. */
  readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /** Emits the new value whenever it is changed by the user. */
  readonly valueChange: OutputEmitterRef<number> = output<number>();

  /** The enum for icons, exposed to the template. */
  protected readonly AppIcon = AppIcon;

  /** @description Computed signal to determine if the decrement button should be disabled. */
  readonly isDecrementDisabled: Signal<boolean> = computed(() => {
    return this.disabled() || this.value() <= this.min();
  });

  /** @description Computed signal to determine if the increment button should be disabled. */
  readonly isIncrementDisabled: Signal<boolean> = computed(() => {
    return this.disabled() || this.value() >= this.max();
  });

  /**
   * @method decrement
   * @description Decrements the current value by 1, respecting the minimum boundary.
   */
  decrement(): void {
    if (this.isDecrementDisabled()) {
      return;
    }
    this.valueChange.emit(this.value() - 1);
  }

  /**
   * @method increment
   * @description Increments the current value by 1, respecting the maximum boundary.
   */
  increment(): void {
    if (this.isIncrementDisabled()) {
      return;
    }
    this.valueChange.emit(this.value() + 1);
  }
}
