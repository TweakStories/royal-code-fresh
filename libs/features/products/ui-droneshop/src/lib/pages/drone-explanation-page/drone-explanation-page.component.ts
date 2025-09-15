// --- VERVANG VOLLEDIG BESTAND: libs/features/products/ui-droneshop/src/lib/pages/drone-explanation-page/drone-explanation-page.component.ts ---
/**
 * @file drone-explanation-page.component.ts
 * @Version 6.3.0 (Definitief Monolithisch & Alle Fouten Gecorrigeerd - Volledig Geoptimaliseerd met UI Componenten)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Een datagedreven pagina-component die een volledige uitleg- of landingspagina rendert.
 *   Deze versie is volledig geoptimaliseerd om zoveel mogelijk gebruik te maken van alle
 *   herbruikbare UI-componenten, waaronder de nieuwe `UiFeatureCardComponent`, `UiStoryCardComponent`,
 *   `UiIconTextRowComponent`, `UiProductAccessoryCardComponent` en `UiFaqComponent`,
 *   en de bestaande `DroneshopTeamComponent`. Dit verhoogt de modulariteit,
 *   onderhoudbaarheid en consistentie.
 */
import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { YouTubePlayerModule } from '@angular/youtube-player';

// Domain & Core Imports
import { AppIcon } from '@royal-code/shared/domain';
import { ReviewTargetEntityType } from '@royal-code/features/reviews/domain';
import { ReviewsFacade } from '@royal-code/features/reviews/core';

// Algemene UI & Service Imports (deze blijven extern en worden geïmporteerd)
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { ProductReviewSummaryComponent } from '@royal-code/features/reviews/ui-plushie';
import { NotificationService } from '@royal-code/ui/notifications';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { SafeHtmlPipe } from '@royal-code/shared/utils';

// <<< NIEUWE UI COMPONENT IMPORTS >>>
import { UiProductAccessoryCardComponent } from '@royal-code/ui/cards/product-accessory-card';
import { UiFeatureCardComponent } from '@royal-code/ui/cards/feature-card';
import { UiIconTextRowComponent } from '@royal-code/ui/cards/icon-text-row';
import { ItemCarouselComponent } from '@royal-code/ui/cards/item-carousel';
import { UiStoryCardComponent } from '@royal-code/ui/cards/story-card';
import { UiFaqComponent } from '@royal-code/ui/faq';
import { LoggerService } from '@royal-code/core/core-logging';
import { DroneExplanationData } from '@royal-code/shared/domain';
import { TeamComponent } from '@royal-code/ui/team';

