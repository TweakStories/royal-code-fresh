/**
 * @file product-hero-card.component.ts
 * @Version 8.1.0 (UI Fixes: Centered Button & Consistent Border)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-08
 * @description
 *   De definitieve implementatie van de ProductHeroCard.
 *   - FIX: De "Shop Now" knop is nu correct horizontaal gecentreerd in de footer.
 *   - FIX: De rand is nu 2px en de hover-state is consistent met andere kaarten.
 */
import {
  Component, ChangeDetectionStrategy, computed, inject, input, Signal, Injector
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

// --- Domain, Core & UI Imports ---
import { AppIcon } from '@royal-code/shared/domain';
import { Image, Media, MediaType } from '@royal-code/shared/domain';
import { Product, ProductVariantCombination, VariantAttributeType } from '@royal-code/features/products/domain';
import { ProductFacade, formatPrice, getProductCurrency, getProductOriginalPrice, getProductPrice } from '@royal-code/features/products/core';
import { AddCartItemPayload, CartFacade } from '@royal-code/features/cart/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { ProductQuickViewComponent } from '../product-quick-view/product-quick-view.component';

// --- UI Component Imports ---
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiColorOptionSelectorComponent, ColorOption } from '@royal-code/ui/variant-selector';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiMediaSliderComponent } from '@royal-code/ui/media';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-product-hero-card',
  standalone: true,
  imports: [
    RouterModule, TranslateModule, UiButtonComponent, UiColorOptionSelectorComponent,
    UiIconComponent, UiMediaSliderComponent, UiParagraphComponent, UiRatingComponent, UiTitleComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product(); as product) {
      <div
        class="product-hero-card group/card bg-card text-foreground rounded-xs shadow-md hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-0.5 overflow-hidden flex flex-col h-full border-2 border-border hover:border-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background"
        (keydown.enter)="onViewDetailsGeneral($event)" tabindex="0" role="article"
        [attr.aria-labelledby]="product.id + '-title'">
       <header class="relative">
        <royal-code-ui-media-slider
          [images]="displayImagesS()"
          (imageClicked)="openImageInLightbox($event)"
          [aspectRatio]="'4/3'"
          [objectFit]="'cover'"
          [showArrowsOnHover]="true"
        />
        @if (isVariantLoadingS()) {
          <div class="absolute inset-0 bg-background/70 flex items-center justify-center z-10">
             <p>{{ 'products.loadingImages' | translate }}</p>
          </div>
        }
      </header>
        <footer class="p-3 sm:p-4 border-t-2 border-black bg-surface-alt mt-auto flex flex-col flex-grow">
          @if (colorOptionsS().length > 1) {
            <div class="color-picker-section flex justify-center mb-2">
              <royal-code-ui-color-option-selector
                [options]="colorOptionsS()"
                [selectedOptionId]="selectedColorAttributeValueIdS()"
                (optionSelected)="onColorSelected($event)"
                [showCheckmarkOnSelected]="true"/>
            </div>
          }
          <div class="text-center mb-2">
            <a [routerLink]="['/products', product.id]" [queryParams]="variantQueryParamsS()" (click)="$event.stopPropagation()" class="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background-secondary rounded-sm -m-0.5 p-0.5 block group" [attr.aria-label]="('products.viewDetailsFor' | translate: { name: product.name })" [title]="('products.viewDetailsFor' | translate: { name: product.name })">
              <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="product.name" [id]="product.id + '-title'" extraClasses="text-md sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2 !mb-0" />
            </a>
          </div>
          <div class="flex items-baseline justify-center mb-1.5">
            <span class="text-base sm:text-lg font-semibold text-primary mr-1.5">{{ currentPriceS() }}</span>
            @if (originalPriceS(); as originalPrice) {
              <span class="text-xs sm:text-sm text-secondary line-through">{{ originalPrice }}</span>
            }
          </div>
          <div class="flex items-center justify-center text-xs text-secondary mb-2">
            @if (product.reviewCount && product.reviewCount > 0 && product.averageRating) {
              <royal-code-ui-rating [rating]="product.averageRating" [readonly]="true" />
              <span class="ml-1 font-semibold text-foreground">{{ (product.averageRating / 2).toFixed(1) }}</span>
              <span class="ml-0.5">({{ 'products.reviewCountText' | translate: { count: product.reviewCount } }})</span>
            } @else {
              <royal-code-ui-paragraph size="xs" extraClasses="italic text-muted-foreground text-center">{{ 'products.noReviewsYet' | translate }}</royal-code-ui-paragraph>
            }
          </div>
          @if(!hideTags() && product.tags && product.tags.length > 0) {
            <div class="flex flex-wrap gap-1.5 justify-center mb-2">
              @for (tag of product.tags.slice(0, 3); track tag) {
                <span class="block px-2 py-0.5 text-[10px] font-medium bg-accent text-accent-on rounded-full leading-tight">{{ tag }}</span>
              }
            </div>
          }
          <div class="flex-grow"></div>
          @if(!hideShopNowButton()) {
            <div class="mt-3 flex justify-center">
              <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="onActionButtonClicked($event); $event.stopPropagation()" [attr.aria-label]="(requiresVariantSelectionS() ? 'products.viewOptionsAria' : 'products.addToCartAria') | translate:{ name: product.name }" [enableNeonEffect]="true" neonTheme="primary">
                @if (requiresVariantSelectionS()) {
                  {{ 'products.viewOptions' | translate }}
                  <royal-code-ui-icon [icon]="AppIcon.Settings" sizeVariant="sm" extraClass="ml-2" />
                } @else {
                  {{ 'products.addToCart' | translate }}
                  <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" sizeVariant="sm" extraClass="ml-2" />
                }
              </royal-code-ui-button>
            </div>
          }
        </footer>
      </div>
    } @else {
      <div class="product-hero-card-empty p-4 bg-card text-secondary rounded-xs shadow-md border border-border flex items-center justify-center h-full aspect-[4/3]">
        <royal-code-ui-paragraph>{{ 'products.loadingProduct' | translate }}</royal-code-ui-paragraph>
      </div>
    }
  `,
  styles: [`:host { display: flex; flex-direction: column; height: 100%; width: 100%; outline: none; }`]
})
export class ProductHeroCardComponent {
  productInput = input.required<Product | undefined>();
  hideShopNowButton = input<boolean>(false);
  hideTags = input<boolean>(false);

  private readonly productFacade = inject(ProductFacade);
  private readonly cartFacade = inject(CartFacade);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly injector = inject(Injector);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly logPrefix = '[ProductHeroCard]';

  readonly AppIcon = AppIcon;
  readonly TitleTypeEnum = TitleTypeEnum;

  readonly product: Signal<Product | undefined> = this.productInput;
  readonly isVariantLoadingS: Signal<boolean>;

  readonly selectedVariantS: Signal<ProductVariantCombination | undefined> = computed(() => {
    const p = this.product();
    if (!p?.id || !p.variantCombinations?.length) return undefined;
    const selectedVariantCombinationId = this.productFacade.viewModel().selectedVariantCombinationIdByProduct[p.id];
    if (selectedVariantCombinationId) return p.variantCombinations.find(vc => vc.id === selectedVariantCombinationId);
    return p.variantCombinations.find(vc => vc.isDefault) ?? p.variantCombinations[0];
  });

  readonly currentPriceS = computed(() => {
      const p = this.product();
      return p ? formatPrice(getProductPrice(p, this.selectedVariantS()?.id), getProductCurrency(p)) : '';
  });

  readonly originalPriceS = computed(() => {
      const p = this.product();
      if (!p) return null;
      const originalPrice = getProductOriginalPrice(p, this.selectedVariantS()?.id);
      return originalPrice ? formatPrice(originalPrice, getProductCurrency(p)) : null;
  });

  readonly currencyS = computed(() => getProductCurrency(this.product()));

  readonly colorOptionsS: Signal<ColorOption[]> = computed(() => {
    const p = this.product();
    const options: ColorOption[] = [];

    // FIXED: Voeg 'none' base optie toe als eerste
    options.push({
      id: 'none',
      displayName: 'Standaard',
      colorValue: '#F5F5F5', // Wordt niet gebruikt voor 'none'
      isAvailable: true,
    });

    // Voeg specifieke kleurvarianten toe
    if (p?.colorVariants && p.colorVariants.length > 0) {
      const colorOptions = p.colorVariants.map(cv => ({
        id: cv.attributeValueId,
        displayName: cv.displayName,
        colorValue: cv.colorHex ?? '#FFFFFF',
        isAvailable: true,
        variantCombinationId: cv.defaultVariantId,
      }));
      options.push(...colorOptions);
    }

    return options;
  });

  readonly selectedColorAttributeValueIdS: Signal<string | null | undefined> = computed(() => {
    const p = this.product();
    if (!p?.id) return 'none'; // FIXED: default naar 'none'

    const selectedVariantCombinationId = this.productFacade.viewModel().selectedVariantCombinationIdByProduct[p.id];

    if (selectedVariantCombinationId && p.colorVariants?.length) {
      const matchingColorVariant = p.colorVariants.find(cv => cv.defaultVariantId === selectedVariantCombinationId);
      if (matchingColorVariant) {
        return matchingColorVariant.attributeValueId;
      }
    }

    // Default naar 'none' (base)
    return 'none';
  });

  readonly displayImagesS: Signal<Image[]> = computed(() => {
    const p = this.product();
    if (!p) return [];

    const selectedColorId = this.selectedColorAttributeValueIdS();

    // FIXED: Check voor 'none' in plaats van 'base'
    if (!selectedColorId || selectedColorId === 'none') {
      // Gebruik algemene product media als base
      return (p.media ?? []).filter((m): m is Image => m.type === MediaType.IMAGE);
    }

    // Specifieke kleur geselecteerd - zoek in colorVariants
    if (p.colorVariants?.length) {
      const selectedColorVariant = p.colorVariants.find(cv => cv.attributeValueId === selectedColorId);

      if (selectedColorVariant?.media?.length) {
        return selectedColorVariant.media.filter((m): m is Image => m.type === MediaType.IMAGE);
      }
    }

    // Fallback naar algemene product media
    return (p.media ?? []).filter((m): m is Image => m.type === MediaType.IMAGE);
  });

  readonly variantQueryParamsS = computed(() => {
    const variantId = this.selectedVariantS()?.id;
    return variantId ? { variant: variantId } : {};
  });

  readonly requiresVariantSelectionS = computed(() => {
    const p = this.product();
    if (!p?.variantAttributes) return false;
    return p.variantAttributes.some(attr => attr.isRequired);
  });

  constructor() {
    const isLoading$: Observable<boolean> = of(false);
    this.isVariantLoadingS = toSignal(isLoading$, { initialValue: false, injector: this.injector });
  }

  onColorSelected(color: ColorOption): void {
    const product = this.product();
    if (!product) return;

    if (color.id === 'none') {
      // Voor 'none': clear selection of selecteer een neutrale staat
      this.productFacade.selectVariantCombination(product.id, null);
    } else if (color.variantCombinationId) {
      // Normale kleur selectie
      this.productFacade.selectVariantCombination(product.id, color.variantCombinationId);
    }
  }

  onActionButtonClicked(event: MouseEvent): void {
    event.stopPropagation();
    const p = this.product();
    if (!p) return;

    if (this.requiresVariantSelectionS()) {
      this.logger.debug(`${this.logPrefix} Actieknop 'Opties bekijken' geklikt. Openen van ProductQuickViewComponent voor product ID: ${p.id}.`);

      const overlayRef = this.overlayService.open({
        component: ProductQuickViewComponent,
        data: { productId: p.id },
        panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
        backdropType: 'dark',
        closeOnClickOutside: true,
      });

      overlayRef.afterClosed$.subscribe(() => {
        this.logger.debug(`${this.logPrefix} Quick View gesloten. Productselectie wordt opgeschoond.`);
        this.productFacade.selectProduct(null);
      });

    } else {
      this.logger.debug(`${this.logPrefix} Actieknop 'Toevoegen aan winkelwagen' geklikt voor product ID: ${p.id}.`);
      const payload: AddCartItemPayload = {
        productId: p.id,
        quantity: 1,
        productName: p.name,
        pricePerItem: getProductPrice(p, undefined),
        productImageUrl: (p.media?.find(m => m.type === MediaType.IMAGE) as Image)?.variants?.[0]?.url,
      };
      this.cartFacade.addItem(payload);
    }
  }

  onViewDetailsGeneral(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, [role="button"], [role="tab"], .color-picker-section')) return;
    const p = this.product();
    if (p) this.router.navigate(['/products', p.id], { queryParams: this.variantQueryParamsS() });
  }

  openImageInLightbox(image: Media): void {
    this.logger.info(`[ProductHeroCard] Lightbox requested for:`, image);
  }
}