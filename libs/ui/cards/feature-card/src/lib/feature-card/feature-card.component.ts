/**
 * @file ui-feature-card.component.ts
 * @Version 1.0.1 (Rounded-xs & Primary Hover)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Een herbruikbare kaartcomponent voor het weergeven van een feature of belofte.
 *   Nu met `rounded-xs` styling en een duidelijke 'primary' hover-state.
 */
import { ChangeDetectionStrategy, Component, input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';

@Component({
  selector: 'royal-code-ui-feature-card',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    UiIconComponent,
    UiTitleComponent,
    UiParagraphComponent,
  ],
  template: `
    <div class="flex items-start p-6 bg-surface border border-border rounded-lg shadow-sm group hover:border-primary hover:bg-surface-alt transition-all duration-200 ease-out">
      <div class="flex-shrink-0 text-primary mr-4">
        <royal-code-ui-icon [icon]="icon()" sizeVariant="xl" extraClass="w-10 h-10" />
      </div>
      <div>
        <royal-code-ui-title
          [level]="TitleTypeEnum.H3"
          [text]="titleKey() | translate"
          extraClasses="!text-lg !font-semibold !mb-2 group-hover:text-primary transition-colors" />
        <royal-code-ui-paragraph
          [text]="descriptionKey() | translate"
          size="sm"
          color="muted"
          [extraClasses]="textWrap() ? 'whitespace-pre-line' : ''" />
      </div>
    </div>
  `,
  styles: [`:host { display: block; height: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFeatureCardComponent {
  readonly icon = input.required<AppIcon>();
  readonly titleKey = input.required<string>();
  readonly descriptionKey = input.required<string>();
  readonly textWrap = input(false, { transform: booleanAttribute });

  protected readonly TitleTypeEnum = TitleTypeEnum;
}