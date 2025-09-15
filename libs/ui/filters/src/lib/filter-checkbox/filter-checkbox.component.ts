/**
 * @file filter-checkbox.component.ts
 * @Version 1.2.0 ("Stoere" UI, One-Way Binding)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-08-30
 * @Description
 *   Een enkele checkbox-item voor een filterlijst. Gebruikt nu een-richting
 *   data-binding (`[isChecked]`) en een output (`isCheckedChange`) voor robuustheid.
 */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'royal-code-ui-filter-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full rounded-none transition-colors duration-150 ease-in-out"
         [ngClass]="{
           'bg-primary': isChecked(),
           'hover:bg-hover': !isChecked()
         }">
      <label class="flex items-center w-full h-full cursor-pointer p-2" [for]="id()">
        <input
          type="checkbox"
          [id]="id()"
          [value]="value()"
          [checked]="isChecked()"
          (change)="onCheckboxChange($event)"
          class="h-4 w-4 text-primary focus:ring-primary border-border rounded-none"
        >
        <span class="ml-3 text-base font-medium"
              [ngClass]="{
                'text-primary-on': isChecked(),
                'text-foreground': !isChecked()
              }">
          {{ label() }}
          @if (count() !== null) {
            <span [ngClass]="{ 'text-primary-on/70': isChecked(), 'text-secondary': !isChecked() }">
              ({{ count() }})
            </span>
          }
        </span>
      </label>
    </div>
  `
})
export class FilterCheckboxComponent {
  readonly isChecked = input.required<boolean>();
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<any>();
  readonly count = input<number | null>(null);

  readonly isCheckedChange = output<boolean>();

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.isCheckedChange.emit(target.checked);
  }
}