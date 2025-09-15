/**
 * @file settings-card.component.ts
 * @Version 1.0.0
 * @Description Reusable card component for grouping settings.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-settings-card',
  standalone: true,
  imports: [CommonModule, UiTitleComponent],
  template: `
    <div class="bg-card border border-border rounded-xs shadow-sm">
      <div class="p-4 border-b border-border">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="title()" extraClasses="!mb-0" />
        @if (description()) {
          <p class="mt-1 text-sm text-secondary">{{ description() }}</p>
        }
      </div>
      <div class="p-4 space-y-4">
        <ng-content />
      </div>
      <footer class="bg-surface-alt border-t border-border px-4 py-3 text-right rounded-b-xs">
        <ng-content select="[footer]" />
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsCardComponent {
  title = input.required<string>();
  description = input<string>();
  protected readonly TitleTypeEnum = TitleTypeEnum;
}