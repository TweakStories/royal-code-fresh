/**
 * @file cart-items-list.component.ts
 * @Version 2.0.0 (Type Fixes)
 */
import { Component, ChangeDetectionStrategy, input, output, InputSignal, OutputEmitterRef } from '@angular/core';

import { CartItemRowComponent, QuantityChangeEvent } from '../cart-item-row/cart-item-row.component';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { TranslateModule } from '@ngx-translate/core';
import { CartItem } from '@royal-code/features/cart/domain';

@Component({
  selector: 'plushie-royal-code-cart-items-list',
  standalone: true,
  imports: [CartItemRowComponent, UiParagraphComponent, TranslateModule],
  template: `
    <div class="flow-root">
      <div class="divide-y divide-border">
        <div class="hidden md:grid md:grid-cols-[1fr_150px_100px_60px] md:gap-8 md:px-4 md:py-2">
          <royal-code-ui-paragraph extraClasses="font-semibold" color="muted">{{ 'shoppingCart.headers.product' | translate }}</royal-code-ui-paragraph>
          <royal-code-ui-paragraph extraClasses="font-semibold text-center" color="muted">{{ 'shoppingCart.headers.quantity' | translate }}</royal-code-ui-paragraph>
          <royal-code-ui-paragraph extraClasses="font-semibold text-right" color="muted">{{ 'shoppingCart.headers.total' | translate }}</royal-code-ui-paragraph>
        </div>
        @for (item of items(); track item.id) {
          <plushie-royal-code-cart-item-row [item]="item" (quantityChange)="quantityChange.emit($event)" (remove)="remove.emit($event)" />
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemsListComponent {
  readonly items: InputSignal<readonly CartItem[]> = input.required<readonly CartItem[]>();
  readonly quantityChange: OutputEmitterRef<QuantityChangeEvent> = output<QuantityChangeEvent>();
  readonly remove: OutputEmitterRef<string> = output<string>();
}
