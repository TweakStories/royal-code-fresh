/**
 * @file droneshop-homepage.component.ts
 * @Version 3.0.1 (Azure deployment fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-15 (Final token verification test)
 * @Description
 *   De definitieve homepage component. Deze versie lost alle eerdere problemen op:
 *   - Consistente mobiele layout voor promo-blokken (full-width op kleine schermen).
 *   - Correcte verticale afstand tussen secties door overkoepelend spacing-beheer.
 *   - De gradient op de full-width kaarten wordt nu altijd correct gerenderd.
 *   - Verwijdering van alle onnodige comments uit de template en `[ngClass]` expressies.
 */
import {
  Component, ChangeDetectionStrategy as CDS, OnInit, inject, signal, computed
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { ProductFacade } from '@royal-code/features/products/core';
import { ProductListCardComponent, ProductGridComponent } from '@royal-code/ui/products';
import { FeedComponent } from '@royal-code/features/social/ui';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { CommonModule } from '@angular/common';
import { UiImageComponent } from '@royal-code/ui/media';
import { SafeHtmlPipe } from '@royal-code/shared/utils';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiFullWidthImageCardComponent } from '@royal-code/ui/cards/full-width-image-card';
import { AiChatComponent } from '@royal-code/features/chat/ui-plushie';

interface PromoBlockItem {
  id: string; titleKey: string; subtitleKey: string; imageUrl: string; route: string; sizeVariant?: 'hero';
}

interface ServiceCardItem {
  id: string; titleKey: string; subtitleKey: string; route: string; icon: AppIcon;
}

