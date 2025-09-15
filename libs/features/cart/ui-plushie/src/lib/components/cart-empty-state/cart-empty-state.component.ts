/**
 * @file cart-empty-state.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-15
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-06-15
 * @PromptSummary Generate the presentational components for the cart page.
 * @Description
 *   A presentational component that displays a message and a call-to-action
 *   when the user's shopping cart is empty.
 */
import { Component, ChangeDetectionStrategy, output, OutputEmitterRef } from '@angular/core';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'plushie-royal-code-cart-empty-state',
  standalone: true,
  imports: [UiButtonComponent, UiTitleComponent, UiParagraphComponent, TranslateModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-4 rounded-xs border border-dashed border-border p-8 text-center">
      <royal-code-ui-title
        [level]="TitleTypeEnum.H3"
        [text]="'shoppingCart.overview.emptyCartTitle' | translate"
      />
      <royal-code-ui-paragraph color="primary" extraClasses="max-w-xs">
        {{ 'shoppingCart.overview.emptyCartDescription' | translate }}
      </royal-code-ui-paragraph>
      <royal-code-ui-button
        type="primary"
        (clicked)="shopNowClicked.emit()">
        {{ 'shoppingCart.overview.continueShopping' | translate }}
      </royal-code-ui-button>
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartEmptyStateComponent {
  /** @description Emits when the 'Verder winkelen' button is clicked. */
  readonly shopNowClicked: OutputEmitterRef<void> = output<void>();

  /** @description Exposes the TitleTypeEnum to the template for strong typing. */
  protected readonly TitleTypeEnum = TitleTypeEnum;
}
