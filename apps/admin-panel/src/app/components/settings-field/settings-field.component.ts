/**
 * @file settings-field.component.ts
 * @Version 1.0.0
 * @Description Reusable layout component for a single setting field with label, help text, and input slot.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'admin-settings-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
      <div class="md:col-span-1 pt-1">
        <label [for]="forInputId()" class="font-medium text-foreground">{{ label() }}</label>
        @if (helpText()) {
          <p class="text-sm text-secondary mt-1">{{ helpText() }}</p>
        }
      </div>
      <div class="md:col-span-2">
        <ng-content />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFieldComponent {
  label = input.required<string>();
  helpText = input<string>();
  forInputId = input<string>();
}