@Component({
  selector: 'droneshop-drone-explanation-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    UiImageComponent, UiTitleComponent, UiParagraphComponent, UiButtonComponent, UiIconComponent,
    ProductReviewSummaryComponent, SafeHtmlPipe, YouTubePlayerModule,
    // <<< TOEGEVOEGDE IMPORTS >>>
    TeamComponent,
    UiFeatureCardComponent, // Reeds aanwezig, maar expliciet hier
    UiIconTextRowComponent, // Voor 'In de doos'
    UiProductAccessoryCardComponent, // Voor accessoires carousel
    ItemCarouselComponent, // Voor de accessoires carousel
    UiStoryCardComponent, // Voor de story sections
    UiFaqComponent, // Voor de FAQ sectie
  ],
  template: `
    @if (contentData(); as data) {
      <div class="drone-explanation-page bg-background text-foreground">
        <!-- Sectie 1: Hero -->
        <div class="relative h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden bg-background">
          @if (data.heroVideoId) {
  <iframe
    [src]="'https://www.youtube.com/embed/' + data.heroVideoId + '?autoplay=1&controls=0&showinfo=0&rel=0&loop=1&mute=1&playlist=' + data.heroVideoId | safeHtml:'resourceUrl'"
    class="absolute inset-0 w-full h-full object-cover"
    width="100%"
    height="100%"
    allow="autoplay; encrypted-media"
    frameborder="0"
    title="Hero Video"
    loading="lazy"
  ></iframe>
} @else if (data.heroImageUrl) {
  <royal-code-ui-image [src]="data.heroImageUrl" [alt]="data.heroTitleKey | translate" objectFit="cover" class="absolute inset-0 w-full h-full"/>
}

          <div class="absolute inset-0 bg-gradient-to-t from-background/70 via-background/40 to-transparent flex items-end">
            <div class="px-4 py-8 sm:px-6 lg:px-8 max-w-2xl text-white">
              <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="data.heroTitleKey | translate" extraClasses="!text-3xl sm:!text-4xl lg:!text-5xl !font-extrabold !leading-tight mb-4" />
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.heroSubtitleKey | translate" extraClasses="!text-lg sm:!text-xl !font-medium opacity-90 mb-8" />
              <royal-code-ui-button [type]="'primary'" [routerLink]="data.productPurchaseRoute">
                {{ data.heroCtaKey | translate }}
              </royal-code-ui-button>
            </div>
          </div>
        </div>

        <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
          <!-- Sectie 2: Belofte -->
          <section class="grid grid-cols-1 gap-8 md:grid-cols-3">
            @for (stat of data.promiseStats; track stat.titleKey) {
              <royal-code-ui-feature-card 
                [icon]="stat.icon" 
                [titleKey]="stat.titleKey" 
                [descriptionKey]="stat.descriptionKey" 
                [textWrap]="stat.textWrap" />
            }
          </section>

          <!-- Sectie 3: Kernomschrijving -->
          <div class="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            @for (block of data.coreDescriptionBlocks; track $index) {
              @switch (block.type) {
                @case ('paragraph') {
                  @if (block.contentKey) {
                    <royal-code-ui-paragraph [text]="block.contentKey | translate" size="lg" color="foreground" extraClasses="leading-relaxed" />
                  }
                }
                @case ('feature-list') {
                  @if (block.items && block.items.length > 0) {
                    <div class="mt-8">
                      <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="block.contentKey | translate" extraClasses="!text-xl !font-semibold !mb-4" />
                      <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        @for (item of block.items; track $index) {
                          <li class="flex items-center text-left text-foreground">
                            <royal-code-ui-icon [icon]="item.icon" sizeVariant="md" extraClass="text-primary mr-3 flex-shrink-0" />
                            <royal-code-ui-paragraph [text]="item.textKey | translate" size="md" color="foreground" extraClasses="font-medium" />
                          </li>
                        }
                      </ul>
                    </div>
                  }
                }
                @case ('quote-block') {
                  @if (block.contentKey) {
                    <blockquote class="bg-surface-alt p-6 rounded-lg border-l-4 border-primary italic text-lg text-foreground">
                      <royal-code-ui-paragraph [text]="block.contentKey | translate" size="lg" color="foreground" extraClasses="leading-relaxed" />
                    </blockquote>
                  }
                }
                @case ('cta-block') {
                  @if (block.ctaTextKey && block.ctaRoute) {
                    <div class="pt-6">
                      <royal-code-ui-button [type]="'primary'" [routerLink]="block.ctaRoute">
                        {{ block.ctaTextKey | translate }}
                      </royal-code-ui-button>
                    </div>
                  }
                }
                @case ('bullet-list') {
                  @if (block.bulletPoints && block.bulletPoints.length > 0) {
                    <ul class="list-disc list-inside text-sm text-foreground space-y-1">
                      @for (point of block.bulletPoints; track $index) {
                        <li>{{ point }}</li>
                      }
                    </ul>
                  }
                }
@case ('media-embed') {
                  <ng-container>
                    @if (block.youtubeVideoId; as videoId) {
                      @if (videoId.length > 0) {
                        @defer (on interaction; prefetch on idle) {
                          <div class="aspect-video w-full rounded-md overflow-hidden bg-muted">
                            <iframe 
                              [src]="'https://www.youtube.com/embed/' + videoId + '?controls=1&showinfo=0&rel=0&autoplay=0&mute=0' | safeHtml:'resourceUrl'" 
                              frameborder="0" 
                              allow="autoplay; encrypted-media" 
                              allowfullscreen 
                              class="w-full h-full"
                              title="Embedded Video">
                            </iframe>
                          </div>
                        } @placeholder {
                          <div class="aspect-video w-full bg-surface-alt rounded-lg flex flex-col items-center justify-center text-secondary border border-dashed cursor-pointer hover:border-primary">
                            <royal-code-ui-icon [icon]="AppIcon.PlayCircle" sizeVariant="xl" extraClass="mb-2 text-primary" />
                            <p class="font-semibold">{{ 'common.watchVideo' | translate }}</p>
                          </div>
                        }
                      }
                    }
                  </ng-container>
              }



              }
            }
          </div>

          <!-- Sectie 4: Componenten In Detail (gebruikt UiStoryCardComponent) -->
          <section class="space-y-12">
            @for (section of data.storySections; track section.id) {
              <royal-code-ui-story-card [data]="section" />
            }
          </section>

          <!-- Sectie 5: Essentiële Accessoires (gebruikt ItemCarouselComponent met UiProductAccessoryCardComponent) -->
          <section>
            <royal-code-ui-item-carousel
              [titleKey]="'droneshop.carousel.essentialAccessories' "
              [items]="accessoryCarouselItems()"
              [itemTemplate]="productAccessoryCardTemplate"
            />
          </section>

          <!-- Sectie 6: In de doos (gebruikt UiIconTextRowComponent) -->
          <section>
            <div class="in-the-box">
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'droneshop.diyKitsOverview.inTheBox.title' | translate" extraClasses="!text-2xl !font-bold !mb-6 text-center" />
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 max-w-4xl mx-auto">
                @for (item of data.inTheBoxItems; track item.textKey) {
                  <royal-code-ui-icon-text-row [data]="item" />
                }
              </div>
            </div>
          </section>

          <!-- Sectie 7: FAQ (gebruikt UiFaqComponent) -->
          <section>
            <div class="faq-section max-w-3xl mx-auto">
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.faqTitleKey | translate" extraClasses="!text-2xl !font-bold !mb-8 text-center" />
              <royal-code-ui-faq [faqs]="data.faqItems" />
            </div>
          </section>

          <!-- Sectie 8: Sociaal Bewijs (gebruikt DroneshopTeamComponent) -->
          <section class="space-y-12">
            <div class="flex flex-col items-center">
              <royal-code-ui-title
                [level]="TitleTypeEnum.H2"
                [text]="'droneshop.diyKitsOverview.testimonials.title' | translate"
                extraClasses="text-center"
              />
              <royal-code-ui-button type="link" (click)="openReviewsOverlay()" extraClasses="mt-2">
                {{ 'droneshop.general.viewAllReviews' | translate }}
              </royal-code-ui-button>
            </div>
            
            <plushie-royal-code-review-summary [summary]="reviewsFacade.reviewSummary() ?? data.reviewSummary" />
            
            <royal-code-ui-team />
          </section>
        </div>

        <!-- Sectie 9: Sticky CTA -->
        <div class="sticky bottom-0 left-0 right-0 z-40 bg-surface-alt border-t border-border shadow-lg py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <royal-code-ui-title [level]="TitleTypeEnum.H4" [text]="data.name" extraClasses="!text-lg !font-semibold" />
            <span class="text-sm text-muted">{{ 'droneshop.general.startingFrom' | translate }} {{ data.basePriceDisplay }}</span>
          </div>
          <royal-code-ui-button [type]="'primary'" [routerLink]="data.productPurchaseRoute">
            {{ data.callToActionLinkKey | translate }}
          </royal-code-ui-button>
        </div>
      </div>

      <!-- TEMPLATES -->
      <ng-template #productAccessoryCardTemplate let-accessoryItem>
        <royal-code-ui-product-accessory-card [accessory]="accessoryItem" />
      </ng-template>

    }
  `,
  styles: [`
    :host { display: block; }
    /* Specifieke styling voor youtube-player binnen deze component's hero section */
    section.relative .youtube-player-hero {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      overflow: hidden; pointer-events: none;
    }
    section.relative .youtube-player-hero > div,
    section.relative .youtube-player-hero > div > iframe {
      width: 100% !important; height: 100% !important; position: absolute;
      top: 0; left: 0; object-fit: cover;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneExplanationPageComponent implements OnInit {
  contentData = input.required<DroneExplanationData>();

  protected readonly reviewsFacade = inject(ReviewsFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly logger = inject(LoggerService);

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  // `activeFaqId` signal en `toggleFaq` methode zijn verwijderd, omdat `UiFaqComponent` dit beheert.

  protected accessoryCarouselItems = computed(() => {
    return this.contentData().essentialAccessories.map(item => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      route: item.route,
    }));
  });

  // `teamMembers` constant is verwijderd, omdat `DroneshopTeamComponent` dit beheert.

  ngOnInit(): void {
    this.reviewsFacade.setContext(this.contentData().id, ReviewTargetEntityType.PRODUCT);
  }

  openReviewsOverlay(): void {
    this.notificationService.showInfo(
      this.translateService.instant('droneshop.general.featureComingSoon')
    );
    this.logger.info('[DroneExplanationPage] "View all reviews" clicked. Overlay feature is pending implementation.');
  }

}