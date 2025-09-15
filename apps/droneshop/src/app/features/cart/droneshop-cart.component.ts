/**
 * @file droneshop-cart.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-22
 * @Description Placeholder cart component voor de Droneshop app.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'droneshop-cart',
  standalone: true,
  imports: [CommonModule, UiTitleComponent, TranslateModule],
  template: `
    <div class="p-8 text-center">
      <royal-code-ui-title
        [level]="TitleTypeEnum.H1"
        [text]="'droneshop.cart.pageTitle' | translate"
        extraClasses="!text-4xl !font-bold mb-4"
      />
      <p class="text-secondary">{{ 'droneshop.cart.emptyMessage' | translate }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopCartComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
}