
/**
 * @file product-detail.component.ts (Definitive & Synchronized Version)
 * @Version 37.0.0
 * @Author Royal-Code MonorepoAppDevAI (Final Correction)
 * @Date 2025-07-17
 * @Description
 *   The definitive, enterprise-grade product detail component. This version provides
 *   a complete and synchronized set of files (.ts, .html) to resolve all
 *   compiler and runtime errors. It implements a robust, non-circular logic for
 *   variant selection, removes all side-effects from computed signals (fixes NG0600),
 *   eliminates non-null assertions and 'any' types, and uses the correct review list component.
 *   Original user comments have been restored.
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common'; // JsonPipe toegevoegd
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, timer } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Domain & Core Imports
import {
  Product,
  ProductVariantCombination,
  StockStatus,
  VariantAttributeType,
} from '@royal-code/features/products/domain';
import { Image, Media, MediaType } from '@royal-code/shared/domain';
import { AddCartItemPayload, CartFacade } from '@royal-code/features/cart/core';
import { ErrorFacade } from '@royal-code/store/error';
import {
  ProductFacade,
  formatPrice,
  getProductCurrency,
  getProductOriginalPrice,
  getProductPrice,
  getStockDisplayInfo,
  isPhysicalProduct,
} from '@royal-code/features/products/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { ReviewsFacade } from '@royal-code/features/reviews/core';
import { ReviewVoteType } from '@royal-code/features/reviews/domain';
// UI & Service Imports
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { MediaViewerService } from '@royal-code/ui/media';
import { NotificationService } from '@royal-code/ui/notifications';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiFeaturedMediaGalleryComponent } from '@royal-code/ui/media';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiQuantityInputComponent } from '@royal-code/ui/quantity-input';
import { UiRatingComponent } from '@royal-code/ui/rating';
import {
  SegmentedBarConfig,
  SegmentStyle,
  UiSegmentedBarComponent,
} from '@royal-code/ui/meters';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import {
  ColorOption,
  SizeOption,
  UiColorOptionSelectorComponent,
  UiSizeOptionSelectorComponent,
} from '@royal-code/ui/variant-selector';
import { CreateReviewFormComponent, ReviewListComponent, ProductReviewSummaryComponent } from '@royal-code/features/reviews/ui-plushie';
import { AppIcon } from '@royal-code/shared/domain';
import { ReviewTargetEntityType } from '@royal-code/features/reviews/domain';
import { StockDisplayInfo } from '@royal-code/features/products/core';
import { CartItemVariant } from '@royal-code/features/cart/domain';

@Component({
  selector: 'plushie-royal-code-product-detail',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, ReviewListComponent,
    UiButtonComponent, UiColorOptionSelectorComponent,
    UiFeaturedMediaGalleryComponent, UiIconComponent,
    UiParagraphComponent, UiQuantityInputComponent, UiRatingComponent,
    UiSegmentedBarComponent, UiSizeOptionSelectorComponent, UiSpinnerComponent,
    UiCardComponent, UiTitleComponent, ProductReviewSummaryComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- === Root Container === -->
    <div class="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <!-- === Loading State === -->
      @if (isLoading() && !selectedProduct()) {
        <div class="flex flex-col items-center justify-center p-12 text-secondary gap-4" role="status" aria-live="polite">
          <royal-code-ui-spinner size="xl" />
          <royal-code-ui-paragraph>{{ 'productDetail.loadingDetails' | translate }}</royal-code-ui-paragraph>
        </div>
      }  @else {
          <!-- === Product Found State === -->
          @if (selectedProduct(); as product) {
            <!-- === Live Viewers & Promotions === -->
            <div class="mb-3 p-2 bg-accent text-accent-on text-center text-sm font-semibold rounded-t-lg">
              <royal-code-ui-icon [icon]="AppIcon.Users" sizeVariant="sm" extraClass="inline-block mr-1.5 align-middle" />
              <span class="align-middle">
                <strong>{{ liveViewers() }}</strong> {{ 'productDetail.liveViewers' | translate }}
              </span>
            </div>

            <div class="space-y-6">
              <!-- === Main Product Grid (Gallery & Details) === -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <!-- === Product Gallery Section === -->
                <section aria-labelledby="product-gallery-title" class="bg-surface-alt p-0.5 rounded-xs border border-border">
                  <h2 id="product-gallery-title" class="sr-only">{{ 'productDetail.productImages' | translate }}</h2>
                  <div class="sticky top-24">
                    <div class="rounded-md overflow-hidden">
                      <royal-code-ui-featured-media-gallery [allMedia]="productImages()" />
                    </div>
                  </div>
                </section>

                <!-- === Product Details & Actions Section === -->
                <section aria-labelledby="product-details-title" class="space-y-4">
                  <div class="flex items-center gap-2">
                    @if(isProductNew()) {
                      <span class="px-2 py-0.5 text-xs font-semibold bg-primary text-primary-on rounded-full" role="status" [attr.aria-label]="'productDetail.newProductStatus' | translate">
                        {{ 'productDetail.newProductBadge' | translate }}
                      </span>
                    }
                  </div>

                  <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="product.name" [id]="'product-details-title'" />
                  <royal-code-ui-paragraph size="sm" color="muted">
                    {{ 'productDetail.byBrand' | translate }}
                    <span class="font-semibold text-foreground">{{ (isPhysicalProduct(product) ? product.brand : 'DreamyFriends') }}</span>
                  </royal-code-ui-paragraph>

                  <div class="flex items-center gap-4">
                    <royal-code-ui-rating [rating]="product.averageRating || 0" [readonly]="true" />
                    <a href="#reviews" class="text-sm text-secondary hover:text-primary underline" [attr.aria-label]="'Bekijk alle ' + (product.reviewCount || 0) + ' reviews'">
                      {{ product.reviewCount || 0 }} {{ 'productDetail.reviewsCount' | translate }}
                    </a>
                  </div>

                  @if (product.shortDescription) {
                    <royal-code-ui-paragraph color="muted" size="sm" extraClasses="mt-2">
                      {{ product.shortDescription }}
                    </royal-code-ui-paragraph>
                  }

                  <!-- === Pricing & Availability Box === -->
                  <div class="p-4 bg-surface-alt rounded-xs border border-border space-y-2" role="region" aria-labelledby="pricing-heading">
                    <h3 id="pricing-heading" class="sr-only">{{ 'productDetail.pricingAndAvailability' | translate }}</h3>
                    @if(flashDealCountdownS(); as countdown) {
                      <div class="text-center text-destructive font-bold" role="timer" aria-live="polite">
                        <royal-code-ui-icon [icon]="AppIcon.Timer" extraClass="inline-block mr-1"/>
                        {{ 'productDetail.flashDeal' | translate }}: {{ countdown }}
                      </div>
                    }
                    <div class="flex items-baseline gap-2">
                      <span class="text-3xl font-bold text-primary" role="text" [attr.aria-label]="'Huidige prijs: ' + currentPriceS()">
                        {{ currentPriceS() }}
                      </span>
                      @if(currentOriginalPriceS(); as oldPrice) {
                        <span class="text-lg text-secondary line-through" role="text" [attr.aria-label]="'Oorspronkelijke prijs: ' + oldPrice">
                          {{ oldPrice }}
                        </span>
                      }
                    </div>
                    <royal-code-ui-paragraph size="sm" [color]="currentStockStatusS().colorClass" extraClasses="font-semibold flex items-center gap-1.5" role="status" [attr.aria-live]="currentStockStatusS().colorClass === 'fire' ? 'assertive' : 'polite'">
                      <royal-code-ui-icon [icon]="currentStockStatusS().icon" sizeVariant="sm" />
                      {{ currentStockStatusS().text }}
                    </royal-code-ui-paragraph>
                    <royal-code-ui-paragraph size="xs" color="muted" role="timer" aria-live="polite">
                      🚚 {{ 'productDetail.deliveryMessage' | translate:{ countdown: nextDayDeliveryCountdownS() } }}
                    </royal-code-ui-paragraph>
                  </div>

                  <!-- === Variant Selection Group === -->
                  <div class="space-y-4" role="group" aria-labelledby="variant-selection-heading">
                    <h3 id="variant-selection-heading" class="sr-only">{{ 'productDetail.selectOptions' | translate }}</h3>

                    @if (colorOptionsS().length > 0) {
                      <royal-code-ui-color-option-selector
                        [options]="colorOptionsS()"
                        [selectedOptionId]="selectedColorId()"
                        (optionSelected)="handleColorSelection($event)"
                        [label]="'productDetail.selectColorLabel' | translate" />
                    }

                    @if (sizeOptionsS().length > 0) {
                      <royal-code-ui-size-option-selector
                        [options]="sizeOptionsS()"
                        [selectedOptionId]="selectedSizeId()"
                        (optionSelected)="handleSizeSelection($event)"
                        [label]="'productDetail.selectSizeLabel' | translate"
                        [currency]="productCurrency(product)" />
                    }
                  </div>

                  <!-- === Purchase Actions Group === -->
                  <div class="flex items-center gap-4 pt-4" role="group" aria-labelledby="purchase-actions-heading">
                    <h3 id="purchase-actions-heading" class="sr-only">{{ 'productDetail.quantityAndActions' | translate }}</h3>
                    <royal-code-ui-quantity-input
                      [value]="quantityS()"
                      [min]="1"
                      [max]="maxOrderQuantityS() ?? 99"
                      [disabled]="!isAddToCartEnabled()"
                      (valueChange)="quantityS.set($event)"
                      [attr.aria-label]="'Selecteer aantal, huidige waarde: ' + quantityS()" />
                    <royal-code-ui-button
                      type="primary"
                      sizeVariant="lg"
                      (clicked)="addToCart()"
                      [disabled]="!isAddToCartEnabled() || cartFacade.isSubmitting()"
                      extraClasses="flex-grow"
                      [useHueGradient]="true"
                      [enableNeonEffect]="true"
                      [attr.aria-label]="getAddToCartAriaLabel()">
                      @if (cartFacade.isSubmitting()) {
                        <royal-code-ui-spinner size="md" />
                      } @else {
                        <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" extraClass="mr-2"/>
                        <span>{{ 'cart.addToCart' | translate }}</span>
                      }
                    </royal-code-ui-button>
                  </div>

                  <!-- === Trust Badges Section === -->
                  <div class="grid grid-cols-2 gap-2 text-xs text-secondary pt-4" role="region" aria-labelledby="trust-badges-heading">
                    <h3 id="trust-badges-heading" class="sr-only">{{ 'productDetail.trustAndGuarantees' | translate }}</h3>
                    <span class="flex items-center gap-1.5"><royal-code-ui-icon [icon]="AppIcon.ShieldCheck" sizeVariant="sm"/>{{ 'productDetail.trustBadge1' | translate }}</span>
                    <span class="flex items-center gap-1.5"><royal-code-ui-icon [icon]="AppIcon.RotateCcw" sizeVariant="sm"/>{{ 'productDetail.trustBadge2' | translate }}</span>
                    <span class="flex items-center gap-1.5"><royal-code-ui-icon [icon]="AppIcon.Truck" sizeVariant="sm"/>{{ 'productDetail.trustBadge3' | translate }}</span>
                    <span class="flex items-center gap-1.5"><royal-code-ui-icon [icon]="AppIcon.Award" sizeVariant="sm"/>{{ 'productDetail.trustBadge4' | translate }}</span>
                  </div>
                </section>
              </div>

              <div class="mt-8 lg:mt-12 space-y-10">
                <!-- === Description Section === -->
                <section id="description" aria-labelledby="description-title">
                  <div class="pb-4 border-b border-border">
                    <royal-code-ui-title [level]="TitleTypeEnum.H2" id="description-title" [text]="'productDetail.descriptionTitle' | translate" />
                  </div>
                  <div class="mt-6 space-y-4">
                    <royal-code-ui-paragraph extraClasses="whitespace-pre-line text-secondary">{{ product.description }}</royal-code-ui-paragraph>
                    @if (product.tags?.length) {
                      <div class="pt-4">
                        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'productDetail.tagsTitle' | translate" extraClasses="!mb-3 !text-base" />
                        <div class="flex flex-wrap gap-2" role="list">
                          @for(tag of product.tags; track tag) {
                            <span class="px-2.5 py-1 text-xs bg-surface-alt text-secondary rounded-full border border-border" role="listitem">{{ tag }}</span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </section>

                <!-- === Specifications Section === -->
                <section id="specifications" aria-labelledby="specifications-title">
                  <div class="pb-4 border-b border-border">
                    <royal-code-ui-title [level]="TitleTypeEnum.H2" id="specifications-title" [text]="'productDetail.specsTitle' | translate" />
                  </div>
                  <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div class="lg:col-span-2 space-y-8">
                      @if (isPhysicalProduct(product)) {
                        @if (physicalProductAttributesSignal(); as attributes) {
                          <div role="region" aria-labelledby="qualities-heading">
                            <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'productDetail.qualitiesTitle' | translate" extraClasses="!mb-4 !text-base" id="qualities-heading"/>
                            <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                              @for (attrKey of attributes.keys; track attrKey) {
                                <div class="flex flex-col">
                                  <dt class="text-sm font-medium text-secondary mb-1">{{ 'productDetail.attributes.' + attrKey | translate }}</dt>
                                  <dd class="text-foreground">
                                    @if (isSegmentedBarConfig(attributes.displayable[attrKey])) {
                                      <royal-code-ui-segmented-bar [config]="attributes.displayable[attrKey]" />
                                    } @else if (typeof attributes.displayable[attrKey] === 'string') {
                                      {{ attributes.displayable[attrKey] | translate }}
                                    } @else {
                                      {{ attributes.displayable[attrKey] }}
                                    }
                                  </dd>
                                </div>
                              }
                            </dl>
                          </div>
                        }
                        @if (product.ageRecommendationKeyOrText) {
                          <div role="region" aria-labelledby="age-heading">
                            <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'productDetail.ageAdviceTitle' | translate" extraClasses="!mb-2 !text-base" id="age-heading" />
                            <royal-code-ui-paragraph size="sm" extraClasses="flex items-center gap-2 text-secondary">
                              <royal-code-ui-icon [icon]="AppIcon.Info" sizeVariant="sm" />
                              {{ product.ageRecommendationKeyOrText }}
                            </royal-code-ui-paragraph>
                          </div>
                        }
                        @if (product.displaySpecifications?.length) {
                          <div role="region" aria-labelledby="specs-heading">
                            <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'productDetail.generalSpecsTitle' | translate" extraClasses="!mb-3 !text-base" id="specs-heading" />
                            <dl class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                              @for(spec of product.displaySpecifications; track spec.specKey) {
                                <dt class="font-medium text-secondary">{{ spec.labelKeyOrText | translate }}:</dt>
                                <dd class="text-foreground">{{ spec.valueKeyOrText | translate }}</dd>
                              }
                            </dl>
                          </div>
                        }
                      } @else {
                        <royal-code-ui-paragraph color="muted">{{ 'productDetail.noSpecsApplicable' | translate }}</royal-code-ui-paragraph>
                      }
                    </div>
                    <aside class="lg:col-span-1" role="complementary" aria-labelledby="why-choose-heading">
                      <div class="sticky top-24">
                        <div class="p-6 bg-surface-alt rounded-xs border border-border">
                          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'productDetail.whyChooseTitle' | translate" extraClasses="text-center !mb-6" id="why-choose-heading"/>
                          <div class="grid grid-cols-2 gap-x-4 gap-y-5">
                            @for (stat of whyChooseUsStats; track stat.textKey) {
                              <royal-code-ui-card>
                                <div class="flex items-center gap-2 p-2">
                                  <royal-code-ui-icon [icon]="stat.icon" sizeVariant="sm"></royal-code-ui-icon>
                                  <span class="text-sm">{{ stat.textKey | translate }}</span>
                                </div>
                              </royal-code-ui-card>
                            }
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                </section>

                <!-- === Reviews Section (Lazy Loaded & Correct Component) === -->
                @defer (on viewport; prefetch on idle) {
                <section #reviewsSection id="reviews" aria-labelledby="reviews-title">
                  <div class="pb-4 border-b border-border flex justify-between items-center">
                    <royal-code-ui-title [level]="TitleTypeEnum.H2" id="reviews-title" [text]="('productDetail.reviewsTitle' | translate) + ' (' + (reviewsFacade.reviewSummary()?.totalReviews ?? 0) + ')'" extraClasses="!mb-0" />
                    @if (selectedProduct(); as product) {
                      <royal-code-ui-button type="primary" sizeVariant="sm" [enableNeonEffect]="true" (clicked)="openCreateReviewModal()" [attr.aria-label]="'Schrijf een review voor ' + product.name">
                        <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2"/>
                        {{ 'productDetail.writeReviewButton' | translate }}
                      </royal-code-ui-button>
                    }
                  </div>
                  <div class="mt-6 space-y-8">
                    @if(reviewsFacade.reviewSummary(); as summary) {
                      <plushie-royal-code-review-summary [summary]="summary" />
                    }
                    <plushie-royal-code-review-list />
                  </div>
                </section>
              } @placeholder {
                <div class="min-h-[20rem] w-full bg-surface-alt rounded-xs border border-dashed border-border"></div>
              }

              </div>
            </div>
          } @else {
            <!-- === Product Not Found State === -->
            <div class="p-8 text-center text-secondary" role="status" aria-live="polite">
              <royal-code-ui-icon [icon]="AppIcon.SearchX" sizeVariant="xl" class="mb-2" />
              <royal-code-ui-paragraph>{{ 'productDetail.notFound' | translate }}</royal-code-ui-paragraph>
            </div>
          }
      }
    </div>


  `,
  styles: [`
    :host { display: block; }
    :host ::ng-deep .royal-code-review-list { display: flex; flex-direction: column; gap: 1.5rem; }
    royal-code-ui-featured-media-gallery { display: block; width: 100%; height: 100%; }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  // === Dependencies  ===
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly mediaViewerService = inject(MediaViewerService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  readonly productFacade = inject(ProductFacade);
  readonly reviewsFacade = inject(ReviewsFacade);
  readonly cartFacade = inject(CartFacade);
  readonly errorFacade = inject(ErrorFacade);

  protected readonly logPrefix = '[ProductDetailComponent]';
  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly StockStatus = StockStatus;
  readonly isPhysicalProduct = isPhysicalProduct;

  // FIX: Gebruik een specifieke type-parameter voor objectKeys om 'any' te vermijden.
  readonly objectKeys = <T extends object>(obj: T): (keyof T)[] => (obj ? Object.keys(obj) as (keyof T)[] : []);

  isSegmentedBarConfig = (value: unknown): value is SegmentedBarConfig =>
    typeof value === 'object' && value !== null && 'filledValue' in value && 'totalValue' in value;

  // === UI State Signals ===
  readonly quantityS = signal(1);
  readonly liveViewers = signal(Math.floor(Math.random() * 20) + 5);
  readonly lowStockThresholdInput = input<number>(10);
  readonly criticalStockThresholdInput = input<number>(5);

  // === Facade-Driven State Signals ===
  readonly selectedProduct = this.productFacade.selectedProduct;
  readonly isLoading = this.productFacade.isLoading;
  readonly reviewsViewModel = this.reviewsFacade.reviewListViewModel;

  // === Real-time Countdown Signals ===
  readonly flashDealCountdownS: Signal<string> = toSignal(timer(0, 1000).pipe(map(() => this.calculateFlashDealCountdown())), { initialValue: '00:00:00' });
  readonly nextDayDeliveryCountdownS: Signal<string> = toSignal(timer(0, 1000).pipe(map(() => this.calculateNextDayDeliveryCountdown())), { initialValue: '00:00:00' });

  // === DERIVED VIEW-STATE SIGNALS (Pure & Robust) ===

  readonly activeVariantCombinationS = computed<ProductVariantCombination | undefined>(() => {
    const product = this.selectedProduct();
    if (!product?.variantCombinations?.length) return undefined;
    const selectedIdFromStore = this.productFacade.viewModel().selectedVariantCombinationIdByProduct[product.id];
    if (selectedIdFromStore) {
      const variant = product.variantCombinations.find(vc => vc.id === selectedIdFromStore);
      if (variant) return variant;
    }
    return product.variantCombinations.find(vc => vc.isDefault) ?? product.variantCombinations[0];
  });

  readonly selectedColorId = computed<string | undefined>(() => {
    const product = this.selectedProduct();
    const activeVariant = this.activeVariantCombinationS();
    if (!product || !activeVariant) return undefined;
    const colorAttributeId = product.variantAttributes?.find(attr => attr.type === VariantAttributeType.COLOR)?.id;
    return activeVariant.attributes.find(a => a.attributeId === colorAttributeId)?.attributeValueId;
  });

  readonly selectedSizeId = computed<string | undefined>(() => {
    const product = this.selectedProduct();
    const activeVariant = this.activeVariantCombinationS();
    if (!product || !activeVariant) return undefined;
    const sizeAttributeId = product.variantAttributes?.find(attr => attr.type === VariantAttributeType.SIZE)?.id;
    return activeVariant.attributes.find(a => a.attributeId === sizeAttributeId)?.attributeValueId;
  });

  readonly colorOptionsS = computed<ColorOption[]>(() => {
    const product = this.selectedProduct();
    const colorAttr = product?.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR);
    if (!colorAttr) return [];
    return colorAttr.values.map(val => ({
      id: val.id, displayName: val.displayName, colorValue: val.colorHex ?? '#FFFFFF', isAvailable: val.isAvailable
    }));
  });

  readonly sizeOptionsS = computed<SizeOption[]>(() => {
    const product = this.selectedProduct();
    // Guard Clause: als er geen product is, retourneer een lege array.
    if (!product) return [];

    const sizeAttr = product.variantAttributes?.find(a => a.type === VariantAttributeType.SIZE);
    if (!sizeAttr) return [];

    const colorAttrId = product.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR)?.id;
    const selectedColor = this.selectedColorId();

    return sizeAttr.values.map(sizeVal => {
      // Guard Clause met Nullish Coalescing: als variantCombinations niet bestaat, is 'isAvailable' false.
      const isAvailable = product.variantCombinations?.some(combo => {
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


  readonly currentPriceS = computed(() => formatPrice(getProductPrice(this.selectedProduct(), this.activeVariantCombinationS()?.id), getProductCurrency(this.selectedProduct())));

  readonly currentOriginalPriceS = computed(() => {
    const originalPrice = getProductOriginalPrice(this.selectedProduct(), this.activeVariantCombinationS()?.id);
    return originalPrice ? formatPrice(originalPrice, getProductCurrency(this.selectedProduct())) : null;
  });

    readonly productImages = computed<Image[]>(() => {
    const product = this.selectedProduct();
    if (!product) return [];

    const colorId = this.selectedColorId();
    const colorAttr = product.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR);
    const selectedValue = colorAttr?.values.find(v => v.id === colorId);

    // Als de geselecteerde kleurvariant zijn eigen media heeft, geef die dan terug.
    if (selectedValue?.media?.length) {
        return selectedValue.media.filter((m): m is Image => m.type === MediaType.IMAGE);
    }
    
    // --- DE FIX ---
    // Fallback: Geef ALLE afbeeldingen van het hoofdproduct terug, niet alleen de eerste.
    // Dit zorgt ervoor dat de gallery altijd een volledige lijst heeft om mee te werken.
    return (product.media ?? []).filter((m): m is Image => m.type === MediaType.IMAGE);
  });


  readonly currentStockStatusS = computed<StockDisplayInfo>(() => {
    const product = this.selectedProduct();
    const variant = this.activeVariantCombinationS();
    const stockQuantity = variant?.stockQuantity ?? (isPhysicalProduct(product) ? product.stockQuantity : undefined);
    const stockStatus = variant?.stockStatus ?? (isPhysicalProduct(product) ? product.stockStatus : undefined);

    // De log-functie wordt hier NIET meer meegegeven. Dit maakt de computed PURE.
    return getStockDisplayInfo(product, variant, stockQuantity, stockStatus, {
        lowThreshold: this.lowStockThresholdInput(),
        criticalThreshold: this.criticalStockThresholdInput(),
        translate: (key, params) => this.translateService.instant(key, params),
    });
  });

  readonly isAddToCartEnabled = computed(() => {
    const product = this.selectedProduct();
    const variant = this.activeVariantCombinationS();

    // Bepaal de stock status op een type-veilige manier
    let stockStatus: StockStatus | undefined;
    if (variant) {
      stockStatus = variant.stockStatus;
    } else if (isPhysicalProduct(product)) {
      // Alleen als het een PhysicalProduct is, mogen we stockStatus benaderen.
      stockStatus = product.stockStatus;
    }

    // De knop is actief als de status bekend is en een van de toegestane waarden heeft.
    return stockStatus === StockStatus.IN_STOCK ||
           stockStatus === StockStatus.ON_BACKORDER ||
           stockStatus === StockStatus.LIMITED_STOCK;
  });



  readonly maxOrderQuantityS = computed<number | undefined>(() => {
    const product = this.selectedProduct();
    return isPhysicalProduct(product) ? product.availabilityRules?.maxOrderQuantity : undefined;
  });

  readonly physicalProductAttributesSignal = computed((): { displayable: Record<string, string | boolean | SegmentedBarConfig>, keys: string[] } | null => {
    const product = this.selectedProduct();
    if (!isPhysicalProduct(product) || !product.customAttributes) return null;

    const attrs = product.customAttributes;
    const displayable: Record<string, string | boolean | SegmentedBarConfig> = {};
    const barAttributes: { key: keyof typeof attrs; max: number; }[] = [
      { key: 'durability', max: 10 }, { key: 'cuddleFactor', max: 10 }, { key: 'fluffiness', max: 10 },
      { key: 'dreamGuard', max: 10 }, { key: 'adventureSpirit', max: 10 }, { key: 'cheerfulness', max: 10 },
      { key: 'comfortLevel', max: 10 }, { key: 'rarityScore', max: 5 },
    ];

    barAttributes.forEach(barAttr => {
      const value = attrs[barAttr.key];
      if (typeof value === 'number') {
        displayable[barAttr.key as string] = {
          filledValue: value, totalValue: barAttr.max, numberOfSegments: barAttr.max,
          displayStyle: SegmentStyle.Chevron, ariaLabel: `productDetail.attributes.${barAttr.key as string}`
        };
      }
    });

    const washableValue = attrs['washable'];
    if (typeof washableValue === 'boolean') {
      // Geef de vertaalkey terug, niet de vertaalde waarde
      displayable['washable'] = washableValue ? 'common.yes' : 'common.no';
    }

    const keys = Object.keys(displayable);
    return keys.length > 0 ? { displayable, keys } : null;
  });


  readonly isProductNew = computed(() => {
    const newUntil = this.selectedProduct()?.isNewUntil?.iso;
    return newUntil ? new Date(newUntil) > new Date() : false;
  });

  readonly whyChooseUsStats = [
    { icon: AppIcon.Baby, textKey: 'productDetail.trustBadge1_text' }, { icon: AppIcon.Sparkles, textKey: 'productDetail.trustBadge2_text' },
    { icon: AppIcon.Recycle, textKey: 'productDetail.trustBadge3_text' }, { icon: AppIcon.ShieldCheck, textKey: 'productDetail.trustBadge4_text' },
    { icon: AppIcon.HeartHandshake, textKey: 'productDetail.trustBadge5_text' }, { icon: AppIcon.Ruler, textKey: 'productDetail.trustBadge6_text' },
  ];

  constructor() {
    this.logger.info(`${this.logPrefix} Initialized.`);

    // Effect om de default variant te selecteren blijft.
    effect(() => {
      const product = this.selectedProduct();
      if (product?.variantCombinations?.length) {
        const currentSelectionInStore = this.productFacade.viewModel().selectedVariantCombinationIdByProduct[product.id];
        if (!currentSelectionInStore) {
            const defaultVariant = product.variantCombinations.find(v => v.isDefault) ?? product.variantCombinations[0];
            if (defaultVariant) {
                setTimeout(() => this.productFacade.selectVariantCombination(product.id, defaultVariant.id), 0);
            }
        }
      }
    });

    // Effect om de review context te zetten
    effect(() => {
      const id = this.selectedProduct()?.id;
      if (id) {
        this.reviewsFacade.setContext(id, ReviewTargetEntityType.PRODUCT);
      }
    });

    // Effect voor het loggen van de stock status, apart van de berekening
    effect(() => {
      const stockStatusInfo = this.currentStockStatusS();
      this.logger.debug(`[Stock Status Changed]`, { newStatus: stockStatusInfo });
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
        const id = params.get('id');
        if (id) {
            this.productFacade.selectProduct(id);
        }
    });
  }

  ngOnDestroy(): void {
    this.productFacade.selectProduct(null);
  }

  // === Event Handlers ===
  handleColorSelection(option: ColorOption): void { this.updateVariantSelection({ newColorId: option.id }); }
  handleSizeSelection(option: SizeOption): void { this.updateVariantSelection({ newSizeId: option.id }); }

  private updateVariantSelection({ newColorId, newSizeId }: { newColorId?: string; newSizeId?: string }): void {
    const product = this.selectedProduct();
    if (!product?.variantCombinations?.length || !product.variantAttributes?.length) return;

    const targetColorId = newColorId ?? this.selectedColorId();
    const targetSizeId = newSizeId ?? this.selectedSizeId();
    const colorAttrId = product.variantAttributes.find(a => a.type === VariantAttributeType.COLOR)?.id;
    const sizeAttrId = product.variantAttributes.find(a => a.type === VariantAttributeType.SIZE)?.id;

    const bestMatch = product.variantCombinations.find(combo => {
      const colorMatch = !colorAttrId || !targetColorId || combo.attributes.some(a => a.attributeId === colorAttrId && a.attributeValueId === targetColorId);
      const sizeMatch = !sizeAttrId || !targetSizeId || combo.attributes.some(a => a.attributeId === sizeAttrId && a.attributeValueId === targetSizeId);
      return colorMatch && sizeMatch;
    });

    if (bestMatch) {
      this.productFacade.selectVariantCombination(product.id, bestMatch.id);
    } else {
      const fallbackMatch = product.variantCombinations.find(combo => {
         return combo.attributes.some(a => a.attributeId === colorAttrId && a.attributeValueId === targetColorId);
      });
       if(fallbackMatch) {
         this.productFacade.selectVariantCombination(product.id, fallbackMatch.id);
       } else {
         this.notificationService.showWarning(this.translateService.instant('productDetail.errors.combinationUnavailable'));
       }
    }
  }

  // --- IN libs/features/products/ui-plushie/src/lib/pages/product-detail/product-detail.component.ts, VERVANG 'addToCart' METHODE ---

    addToCart(): void {
    const M = '[ProductDetailComponent] addToCart:';
    this.logger.debug(`${M} Method called.`);

    const product = this.selectedProduct();
    const activeVariant = this.activeVariantCombinationS();

    if (!product || !this.isAddToCartEnabled()) {
      this.notificationService.showError(this.translateService.instant('productDetail.addToCartError'));
      this.logger.warn(`${M} Aborted. Product not available or not addable.`, { product, isAddToCartEnabled: this.isAddToCartEnabled() });
      return;
    }

    const selectedVariants: CartItemVariant[] = [];
    const colorAttr = product.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR);
    const sizeAttr = product.variantAttributes?.find(a => a.type === VariantAttributeType.SIZE);

    if (colorAttr && this.selectedColorId()) {
      const colorValue = colorAttr.values.find(v => v.id === this.selectedColorId());
      if (colorValue) {
        selectedVariants.push({
          name: 'Color',
          value: colorValue.displayName,
          displayValue: colorValue.colorHex ?? undefined
        });
      }
    }
    if (sizeAttr && this.selectedSizeId()) {
      const sizeValue = sizeAttr.values.find(v => v.id === this.selectedSizeId());
      if (sizeValue) {
        selectedVariants.push({
          name: 'Size',
          value: sizeValue.displayName
        });
      }
    }
    const payload: AddCartItemPayload = {
      productId: product.id,
      quantity: this.quantityS(),
      variantId: activeVariant?.id,
      productName: product.name,
      pricePerItem: getProductPrice(product, activeVariant?.id),
      productImageUrl: this.productImages()?.[0]?.variants?.[0]?.url,
      selectedVariants: selectedVariants.length > 0 ? selectedVariants : undefined,
    };

    // --- DE AANPASSING ---
    // Gebruik JSON.stringify om een exacte snapshot te loggen, dit voorkomt "lazy evaluation" in de console.
    this.logger.info(`${M} Dispatching addItem with payload snapshot:`, JSON.stringify(payload, null, 2));
    this.cartFacade.addItem(payload);
  }



  onVote(reviewId: string, voteType: 'like' | 'dislike'): void { this.reviewsFacade.vote(reviewId, voteType as ReviewVoteType); }
  onDeleteReview(reviewId: string): void { this.reviewsFacade.deleteReview(reviewId); }
  onReport(reviewId: string): void { this.logger.info(`${this.logPrefix} Review reported`, { reviewId }); }
  onAuthorClick(authorId: string): void { this.logger.debug(`${this.logPrefix} Author profile clicked`, { authorId }); }

  openCreateReviewModal(): void {
    const product = this.selectedProduct();
    if (!product?.id) {
      this.notificationService.showError(this.translateService.instant('productDetail.reviewModalError'));
      return;
    }
    this.overlayService.open({ component: CreateReviewFormComponent, data: { targetEntityId: product.id, targetEntityType: ReviewTargetEntityType.PRODUCT }, panelClass: ['w-full', 'max-w-xl'], backdropType: 'dark' });
  }

  openLightbox(media: Media[] | undefined, startWithId: string): void {
      if (!media || media.length === 0) return;
      const images = media.filter((m): m is Image => m.type === MediaType.IMAGE);
      const startIndex = images.findIndex(img => img.id === startWithId);
      if (images.length > 0) {
        this.mediaViewerService.openLightbox(images, Math.max(0, startIndex));
      }
  }

  getAddToCartAriaLabel(): string {
    const product = this.selectedProduct();
    const variant = this.activeVariantCombinationS();
    let label = `${this.translateService.instant('productDetail.addToCartAriaLabelPrefix')} ${this.quantityS()} ${product?.name || ''}`;
    if (variant) label += ` (${variant.sku})`;
    return `${label} ${this.translateService.instant('productDetail.addToCartAriaLabelSuffix')}`;
  }

  productCurrency(product: Product): string { return getProductCurrency(product); }

  private calculateFlashDealCountdown(): string {
    const endTime = new Date(); endTime.setHours(endTime.getHours() + 2, endTime.getMinutes() + 34, endTime.getSeconds() + 21);
    const remaining = endTime.getTime() - new Date().getTime();
    if (remaining <= 0) return "00:00:00";
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
    const minutes = Math.floor((remaining / 1000 / 60) % 60).toString().padStart(2, '0');
    const seconds = Math.floor((remaining / 1000) % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  private calculateNextDayDeliveryCountdown(): string {
    const now = new Date(); const endTime = new Date(now);
    endTime.setHours(22, 0, 0, 0);
    if (now > endTime) endTime.setDate(endTime.getDate() + 1);
    const remaining = endTime.getTime() - now.getTime();
    if (remaining <= 0) return "00:00:00";
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
    const minutes = Math.floor((remaining / 1000 / 60) % 60).toString().padStart(2, '0');
    const seconds = Math.floor((remaining / 1000) % 60).toString().padStart(2, '0');
    return `${hours}u ${minutes}m ${seconds}s`;
  }
}
