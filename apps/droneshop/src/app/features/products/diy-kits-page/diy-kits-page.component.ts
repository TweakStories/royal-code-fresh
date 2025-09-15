// --- IN apps/droneshop/src/app/features/products/diy-kits-page/diy-kits-page.component.ts, VERVANG DIT BLOK ---
import { DiyKitCardComponent } from '@royal-code/ui/products';
import { TeamComponent } from '@royal-code/ui/team';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiFaqComponent } from '@royal-code/ui/faq';
import { Image, MediaType, AppIcon } from '@royal-code/shared/domain'; // <<< AppIcon toegevoegd
import { UiImageComponent } from '@royal-code/ui/media';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { TranslateModule } from '@ngx-translate/core';
import { DIY_KITS_PAGE_DATA } from './diy-kits-page.data';
import { UiFeatureCardComponent } from '@royal-code/ui/cards/feature-card';
import { UiFullWidthImageCardComponent } from '@royal-code/ui/cards/full-width-image-card';
import { ItemCarouselComponent } from '@royal-code/ui/cards/item-carousel';
import { UiStatCardComponent } from '@royal-code/ui/cards/stat-card';
import { StickyCtaBarComponent } from '@royal-code/ui/sticky-cta-bar';

@Component({
  selector: 'droneshop-diy-kits-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, YouTubePlayerModule,
    DiyKitCardComponent, TeamComponent, UiFullWidthImageCardComponent,
    UiStatCardComponent, ItemCarouselComponent, UiTitleComponent, UiParagraphComponent,
    UiButtonComponent, UiIconComponent, UiFaqComponent, StickyCtaBarComponent,
    UiImageComponent, UiFeatureCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (diyKitPageData; as data) {
      <div class="diy-kits-page bg-background text-foreground space-y-16 md:space-y-24">
        
        <!-- Sectie 1: Hero -->
        <section class="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
<royal-code-ui-full-width-image-card
  [youtubeVideoId]="data.hero.youtubeVideoId"
  [titleKey]="data.hero.titleKey | translate"
  [subtitleKey]="data.hero.subtitleKey | translate"
  textAlign="center"
  class="absolute inset-0 w-full h-full"
  [route]="'#'" 
  ngSkipHydration
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
>
  <div class="flex flex-col sm:flex-row gap-3 mt-4">
    <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="scrollToSection(data.hero.ctaBeginnerAnchor)">
      {{ data.hero.ctaBeginnerKey | translate }}
    </royal-code-ui-button>
    <royal-code-ui-button type="outline" sizeVariant="lg" (clicked)="scrollToSection(data.hero.ctaExpertAnchor)">
      {{ data.hero.ctaExpertKey | translate }}
    </royal-code-ui-button>
  </div>
</royal-code-ui-full-width-image-card>

        </section>

        <!-- Sectie 2: Waardepropositie -->
        @defer (on viewport) {
          <section class="container-max px-4">
            <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.valueProp.titleKey | translate" blockStyle="true" blockStyleType="primary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-12" />
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              @for(card of data.valueProp.cards; track card.titleKey) {
                <royal-code-ui-feature-card 
                  [icon]="card.icon" 
                  [titleKey]="card.titleKey" 
                  [descriptionKey]="card.descriptionKey" 
                  [textWrap]="true" />
              }
            </div>
          </section>
        } @placeholder {
          <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div>
        }

        <!-- Sectie 3: Kit Finder Quiz -->
        @defer (on viewport) {
          <section>
            <royal-code-ui-full-width-image-card [imageUrl]="data.kitFinder.imageUrl" [titleKey]="data.kitFinder.titleKey | translate" [subtitleKey]="data.kitFinder.subtitleKey | translate" [buttonTextKey]="data.kitFinder.buttonTextKey | translate" [route]="data.kitFinder.route" textAlign="center" class="h-[50vh]" />
          </section>
        } @placeholder {
          <div class="h-80 w-full bg-surface-alt animate-pulse"></div>
        }

        <!-- NIEUW - Sectie: Zorgeloos Bouwen -->
        @defer (on viewport) {
          <section>
            <royal-code-ui-full-width-image-card 
              [imageUrl]="data.seamlessBuildGuide.imageUrl"
              [titleKey]="data.seamlessBuildGuide.titleKey | translate"
              [subtitleKey]="data.seamlessBuildGuide.subtitleKey | translate"
              [buttonTextKey]="data.seamlessBuildGuide.buttonTextKey | translate"
              [route]="data.seamlessBuildGuide.route"
              textAlign="center"
              class="h-[50vh]" />
          </section>
        } @placeholder {
          <div class="h-80 w-full bg-surface-alt animate-pulse"></div>
        }

        <!-- Sectie 4: Bouwpakketten Showcase (Met nieuwe opsplitsing) -->
        <section [id]="data.sub250gKits.anchorId" class="container-max px-4 space-y-12">
          <div>
            <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.sub250gKits.titleKey | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!text-2xl md:!text-3xl !mb-8" />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              @for (kit of data.sub250gKits.kits; track kit.id) {
                <droneshop-diy-kit-card [kit]="kit" />
              }
            </div>
          </div>
          <div [id]="data.fiveInchKits.anchorId">
            <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.fiveInchKits.titleKey | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!text-2xl md:!text-3xl !mb-8" />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               @for (kit of data.fiveInchKits.kits; track kit.id) {
                <droneshop-diy-kit-card [kit]="kit" />
              }
            </div>
          </div>
        </section>

        <!-- Sectie 5: Componenten Verdieping -->
        @defer (on viewport) {
          <section class="container-max px-4">
            <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.componentDeepDive.titleKey | translate" blockStyle="true" blockStyleType="primary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-4" />
            <royal-code-ui-paragraph color="muted" extraClasses="text-center max-w-3xl mx-auto mb-12">{{ data.componentDeepDive.subtitleKey | translate }}</royal-code-ui-paragraph>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              @for (item of data.componentDeepDive.gridItems; track item.id) {
                <a [routerLink]="item.route" class="block group">
                  <royal-code-ui-stat-card
                    [icon]="item.icon ?? null"
                    [label]="item.titleKey | translate"
                    [value]="item.descriptionKey | translate"
                    [textWrap]="true" />
                </a>
              }
            </div>
          </section>
        } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }

        <!-- Sectie 6: Gidsen & Resources -->
        @defer (on viewport) {
          <section class="container-max px-4">
            <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.guides.titleKey | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-12" />
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              @for (guide of data.guides.links; track guide.titleKey) {
                <a [routerLink]="guide.route" class="block group">
                  <div class="h-full p-6 bg-card border-2 border-black text-center hover:border-primary transition-colors">
                    <royal-code-ui-icon [icon]="guide.icon" sizeVariant="xl" extraClass="text-primary mb-4" />
                    <h3 class="font-semibold text-foreground mb-2">{{ guide.titleKey | translate }}</h3>
                    <p class="text-sm text-secondary">{{ guide.descriptionKey | translate }}</p>
                  </div>
                </a>
              }
            </div>
          </section>
        } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }
        
        <!-- Sectie 7: Tech Highlights Grid (Nieuw) -->
        @defer (on viewport) {
          <section class="container-max px-4 text-center">
            <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.techHighlights.titleKey | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-12" />
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
              @for (highlight of data.techHighlights.gridItems; track highlight.id) { 
              <royal-code-ui-full-width-image-card 
                [imageUrl]="highlight.imageUrl ?? ''" 
                [youtubeVideoId]="highlight.youtubeVideoId" 
                [titleKey]="highlight.titleKey | translate" 
                [subtitleKey]="highlight.descriptionKey | translate" 
                [textAlign]="highlight.textAlign" 
                [route]="highlight.route || '#'" 
                [class]="highlight.gridClasses" 
                [padding]="highlight.contentPadding ?? 'p-4'" 
                ngSkipHydration
              /> 
            }
            </div>
          </section>
        } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }

        <!-- Sectie 8: Community & Support -->
        <section class="container-max px-4 space-y-12">
          <!-- Testimonials, FAQ, Team -->
          @defer (on viewport) {
            <div>
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.testimonials.titleKey | translate" blockStyle="true" blockStyleType="primary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-12" />
              <royal-code-ui-item-carousel [items]="data.testimonials.items" [itemTemplate]="testimonialTemplate" />
            </div>
          } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }
          @defer(on viewport) {
            <div>
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.faq.titleKey | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-12" />
              <royal-code-ui-faq [faqs]="data.faq.items" />
            </div>
          } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }
          @defer (on viewport) {
            <royal-code-ui-team />
          } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }
        </section>

        <!-- Sectie 9: Sticky CTA -->
        <royal-code-sticky-cta-bar [productName]="'Bouwpakket Drones'" [purchaseRoute]="data.stickyCta.route" [ctaTextKey]="data.stickyCta.textKey" />

      </div>

      <!-- TEMPLATES -->
      <ng-template #testimonialTemplate let-testimonial>
        <div class="snap-start flex-shrink-0 w-80 md:w-96 p-6 bg-surface-alt border border-border rounded-lg">
          <royal-code-ui-icon [icon]="AppIcon.Quote" sizeVariant="lg" extraClass="text-primary mb-3"/>
          <blockquote class="text-foreground italic mb-4">"{{ testimonial.quoteKey | translate }}"</blockquote>
          <div class="flex items-center gap-3">
            <royal-code-ui-image [image]="mapToImage(testimonial.imageUrl, testimonial.author | translate)" rounding="full" objectFit="cover" extraClasses="w-12 h-12" />
            <div>
              <p class="font-semibold text-foreground">{{ testimonial.author | translate }}</p>
            </div>
          </div>
        </div>
      </ng-template>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class DiyKitsPageComponent {
  protected readonly diyKitPageData = DIY_KITS_PAGE_DATA;
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon; // <<< Toegevoegd

  private readonly platformId = inject(PLATFORM_ID);
  protected readonly isBrowser: boolean = isPlatformBrowser(this.platformId);

  scrollToSection(anchor: string): void {
    if (this.isBrowser) {
      const element = document.querySelector(anchor);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  protected mapToImage(url: string, altText: string): Image {
    return {
      id: url,
      type: MediaType.IMAGE,
      variants: [{ url: url, purpose: 'thumbnail' }],
      altText: altText
    };
  }
}