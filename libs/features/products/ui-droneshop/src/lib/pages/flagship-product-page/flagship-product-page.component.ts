/**
 * @file flagship-product-page.component.ts
 * @Version 1.2.0 (FIXED: Authentication Guard for Reviews)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-08
 * @Description
 *   The definitive, reusable UI blueprint for flagship product pages.
 *   This version adds an authentication check to the 'write review' functionality,
 *   preventing non-authenticated users from opening the review form.
 */
import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // DecimalPipe toegevoegd voor prijsformat
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Domain & Core Imports (corrected paths)
import { Product, isPhysicalProduct, ProductVariantCombination, StockStatus, VariantAttributeType } from '@royal-code/features/products/domain';
import { AppIcon, Image, Media, MediaType } from '@royal-code/shared/domain';
import { ReviewTargetEntityType } from '@royal-code/features/reviews/domain';
import { StockDisplayInfo, getStockDisplayInfo, formatPrice, getProductCurrency, getProductOriginalPrice, getProductPrice } from '@royal-code/features/products/core';
import { filterImageMedia } from '@royal-code/shared/utils';

// UI & Service Imports
import { UiFeaturedMediaGalleryComponent } from '@royal-code/ui/media';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiWishlistButtonComponent } from '@royal-code/ui/wishlist';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiQuantityInputComponent } from '@royal-code/ui/quantity-input';
import { UiColorOptionSelectorComponent, UiSizeOptionSelectorComponent, ColorOption, SizeOption } from '@royal-code/ui/variant-selector';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { ReviewListComponent, ProductReviewSummaryComponent, CreateReviewFormComponent } from '@royal-code/features/reviews/ui-plushie';
import { TeamComponent } from '@royal-code/ui/team';
import { CartFacade, AddCartItemPayload } from '@royal-code/features/cart/core';
import { ReviewsFacade } from '@royal-code/features/reviews/core';
import { NotificationService } from '@royal-code/ui/notifications';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { CartItemVariant } from '@royal-code/features/cart/domain';
import { RouterModule } from '@angular/router';
import { UiStatCardComponent } from '@royal-code/ui/cards/stat-card';
import { AuthFacade } from '@royal-code/store/auth';

