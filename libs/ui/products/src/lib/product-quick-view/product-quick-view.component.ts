// --- VERVANG VOLLEDIG BESTAND: libs/ui/products/src/lib/product-quick-view/product-quick-view.component.ts ---
/**
 * @file product-quick-view.component.ts
 * @Version 5.0.0 (Definitieve Fix: Oneindige Loop & Type Safety)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-03
 * @Description
 *   De definitieve, enterprise-grade implementatie van de "Quick View" overlay.
 *   Deze versie corrigeert de oneindige lus die werd veroorzaakt door onjuiste
 *   variantselectie voor producten zonder variantcombinaties, en lost typefouten op.
 *   De component is nu robuust, type-veilig, en volgt strikt de Signal-architectuur.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, Signal, effect, OnDestroy, DestroyRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// --- Core, Facades & DI Tokens ---
import { ProductFacade, formatPrice, getProductCurrency, getProductOriginalPrice, getProductPrice, getStockDisplayInfo, isPhysicalProduct } from '@royal-code/features/products/core';
import { AddCartItemPayload, CartFacade } from '@royal-code/features/cart/core';
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';
import { Product, ProductVariantCombination, StockStatus, VariantAttributeType } from '@royal-code/features/products/domain';
import { Image, Media, MediaType, ProductQuickViewData } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { CartItemVariant } from '@royal-code/features/cart/domain';

// --- UI Components ---
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiImageComponent } from '@royal-code/ui/image';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import {
  ColorOption,
  SizeOption,
  UiColorOptionSelectorComponent,
  UiSizeOptionSelectorComponent,
} from '@royal-code/ui/variant-selector';
import { UiQuantityInputComponent } from '@royal-code/ui/quantity-input';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { NotificationService } from '@royal-code/ui/notifications';


@Component({
  selector: 'royal-code-ui-product-quick-view',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, UiSpinnerComponent,
    UiTitleComponent, UiParagraphComponent, UiImageComponent, UiButtonComponent,
    UiIconComponent, UiColorOptionSelectorComponent, UiSizeOptionSelectorComponent,
    UiQuantityInputComponent, UiRatingComponent
  ],
  template: `
    <div class="bg-card p-6 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative">
      <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="close()" extraClasses="!absolute top-3 right-3 z-10 text-secondary hover:text-foreground">
        <royal-code-ui-icon [icon]="AppIcon.X" />
      </royal-code-ui-button>

      @if (product(); as product) {
        <!-- Product is geladen en beschikbaar via 'product' variabele -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 overflow-y-auto pr-2 -mr-2">
          <!-- Afbeelding & Basisinfo -->
          <div class="flex flex-col items-center">
            <div class="w-full max-w-sm aspect-square rounded-xs overflow-hidden border border-border">
              @if (displayImage(); as img) {
                <royal-code-ui-image [src]="img.variants[0].url" [alt]="product.name" objectFit="cover" [lazyLoad]="false" />
              } @else {
                <div class="w-full h-full flex items-center justify-center bg-muted/50 text-secondary border border-border rounded-xs">
                  <royal-code-ui-icon [icon]="AppIcon.ImageOff" sizeVariant="xl" />
                </div>
              }

            </div>
          </div>

          <!-- Selectie & Acties -->
          <div class="flex flex-col">
            <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="product.name" extraClasses="!mb-1" />
            <div class="flex items-center gap-4 my-2">
                <royal-code-ui-rating [rating]="product.averageRating || 0" [readonly]="true" />
                <a [routerLink]="['/products', product.id]" (click)="close()" class="text-sm text-secondary hover:text-primary underline">
                  {{ (product.reviewCount || 0) + ' ' + ('common.reviews' | translate) }}
                </a>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-primary">{{ currentPriceS() }}</span>
              @if(currentOriginalPriceS(); as oldPrice) {
                <span class="text-lg text-secondary line-through">{{ oldPrice }}</span>
              }
            </div>

            <!-- Stock Status -->
            <royal-code-ui-paragraph size="sm" [color]="currentStockStatusS().colorClass" extraClasses="font-semibold flex items-center gap-1.5 mt-1" role="status">
              <royal-code-ui-icon [icon]="currentStockStatusS().icon" sizeVariant="sm" />
              {{ currentStockStatusS().text }}
            </royal-code-ui-paragraph>
            
            <div class="space-y-4 mt-6 border-t border-border pt-4">
              <!-- Variant Selectors -->
              @if (colorOptionsS().length > 0) {
                <royal-code-ui-color-option-selector [options]="colorOptionsS()" [selectedOptionId]="selectedColorId()" (optionSelected)="handleColorSelection($event)" [label]="'productDetail.selectColorLabel' | translate" />
              }
              @if (sizeOptionsS().length > 0) {
                <royal-code-ui-size-option-selector [options]="sizeOptionsS()" [selectedOptionId]="selectedSizeId()" (optionSelected)="handleSizeSelection($event)" [label]="'productDetail.selectSizeLabel' | translate" />
              }
              <!-- Andere attributen indien nodig -->
            </div>
            
            <div class="flex-grow"></div>

            <div class="flex items-center gap-4 pt-6 border-t border-border mt-6">
              <royal-code-ui-quantity-input [(value)]="quantityS" [min]="1" [max]="maxOrderQuantityS()" [disabled]="!isAddToCartEnabled()" />
              <royal-code-ui-button
                type="primary"
                sizeVariant="lg"
                (clicked)="addToCart()"
                [disabled]="!isAddToCartEnabled() || cartFacade.isSubmitting()"
                [useHueGradient]="true"
                [enableNeonEffect]="true"
                neonTheme="primary">
                @if (cartFacade.isSubmitting()) {
                  <royal-code-ui-spinner size="md" />
                } @else {
                  <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" sizeVariant="sm" extraClass="mr-2"/>
                  <span>{{ 'common.buttons.addToCart' | translate }}</span>
                }
              </royal-code-ui-button>
            </div>

            <a [routerLink]="['/products', product.id]" (click)="close()" class="block text-center mt-4 text-sm text-primary underline hover:text-primary/80">
              {{ 'productDetail.viewFullDetails' | translate }}
            </a>
          </div>
        </div>
      } @else if (productFacade.isLoading()) {
        <!-- Product is nog niet geladen, maar er is geen error -->
        <div class="flex items-center justify-center h-96">
          <royal-code-ui-spinner size="xl" />
        </div>
      } @else if (productFacade.error()) {
        <!-- Er is een fout opgetreden bij het laden -->
        <div class="flex flex-col items-center justify-center h-96 text-destructive gap-4">
          <royal-code-ui-icon [icon]="AppIcon.AlertCircle" sizeVariant="xl" />
          <royal-code-ui-paragraph size="lg" color="error">{{ 'productDetail.apiError' | translate }}</royal-code-ui-paragraph>
          <royal-code-ui-button type="outline" (clicked)="retryLoading()">{{ 'common.buttons.retry' | translate }}</royal-code-ui-button>
        </div>
      } @else {
        <!-- Product niet gevonden (of andere onverwachte lege staat) -->
        <div class="flex flex-col items-center justify-center h-96 text-secondary gap-4">
          <royal-code-ui-icon [icon]="AppIcon.SearchX" sizeVariant="xl" />
          <royal-code-ui-paragraph>{{ 'productDetail.notFound' | translate }}</royal-code-ui-paragraph>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: flex; align-items: center; justify-content: center; padding: 1rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductQuickViewComponent implements OnInit, OnDestroy {
  protected readonly productFacade = inject(ProductFacade);
  protected readonly cartFacade = inject(CartFacade);
  protected readonly overlayData: ProductQuickViewData = inject(DYNAMIC_OVERLAY_DATA);
  private readonly overlayRef = inject(DYNAMIC_OVERLAY_REF);
  private readonly translate = inject(TranslateService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef); // Injecteer DestroyRef

  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;

  protected quantityS = signal(1);
  protected readonly product = this.productFacade.selectedProduct; // Signal<Product | undefined>

  // === DERIVED SIGNALS (PURE & DEFENSIEF) ===
  
  readonly activeVariantCombinationS: Signal<ProductVariantCombination | undefined> = computed(() => {
    const p = this.product();
    if (!p?.variantCombinations?.length) {
      // Als er geen combinaties zijn, kan er geen combinatie geselecteerd zijn.
      // Belangrijk: Retourneer undefined.
      return undefined;
    }
    const selectedId = this.productFacade.viewModel().selectedVariantCombinationIdByProduct[p.id];
    if (selectedId) return p.variantCombinations.find(vc => vc.id === selectedId);
    return p.variantCombinations.find(vc => vc.isDefault) ?? p.variantCombinations[0];
  });

readonly selectedColorId: Signal<string | undefined> = computed(() => {
  const p = this.product();
  const variant = this.activeVariantCombinationS();
  
  // Als er geen product of geen variant is, default naar 'base'
  if (!p || !variant) return 'base';
  
  const colorAttrId = p.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR)?.id;
  if (!colorAttrId) return 'base';
  
  const selectedColorId = variant.attributes.find(a => a.attributeId === colorAttrId)?.attributeValueId;
  return selectedColorId ?? 'base';
});


  readonly selectedSizeId: Signal<string | undefined> = computed(() => {
    const p = this.product();
    const variant = this.activeVariantCombinationS();
    if (!p || !variant) return undefined;
    const sizeAttrId = p.variantAttributes?.find(a => a.type === VariantAttributeType.SIZE)?.id;
    return variant.attributes.find(a => a.attributeId === sizeAttrId)?.attributeValueId;
  });

readonly colorOptionsS: Signal<ColorOption[]> = computed(() => {
  const p = this.product(); 
  const options: ColorOption[] = [];
  
  // Voeg base/neutral option toe als eerste optie
  options.push({
    id: 'base',
    displayName: 'Alle opties', // Of een translate key
    colorValue: '#F5F5F5', // Lichtgrijs voor neutral
    isAvailable: true,
  });
  
  // Voeg specifieke kleurvarianten toe
  const colorAttr = p?.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR);
  if (colorAttr) {
    const colorOptions = colorAttr.values.map(val => ({
      id: val.id, 
      displayName: val.displayName, 
      colorValue: val.colorHex ?? '#FFFFFF', 
      isAvailable: val.isAvailable,
    }));
    options.push(...colorOptions);
  }
  
  return options;
});


  readonly sizeOptionsS: Signal<SizeOption[]> = computed(() => {
    const p = this.product(); 
    if (!p) return [];
    const sizeAttr = p.variantAttributes?.find(a => a.type === VariantAttributeType.SIZE);
    if (!sizeAttr) return [];

    const colorAttrId = p.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR)?.id;
    const selectedColorId = this.selectedColorId();

    return sizeAttr.values.map(sizeVal => {
      const isAvailable = p.variantCombinations?.some(combo => {
        const sizeMatch = combo.attributes.some(a => a.attributeId === sizeAttr.id && a.attributeValueId === sizeVal.id);
        const colorMatch = !colorAttrId || !selectedColorId || combo.attributes.some(a => a.attributeId === colorAttrId && a.attributeValueId === selectedColorId);
        return sizeMatch && colorMatch;
      }) ?? false;

      return { id: sizeVal.id, displayName: sizeVal.displayName, value: sizeVal.value, isAvailable: isAvailable, priceModifier: sizeVal.priceModifier ?? 0 };
    });
  });

  readonly currentPriceS = computed(() => {
    const p = this.product();
    return p ? formatPrice(getProductPrice(p, this.activeVariantCombinationS()?.id), getProductCurrency(p)) : '';
  });

  readonly currentOriginalPriceS = computed(() => {
    const p = this.product();
    if (!p) return null;
    const op = getProductOriginalPrice(p, this.activeVariantCombinationS()?.id);
    return op ? formatPrice(op, getProductCurrency(p)) : null;
  });
  
  // --- Hernoemd van displayImage naar displayImagesS (voor consistentie) ---
readonly displayImage = computed<Image | undefined>(() => {
  const p = this.product();
  if (!p) return undefined;

  const selectedColorId = this.selectedColorId();
  
  // Als 'base' geselecteerd of geen specifieke kleur, gebruik selectedVariant media
  if (!selectedColorId || selectedColorId === 'base') {
    // Voor product detail: gebruik de media van de huidige selectedVariant
    const activeVariant = this.activeVariantCombinationS();
    if (activeVariant) {
      // Zoek de variant combination in product.variantCombinations
      const variantCombo = p.variantCombinations?.find(vc => vc.id === activeVariant.id);
      if (variantCombo?.mediaIds?.length && p.media?.length) {
        const firstMediaId = variantCombo.mediaIds[0];
        const variantImage = p.media.find(m => m.id === firstMediaId);
        if (variantImage && variantImage.type === MediaType.IMAGE) {
          return variantImage as Image;
        }
      }
    }
    
    // Fallback naar algemene product media
    if (p.media?.length) {
      const featuredImage = p.media.find((m): m is Image => m.type === MediaType.IMAGE);
      if (featuredImage) return featuredImage;
    }
    
    return undefined;
  }

  // Specifieke kleur geselecteerd - gebruik color attribute media
  const colorAttribute = p.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR);
  const colorValue = colorAttribute?.values.find(v => v.id === selectedColorId);
  if (colorValue?.media?.length) {
    const variantImage = colorValue.media.find((m): m is Image => m.type === MediaType.IMAGE);
    if (variantImage) return variantImage;
  }

  // Fallback naar algemene product media
  if (p.media?.length) {
    const featuredImage = p.media.find((m): m is Image => m.type === MediaType.IMAGE);
    if (featuredImage) return featuredImage;
  }

  return undefined;
});

  readonly currentStockStatusS = computed(() => {
    const p = this.product();
    const v = this.activeVariantCombinationS();
    const qty = v?.stockQuantity ?? (isPhysicalProduct(p) ? p.stockQuantity : undefined);
    // Coalesce null naar undefined hier, voordat we het naar getStockDisplayInfo sturen.
    const status = (v?.stockStatus ?? (isPhysicalProduct(p) ? p.stockStatus : p?.stockStatus)) ?? undefined;
    return getStockDisplayInfo(p, v, qty, status, {
      translate: (key, params) => this.translate.instant(key, params),
    });
  });

  readonly isAddToCartEnabled = computed(() => {
    const variant = this.activeVariantCombinationS();
    if (!variant) return false;
    const stockStatus = variant.stockStatus;
    return stockStatus === StockStatus.IN_STOCK || stockStatus === StockStatus.LIMITED_STOCK;
  });
  
  readonly maxOrderQuantityS = computed(() => {
    const p = this.product();
    return isPhysicalProduct(p) ? (p.availabilityRules?.maxOrderQuantity ?? 99) : 99;
  });

constructor() {
    this.logger.info(`[ProductQuickViewComponent] Constructor: Product ID from overlay: ${this.overlayData.productId}`);
    
    // Laad het product via de facade.
    this.productFacade.selectProduct(this.overlayData.productId);

    // FIX: Aangepast effect om de oneindige lus te voorkomen
    effect(() => {
      const product = this.product();
      if (!product || !product.id) return; // Stop als er geen product is

      const selectedVariantIdInStore = this.productFacade.viewModel().selectedVariantCombinationIdByProduct[product.id];

      // Dit effect mag ALLEEN draaien als er nog GEEN selectie (zelfs geen null) in de store staat.
      if (selectedVariantIdInStore === undefined) {
        // Als het product varianten HEEFT, selecteer dan de default.
        if (product.variantCombinations && product.variantCombinations.length > 0) {
          this.logger.info(`[ProductQuickViewComponent] Product ${product.id} heeft varianten en geen selectie. Standaardvariant wordt geselecteerd.`);
          const defaultVariant = product.variantCombinations.find(v => v.isDefault) ?? product.variantCombinations[0];
          if (defaultVariant) {
            this.productFacade.selectVariantCombination(product.id, defaultVariant.id);
          }
        } else {
          // Als het product GEEN varianten heeft, doe dan NIETS. Dispatch geen actie.
          // De state blijft `undefined`, wat de correcte staat is.
          this.logger.debug(`[ProductQuickViewComponent] Product ${product.id} heeft geen varianten. Geen variantselectie-actie gedispatcht.`);
        }
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {}
  
ngOnDestroy(): void {
    // --- DE FIX: Alle state dispatches zijn hier verwijderd ---
    // De ProductHeroCardComponent is nu verantwoordelijk voor het opschonen van de state
    // nadat de overlay is gesloten. Dit voorkomt de NG0911 race condition.
    this.destroyRef.onDestroy(() => this.logger.debug(`[ProductQuickViewComponent] Component destroyed`));
  }


handleColorSelection(option: ColorOption): void { 
  if (option.id === 'base') {
    // Voor 'base' selectie: geen specifieke variant combination selecteren
    // Of selecteer de default variant
    const product = this.product();
    if (product?.variantCombinations?.length) {
      const defaultVariant = product.variantCombinations.find(v => v.isDefault) ?? product.variantCombinations[0];
      if (defaultVariant) {
        this.productFacade.selectVariantCombination(product.id, defaultVariant.id);
      }
    }
  } else {
    // Normale kleur selectie
    this.updateVariantSelection({ newColorId: option.id }); 
  }
}

handleSizeSelection(option: SizeOption): void { this.updateVariantSelection({ newSizeId: option.id }); }

  private updateVariantSelection({ newColorId, newSizeId }: { newColorId?: string; newSizeId?: string }): void {
      const product = this.product();
      if (!product?.variantCombinations?.length) {
          this.notificationService.showWarning(this.translate.instant('productDetail.errors.noCombinationsAvailable'));
          return;
      }
      const targetColorId = newColorId ?? this.selectedColorId();
      const targetSizeId = newSizeId ?? this.selectedSizeId();
      const colorAttrId = product.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR)?.id;
      const sizeAttrId = product.variantAttributes?.find(a => a.type === VariantAttributeType.SIZE)?.id;
      const bestMatch = product.variantCombinations.find(combo => {
        const colorMatch = !colorAttrId || !targetColorId || combo.attributes.some(a => a.attributeId === colorAttrId && a.attributeValueId === targetColorId);
        const sizeMatch = !sizeAttrId || !targetSizeId || combo.attributes.some(a => a.attributeId === sizeAttrId && a.attributeValueId === targetSizeId);
        return colorMatch && sizeMatch;
      });
      if (bestMatch) {
          this.productFacade.selectVariantCombination(product.id, bestMatch.id);
      } else {
          this.notificationService.showWarning(this.translate.instant('productDetail.errors.combinationUnavailable'));
      }
  }

  addToCart(): void {
    const product = this.product();
    const variant = this.activeVariantCombinationS();
    if (!product || !this.isAddToCartEnabled()) { // Guard clause
      this.notificationService.showError(this.translate.instant('productDetail.addToCartError'));
      return;
    }
    const selectedVariants: CartItemVariant[] = [];
    const colorAttr = product.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR);
    const sizeAttr = product.variantAttributes?.find(a => a.type === VariantAttributeType.SIZE);
    if (colorAttr && this.selectedColorId()) {
      const cv = colorAttr.values.find(v => v.id === this.selectedColorId());
      if(cv) selectedVariants.push({ name: 'Color', value: cv.displayName ?? '', displayValue: cv.colorHex ?? undefined }); // Fix type: ?? ''
    }
    if (sizeAttr && this.selectedSizeId()) {
      const sv = sizeAttr.values.find(v => v.id === this.selectedSizeId());
      if(sv) selectedVariants.push({ name: 'Size', value: sv.displayName ?? '' }); // Fix type: ?? ''
    }
    const payload: AddCartItemPayload = {
      productId: product.id,
      quantity: this.quantityS(),
      variantId: variant?.id, // Zal undefined zijn als geen combinaties bestaan
      productName: product.name,
      pricePerItem: getProductPrice(product, variant?.id),
      productImageUrl: this.displayImage()?.variants?.[0]?.url,
      selectedVariants: selectedVariants.length > 0 ? selectedVariants : undefined,
    };
    this.cartFacade.addItem(payload);
    this.close();
  }

  retryLoading(): void {
      if (this.overlayData.productId) {
          this.productFacade.selectProduct(this.overlayData.productId);
      }
  }

  close(): void {
    this.overlayRef.close();
  }
}