@Component({
  selector: 'app-droneshop-home',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, UiIconComponent, UiButtonComponent,
    ProductListCardComponent, AiChatComponent, FeedComponent,
    UiTitleComponent, ProductGridComponent, UiSpinnerComponent,
    UiImageComponent, UiCardComponent, UiFullWidthImageCardComponent, SafeHtmlPipe
  ],
  changeDetection: CDS.OnPush,
  template: `
    <div class="droneshop-home-container space-y-12 md:space-y-16">

      <!-- SECTIE 1: Hero - Single Funnel Entry Point & AI Assistent -->
      <section class="relative">
        <div class="flex flex-col lg:flex-row gap-0 lg:items-stretch">
          <div class="w-full lg:w-2/3">
            <a routerLink="/products" class="relative block group/hero-card h-full min-h-[375px] overflow-hidden rounded-none">
              <iframe
                [src]="('https://www.youtube.com/embed/YNuc4wsvnZY?autoplay=1&controls=0&showinfo=0&rel=0&loop=1&mute=1&playlist=YNuc4wsvnZY' | safeHtml:'resourceUrl')"
                class="absolute inset-0 w-full h-full object-cover"
                width="100%"
                height="100%"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                frameborder="0"
                title="Drone Hero Video"
                loading="lazy"
              ></iframe>
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-10"></div>
              <div class="absolute inset-0 p-8 flex flex-col justify-end z-20 text-white">
                <h2 class="text-4xl font-bold mb-3 [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">{{ 'droneshop.home.mainHero.title' | translate }}</h2>
                <p class="text-white/90 max-w-md mb-6 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{{ 'droneshop.home.mainHero.subtitle' | translate }}</p>
                <div class="flex flex-col sm:flex-row gap-3">
                  <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="$event.preventDefault(); $event.stopPropagation(); navigateTo('/drones/rtf-drones')">
                    <royal-code-ui-icon [icon]="AppIcon.PlayCircle" extraClass="mr-2"/>{{ 'droneshop.home.mainHero.ctaRtf' | translate }}
                  </royal-code-ui-button>
                  <royal-code-ui-button type="outline" sizeVariant="lg" (clicked)="$event.preventDefault(); $event.stopPropagation(); navigateTo('/drones/build-kits')">
                    <royal-code-ui-icon [icon]="AppIcon.Wrench" extraClass="mr-2"/>{{ 'droneshop.home.mainHero.ctaBuild' | translate }}
                  </royal-code-ui-button>
                </div>
              </div>
            </a>
          </div>
          <div class="w-full lg:w-1/3">
             <royal-code-ai-chat class="h-full w-full flex flex-col min-h-[375px]" ngSkipHydration />
          </div>
        </div>
      </section>

      <!-- SECTIE 2: Featured Products Grid -->
      <section aria-labelledby="featured-title">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H2" 
          [text]="'droneshop.home.featured.title' | translate" 
          extraClasses="!text-2xl !font-semibold !mb-4 !text-center md:!text-left" /> 
        <div class="bg-surface-alt p-6 rounded-xs">
          @if (productFacade.isLoading() && productFacade.featuredProducts().length === 0) {
            <p class="text-center text-secondary italic py-5 flex items-center justify-center gap-2">
              <royal-code-ui-spinner size="sm" />
              <span>{{ 'droneshop.home.featured.loading' | translate }}</span>
            </p>
          } @else if (productFacade.featuredProducts().length > 0) {
            <royal-code-ui-product-grid [products]="featuredProducts()" />
          } @else {
            <p class="text-center text-secondary italic py-5">{{ 'droneshop.home.featured.noProducts' | translate }}</p>
          }
        </div>
      </section>

      <!-- SECTIE 3: Nieuw Binnen & Social Feed -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div aria-labelledby="new-arrivals-title" class="h-full">
          <royal-code-ui-title 
            [level]="TitleTypeEnum.H2" 
            [text]="'droneshop.home.newArrivals.title' | translate" 
            extraClasses="!text-2xl !font-semibold !mb-4" /> 
          <div class="bg-surface-alt p-6 rounded-xs h-full">
            @if (newArrivals().length > 0) {
              <div class="space-y-3">
                @for (product of newArrivals(); track product.id) {
                  <royal-code-ui-product-list-card [productInput]="product" />
                }
              </div>
            } @else {
              <p class="text-center text-secondary italic py-5">{{ 'droneshop.home.newArrivals.loading' | translate }}</p>
            }
          </div>
        </div>
        <div class="feed-section h-full" aria-labelledby="feed-title">
          <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'droneshop.home.feed.title' | translate" extraClasses="!text-2xl !font-semibold !mb-4" />
          <div class="bg-surface-alt p-6 rounded-xs h-full">
            <royal-code-feed [feedId]="'droneshop-home'" [maximumNumberOfFeedItems]="2" />
          </div>
        </div>
      </section>

      <!-- SECTIE 4 & 5 GECOMBINEERD: Promoties & Gidsen -->
      <section aria-labelledby="promo-blocks-title" class="flex flex-col gap-4 lg:gap-6">
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'droneshop.home.promoBlocks.title' | translate" extraClasses="!text-2xl !font-semibold !mb-0 !text-center md:!text-left" /> 
        
        <!-- Mozaïek Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          @for (promoBlock of droneshopPromoBlocks(); track promoBlock.id; let i = $index) {
            <div [class]="i === 0 ? 'col-span-1 md:col-span-2' : 'col-span-1 md:col-span-1'">
              <ng-container [ngTemplateOutlet]="promoBlockTemplate" [ngTemplateOutletContext]="{$implicit: promoBlock}"></ng-container>
            </div>
          }
        </div>

        <!-- Full-Width Kaarten -->
        <div class="flex flex-col gap-4 lg:gap-6">
            <royal-code-ui-full-width-image-card
            class="h-[192px]" 
            imageUrl="images/default-image.webp" 
            titleKey="droneshop.home.discoverCards.guides.title"
            subtitleKey="droneshop.home.discoverCards.guides.description"
            buttonTextKey="droneshop.home.discoverCards.guides.cta"
            [route]="'/guides'"
            textAlign="left"
            [rounding]="'xs'" />
          
          <royal-code-ui-full-width-image-card
            class="h-[192px]" 
            imageUrl="images/default-image.webp" 
            titleKey="droneshop.home.discoverCards.software.title"
            subtitleKey="droneshop.home.discoverCards.software.description"
            buttonTextKey="droneshop.home.discoverCards.software.cta"
            [route]="'/downloads'"
            textAlign="right"
            [rounding]="'xs'" />
        </div>
      </section>
      
      <!-- SECTIE 6: Hulp & Service -->
      <section aria-labelledby="service-cards-title">
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'droneshop.home.serviceCards.title' | translate" extraClasses="!text-2xl !font-semibold !mb-6 !text-center" /> 
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (item of serviceCards(); track item.id) {
            <a [routerLink]="item.route" class="block group h-full">
              <royal-code-ui-card 
                extraContentClasses="!p-6 text-center bg-surface-alt border-2 border-border" 
                [rounding]="'xs'" 
                class="transition-transform duration-300 group-hover:scale-105">
                <royal-code-ui-icon [icon]="item.icon" sizeVariant="xl" extraClass="text-primary mb-4" />
                <h3 class="text-lg font-semibold text-foreground mb-2">{{ item.titleKey | translate }}</h3>
                <p class="text-sm text-secondary">{{ item.subtitleKey | translate }}</p>
              </royal-code-ui-card>
            </a>
          }
        </div>
      </section>
    </div>

    <ng-template #promoBlockTemplate let-promoBlock>
      <a [routerLink]="promoBlock.route" class="relative block w-full h-full aspect-video md:aspect-[4/3] overflow-hidden group/promo transition-transform duration-300 hover:scale-105 rounded-xs">
        <royal-code-ui-image [src]="promoBlock.imageUrl" [alt]="promoBlock.titleKey | translate" objectFit="cover" [lazyLoad]="true" class="absolute inset-0 w-full h-full" [rounding]="'none'"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-4 text-white flex flex-col items-start text-left">
          <h3 class="text-xl font-bold mb-1">{{ promoBlock.titleKey | translate }}</h3>
          <p class="text-sm text-white/90">{{ promoBlock.subtitleKey | translate }}</p>
        </div>
      </a>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    section.relative .youtube-player-full-screen {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      overflow: hidden; pointer-events: none;
    }
    section.relative .youtube-player-full-screen > div,
    section.relative .youtube-player-full-screen > div > iframe {
      width: 100% !important; height: 100% !important; position: absolute;
      top: 0; left: 0; object-fit: cover;
    }
  `],
})
export class DroneshopHomePageComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  protected readonly productFacade = inject(ProductFacade);
  private readonly router = inject(Router);

  readonly featuredProducts = this.productFacade.featuredProducts;
  readonly newArrivals = this.productFacade.allProducts;

  readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;

  readonly serviceCards = signal<ServiceCardItem[]>([
    { id: 'support', titleKey: 'droneshop.home.serviceCards.support.title', subtitleKey: 'droneshop.home.serviceCards.support.subtitle', route: '/contact', icon: AppIcon.LifeBuoy },
    { id: 'orders', titleKey: 'droneshop.home.serviceCards.orders.title', subtitleKey: 'droneshop.home.serviceCards.orders.subtitle', route: '/orders', icon: AppIcon.Package },
    { id: 'shipping', titleKey: 'droneshop.home.serviceCards.shipping.title', subtitleKey: 'droneshop.home.serviceCards.shipping.subtitle', route: '/shipping', icon: AppIcon.Truck },
    { id: 'buyersGuide', titleKey: 'droneshop.home.serviceCards.buyersGuide.title', subtitleKey: 'droneshop.home.serviceCards.buyersGuide.subtitle', route: '/guides/buyers-guide', icon: AppIcon.BookOpen }
  ]);
  
  readonly droneshopPromoBlocks = signal<PromoBlockItem[]>([
    { id: 'starter-kits', titleKey: 'droneshop.home.promoBlocks.starterKits.title', subtitleKey: 'droneshop.home.promoBlocks.starterKits.subtitle', imageUrl: 'images/default-image.webp', route: '/products?category=starter-kits', sizeVariant: 'hero' },
    { id: 'cinematic-drones', titleKey: 'droneshop.home.promoBlocks.cinematicDrones.title', subtitleKey: 'droneshop.home.promoBlocks.cinematicDrones.subtitle', imageUrl: 'images/default-image.webp', route: '/products?category=cinematic-drones' },
    { id: 'parts', titleKey: 'droneshop.home.promoBlocks.spareParts.title', subtitleKey: 'droneshop.home.promoBlocks.spareParts.subtitle', imageUrl: 'images/default-image.webp', route: '/products/parts' },
    { id: 'apparel', titleKey: 'droneshop.home.promoBlocks.apparel.title', subtitleKey: 'droneshop.home.promoBlocks.apparel.subtitle', imageUrl: 'images/default-image.webp', route: '/apparel' },
    { id: 'tuning', titleKey: 'droneshop.home.promoBlocks.tuningSetup.title', subtitleKey: 'droneshop.home.promoBlocks.tuningSetup.subtitle', imageUrl: 'images/default-image.webp', route: '/guides/tuning-setup' },
  ]);
  
  readonly colSpanConfig = computed(() => ({ 0: 2 }));

  ngOnInit(): void {
    this.loadProductData();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  private loadProductData(): void {
    this.productFacade.loadFeaturedProducts();
    this.productFacade.openPage({ initialFilters: { pageSize: 4 } }); 
  }
}