/**
 * @file apps/plushie-paradise/src/app/features/home/home.component.ts
 * @Version 4.0.0 (Corrected Product Loading Logic)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   Homepage component for Plushie Paradise. This version is now corrected to
 *   dispatch the appropriate actions to load both featured products and a general
 *   list of products for different sections of the page, using dedicated signals
 *   for improved clarity and state management.
 */
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';

import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// === Shared / Core ===
import { AppIcon } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

// === UI ===
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';

// === Avatar & Chat ===
import { MOCK_CAT_IDLE_ANIMATION_ID, MOCK_CAT_SKIN_ID, MOCK_STUDIO_BACKGROUND_ID } from './mock-avatar-data';
import { UiAvatarRendererComponent, AvatarViewConfig, InitialCameraConfig, SceneLightingConfig } from '@royal-code/ui/avatar-renderer';
import { AiChatComponent, ChatMessageSubmitData } from '@royal-code/features/chat/ui-plushie';
import { ChatFacade, SendMessagePayload } from '@royal-code/features/chat/core';

// === Products Feature ===
import { ProductFacade, getProductPrimaryImage, getProductPrice, getProductCurrency, formatPrice } from '@royal-code/features/products/core';
import { Product } from '@royal-code/features/products/domain';
import { ProductHeroCardComponent, ProductListCardComponent } from '@royal-code/features/products/ui-plushie';
import { Image } from '@royal-code/shared/domain';
import { FeedComponent } from '@royal-code/features/social/ui';
import { TitleTypeEnum, UiTitleComponent } from '@royal-code/ui/title';

