/**
 * @file order-success-page.component.ts
 * @Version 1.1.0 (i18n Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-10
 * @Description
 *   Displays a confirmation message to the user after a successful order placement.
 *   This version is fully internationalized.
 */
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'plushie-royal-code-order-success-page',
  standalone: true,
  imports: [TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent],
  template: `
    <div class="container mx-auto px-4 py-16 text-center">
      <royal-code-ui-icon [icon]="AppIcon.CircleCheck" sizeVariant="xl" extraClass="text-success mx-auto mb-4" />
      <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'checkout.success.title' | translate"/>
      <royal-code-ui-paragraph color="muted" extraClasses="mt-2">
        {{ 'checkout.success.description' | translate }}
      </royal-code-ui-paragraph>
      @if (orderId(); as id) {
        <royal-code-ui-paragraph size="sm" extraClasses="mt-4">
          {{ 'checkout.success.orderNumber' | translate }} <span class="font-semibold text-primary">{{ id }}</span>
        </royal-code-ui-paragraph>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSuccessPageComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  readonly orderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id')))
  );
}
