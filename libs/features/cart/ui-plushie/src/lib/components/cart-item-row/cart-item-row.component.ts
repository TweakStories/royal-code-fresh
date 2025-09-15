/**
 * @file cart-item-row.component.ts
 * @Version 3.5.0 (Image Fill & Rounding Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   A presentational component for a single item in the cart, now with the
 *   image correctly filling its container and a consistent rounding applied.
 */
import {
  Component, ChangeDetectionStrategy, input, output, InputSignal, OutputEmitterRef
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiQuantityInputComponent } from '@royal-code/ui/quantity-input';
import { AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { CartItem } from '@royal-code/features/cart/domain';
import { SortByVariantNamePipe } from '../../pipes/sort-by-variant-name.pipe';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiImageComponent } from '@royal-code/ui/media';

export interface QuantityChangeEvent { itemId: string; newQuantity: number; }

@Component({
  selector: 'plushie-royal-code-cart-item-row',
  standalone: true,
  imports: [
    CommonModule, RouterModule, CurrencyPipe,
    UiTitleComponent, UiParagraphComponent, UiButtonComponent, UiIconComponent,
    UiQuantityInputComponent, TranslateModule, SortByVariantNamePipe,
    UiBadgeComponent, UiImageComponent
  ],
  template: `
    <div class="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border py-4"
       [class.opacity-50]="item().syncStatus === 'pending'">
      <!-- Product Image (Link) -->
      <a [routerLink]="['/products', item().productId]"
         class="h-36 w-36 flex-shrink-0 block group overflow-hidden"
         style="line-height: 0;"> <!-- AANPASSING: line-height: 0 afgedwongen -->
        @if (item().productImageUrl) {
          <royal-code-ui-image [src]="item().productImageUrl" [alt]="item().productName ?? 'Productafbeelding'"
                                   objectFit="cover" [rounding]="'lg'" />
        } @else {
          <!-- Fallback indien geen afbeelding URL beschikbaar is -->
          <div class="w-full h-full rounded-xs bg-muted flex items-center justify-center text-muted-foreground border border-border rounded-lg">
            <royal-code-ui-icon [icon]="AppIcon.ImageOff" sizeVariant="md" />
          </div>
        }
      </a>


      <!-- Product Info -->
      <div class="flex flex-col justify-start items-start gap-1.5">
        <a [routerLink]="['/products', item().productId]">
          <royal-code-ui-title [level]="TitleTypeEnum.H4" [text]="item().productName ?? ('common.messages.loading' | translate)" extraClasses="hover:text-primary transition-colors !mb-0" />
        </a>

        <!-- RIJKE VARIANT WEERGAVE (NU MET UI-BADGE) -->
          @if (item().selectedVariants && item().selectedVariants!.length > 0) {
          <div class="flex items-center gap-2 flex-wrap">
            @for (variant of item().selectedVariants | sortByVariantName; track variant.name) {
              <royal-code-ui-badge color="muted" [bordered]="true">
                @if (variant.name === 'Color' && variant.displayValue) {
                  <!-- Dit bolletje wordt nu correct geprojecteerd -->
                  <span class="w-3 h-3 rounded-full border border-border inline-block flex-shrink-0" [style.background-color]="variant.displayValue" role="img" [attr.aria-label]="variant.value + ' kleur'"></span>
                }
                <!-- De gap-x-1.5 in UiBadgeComponent zorgt voor de ruimte -->
                <span>{{ variant.value }}</span>
              </royal-code-ui-badge>
            }
          </div>
        }

        <royal-code-ui-paragraph color="primary" extraClasses="font-semibold">
          {{ item().pricePerItem | currency:'EUR' }}
        </royal-code-ui-paragraph>

        <!-- Quantity Input (Mobile) -->
        <div class="mt-2 md:hidden">
          <royal-code-ui-quantity-input
            [value]="item().quantity"
            [disabled]="item().syncStatus !== 'synced'"
            (valueChange)="onQuantityChange($event)"
          />
        </div>
      </div>

      <!-- Actions & Totals -->
      <div class="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-8">
        <!-- Quantity Input (Desktop) -->
        <div class="hidden md:block">
          <royal-code-ui-quantity-input
            [value]="item().quantity"
            [disabled]="item().syncStatus !== 'synced'"
            (valueChange)="onQuantityChange($event)"
          />
        </div>
        <!-- Line Total -->
        <div class="w-24 text-right font-semibold text-foreground">
          {{ item().lineTotal | currency:'EUR' }}
        </div>
        <!-- Remove Button -->
        <royal-code-ui-button type="transparent" sizeVariant="icon" [disabled]="item().syncStatus !== 'synced'"
                                  (clicked)="remove.emit(item().id)" [attr.aria-label]="'shoppingCart.item.removeAriaLabel' | translate">
          <royal-code-ui-icon [icon]="AppIcon.Trash2" />
        </royal-code-ui-button>
      </div>
    </div>
  `,
  styles: [`:host { display: contents; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemRowComponent {
  readonly item: InputSignal<CartItem> = input.required<CartItem>();
  readonly quantityChange: OutputEmitterRef<QuantityChangeEvent> = output<QuantityChangeEvent>();
  readonly remove: OutputEmitterRef<string> = output<string>();

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  onQuantityChange(newQuantity: number): void {
    this.quantityChange.emit({ itemId: this.item().id, newQuantity });
  }
}