@Component({
  selector: 'droneshop-flagship-product-page',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, RouterModule, // DecimalPipe en RouterModule toegevoegd
    UiFeaturedMediaGalleryComponent, UiImageComponent, UiTitleComponent,
    UiParagraphComponent, UiRatingComponent, UiButtonComponent, UiIconComponent,
    UiQuantityInputComponent, UiColorOptionSelectorComponent, UiSizeOptionSelectorComponent,
    ReviewListComponent, ProductReviewSummaryComponent,
    UiSpinnerComponent, UiWishlistButtonComponent, TeamComponent, UiStatCardComponent
  ],
  template: `
    @if (product(); as p) {
      <div class="flagship-product-page bg-background text-foreground space-y-16 md:space-y-24">
        <!-- Sectie 1: Immersive Hero Intro -->
        <section class="relative h-[80vh] flex items-center justify-center text-center text-white overflow-hidden p-4 md:p-8">
          <royal-code-ui-image
            [src]="heroImage()?.variants?.[0]?.url || 'images/default-image.webp'"
            [alt]="heroImage()?.altText || p.name"
            objectFit="cover"
            extraClasses="absolute inset-0 w-full h-full z-0"
            [rounding]="'none'"
          />
          <div class="absolute inset-0 bg-black/60 z-10"></div>
          <div class="relative z-20 max-w-4xl animate-fade-in">
            <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="p.name" extraClasses="!text-5xl md:!text-7xl !font-extrabold !text-white [text-shadow:0_3px_10px_rgba(0,0,0,0.8)]"/>
            <royal-code-ui-paragraph extraClasses="max-w-3xl mx-auto mt-4 text-xl md:text-2xl font-semibold text-white/90 [text-shadow:0_2px_6px_rgba(0,0,0,0.7)]">
              {{ p.shortDescription }}
            </royal-code-ui-paragraph>
          </div>
        </section>

        <!-- Sectie 2: Main Purchase Zone -->
        <section class="container-max px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <!-- Linkerkolom: Galerij -->
          <div class="sticky top-24 self-start">
            <royal-code-ui-featured-media-gallery [allMedia]="getProductMedia(p)" />
          </div>

          <!-- Rechterkolom: Aankoopdetails -->
          <div class="space-y-4">
            <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="p.name" />
            <royal-code-ui-paragraph size="sm" color="muted">
              {{ 'productDetail.byBrand' | translate }}
              <span class="font-semibold text-foreground">{{ isPhysicalProduct(p) ? p.brand : 'Droneshop' }}</span>
            </royal-code-ui-paragraph>
            <div class="flex items-center gap-4">
              <royal-code-ui-rating [rating]="p.averageRating || 0" [readonly]="true" />
              <a href="#reviews" class="text-sm text-secondary hover:text-primary underline">
                {{ p.reviewCount || 0 }} {{ 'productDetail.reviewsCount' | translate }}
              </a>
            </div>
            <div class="p-4 bg-surface-alt rounded-xs border border-border space-y-2">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-primary">{{ formatPrice(currentPrice(), getProductCurrency(p)) }}</span>
                @if(currentOriginalPrice(); as oldPrice) {
                  <span class="text-lg text-secondary line-through">{{ formatPrice(oldPrice, getProductCurrency(p)) }}</span>
                }
              </div>
              <royal-code-ui-paragraph size="sm" [color]="stockStatusDisplay().colorClass" extraClasses="font-semibold flex items-center gap-1.5">
                <royal-code-ui-icon [icon]="stockStatusDisplay().icon" sizeVariant="sm" />
                {{ stockStatusDisplay().text }}
              </royal-code-ui-paragraph>
            </div>
            <!-- Variant Selectors -->
            @if (colorOptions().length > 0) {
              <royal-code-ui-color-option-selector [options]="colorOptions()" [selectedOptionId]="selectedColorId()" (optionSelected)="handleColorSelection($event)" [label]="'Kleur'" />
            }
            @if (sizeOptions().length > 0) {
              <royal-code-ui-size-option-selector
                [options]="sizeOptions()"
                [selectedOptionId]="selectedSizeId()"
                (optionSelected)="handleSizeSelection($event)"
                [label]="'Maat'"
                [currency]="getProductCurrency(p)" />
            }
            <!-- Aankoop Acties -->
            <div class="flex items-center gap-4 pt-4">
              <royal-code-ui-quantity-input [(value)]="quantityS" [min]="1" [max]="maxOrderQuantity()" [disabled]="!isAddToCartEnabled()" />
              <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="addToCart()" [disabled]="!isAddToCartEnabled() || cartFacade.isSubmitting()" extraClasses="flex-grow" [enableNeonEffect]="true">
                @if(cartFacade.isSubmitting()) { <royal-code-ui-spinner size="md"/> } @else { <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" extraClass="mr-2"/><span>Toevoegen</span> }
              </royal-code-ui-button>
              <royal-code-ui-wishlist-button [productId]="p.id" [variantId]="activeVariant()?.id" />
            </div>
          </div>
        </section>

        <!-- Sectie 3: De Droneshop RTF Belofte (re-use) -->
        @defer (on viewport) {
          <section class="container-max px-4">
            <royal-code-ui-title
              [level]="TitleTypeEnum.H2"
              text="Gebouwd om te Presteren. Gebouwd om Lang Mee te Gaan."
              extraClasses="!text-3xl md:!text-4xl !text-center !mb-4" />
            <royal-code-ui-paragraph color="muted" extraClasses="text-center max-w-3xl mx-auto mb-12">
              Elke Droneshop RTF drone is het resultaat van talloze uren expertise. We selecteren alleen de beste componenten en assembleren elke drone met een obsessie voor detail, zodat jij je kunt focussen op wat echt telt: vliegen.
            </royal-code-ui-paragraph>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <royal-code-ui-stat-card [icon]="AppIcon.Cpu" label="Premium Componenten" value="Bewezen hardware van Foxeer, RCINPOWER, en RadioMaster." [textWrap]="true" />
              <royal-code-ui-stat-card [icon]="AppIcon.Wrench" label="Professionele Assemblage" value="Nette bedrading, waterdichte conformal coating en stevige solderingen." [textWrap]="true" />
              <royal-code-ui-stat-card [icon]="AppIcon.CheckCircle" label="Getest & Getuned" value="Elke drone krijgt een basis-tune en wordt uitvoerig getest voor verzending." [textWrap]="true" />
            </div>
          </section>
        } @placeholder { <div class="h-96 w-full bg-surface-alt animate-pulse"></div> }

        <!-- Sectie X: Reviews -->
        @defer(on viewport) {
          <section class="container-max px-4" id="reviews">
            <div class="pb-4 border-b border-border flex justify-between items-center mb-6">
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'Reviews (' + (reviewsFacade.reviewSummary()?.totalReviews ?? 0) + ')' | translate" />
              <royal-code-ui-button type="primary" (clicked)="openCreateReviewModal()">{{ 'productDetail.writeReviewButton' | translate }}</royal-code-ui-button>
            </div>
            @if(reviewsFacade.reviewSummary(); as summary) {
              <plushie-royal-code-review-summary [summary]="summary" />
            }
            <plushie-royal-code-review-list />
          </section>
        } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }

         <!-- Sectie Laatste: Ons Team -->
        @defer(on viewport) {
          <section class="container-max px-4">
            <royal-code-ui-team />
          </section>
        } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }
      </div>
    } @else {
      <div class="flex items-center justify-center h-96">
        <royal-code-ui-spinner size="xl" />
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .flagship-product-page video { transform: translate(-50%, -50%); } /* Fix voor object-fit */
  `]
})
export class FlagshipProductPageComponent implements OnInit {
  // === Inputs ===
  product = input.required<Product>();

