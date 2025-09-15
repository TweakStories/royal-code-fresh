import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-info-icon',
  standalone: true,
  imports: [CommonModule, UiIconComponent],
  template: `
    <span class="inline-block ml-1 cursor-help" [title]="infoText()">
      <royal-code-ui-icon [icon]="AppIcon.HelpCircle" sizeVariant="xs" extraClass="text-secondary" />
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoIconComponent {
  infoText = input.required<string>();
  protected readonly AppIcon = AppIcon;
}