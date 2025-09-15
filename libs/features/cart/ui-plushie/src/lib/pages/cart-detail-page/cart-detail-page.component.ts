/**
 * @file cart-detail-page.component.ts
 * @Version 2.0.0 (Type Fixes)
 */
import { Component, ChangeDetectionStrategy, inject, OnInit, effect,
 } from '@angular/core';

import { Router } from '@angular/router';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { CartItemsListComponent } from '../../components/cart-items-list/cart-items-list.component';
import { CartSummaryComponent } from '../../components/cart-summary/cart-summary.component';
import { CartEmptyStateComponent } from '../../components/cart-empty-state/cart-empty-state.component';
import { QuantityChangeEvent } from '../../components/cart-item-row/cart-item-row.component';
import { TranslateModule } from '@ngx-translate/core';
import { CartFacade } from '@royal-code/features/cart/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'plushie-royal-code-cart-detail-page',
  standalone: true,
  imports: [
    UiTitleComponent,
    UiSpinnerComponent,
    CartItemsListComponent,
    CartSummaryComponent,
    CartEmptyStateComponent,
    TranslateModule
],
  template: `
    <div class="container mx-auto px-4 py-8">
      <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'shoppingCart.overview.title' | translate" extraClasses="mb-8" />
      @if (facade.isLoading() && facade.isEmpty()) {
        <div class="flex h-96 items-center justify-center">
          <royal-code-ui-spinner size="xl" />
        </div>
      } @else if (facade.isEmpty()) {
        <plushie-royal-code-cart-empty-state (shopNowClicked)="navigateToProducts()" />
      } @else {
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <div class="lg:col-span-2">
            <plushie-royal-code-cart-items-list [items]="facade.viewModel().items"
                                        (quantityChange)="onQuantityChange($event)"
                                        (remove)="onRemoveItem($event)" />
          </div>
          <div class="lg:col-span-1">
            <plushie-royal-code-cart-summary [summary]="facade.viewModel()" [isSubmitting]="facade.isSubmitting()"
                                     (checkoutClicked)="onCheckout()" />
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDetailPageComponent implements OnInit {
  protected readonly facade = inject(CartFacade);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  protected readonly TitleTypeEnum = TitleTypeEnum;



  onQuantityChange(event: QuantityChangeEvent): void {
    this.facade.updateItemQuantity(event.itemId, event.newQuantity);
  }

  onRemoveItem(itemId: string): void {
    this.facade.removeItem(itemId);
  }

  onCheckout(): void { this.router.navigate(['/checkout']); }
  navigateToProducts(): void { this.router.navigate(['/products']); }

  constructor() {
    console.log(`%c[CartDetailPageComponent] CONSTRUCTOR: Initial facade state`, 'color: blue; font-weight: bold;', {
      isLoading: this.facade.isLoading(),
      isEmpty: this.facade.isEmpty(),
      itemCount: this.facade.viewModel().items.length
    });

    effect(() => {
      console.log(`%c[CartDetailPageComponent] EFFECT: ViewModel has changed.`, 'color: blue; font-weight: bold;', {
        isLoading: this.facade.isLoading(),
        isEmpty: this.facade.isEmpty(),
        items: this.facade.viewModel().items
      });
    });
  }

  ngOnInit(): void {
    // Deze methode blijft leeg.
  }
}