  // === Dependencies ===
  protected readonly cartFacade = inject(CartFacade);
  protected readonly reviewsFacade = inject(ReviewsFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly authFacade = inject(AuthFacade);
  
  // === Internal UI State ===
  protected readonly quantityS = signal(1);
  protected readonly selectedColorId = signal<string | undefined>(undefined);
  protected readonly selectedSizeId = signal<string | undefined>(undefined);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  protected isPhysicalProduct = isPhysicalProduct;

  
  // === UI State Signals ===
  readonly isAuthenticated = this.authFacade.isAuthenticated; 



  constructor() {
    effect(() => {
      const p = this.product();
      if (p) {
        const defaultVariant = p.variantCombinations?.find((v: ProductVariantCombination) => v.isDefault) ?? p.variantCombinations?.[0];
        if (defaultVariant) {
          this.updateVariantSignals(defaultVariant);
        }
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.reviewsFacade.setContext(this.product().id, ReviewTargetEntityType.PRODUCT);
  }

  // === Computed Signals for UI Derivation ===
  readonly activeVariant = computed<ProductVariantCombination | undefined>(() => {
    const p = this.product();
    if (!p.variantCombinations?.length) return undefined;

    const colorAttrId = p.variantAttributes?.find((a) => a.type === VariantAttributeType.COLOR)?.id;
    const sizeAttrId = p.variantAttributes?.find((a) => a.type === VariantAttributeType.SIZE)?.id;

    return p.variantCombinations.find((combo: ProductVariantCombination) => {
      const colorMatch = !colorAttrId || !this.selectedColorId() || combo.attributes.some(a => a.attributeId === colorAttrId && a.attributeValueId === this.selectedColorId());
      const sizeMatch = !sizeAttrId || !this.selectedSizeId() || combo.attributes.some(a => a.attributeId === sizeAttrId && a.attributeValueId === this.selectedSizeId());
      return colorMatch && sizeMatch;
    });
  });

  readonly heroImage = computed<Image | undefined>(() => {
    const featuredMedia = this.product().media?.find((m: Media): m is Image => m.type === MediaType.IMAGE);
    return featuredMedia || filterImageMedia(this.product().media)?.[0];
  });

  readonly colorOptions = computed<ColorOption[]>(() => {
    const colorAttr = this.product().variantAttributes?.find((a) => a.type === VariantAttributeType.COLOR);
    if (!colorAttr) return [];
    return colorAttr.values.map((val) => ({
      id: val.id, displayName: val.displayName, colorValue: val.colorHex ?? '#FFFFFF', isAvailable: val.isAvailable
    }));
  });

  readonly sizeOptions = computed<SizeOption[]>(() => {
    const p = this.product();
    if (!p) return [];

    const sizeAttr = p.variantAttributes?.find(a => a.type === VariantAttributeType.SIZE);
    if (!sizeAttr) return [];

    const colorAttrId = p.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR)?.id;
    const selectedColor = this.selectedColorId();

    return sizeAttr.values.map(sizeVal => {
      const isAvailable = p.variantCombinations?.some(combo => {
        const hasThisSize = combo.attributes.some(a => a.attributeId === sizeAttr.id && a.attributeValueId === sizeVal.id);
        const hasSelectedColor = !colorAttrId || !selectedColor || combo.attributes.some(a => a.attributeId === colorAttrId && a.attributeValueId === selectedColor);
        return hasThisSize && hasSelectedColor;
      }) ?? false;

      return {
        id: sizeVal.id,
        displayName: sizeVal.displayName,
        value: sizeVal.value,
        priceModifier: sizeVal.priceModifier,
        isAvailable: isAvailable
      };
    });
  });

  readonly maxOrderQuantity = computed<number>(() => {
    const p = this.product();
    return (isPhysicalProduct(p) ? p.availabilityRules?.maxOrderQuantity : undefined) ?? 99;
  });

  readonly currentPrice = computed(() => this.activeVariant()?.price ?? this.product().price ?? 0);
  readonly currentOriginalPrice = computed(() => this.activeVariant()?.originalPrice ?? this.product().originalPrice);

  readonly stockStatusDisplay = computed<StockDisplayInfo>(() => {
    const p = this.product();
    const v = this.activeVariant();
    const qty = v?.stockQuantity ?? (isPhysicalProduct(p) ? p.stockQuantity : undefined);
    const status = v?.stockStatus ?? (isPhysicalProduct(p) ? p.stockStatus : undefined);
    return getStockDisplayInfo(p, v, qty, status, { translate: (k: string, params?: Record<string, any>) => this.translateService.instant(k, params) });
  });

  readonly isAddToCartEnabled = computed(() => {
    const stockInfo = this.stockStatusDisplay();
    return stockInfo.text !== this.translateService.instant('productDetail.outOfStock') &&
           stockInfo.text !== this.translateService.instant('productDetail.discontinued');
  });

  // === Event Handlers ===
  handleColorSelection(option: ColorOption): void {
    this.selectedColorId.set(option.id);
  }

  handleSizeSelection(option: SizeOption): void {
    this.selectedSizeId.set(option.id);
  }

  addToCart(): void {
    const p = this.product();
    const v = this.activeVariant();

    const selectedVariants: CartItemVariant[] = [];
    const colorAttr = p.variantAttributes?.find((a) => a.type === VariantAttributeType.COLOR);

    if (colorAttr && this.selectedColorId()) {
      const colorValue = colorAttr.values.find((val) => val.id === this.selectedColorId());
      if (colorValue) {
        selectedVariants.push({
          name: colorAttr.name,
          value: colorValue.displayName,
          displayValue: colorValue.colorHex ?? undefined
        });
      }
    }
    const sizeAttr = p.variantAttributes?.find((a) => a.type === VariantAttributeType.SIZE);
    if (sizeAttr && this.selectedSizeId()) {
      const sizeValue = sizeAttr.values.find((val) => val.id === this.selectedSizeId());
      if (sizeValue) {
        selectedVariants.push({
          name: sizeAttr.name,
          value: sizeValue.displayName,
        });
      }
    }


    const payload: AddCartItemPayload = {
      productId: p.id,
      quantity: this.quantityS(),
      variantId: v?.id,
      productName: p.name,
      pricePerItem: this.currentPrice(),
      productImageUrl: this.heroImage()?.variants?.[0]?.url,
      selectedVariants: selectedVariants.length > 0 ? selectedVariants : undefined,
    };
    this.cartFacade.addItem(payload);
  }

    openCreateReviewModal(): void {
    if (!this.isAuthenticated()) {
      this.notificationService.showInfo(this.translateService.instant('productDetail.loginToWriteReview'));
      return; 
    }

    this.overlayService.open({
      component: CreateReviewFormComponent,
      data: { targetEntityId: this.product().id, targetEntityType: ReviewTargetEntityType.PRODUCT },
      panelClass: ['w-full', 'max-w-xl', 'bg-background'], backdropType: 'dark'
    });
  }

  // Helper to update variant selection signals based on a ProductVariantCombination
  private updateVariantSignals(variant: ProductVariantCombination): void {
      const p = this.product();
      const colorAttrId = p.variantAttributes?.find((a) => a.type === VariantAttributeType.COLOR)?.id;
      const sizeAttrId = p.variantAttributes?.find((a) => a.type === VariantAttributeType.SIZE)?.id;

      if (colorAttrId) {
          this.selectedColorId.set(variant.attributes.find(a => a.attributeId === colorAttrId)?.attributeValueId);
      }
      if (sizeAttrId) {
          this.selectedSizeId.set(variant.attributes.find(a => a.attributeId === sizeAttrId)?.attributeValueId);
      }
  }

  // Expose formatPrice and getProductCurrency for template usage
  protected formatPrice = formatPrice;
  protected getProductCurrency = getProductCurrency;

  // Helper for allMedia binding in template (to fix parser error)
  protected getProductMedia(product: Product): Media[] {
    return (product.media || []).slice();
  }
}