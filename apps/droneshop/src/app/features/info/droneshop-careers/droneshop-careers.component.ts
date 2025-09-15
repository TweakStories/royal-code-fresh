/**
 * @file droneshop-careers.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description Placeholder component for the careers page.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'droneshop-careers',
  standalone: true,
  imports: [CommonModule, UiTitleComponent, TranslateModule, UiParagraphComponent, UiButtonComponent],
  template: `
    <div class="p-8 text-center container-max py-12 px-4">
      <royal-code-ui-title
        [level]="TitleTypeEnum.H1"
        [text]="'careersPage.title' | translate"
        extraClasses="!text-4xl !font-bold mb-4"
      />
      <royal-code-ui-paragraph color="muted" extraClasses="max-w-2xl mx-auto mb-8">
        {{ 'careersPage.subtitle' | translate }}
      </royal-code-ui-paragraph>
      <a href="mailto:roy_wetering@outlook.com">
        <royal-code-ui-button type="primary" sizeVariant="lg">
          {{ 'careersPage.cta' | translate }}
        </royal-code-ui-button>
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopCareersComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
}