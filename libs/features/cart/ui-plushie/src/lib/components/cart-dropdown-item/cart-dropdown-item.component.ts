/**
 * @file cart-dropdown-item.component.ts
 * @Version 3.0.0 (Gebruikt UiProductLineItemComponent)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   De component voor een enkel cart item in de dropdown, nu geoptimaliseerd
 *   om de herbruikbare `UiProductLineItemComponent` te gebruiken voor een consistente
 *   weergave van productregelitems.
 */
import { Component, ChangeDetectionStrategy, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// UI Imports
import { TitleTypeEnum} from '@royal-code/shared/domain';
import { UiProductLineItemComponent } from '@royal-code/ui/products'; // <<< NIEUW TOEGEVOEGD

import { CartItem } from '@royal-code/features/cart/core'; // Originele CartItem input

@Component({
  selector: 'plushie-royal-code-cart-dropdown-item',
  standalone: true,
  imports: [
    UiProductLineItemComponent, // <<< Gebruikt de nieuwe component
    TranslateModule,
    // De onderstaande imports zijn niet meer direct nodig in de template van DIT component
    // maar zijn opgenomen in UiProductLineItemComponent.
    // CurrencyPipe, RouterLink, UiImageComponent, UiTitleComponent, UiParagraphComponent
  ],
  template: `
    @if (item(); as i) {
      <div (click)="linkClicked.emit()">
        <royal-code-ui-product-line-item
          [item]="{
            id: i.id,
            name: i.productName ?? ('common.messages.loading' | translate),
            imageUrl: i.productImageUrl,
            quantity: i.quantity,
            pricePerItem: i.pricePerItem ?? 0,
            lineTotal: i.lineTotal ?? (i.quantity * (i.pricePerItem ?? 0)),
            productId: i.productId,
            route: ['/products', i.productId]
          }"
        />
      </div>
    }
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDropdownItemComponent {
  /** @description The cart item data to display. */
  readonly item: InputSignal<CartItem> = input.required<CartItem>();

  /** @description Emits when the user clicks a link to navigate, signaling the parent to close. */
  readonly linkClicked: OutputEmitterRef<void> = output<void>();

  /** @description Exposes the TitleTypeEnum to the template. */
  protected readonly TitleTypeEnum = TitleTypeEnum; // Niet direct gebruikt, maar kan voor debug doeleinden blijven
}