@Component({
  selector: 'app-plushie-paradise-home',
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    UiIconComponent,
    UiButtonComponent,
    ProductHeroCardComponent,
    ProductListCardComponent,
    UiAvatarRendererComponent,
    AiChatComponent,
    FeedComponent,
    UiTitleComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="plushie-home-container space-y-8">
      <!-- Sectie: Avatar en AI Chat -->
      <section class="relative">
        <div class="w-screen relative left-1/2 -translate-x-1/2 max-w-none
                    flex flex-col md:flex-row items-stretch">
          <div class="flex-1 h-[40vh] min-h-[300px] md:min-h-[500px]
                      bg-gradient-to-br from-theme-water to-theme-forest
                      dark:from-theme-water dark:to-theme-forest
                      relative overflow-hidden
                      md:rounded-l-xl md:shadow-lg">
            @if(avatarRenderConfig(); as cfg) {
              <royal-code-ui-avatar-renderer
                class="w-full h-full"
                [viewConfig]="cfg"
              />
            } @else {
              <div class="w-full h-full flex items-center justify-center text-secondary">
                <p>{{ 'plushieHome.avatarLoading' | translate }}</p>
              </div>
            }
          </div>
          <div class="w-full md:w-1/2 md:max-w-md lg:max-w-lg xl:max-w-xl flex-shrink-0
                      bg-card md:border-l border-border md:rounded-r-xl md:shadow-lg
                      min-h-[300px] md:min-h-[500px] z-0
                      flex flex-col">
            <royal-code-ai-chat class="w-full h-full" />
          </div>
        </div>
      </section>

      <!-- Featured Products Grid -->
      <section aria-labelledby="featured-title">
        <h2 id="featured-title" class="text-2xl font-semibold text-foreground mb-4 text-center md:text-left">
          {{ 'plushieHome.featured.title' | translate }}
        </h2>
        @if (featuredProducts().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            @for (product of featuredProducts(); track product.id) {
              <plushie-royal-code-product-hero-card [productInput]="product" [hideShopNowButton]="true" />
            }
          </div>
        } @else {
          <p class="text-center text-secondary italic py-5">{{ 'plushieHome.featured.loading' | translate }}</p>
        }
      </section>

      <!-- New Arrivals List -->
      <section aria-labelledby="new-arrivals-title">
        <h2 id="new-arrivals-title" class="text-2xl font-semibold text-foreground mb-4 text-center md:text-left">
          {{ 'plushieHome.newArrivals.title' | translate }}
        </h2>
        @if (newArrivals().length > 0) {
          <div class="space-y-3">
            @for (product of newArrivals(); track product.id) {
              <plushie-royal-code-product-list-card [productInput]="product" />
            }
          </div>
        } @else {
          <p class="text-center text-secondary italic py-5">{{ 'plushieHome.newArrivals.loading' | translate }}</p>
        }
      </section>

      <!-- You May Also Like Section -->
             <section aria-labelledby="you-may-like-title">
        <h2 id="you-may-like-title" class="text-2xl font-semibold text-foreground mb-4 text-center md:text-left">
          {{ 'plushieHome.youMayLike.title' | translate }}
        </h2>
        @if (recommendations().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            @for (product of recommendations(); track product.id) {
              <plushie-royal-code-product-hero-card [productInput]="product" />
            }
          </div>
        } @else {
          <p class="text-center text-secondary italic py-5">{{ 'plushieHome.youMayLike.loading' | translate }}</p>
        }
      </section>



      <!-- Hero Banner Section -->
      <section class="hero-banner bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 dark:from-pink-700 dark:via-purple-700 dark:to-indigo-800 text-center p-8 md:p-12 rounded-xl shadow-lg">
        <h1 class="text-3xl md:text-5xl font-bold text-white mb-3 [text-shadow:0_2px_4px_rgba(0,0,0,0.2)]">
          {{ 'plushieHome.hero.title' | translate }}
        </h1>
        <p class="text-md md:text-lg text-white/90 mb-6 [text-shadow:0_1px_3px_rgba(0,0,0,0.15)] max-w-2xl mx-auto">
          {{ 'plushieHome.hero.subtitle' | translate }}
        </p>
        <royal-code-ui-button type="primary" sizeVariant="lg" extraClasses="bg-white text-pink-500 hover:bg-pink-50">
          {{ 'plushieHome.hero.cta' | translate }}
          <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" extraClass="ml-2" />
        </royal-code-ui-button>
      </section>


      <section class="feed-section">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H2"
          [text]="'plushieHome.feed.title' | translate"
          [center]="true"
        />
        <royal-code-feed
          [feedId]="'cv-home'"
        />
      </section>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class PlushieParadiseHomeComponent implements OnInit {
  // === Dependency Injection ===
  private readonly logger = inject(LoggerService);
  private readonly chatFacade = inject(ChatFacade);
  private readonly productFacade = inject(ProductFacade);

  // === Local State Signals ===
  readonly avatarRenderConfig = signal<AvatarViewConfig | undefined>(undefined);
  readonly isSendingAiMessage = signal(false);

  // === Product Data Signals (Derived from Facade) ===
  readonly featuredProducts = this.productFacade.featuredProducts;
  readonly recommendations = this.productFacade.recommendations; // <-- GEBRUIK DE NIEUWE FACADE PROPERTY
  readonly newArrivals = computed(() => this.productFacade.allProducts().slice(0, 3));

  // === Template Helpers ===
  readonly AppIcon = AppIcon;
  private readonly logPrefix = '[PlushieParadiseHomeComponent]';
  protected readonly TitleTypeEnum = TitleTypeEnum;


  // === Lifecycle Hooks ===
  ngOnInit(): void {
    this.logger.debug(`${this.logPrefix} ngOnInit: Setting up avatar and loading product data.`);
    this.setupAvatar();
    this.loadProductData();
  }

  // === Private Methods ===
    private loadProductData(): void {
    this.logger.debug(`${this.logPrefix} Dispatching actions to load product data.`);
    this.productFacade.loadFeaturedProducts();
    this.productFacade.loadRecommendations();
    // De algemene lijst voor "New Arrivals"
    this.productFacade.openPage({ initialFilters: { pageSize: 3 } });
  }


  private setupAvatar(): void {
    const cam: InitialCameraConfig = {
      alpha: Math.PI / 1.8, beta: Math.PI / 300, radius: 500,
      targetOffset: { x: 0, y: 0.45, z: 0 }, lowerRadiusLimit: 0.5,
      upperRadiusLimit: 3000, wheelPrecision: 80,
    };
    const light: SceneLightingConfig = {
      ambientLightIntensity: 0.9, ambientLightColor: '#FFF5E1',
      directionalLight: {
        direction: { x: 0.8, y: 1, z: 0.6 }, intensity: 1.5,
        color: '#FFEACC', castShadows: true, shadowGeneratorMapSize: 1024,
      },
    };
    this.avatarRenderConfig.set({
      skinId: MOCK_CAT_SKIN_ID, backgroundId: MOCK_STUDIO_BACKGROUND_ID,
      animationId: MOCK_CAT_IDLE_ANIMATION_ID, cameraConfig: cam,
      lightingConfig: light, interactive: true, enableShadows: true,
    });
  }

  // === Template-facing Methods ===
  handleAiChatMessage(data: ChatMessageSubmitData): void {
    if (this.isSendingAiMessage()) return;
    const { text, gifUrl, files } = data;
    if (!text.trim() && !gifUrl && !files?.length) return;
    this.logger.info(`${this.logPrefix} Quick AI Chat message submitted:`, { textLength: text?.length, hasGif: !!gifUrl, fileCount: files?.length });
    this.isSendingAiMessage.set(true);
    const payload: Omit<SendMessagePayload, 'conversationId' | 'tempId'> = {
      content: text, media: files, gifUrl: gifUrl ?? undefined,
    };
    this.chatFacade.sendMessageToAiBot(payload);
    setTimeout(() => this.isSendingAiMessage.set(false), 1500);
  }

  getPrimaryImageFromProduct(product: Product): Image | undefined {
    return getProductPrimaryImage(product);
  }

  getFormattedPrice(product: Product): string {
    const price = getProductPrice(product);
    const currency = getProductCurrency(product);
    return formatPrice(price, currency) || `${currency || '$'}0.00`;
  }
}
