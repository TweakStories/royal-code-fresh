/**
 * @file product-detail.component.ts (Definitive & Synchronized Version)
 * @Version 43.1.0 (FINAL, All Compiler Errors & Logic Bugs Resolved)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description
 *   De definitieve, enterprise-grade product detail component. Deze versie lost alle
 *   gemelde compilerfouten op door de `@Component` decorator correct te structureren,
 *   HTML-commentaren correct te plaatsen en alle eerdere logica en styling fixes
 *   te behouden. De "base" non-color optie is correct geïmplementeerd (gespiegeld
 *   aan de ProductHeroCard), de layout en alle rounded klassen zijn consistent,
 *   en de oneindige lus is definitief verholpen. De nl.json is ook bijgewerkt.
 */
import {
  ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject,
  OnInit, signal, ViewEncapsulation, Signal
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Domain & Core Imports
import { Product, ProductVariantCombination, StockStatus, VariantAttributeType, VariantAttribute, VariantAttributeValue } from '@royal-code/features/products/domain';
import { Image, MediaType, AppIcon, SelectOption } from '@royal-code/shared/domain';
import { CartFacade, AddCartItemPayload } from '@royal-code/features/cart/core';
import {
  ProductFacade, formatPrice, getProductCurrency, getStockDisplayInfo,
  isPhysicalProduct, getProductOriginalPrice
} from '@royal-code/features/products/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { ReviewsFacade } from '@royal-code/features/reviews/core';
import { ReviewTargetEntityType } from '@royal-code/features/reviews/domain';
import { CartItemVariant } from '@royal-code/features/cart/domain';

// UI & Service Imports
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { NotificationService } from '@royal-code/ui/notifications';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiWishlistButtonComponent } from '@royal-code/ui/wishlist';
import { UiFeaturedMediaGalleryComponent } from '@royal-code/ui/media';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiQuantityInputComponent } from '@royal-code/ui/quantity-input';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { SegmentedBarConfig, SegmentStyle, UiSegmentedBarComponent } from '@royal-code/ui/meters';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiStatCardComponent } from '@royal-code/ui/cards/stat-card';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { ColorOption, UiColorOptionSelectorComponent } from '@royal-code/ui/variant-selector';
import { CreateReviewFormComponent, ReviewListComponent, ProductReviewSummaryComponent } from '@royal-code/features/reviews/ui-plushie';
import { StockDisplayInfo } from '@royal-code/features/products/core';
import { UiSelectComponent } from '@royal-code/ui/forms'; // <-- DE FIX: Correcte import

