/**
 * @file product-list-card.component.ts
 * @Version 3.2.0 (Corrected & Stabilized)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date HUIDIGE_DATUM
 * @Description
 *   The definitive, feature-complete implementation for a product in a list format.
 *   This version corrects a missing signal for selected color, resolving TS2339.
 */
import { Component, ChangeDetectionStrategy, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

// --- Domain, Core, Facades & Services ---
import { AppIcon } from '@royal-code/shared/domain';
import { Image, Media, MediaType } from '@royal-code/shared/domain';
import { Product, ProductVariantCombination, VariantAttributeType } from '@royal-code/features/products/domain';
import { ProductFacade, formatPrice, getProductCurrency, getProductOriginalPrice, getProductPrice } from '@royal-code/features/products/core';
import { CartFacade } from '@royal-code/features/cart/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { DynamicOverlayService } from '@royal-code/ui/overlay';

// --- UI Components ---
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiMediaSliderComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiColorOptionSelectorComponent, ColorOption } from '@royal-code/ui/variant-selector';
import { ProductQuickViewComponent } from '../product-quick-view/product-quick-view.component';
import { UiRatingComponent } from '@royal-code/ui/rating';

@Component({
  selector: 'royal-code-ui-product-list-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, UiIconComponent, UiButtonComponent,
    UiMediaSliderComponent, UiTitleComponent, UiParagraphComponent, UiColorOptionSelectorComponent,
    UiRatingComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product(); as p) {
      <div
        class="product-list-card group/list-card bg-card text-foreground rounded-xs shadow hover:shadow-lg transition-all duration-200 ease-out overflow-hidden flex flex-col sm:flex-row items-stretch border border-border hover:border-primary/30"
        role="article"
        [attr.aria-labelledby]="p.id + '-list-title'">

        <!-- Afbeelding Sectie met Slider -->
                <div class="relative flex-shrink-0 w-full sm:w-36 md:w-64 h-44 bg-muted">
          @if (displayImagesS().length > 0) {
            <royal-code-ui-media-slider
              [images]="displayImagesS()"
              [totalImageCount]="displayImagesS().length"
              [loop]="true"
              [showArrowsOnHover]="true"
              [showDots]="true"
              [aspectRatio]="'1/1'"
              [objectFit]="'cover'"
              [lazyLoad]="true"
              (imageClicked)="navigateToDetail(p.id)"
            />
          } @else {
            <div class="w-full h-full flex items-center justify-center bg-muted/50 text-secondary border border-border rounded-xs">
              <royal-code-ui-icon [icon]="AppIcon.ImageOff" sizeVariant="xl" />
            </div>
          }
        </div>


        <!-- Details & Acties Sectie -->
        <div class="flex-grow flex flex-col items-start min-w-0 p-3 sm:p-4">
          <a [routerLink]="['/products', p.id]">
            <royal-code-ui-title
              [level]="TitleTypeEnum.H3"
              [text]="p.name"
              [id]="p.id + '-list-title'"
              extraClasses="!text-base sm:!text-lg font-semibold text-foreground group-hover/list-card:text-primary transition-colors line-clamp-2 leading-tight !mb-1" />
          </a>
          
          <!-- Reviews -->
          <div class="flex items-center gap-2 text-xs text-secondary mb-2">
            @if (p.reviewCount && p.reviewCount > 0 && p.averageRating) {
              <royal-code-ui-rating [rating]="p.averageRating" [readonly]="true" size="sm" />
              <span class="ml-1 font-semibold text-foreground">{{ (p.averageRating / 2).toFixed(1) }}</span>
              <span class="ml-0.5">({{ p.reviewCount }})</span>
            } @else {
              <royal-code-ui-paragraph size="xs" extraClasses="italic text-muted-foreground">
                {{ 'products.noReviewsYet' | translate }}
              </royal-code-ui-paragraph>
            }
          </div>

          <div class="text-lg sm:text-xl font-bold text-primary">
            {{ currentPriceS() }}
            @if (currentOriginalPriceS(); as oldPriceStr) {
              <span class="ml-1.5 text-sm text-secondary line-through">
                {{ oldPriceStr }}
              </span>
            }
          </div>
          
          <div class="w-full flex-grow"></div> <!-- Spacer -->

          <!-- Kleur Selectie & Actieknop -->
          <div class="w-full flex items-center justify-between gap-4 mt-3">
            @if (colorOptionsS().length > 1) {
              <royal-code-ui-color-option-selector
                [options]="colorOptionsS()"
                [selectedOptionId]="selectedColorAttributeValueIdS()"
                (optionSelected)="onColorSelected($event)"
                [showCheckmarkOnSelected]="true"
              />
            } @else {
              <div></div> <!-- Lege div om layout te behouden -->
            }
            
            <royal-code-ui-button
              type="primary"
              sizeVariant="sm"
              (clicked)="onActionButtonClicked($event)"
              class="flex-shrink-0"
              [attr.aria-label]="(requiresVariantSelectionS() ? 'products.viewOptionsAria' : 'products.addToCartAria') | translate:{ name: p.name }">
              @if (requiresVariantSelectionS()) {
                <span class="hidden sm:inline">{{ 'products.viewOptions' | translate }}</span>
                <royal-code-ui-icon [icon]="AppIcon.Settings" sizeVariant="sm" extraClass="sm:ml-2" />
              } @else {
                 <span class="hidden sm:inline">{{ 'products.addToCart' | translate }}</span>
                <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" sizeVariant="sm" extraClass="sm:ml-2" />
              }
            </royal-code-ui-button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; width: 100%; }`]
})
export class ProductListCardComponent {
  productInput: InputSignal<Product | undefined> = input.required<Product | undefined>();
  
  private readonly productFacade = inject(ProductFacade);
  private readonly cartFacade = inject(CartFacade);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly overlayService = inject(DynamicOverlayService);

  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;

  readonly product: Signal<Product | undefined> = this.productInput;
  
  readonly selectedVariantS = computed(() => {
    const p = this.product();
    if (!p?.id || !p.variantCombinations?.length) return undefined;
    const selectedVariantId = this.productFacade.viewModel().selectedVariantCombinationIdByProduct[p.id];
    if (selectedVariantId) return p.variantCombinations.find(vc => vc.id === selectedVariantId);
    return p.variantCombinations.find(vc => vc.isDefault) ?? p.variantCombinations[0];
  });
  
  readonly currentPriceS = computed(() => {
    const p = this.product();
    return p ? formatPrice(getProductPrice(p, this.selectedVariantS()?.id), getProductCurrency(p)) : '';
  });

  readonly currentOriginalPriceS = computed(() => {
    const p = this.product();
    if (!p) return null;
    const originalPrice = getProductOriginalPrice(p, this.selectedVariantS()?.id);
    return originalPrice ? formatPrice(originalPrice, getProductCurrency(p)) : null;
  });

  readonly colorOptionsS = computed<ColorOption[]>(() => {
    const p = this.product();
    if (!p?.colorVariants || p.colorVariants.length === 0) return [];
    return p.colorVariants.map(cv => ({
      id: cv.attributeValueId,
      displayName: cv.displayName,
      colorValue: cv.colorHex ?? '#FFFFFF',
      isAvailable: true,
      variantCombinationId: cv.defaultVariantId,
    }));
  });

  // --- HIER IS DE FIX: De ontbrekende computed signal is toegevoegd ---
  readonly selectedColorAttributeValueIdS = computed(() => {
    const variant = this.selectedVariantS();
    const colorAttrId = this.product()?.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR)?.id;
    if (!variant || !colorAttrId) return null;
    return variant.attributes.find(a => a.attributeId === colorAttrId)?.attributeValueId;
  });
  
readonly displayImagesS = computed<Image[]>(() => {
    const p = this.product();
    if (!p) return [];
    
    // EXACT DEZELFDE LOGICA ALS DE HERO CARD:
    const selectedColorVariant = p.colorVariants?.find(cv => cv.attributeValueId === this.selectedColorAttributeValueIdS());
    
    if (selectedColorVariant?.media?.length) {
      return selectedColorVariant.media.filter((m): m is Image => m.type === MediaType.IMAGE);
    }
    
    // Fallback naar de algemene media van het product.
    return (p.media ?? []).filter((m): m is Image => m.type === MediaType.IMAGE);
  });


  readonly requiresVariantSelectionS = computed(() => {
    const p = this.product();
    if (!p?.variantAttributes) return false;
    return p.variantAttributes.some(attr => attr.isRequired);
  });
  
  onColorSelected(color: ColorOption): void {
    const p = this.product();
    if (p && color.variantCombinationId) {
      this.productFacade.selectVariantCombination(p.id, color.variantCombinationId);
    }
  }
  
  onActionButtonClicked(event: MouseEvent): void {
    event.stopPropagation();
    const p = this.product();
    if (!p) return;

    if (this.requiresVariantSelectionS()) {
      this.overlayService.open({
        component: ProductQuickViewComponent,
        data: { productId: p.id },
        panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
        backdropType: 'dark',
        closeOnClickOutside: true
      });
    } else {
      const payload = {
        productId: p.id,
        quantity: 1,
        variantId: this.selectedVariantS()?.id,
        productName: p.name,
        pricePerItem: getProductPrice(p, this.selectedVariantS()?.id),
        productImageUrl: this.displayImagesS()?.[0]?.variants?.[0]?.url,
        selectedVariants: [],
      };
      this.cartFacade.addItem(payload);
    }
  }

  navigateToDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }
}