/**
 * @file icon-text-row.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Een presentational component voor het weergeven van een enkele regel tekst
 *   met een bijbehorend icoon. Ideaal voor lijsten zoals "In de doos" items.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// UI Imports
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { AppIcon, IconTextRowData } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-icon-text-row',
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    UiIconComponent, UiParagraphComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data(); as d) {
      <div class="flex items-center text-foreground">
        <royal-code-ui-icon [icon]="d.icon" sizeVariant="md" extraClass="text-primary mr-3 flex-shrink-0" />
        <royal-code-ui-paragraph [text]="d.textKey | translate" size="md" color="foreground" />
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class UiIconTextRowComponent {
  data = input.required<IconTextRowData>();
}