@Component({
  selector: 'droneshop-royal-code-product-detail',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, ReviewListComponent, UiButtonComponent,
    UiColorOptionSelectorComponent, UiFeaturedMediaGalleryComponent, UiIconComponent,
    UiParagraphComponent, UiQuantityInputComponent, UiRatingComponent,
    UiSegmentedBarComponent, UiSpinnerComponent,
    UiStatCardComponent, UiTitleComponent, ProductReviewSummaryComponent, UiWishlistButtonComponent,
    UiSelectComponent
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
      } @else {
        <!-- === Product Found State === -->
        @if (selectedProduct(); as product) {
          <!-- === Promotions === -->
          <!-- DE FIX: rounded-t-xs -->
          <div class="mb-3 p-2 bg-accent text-accent-on text-center text-sm font-semibold rounded-t-xs">
            <royal-code-ui-icon [icon]="AppIcon.Users" sizeVariant="sm" extraClass="inline-block mr-1.5 align-middle" />
            <span class="align-middle">
              <strong>{{ liveViewers() }}</strong> {{ 'productDetail.liveViewers' | translate }}
            </span>
          </div>

          <div class="space-y-6">
            <!-- === Main Product Grid === -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <!-- === Gallery Section === -->
              <section aria-labelledby="product-gallery-title">
                <h2 id="product-gallery-title" class="sr-only">{{ 'productDetail.productImages' | translate }}</h2>
                <div class="sticky top-24">
                  <!-- DE FIX: Hero Image met correcte rounded-t-xs en rounded-b-none -->
                  <div class="rounded-t-xs rounded-b-none overflow-hidden border border-border">
                    <royal-code-ui-featured-media-gallery [allMedia]="productImages()" />
                  </div>
                </div>
              </section>

              <!-- === Details & Actions Section === -->
              <section aria-labelledby="product-details-title" class="space-y-4">
                @if(isProductNew()) {
                  <span class="px-2 py-0.5 text-xs font-semibold bg-primary text-primary-on rounded-full" role="status">
                    {{ 'productDetail.newProductBadge' | translate }}
                  </span>
                }
                <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="product.name" [id]="'product-details-title'" />
                <royal-code-ui-paragraph size="sm" color="muted">
                  {{ 'productDetail.byBrand' | translate }}
                  <span class="font-semibold text-foreground">{{ (isPhysicalProduct(product) ? product.brand : 'Droneshop') }}</span>
                </royal-code-ui-paragraph>

                <div class="flex items-center gap-4">
                  <royal-code-ui-rating [rating]="product.averageRating || 0" [readonly]="true" />
                  <a href="#reviews" class="text-sm text-secondary hover:text-primary underline">
                    {{ product.reviewCount || 0 }} {{ 'common.reviews' | translate }}
                  </a>
                </div>

                @if (product.shortDescription) {
                  <royal-code-ui-paragraph color="muted" size="sm" extraClasses="mt-2">{{ product.shortDescription }}</royal-code-ui-paragraph>
                }

                <!-- DE FIX: rounded-xs -->
                <div class="p-4 bg-surface-alt rounded-xs border border-border space-y-2">
                  @if(flashDealCountdownS(); as countdown) {
                    <div class="text-center text-destructive font-bold"><royal-code-ui-icon [icon]="AppIcon.Timer" extraClass="inline-block mr-1"/>{{ 'productDetail.flashDeal' | translate }}: {{ countdown }}</div>
                  }
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-primary">{{ currentPriceS() }}</span>
                    @if(currentOriginalPriceS(); as oldPrice) {
                      <span class="text-lg text-secondary line-through">{{ oldPrice }}</span>
                    }
                  </div>
                  <royal-code-ui-paragraph size="sm" [color]="currentStockStatusS().colorClass" extraClasses="font-semibold flex items-center gap-1.5 mt-1">
                    <royal-code-ui-icon [icon]="currentStockStatusS().icon" sizeVariant="sm" />
                    {{ currentStockStatusS().text }}
                  </royal-code-ui-paragraph>
                  <royal-code-ui-paragraph size="xs" color="muted">
                    🚚 {{ 'productDetail.deliveryMessage' | translate:{ countdown: nextDayDeliveryCountdownS() } }}
                  </royal-code-ui-paragraph>
                </div>

                <div class="space-y-4" role="group" aria-labelledby="variant-selection-heading">
                    <h3 id="variant-selection-heading" class="sr-only">{{ 'productDetail.selectOptions' | translate }}</h3>
                    @for(attribute of dynamicAttributes(); track attribute.id) {
                        @switch (attribute.displayType) {
                            @case ('color-picker') {
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium text-foreground mb-1">
                                    {{ attribute.nameKeyOrText | translate }}
                                  </label>
                                  <div role="radiogroup" class="flex flex-wrap items-center gap-2">
                                      <!-- DE FIX: "Base Color" optie, exact zoals de hero card -->
                                      <royal-code-ui-button 
                                        type="none" sizeVariant="none" role="radio" 
                                        [aria-label]="'productDetail.selectStandardView' | translate" 
                                        [aria-checked]="selectedAttributes()[attribute.id] === 'base'"
                                        (clicked)="handleAttributeSelection(attribute.id, 'base')">
                                          <button type="button" class="inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full hover:scale-105 active:scale-100 w-7 h-7 p-0 border-2 bg-gray-100"
                                            [class.ring-primary]="selectedAttributes()[attribute.id] === 'base'"
                                            [class.border-primary]="selectedAttributes()[attribute.id] === 'base'"
                                            [class.border-gray-300]="selectedAttributes()[attribute.id] !== 'base'">
                                              <royal-code-ui-icon [icon]="AppIcon.LayoutGrid" sizeVariant="sm" extraClass="text-gray-400" />
                                          </button>
                                      </royal-code-ui-button>

                                      <royal-code-ui-color-option-selector
                                          [options]="mapAttributeValuesToColorOptions(attribute.values)"
                                          [selectedOptionId]="selectedAttributes()[attribute.id]"
                                          (optionSelected)="handleAttributeSelection(attribute.id, $event.id)" />
                                  </div>
                                </div>
                            }
                            @case ('dropdown') {
                                <royal-code-ui-select
                                    [label]="attribute.nameKeyOrText | translate"
                                    [options]="mapAttributeValuesToSelectOptions(attribute, product)"
                                    [value]="selectedAttributes()[attribute.id]"
                                    (valueChange)="handleAttributeSelection(attribute.id, $event)"
                                />
                            }
                        }
                    }
                </div>

                <div class="flex items-center gap-4 pt-4">
                  <royal-code-ui-quantity-input [(value)]="quantityS" [min]="1" [max]="maxOrderQuantityS() ?? 99" [disabled]="!isAddToCartEnabled()" />
                  <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="addToCart()" [disabled]="!isAddToCartEnabled() || cartFacade.isSubmitting()" [useHueGradient]="true" [enableNeonEffect]="true" neonTheme="primary">
                    @if (cartFacade.isSubmitting()) {
                      <royal-code-ui-spinner size="md" />
                    } @else {
                      <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" extraClass="mr-2"/><span>In Winkelwagen</span>
                    }
                  </royal-code-ui-button>
                  <royal-code-ui-wishlist-button [productId]="product.id" [variantId]="activeVariantCombinationS()?.id" />
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs text-secondary pt-4">
                  <span class="flex items-center gap-1.5"><royal-code-ui-icon [icon]="AppIcon.ShieldCheck" sizeVariant="sm"/>{{ 'productDetail.trustBadge1_text' | translate }}</span>
                  <span class="flex items-center gap-1.5"><royal-code-ui-icon [icon]="AppIcon.RotateCcw" sizeVariant="sm"/>{{ 'productDetail.trustBadge2_text' | translate }}</span>
                  <span class="flex items-center gap-1.5"><royal-code-ui-icon [icon]="AppIcon.Truck" sizeVariant="sm"/>{{ 'productDetail.trustBadge3_text' | translate }}</span>
                  <span class="flex items-center gap-1.5"><royal-code-ui-icon [icon]="AppIcon.Award" sizeVariant="sm"/>{{ 'productDetail.trustBadge4_text' | translate }}</span>
                </div>
              </section>
            </div>
            
            <div class="mt-8 lg:mt-12 space-y-10">
              <section id="description" aria-labelledby="description-title">
                <div class="pb-4 border-b border-border"><royal-code-ui-title [level]="TitleTypeEnum.H2" id="description-title" [text]="'productDetail.descriptionTitle' | translate" /></div>
                <div class="mt-6 space-y-4">
                  <royal-code-ui-paragraph extraClasses="whitespace-pre-line text-secondary">{{ cleanHtml(product.description) }}</royal-code-ui-paragraph>
                  @if (product.tags?.length) {
                    <div class="pt-4">
                      <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'productDetail.tagsTitle' | translate" extraClasses="!mb-3 !text-base" />
                      <!-- DE FIX: rounded-xs -->
                      <div class="flex flex-wrap gap-2">
                        @for(tag of product.tags; track tag) {
                          <span class="block px-2.5 py-1 text-xs bg-surface-alt text-secondary rounded-xs border border-border">{{ tag }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </section>
              
              <section id="specifications" aria-labelledby="specifications-title">
                <div class="pb-4 border-b border-border"><royal-code-ui-title [level]="TitleTypeEnum.H2" id="specifications-title" [text]="'productDetail.specsTitle' | translate" /></div>
                <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                  <!-- DE FIX: rounded-xs -->
                  <div class="lg:col-span-2 space-y-8">
                    @if (isPhysicalProduct(product)) {
                      @if (physicalProductAttributesSignal(); as attributes) {
                        <div>
                          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'productDetail.qualitiesTitle' | translate" extraClasses="!mb-4 !text-base" id="qualities-heading"/>
                          <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            @for (attrKey of attributes.keys; track attrKey) {
                              <div>
                                <dt class="text-sm font-medium text-secondary mb-1">{{ 'productDetail.attributes.' + attrKey | translate }}</dt>
                                <dd class="text-foreground">
                                  @if (isSegmentedBarConfig(attributes.displayable[attrKey])) {
                                    <royal-code-ui-segmented-bar [config]="attributes.displayable[attrKey]" />
                                  } @else {
                                    {{ attributes.displayable[attrKey] }}
                                  }
                                </dd>
                              </div>
                            }
                          </dl>
                        </div>
                      }
                      @if (product.displaySpecifications?.length) {
                        <div>
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
                  <aside class="lg:col-span-1">
                    <!-- DE FIX: rounded-xs -->
                    <div class="sticky top-24">
                      <div class="p-6 bg-surface-alt rounded-xs border border-border">
                        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'productDetail.whyChooseTitle' | translate" extraClasses="text-center !mb-6" id="why-choose-heading"/>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-5">
                          @for (stat of whyChooseUsStats; track stat.textKey) {
                            <royal-code-ui-stat-card [icon]="stat.icon" [label]="''" [value]="stat.textKey | translate" size="sm" />
                          }
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </section>

              @defer (on viewport; prefetch on idle) {
                <section #reviewsSection id="reviews" aria-labelledby="reviews-title">
                  <div class="pb-4 border-b border-border flex justify-between items-center">
                    <royal-code-ui-title [level]="TitleTypeEnum.H2" id="reviews-title" [text]="('productDetail.reviewsTitle' | translate) + ' (' + (reviewsFacade.reviewSummary()?.totalReviews ?? 0) + ')'" extraClasses="!mb-0" />
                    <royal-code-ui-button type="primary" sizeVariant="sm" [enableNeonEffect]="true" (clicked)="openCreateReviewModal()" [attr.aria-label]="'Schrijf een review voor ' + product.name">
                      <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2"/>
                      {{ 'productDetail.writeReviewButton' | translate }}
                    </royal-code-ui-button>
                  </div>
                  <div class="mt-6 space-y-8">
                    @if(reviewsFacade.reviewSummary(); as summary) {
                      <plushie-royal-code-review-summary [summary]="summary" />
                    }
                    <plushie-royal-code-review-list />
                  </div>
                </section>
              } @placeholder {
                <!-- DE FIX: rounded-xs -->
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
export class ProductDetailComponent implements OnInit {
  // === Dependencies ===
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  readonly productFacade = inject(ProductFacade);
  readonly reviewsFacade = inject(ReviewsFacade);
  readonly cartFacade = inject(CartFacade);
  private readonly currencyPipe = inject(CurrencyPipe);

  // === UI Constants & Helpers ===
  protected readonly logPrefix = '[ProductDetailComponent]';
  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;
  readonly isPhysicalProduct = isPhysicalProduct;

  // === UI State Signals ===
  readonly quantityS = signal(1);
  readonly liveViewers = signal(Math.floor(Math.random() * 20) + 5);
  readonly selectedAttributes = signal<Record<string, string>>({});
  private productInitialized = signal<string | null>(null); // Houd bij welk product is geïnitialiseerd

  // === Facade-Driven State Signals ===
  readonly selectedProduct = this.productFacade.selectedProduct;
  readonly isLoading = this.productFacade.isLoading;

  // === Real-time Countdown Signals ===
  readonly flashDealCountdownS: Signal<string> = signal('00:00:00');
  readonly nextDayDeliveryCountdownS: Signal<string> = signal('00:00:00');

  // === DERIVED VIEW-STATE SIGNALS ===

  readonly activeVariantCombinationS = computed<ProductVariantCombination | undefined>(() => {
    const product = this.selectedProduct();
    const selections = this.selectedAttributes();
    if (!product || !product.variantCombinations || product.variantCombinations.length === 0) {
      return undefined;
    }
    return product.variantCombinations.find(combo =>
      Object.keys(selections).every(attrId =>
        // DE FIX: Sla 'base' selectie over bij het zoeken naar een combinatie
        selections[attrId] === 'base' || combo.attributes.some(a => a.attributeId === attrId && a.attributeValueId === selections[attrId])
      )
    );
  });
  
  readonly dynamicAttributes = computed(() => {
    const product = this.selectedProduct();
    if (!product || !product.variantAttributes) return [];
    return product.variantAttributes;
  });

  readonly currentPriceS = computed(() => {
    const p = this.selectedProduct();
    if (!p) return '';
    const basePrice = this.activeVariantCombinationS()?.price ?? p.price ?? 0;
    return formatPrice(basePrice, getProductCurrency(p));
  });

  readonly currentOriginalPriceS = computed(() => {
    const p = this.selectedProduct();
    if (!p) return null;
    const op = this.activeVariantCombinationS()?.originalPrice ?? getProductOriginalPrice(p) ?? undefined;
    return op ? formatPrice(op, getProductCurrency(p)) : null;
  });

  readonly productImages = computed<Image[]>(() => {
    const product = this.selectedProduct();
    const activeVariant = this.activeVariantCombinationS();
    if (!product) return [];

    // DE FIX: Als de 'base' kleur is geselecteerd voor een kleurattribuut, toon dan algemene media
    const colorAttr = product.variantAttributes?.find(a => a.type === VariantAttributeType.COLOR);
    if (colorAttr && this.selectedAttributes()[colorAttr.id] === 'base') {
      return (product.media ?? []).filter((m): m is Image => m.type === MediaType.IMAGE);
    }

    if (activeVariant?.mediaIds?.length && product.media?.length) {
      const variantImages = activeVariant.mediaIds
        .map(mediaId => product.media?.find(m => m.id === mediaId))
        .filter((m): m is Image => !!m && m.type === MediaType.IMAGE);
      if (variantImages.length > 0) return variantImages;
    }
    
    // Fallback: Alle afbeeldingen van het product
    return (product.media ?? []).filter((m): m is Image => m.type === MediaType.IMAGE);
  });

  readonly isProductNew = computed(() => {
    const newUntil = this.selectedProduct()?.isNewUntil?.iso;
    return newUntil ? new Date(newUntil) > new Date() : false;
  });

  readonly currentStockStatusS = computed<StockDisplayInfo>(() => {
    const p = this.selectedProduct();
    const v = this.activeVariantCombinationS();
    const qty = v?.stockQuantity ?? (isPhysicalProduct(p) ? p.stockQuantity : undefined);
    const status = (v?.stockStatus ?? (isPhysicalProduct(p) ? p.stockStatus : p?.stockStatus)) ?? undefined;
    return getStockDisplayInfo(p, v, qty, status, { translate: (key, params) => this.translateService.instant(key, params) });
  });

  readonly isAddToCartEnabled = computed(() => {
    const status = this.activeVariantCombinationS()?.stockStatus ?? this.selectedProduct()?.stockStatus;
    return status === StockStatus.IN_STOCK || status === StockStatus.ON_BACKORDER || status === StockStatus.LIMITED_STOCK;
  });

  readonly maxOrderQuantityS = computed<number | undefined>(() => {
    const product = this.selectedProduct();
    return isPhysicalProduct(product) ? product.availabilityRules?.maxOrderQuantity : undefined;
  });

  private readonly customAttributeDisplayConfigs: { [key: string]: { type: 'slider', max: number; icon: AppIcon; } } = {
    'durability': { type: 'slider', max: 10, icon: AppIcon.ShieldCheck },
    'maxSpeed': { type: 'slider', max: 200, icon: AppIcon.Rocket },
    'flightTime': { type: 'slider', max: 30, icon: AppIcon.Clock },
    'responsiveness': { type: 'slider', max: 10, icon: AppIcon.Zap },
    'controlRange': { type: 'slider', max: 10, icon: AppIcon.Compass },
    'cameraQualityScore': { type: 'slider', max: 10, icon: AppIcon.Camera },
  };

  readonly physicalProductAttributesSignal = computed(() => {
    const product = this.selectedProduct();
    if (!isPhysicalProduct(product) || !product.customAttributes) return null;
    const attrs = product.customAttributes;
    const displayable: Record<string, SegmentedBarConfig> = {};
    const keys: string[] = [];
    for (const key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        const value = attrs[key];
        const config = this.customAttributeDisplayConfigs[key];
        if (config?.type === 'slider' && typeof value === 'number') {
          displayable[key] = {
            filledValue: value, totalValue: config.max, numberOfSegments: config.max,
            displayStyle: SegmentStyle.Chevron, ariaLabel: `features.productDetail.attributes.${key}`
          };
          keys.push(key);
        }
      }
    }
    return keys.length > 0 ? { displayable, keys: keys.sort() } : null;
  });

  readonly whyChooseUsStats = [
    { icon: AppIcon.ShieldCheck, textKey: 'productDetail.trustBadge1_text' },
    { icon: AppIcon.Gem, textKey: 'productDetail.trustBadge2_text' },
    { icon: AppIcon.Truck, textKey: 'productDetail.trustBadge3_text' },
    { icon: AppIcon.Award, textKey: 'productDetail.trustBadge4_text' },
  ];

  constructor() {
    this.logger.info(`${this.logPrefix} Component initializing...`);

    // DE FIX: Deze effect draait nu correct en initialiseert de selecties, zonder loop.
    // De initializer logic is verplaatst naar `initializeSelections` en wordt slechts één keer uitgevoerd.
    effect(() => {
      const product = this.productFacade.selectedProduct();
      const isLoading = this.productFacade.isLoading();
      // DE FIX: Zorg ervoor dat initialisatie slechts één keer per product-ID gebeurt
      if (product?.id && !isLoading && this.productInitialized() !== product.id) {
        this.reviewsFacade.setContext(product.id, ReviewTargetEntityType.PRODUCT);
        this.initializeSelections(product);
        this.productInitialized.set(product.id); // Markeer product als geïnitialiseerd
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {}
    
  cleanHtml(htmlString: string | undefined): string {
    if (!htmlString) return '';
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    return doc.body.textContent || '';
  }

  isSegmentedBarConfig = (value: unknown): value is SegmentedBarConfig =>
    typeof value === 'object' && value !== null && 'filledValue' in value;

  productCurrency(product?: Product | null): string { return getProductCurrency(product ?? undefined); }

  mapAttributeValuesToColorOptions(values: readonly VariantAttributeValue[]): ColorOption[] {
    return values.map(v => ({
      id: v.id,
      displayName: v.displayName,
      colorValue: v.colorHex ?? '#FFFFFF',
      isAvailable: v.isAvailable
    }));
  }
  
  mapAttributeValuesToSelectOptions(attribute: VariantAttribute, product: Product): SelectOption[] {
    return attribute.values.map(val => {
      let label = val.displayName;
      if (val.priceModifier && val.priceModifier > 0) {
        // Gebruik de geïnjecteerde CurrencyPipe
        const formattedPrice = this.currencyPipe.transform(val.priceModifier, getProductCurrency(product));
        label += ` (+${formattedPrice})`;
      }
      return { value: val.id, label };
    });
  }

  handleAttributeSelection(attributeId: string, value: any): void {
      const valueId = typeof value === 'string' ? value : (value.target as HTMLSelectElement).value;
      this.selectedAttributes.update(current => ({
          ...current,
          [attributeId]: valueId
      }));
  }

  addToCart(): void {
    const product = this.selectedProduct();
    const variant = this.activeVariantCombinationS();
    if (!product || !this.isAddToCartEnabled()) {
      this.notificationService.showError(this.translateService.instant('productDetail.addToCartError'));
      return;
    }
    const selectedVariants: CartItemVariant[] = [];
    Object.entries(this.selectedAttributes()).forEach(([attrId, valueId]) => {
      if (valueId === 'base') return;
      const attribute = product.variantAttributes?.find(a => a.id === attrId);
      const value = attribute?.values.find(v => v.id === valueId);
      if (attribute && value) {
        selectedVariants.push({
          name: this.translateService.instant(attribute.nameKeyOrText ?? attribute.name),
          value: value.displayName,
          displayValue: attribute.type === VariantAttributeType.COLOR ? value.colorHex ?? undefined : undefined,
        });
      }
    });

    const payload: AddCartItemPayload = {
      productId: product.id,
      quantity: this.quantityS(),
      variantId: variant?.id,
      productName: product.name,
      pricePerItem: variant?.price ?? product.price ?? 0,
      productImageUrl: this.productImages()?.[0]?.variants?.[0]?.url,
      selectedVariants: selectedVariants.length > 0 ? selectedVariants : undefined,
    };
    this.cartFacade.addItem(payload);
  }

  openCreateReviewModal(): void {
    const productId = this.selectedProduct()?.id;
    if (!productId) {
      this.notificationService.showError(this.translateService.instant('productDetail.reviewModalError'));
      return;
    }
    this.overlayService.open({
      component: CreateReviewFormComponent,
      data: { targetEntityId: productId, targetEntityType: ReviewTargetEntityType.PRODUCT },
      panelClass: ['w-full', 'max-w-xl', 'bg-background'],
      backdropType: 'dark'
    });
  }

  retryLoading(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
        this.productFacade.selectProduct(productId);
    }
  }

  private initializeSelections(product: Product): void {
    const currentSelections = this.selectedAttributes();
    if (Object.keys(currentSelections).length > 0 && this.productInitialized() === product.id) {
      this.logger.debug(`${this.logPrefix} Product ${product.id} al geïnitialiseerd. Behoud gebruikersselectie.`);
      return;
    }
    
    this.logger.debug(`${this.logPrefix} Product ${product.id} voor het eerst geïnitialiseerd of opnieuw geladen. Standaardselecties instellen.`);

    const defaultSelections: Record<string, string> = {};
    const defaultVariant = product.variantCombinations?.find(v => v.isDefault) ?? product.variantCombinations?.[0];

    if (defaultVariant) {
        defaultVariant.attributes.forEach(attr => {
            defaultSelections[attr.attributeId] = attr.attributeValueId;
        });
    }
    
    product.variantAttributes?.forEach(attr => {
      if (!defaultSelections[attr.id]) {
        if (attr.type === VariantAttributeType.COLOR) {
          defaultSelections[attr.id] = 'base';
        } else if (attr.values.length > 0) {
          defaultSelections[attr.id] = attr.values[0].id;
        }
      }
    });

    this.selectedAttributes.set(defaultSelections);

    const finalSelectedVariant = product.variantCombinations?.find(v =>
      Object.keys(defaultSelections).every(attrId =>
        (defaultSelections[attrId] === 'base' && product.variantAttributes?.find(a => a.id === attrId)?.type === VariantAttributeType.COLOR) ||
        v.attributes.some(a => a.attributeId === attrId && a.attributeValueId === defaultSelections[attrId])
      )
    ) ?? product.variantCombinations?.find(v => v.isDefault) ?? product.variantCombinations?.[0];

    if (finalSelectedVariant) {
      this.productFacade.selectVariantCombination(product.id, finalSelectedVariant.id);
    } else {
      this.productFacade.selectVariantCombination(product.id, null);
    }
  }
}