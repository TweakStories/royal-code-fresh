/**
 * @file order-summary.component.ts
 * @Version 3.0.0 (Geïntegreerde UiProductLineItemComponent)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Dit is de definitieve OrderSummaryComponent, nu geoptimaliseerd om de
 *   nieuwe, herbruikbare `UiProductLineItemComponent` te gebruiken voor de
 *   weergave van individuele orderregels. Dit verhoogt consistentie en
 *   onderhoudbaarheid.
 */
import { Component, ChangeDetectionStrategy, input, Signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CartViewModel } from '@royal-code/features/cart/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum, ProductLineItemData} from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiProductLineItemComponent } from '@royal-code/ui/products'; 

@Component({
  selector: 'plushie-royal-code-order-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiProductLineItemComponent, CurrencyPipe],
  template: `
    <aside class="sticky top-24 rounded-xs border border-border bg-surface-alt p-4 sm:p-6 lg:p-8">
      <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'checkout.orderSummary.title' | translate" />
      @if (summary(); as data) {
        <div class="mt-6 space-y-4">
          <!-- Item List -->
          <div class="space-y-4">
            @for (item of data.items; track item.id) {
              <royal-code-ui-product-line-item [item]="mapCartItemToProductLineItem(item)" />
            }
          </div>
          <!-- Financials -->
          <div class="space-y-2 border-t border-border pt-4">
            <div class="flex justify-between text-sm">
              <royal-code-ui-paragraph color="muted">{{ 'checkout.orderSummary.subtotal' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph extraClasses="font-medium">{{ data.subTotal | currency:'EUR' }}</royal-code-ui-paragraph>
            </div>
            <div class="flex justify-between text-sm">
              <royal-code-ui-paragraph color="muted">{{ 'checkout.orderSummary.shippingCosts' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph extraClasses="font-medium">{{ data.shippingCost | currency:'EUR' }}</royal-code-ui-paragraph>
            </div>
          </div>
          <div class="flex justify-between border-t border-border pt-4 text-base font-semibold">
            <royal-code-ui-paragraph>{{ 'checkout.orderSummary.total' | translate }}</royal-code-ui-paragraph>
            <royal-code-ui-paragraph>{{ data.totalWithShipping | currency:'EUR' }}</royal-code-ui-paragraph>
          </div>
            <!-- VAT Information -->
            @if(data.totalVatAmount !== undefined && data.totalVatAmount !== null) {
          <div class="flex justify-between text-xs text-muted mt-1 pt-2 border-t border-dashed border-border/50">
              <royal-code-ui-paragraph>{{ 'checkout.orderSummary.includingVat' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph>{{ data.totalVatAmount | currency:'EUR' }}</royal-code-ui-paragraph>
          </div>
          }
        </div>
      } @else {
        <div class="mt-6 text-center text-muted">{{ 'checkout.orderSummary.loading' | translate }}</div>
      }
    </aside>
  `,
  styles: [` :host { display: block; } `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummaryComponent {
  /** @description The cart view model containing all data for the summary. */
  readonly summary = input.required<CartViewModel | null>();
  protected readonly TitleTypeEnum = TitleTypeEnum;

  protected mapCartItemToProductLineItem(cartItem: CartViewModel['items'][0]): ProductLineItemData {
    return {
      id: cartItem.id,
      name: cartItem.productName,
      imageUrl: cartItem.productImageUrl,
      quantity: cartItem.quantity,
      pricePerItem: cartItem.pricePerItem ?? 0,
      lineTotal: cartItem.lineTotal,
      productId: cartItem.productId,
      route: ['/products', cartItem.productId] // Maak een route als voorbeeld
    };
  }
}