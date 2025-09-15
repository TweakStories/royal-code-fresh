/**
 * @file wishlist-item-card.component.ts
 * @Version 2.0.0 (Enhanced Variant Display)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description Presentational component for a single wishlist item, now with enhanced variant display, including color swatches.
 */
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WishlistItem } from '@royal-code/features/wishlist/domain';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { AddCartItemPayload, CartFacade } from '@royal-code/features/cart/core';
import { VariantAttributeType } from '@royal-code/features/products/domain'; // << TOEGEVOEGD

@Component({
  selector: 'droneshop-wishlist-item-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, CurrencyPipe,
    UiImageComponent, UiTitleComponent, UiButtonComponent, UiIconComponent, UiBadgeComponent
  ],
  template: `
    @if(item(); as wishlistItem) {
      <div class="flex flex-col sm:flex-row items-center gap-4 border border-border p-4 rounded-xs bg-card">
        <a [routerLink]="['/products', wishlistItem.productId]" class="flex-shrink-0 w-32 h-32 block">
          <royal-code-ui-image [src]="wishlistItem.productImageUrl ?? ''" [alt]="wishlistItem.productName" objectFit="cover" [rounding]="'xs'" />
        </a>
        <div class="flex-grow w-full">
          <a [routerLink]="['/products', wishlistItem.productId]">
            <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="wishlistItem.productName" extraClasses="hover:text-primary transition-colors !text-lg !mb-2" />
          </a>
          @if(wishlistItem.variantAttributes?.length) {
            <div class="flex flex-wrap gap-2 mb-2">
              @for(attr of wishlistItem.variantAttributes; track attr.attributeType) {
                <royal-code-ui-badge color="muted" [bordered]="true">
                  @if (attr.attributeType === VariantAttributeType.COLOR && attr.value) {
                    <!-- << DE FIX: Kleurbolletje voor Color attributen >> -->
                    <span class="w-3 h-3 rounded-full border border-border inline-block flex-shrink-0"
                          [style.background-color]="attr.value" role="img" [attr.aria-label]="attr.value + ' kleur'"></span>
                  }
                  <span>{{ attr.displayName }}: {{ attr.value }}</span>
                </royal-code-ui-badge>
              }
            </div>
          }
          <div class="flex items-baseline gap-2">
            <p class="text-xl font-bold text-primary">{{ wishlistItem.price | currency:wishlistItem.currency }}</p>
            @if(wishlistItem.originalPrice && wishlistItem.originalPrice > wishlistItem.price) {
              <p class="text-sm text-secondary line-through">{{ wishlistItem.originalPrice | currency:wishlistItem.currency }}</p>
            }
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto self-end">
          <royal-code-ui-button type="primary" (clicked)="addToCart(wishlistItem)">
            <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" extraClass="mr-2" />
            <span>{{ 'cart.addToCart' | translate }}</span>
          </royal-code-ui-button>
          <royal-code-ui-button type="outline" (clicked)="removeItem.emit(wishlistItem.id)">
            <royal-code-ui-icon [icon]="AppIcon.Trash2" />
          </royal-code-ui-button>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistItemCardComponent {
  readonly item = input.required<WishlistItem>();
  readonly removeItem = output<string>();
  
  private readonly cartFacade = inject(CartFacade);
  
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  protected readonly VariantAttributeType = VariantAttributeType; // << TOEGEVOEGD voor template

addToCart(item: WishlistItem): void {
    const payload: AddCartItemPayload = {
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      quantity: 1,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
      pricePerItem: item.price,
      selectedVariants: item.variantAttributes?.map(attr => ({
        name: attr.displayName,
        value: attr.value,
        displayValue: attr.colorHex ?? undefined 
      }))
    };
    this.cartFacade.addItem(payload);
  }


}