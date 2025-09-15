// apps/droneshop/src/app/features/products/rtf-drones-page/rtf-drones-page.component.ts
/**
 * @file rtf-drones-page.component.ts
 * @Version 6.3.0 (UiRtfProductCardComponent & UI Component Gebruik Optimalisatie)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-03
 * @Description
 *   De definitieve, conversie-geoptimaliseerde overzichtspagina voor RTF drones.
 *   Deze versie integreert strategische UX- en marketingelementen om de
 *   gebruikerservaring te maximaliseren en conversie te verhogen voor alle persona's.
 *   Alle productkaarten gebruiken nu de nieuwe, herbruikbare `UiRtfProductCardComponent`.
 *   De FAQ en Team secties gebruiken nu de geüpgradeerde UI componenten.
 */
import { ChangeDetectionStrategy, Component, signal, TemplateRef, ViewChild, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { YouTubePlayerModule } from '@angular/youtube-player';

// UI Imports
import { UiTitleComponent } from '@royal-code/ui/title';
import { ItemCarouselItem, TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiListComponent, ListTypesEnum } from '@royal-code/ui/list';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { TeamComponent } from '@royal-code/ui/team';
import { AppIcon } from '@royal-code/shared/domain';
import { UiFaqComponent } from '@royal-code/ui/faq'; // <-- Gebruikt de geüpgradeerde UiFaqComponent
import { UiRtfProductCardComponent } from '@royal-code/ui/products'; 
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiFeatureCardComponent } from '@royal-code/ui/cards/feature-card';
import { UiFullWidthImageCardComponent } from '@royal-code/ui/cards/full-width-image-card';
import {  ItemCarouselComponent } from '@royal-code/ui/cards/item-carousel';
import { UiStatCardComponent } from '@royal-code/ui/cards/stat-card';

// === LOKALE INTERFACES VOOR DEZE PAGINA (ongewijzigd) ===
interface RtfProductHighlight {
  icon: AppIcon;
  textKey: string;
}

interface RtfProductCardData {
  id: string; nameKey: string; imageUrl: string; descriptionKey: string;
  specs: RtfProductHighlight[]; price: string; route: string;
}

interface TechHighlightGridItem {
  id: string; imageUrl?: string; youtubeVideoId?: string; titleKey: string;
  descriptionKey: string; route?: string | string[]; textAlign: 'left' | 'right' | 'center';
  size: 'small' | 'medium' | 'large' | 'full-width'; openInNewTab?: boolean; gridClasses?: string;
  contentPadding?: string; 
}


interface QuizCardData {
  imageUrl: string; titleKey: string; subtitleKey: string; buttonTextKey: string; route: string;
}

interface TestimonialItem extends ItemCarouselItem {
  quoteKey: string; author: string;
}

interface FaqItem {
  id: string; questionKey: string; answerKey: string;
}

interface RtfDronesPageData {
  heroYoutubeVideoId: string; heroTitleKey: string; heroSubtitleKey: string; heroCtaKey: string; heroCtaRoute: string;
  valuePropositionTitleKey: string; valuePropositionDescriptionKey: string;
  valuePropositionStats: { icon: AppIcon; titleKey: string; descriptionKey: string; }[];
  quizCard: QuizCardData;
  techHighlightsGridTitleKey: string; techHighlightsGrid: TechHighlightGridItem[];
  testimonialsTitleKey: string; testimonials: TestimonialItem[];
  midFunnelCtaButtons: { textKey: string; route: string; }[];
  sub250gSectionTitleKey: string; sub250gSectionSubtitleKey: string;
  sub250gFullWidthCardImageUrl: string; sub250gFullWidthCardTitleKey: string; sub250gFullWidthCardSubtitleKey: string; sub250gFullWidthCardRoute: string;
  sub250gDrones: RtfProductCardData[];
  fiveInchSectionTitleKey: string; fiveInchSectionSubtitleKey: string;
  fiveInchFullWidthCardImageUrl: string; fiveInchFullWidthCardTitleKey: string; fiveInchFullWidthCardSubtitleKey: string; fiveInchFullWidthCardRoute: string;
  fiveInchDrones: RtfProductCardData[];
  faqTitleKey: string; faqItems: FaqItem[];
}

const RTF_DRONES_PAGE_DATA: RtfDronesPageData = {
  heroYoutubeVideoId: 'YNuc4wsvnZY', // <<< YouTube ID
  heroTitleKey: 'droneshop.rtfDronesOverview.hero.title',
  heroSubtitleKey: 'droneshop.rtfDronesOverview.hero.subtitle',
  heroCtaKey: 'droneshop.rtfDronesOverview.hero.cta',
  heroCtaRoute: '/drones/rtf-drones#sub-250g',

  valuePropositionTitleKey: 'droneshop.rtfDronesOverview.valueProp.title',
  valuePropositionDescriptionKey: 'droneshop.rtfDronesOverview.valueProp.description',
  valuePropositionStats: [
    { icon: AppIcon.Cpu, titleKey: 'droneshop.rtfDronesOverview.valueProp.stats.components.label', descriptionKey: 'droneshop.rtfDronesOverview.valueProp.stats.components.value' },
    { icon: AppIcon.Wrench, titleKey: 'droneshop.rtfDronesOverview.valueProp.stats.assembly.label', descriptionKey: 'droneshop.rtfDronesOverview.valueProp.stats.assembly.value' },
    { icon: AppIcon.CheckCircle, titleKey: 'droneshop.rtfDronesOverview.valueProp.stats.tested.label', descriptionKey: 'droneshop.rtfDronesOverview.valueProp.stats.tested.value' },
  ],

  quizCard: {
    imageUrl: 'images/default-image.webp',
    titleKey: 'droneshop.rtfDronesOverview.quiz.title',
    subtitleKey: 'droneshop.rtfDronesOverview.quiz.subtitle',
    buttonTextKey: 'droneshop.rtfDronesOverview.quiz.cta',
    route: '/quiz/fpv-drone-finder'
  },

  techHighlightsGridTitleKey: 'droneshop.rtfDronesOverview.techHighlights.title',
  techHighlightsGrid: [
     { id: 'dji-o4', youtubeVideoId: 'YNuc4wsvnZY', titleKey: 'droneshop.rtfDronesOverview.techHighlights.djiO4.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.djiO4.description', route: '/drones/rtf-drones/quadmula-siren-f35#dji-o4', textAlign: 'center', size: 'large', gridClasses: 'md:col-span-2 lg:col-span-3 lg:row-span-2 h-[262.5px] md:h-[300px] lg:h-[300px]' }, // 25% kleiner
     { id: 'rcinpower-motors', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.rtfDronesOverview.techHighlights.rcinpower.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.rcinpower.description', route: '/drones/rtf-drones/quadmula-siren-f35#motors', textAlign: 'center', size: 'medium', gridClasses: 'md:col-span-1 lg:col-start-4 lg:col-span-3 lg:row-start-1 lg:row-span-1 h-[127.5px] md:h-[141px] lg:h-[141px]' }, // 25% kleiner
     { id: 'foxeer-hardware', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.rtfDronesOverview.techHighlights.foxeer.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.foxeer.description', route: '/drones/rtf-drones/quadmula-siren-f35#stack', textAlign: 'center', size: 'medium', gridClasses: 'md:col-span-1 lg:col-start-4 lg:col-span-3 lg:row-start-2 lg:row-span-1 h-[127.5px] md:h-[141px] lg:h-[141px]' }, // 25% kleiner
     { id: 'frame-choice', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.rtfDronesOverview.techHighlights.frameChoice.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.frameChoice.description', route: '/drones/rtf-drones/quadmula-siren-f35#frame', textAlign: 'center', size: 'small', gridClasses: 'md:col-span-1 lg:col-span-3 h-[150px] lg:h-[150px]' }, // 25% kleiner
     { id: 'radiomaster-txrx', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.rtfDronesOverview.techHighlights.radiomaster.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.radiomaster.description', route: '/drones/rtf-drones/quadmula-siren-f35#radio', textAlign: 'center', size: 'small', gridClasses: 'md:col-span-1 lg:col-span-3 h-[150px] lg:h-[150px]' }, // 25% kleiner
     { id: 'dji-o4-pro-video-tx', youtubeVideoId: 'YNuc4wsvnZY', titleKey: 'droneshop.rtfDronesOverview.techHighlights.djiO4ProVideoTx.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.djiO4ProVideoTx.description', route: '/drones/rtf-drones/dji-o4-pro-transmission', textAlign: 'center', size: 'full-width', gridClasses: 'lg:col-span-6 h-[187.5px] md:h-[225px]' } // 25% kleiner
  ],
  
  testimonialsTitleKey: 'droneshop.rtfDronesOverview.testimonials.title',
  testimonials: [
    { id: 't1', name: 'Mark V.', imageUrl: 'images/default-image.webp', quoteKey: 'droneshop.rtfDronesOverview.testimonials.t1.quote', author: 'Mark V. - FPV Piloot sinds 2022' },
    { id: 't2', name: 'Jessica de G.', imageUrl: 'images/default-image.webp', quoteKey: 'droneshop.rtfDronesOverview.testimonials.t2.quote', author: 'Jessica de G. - Cinematograaf' },
    { id: 't3', name: 'Tom L.', imageUrl: 'images/default-image.webp', quoteKey: 'droneshop.rtfDronesOverview.testimonials.t3.quote', author: 'Tom L. - Beginner' },
  ],

  midFunnelCtaButtons: [
    { textKey: 'droneshop.rtfDronesOverview.midFunnelCta.sub250g', route: '#sub-250g' },
    { textKey: 'droneshop.rtfDronesOverview.midFunnelCta.fiveInch', route: '#performance-5-inch' }
  ],

  sub250gSectionTitleKey: 'droneshop.rtfDronesOverview.sub250g.title',
  sub250gSectionSubtitleKey: 'droneshop.rtfDronesOverview.sub250g.subtitle',
  sub250gFullWidthCardImageUrl: 'images/default-image.webp',
  sub250gFullWidthCardTitleKey: 'droneshop.rtfDronesOverview.sub250g.cardTitle',
  sub250gFullWidthCardSubtitleKey: 'droneshop.rtfDronesOverview.sub250g.cardSubtitle',
  sub250gFullWidthCardRoute: '/products/f3500002-0000-0000-0000-000000000002',
  sub250gDrones: [
    { id: 'rtf-siren-f35', nameKey: 'droneshop.rtfDronesOverview.sirenF35.name', imageUrl: 'images/default-image.webp', descriptionKey: 'droneshop.rtfDronesOverview.sirenF35.description', specs: [ { icon: AppIcon.GitCommit, textKey: 'droneshop.rtfDronesOverview.sirenF35.specs.frame' }, { icon: AppIcon.Cpu, textKey: 'droneshop.rtfDronesOverview.sirenF35.specs.stack' }, { icon: AppIcon.Power, textKey: 'droneshop.rtfDronesOverview.sirenF35.specs.motors' }, { icon: AppIcon.Radio, textKey: 'droneshop.rtfDronesOverview.sirenF35.specs.rx' } ], price: '€ 389,95', route: '/products/f3500002-0000-0000-0000-000000000002' },
  ],

  fiveInchSectionTitleKey: 'droneshop.rtfDronesOverview.fiveInch.title',
  fiveInchSectionSubtitleKey: 'droneshop.rtfDronesOverview.fiveInch.subtitle',
  fiveInchFullWidthCardImageUrl: 'images/default-image.webp',
  fiveInchFullWidthCardTitleKey: 'droneshop.rtfDronesOverview.fiveInch.cardTitle',
  fiveInchFullWidthCardSubtitleKey: 'droneshop.rtfDronesOverview.fiveInch.cardSubtitle',
  fiveInchFullWidthCardRoute: '/products/f5000001-0000-0000-0000-000000000001',
  fiveInchDrones: [
    { id: 'rtf-siren-f5', nameKey: 'droneshop.rtfDronesOverview.sirenF5.name', imageUrl: 'images/default-image.webp', descriptionKey: 'droneshop.rtfDronesOverview.sirenF5.description', specs: [ { icon: AppIcon.GitCommit, textKey: 'droneshop.rtfDronesOverview.sirenF5.specs.frame' }, { icon: AppIcon.Cpu, textKey: 'droneshop.rtfDronesOverview.sirenF5.specs.stack' }, { icon: AppIcon.Power, textKey: 'droneshop.rtfDronesOverview.sirenF5.specs.motors' }, { icon: AppIcon.Radio, textKey: 'droneshop.rtfDronesOverview.sirenF5.specs.rx' } ], price: '€ 549,95', route: '/products/f5000001-0000-0000-0000-000000000001' },
  ],

  faqTitleKey: 'droneshop.rtfDronesOverview.faq.title',
  faqItems: [
    { id: 'faq1', questionKey: 'droneshop.rtfDronesOverview.faq.q1', answerKey: 'droneshop.rtfDronesOverview.faq.a1' },
    { id: 'faq2', questionKey: 'droneshop.rtfDronesOverview.faq.q2', answerKey: 'droneshop.rtfDronesOverview.faq.a2' },
    { id: 'faq3', questionKey: 'droneshop.rtfDronesOverview.faq.q3', answerKey: 'droneshop.rtfDronesOverview.faq.a3' },
  ]
};

@Component({
  selector: 'droneshop-rtf-drones-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    UiFullWidthImageCardComponent, UiTitleComponent, UiParagraphComponent,
    UiButtonComponent, UiIconComponent, UiCardComponent, UiStatCardComponent,
    UiImageComponent, UiListComponent, ItemCarouselComponent, TeamComponent,
    UiSpinnerComponent, YouTubePlayerModule, UiFaqComponent,
    UiFeatureCardComponent,
    UiRtfProductCardComponent // <<< TOEGEVOEGD
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (rtfDronesData; as data) {
      <div class="rtf-drones-page bg-background text-foreground space-y-16 md:space-y-24">

        <!-- Sectie 1: De Adrenaline-Start (Hero) -->
        <section class="relative h-[52.5vh] md:h-[75vh] flex items-center justify-center text-center text-white overflow-hidden">
         <royal-code-ui-full-width-image-card
  [youtubeVideoId]="data.heroYoutubeVideoId"
  [titleKey]="data.heroTitleKey"
  [subtitleKey]="data.heroSubtitleKey"
  [buttonTextKey]="data.heroCtaKey"
  [route]="data.heroCtaRoute"
  textAlign="center"
  class="absolute inset-0 w-full h-full"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
>
  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce"><royal-code-ui-icon [icon]="AppIcon.ArrowDown" sizeVariant="xl" extraClass="text-white/80" /></div>
</royal-code-ui-full-width-image-card>

        </section>

        <!-- Sectie 2: De Droneshop Belofte -->
        @defer (on viewport) {
          <section class="container-max px-4">
            <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'droneshop.rtfDronesOverview.valueProp.title' | translate" blockStyle="true" blockStyleType="primary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-4" />
            <royal-code-ui-paragraph color="muted" extraClasses="text-center max-w-3xl mx-auto mb-12">{{ data.valuePropositionDescriptionKey | translate }}</royal-code-ui-paragraph>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              @for (stat of data.valuePropositionStats; track stat.titleKey) {
                <royal-code-ui-feature-card
                  [icon]="stat.icon"
                  [titleKey]="stat.titleKey"
                  [descriptionKey]="stat.descriptionKey"
                  [textWrap]="true" />
              }
            </div>
          </section>
        } @placeholder { <div class="h-96 w-full bg-surface-alt animate-pulse"></div> }

        <!-- NIEUW - Sectie 3: "Help Mij Kiezen" Quiz CTA -->
        @defer (on viewport) {
          <section>
            <royal-code-ui-full-width-image-card [imageUrl]="data.quizCard.imageUrl" [titleKey]="data.quizCard.titleKey | translate" [subtitleKey]="data.quizCard.subtitleKey | translate" [buttonTextKey]="data.quizCard.buttonTextKey | translate" [route]="data.quizCard.route" textAlign="center" class="h-[54vh] md:h-[60vh]" /> <!-- 25% kleiner -->
          </section>
        } @placeholder { <div class="h-80 w-full bg-surface-alt animate-pulse"></div> }

        <!-- Sectie 4: De Kern van Onze RTF Drones (Tech Grid) -->
        @defer (on viewport) {
          <section class="container-max px-4 text-center">
            <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.techHighlightsGridTitleKey | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-12" />
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
            @for (highlight of data.techHighlightsGrid; track highlight.id) { 
              <royal-code-ui-full-width-image-card 
                [imageUrl]="highlight.imageUrl ?? ''" 
                [youtubeVideoId]="highlight.youtubeVideoId" 
                [titleKey]="highlight.titleKey | translate" 
                [subtitleKey]="highlight.descriptionKey | translate" 
                [textAlign]="highlight.textAlign" 
                [route]="highlight.route || '#'" 
                [openInNewTab]="highlight.openInNewTab ?? false" 
                [class]="getHighlightClasses(highlight)"
                [padding]="highlight.contentPadding ?? 'p-4'" /> 
            }

                </div>
            <div class="mt-12 flex justify-center gap-4">
              @for (button of data.midFunnelCtaButtons; track button.route) { <royal-code-ui-button type="primary" sizeVariant="xl" [enableNeonEffect]="true" (clicked)="scrollToSection(button.route)"><royal-code-ui-icon [icon]="AppIcon.ArrowDownCircle" extraClass="mr-3" /> {{ button.textKey | translate }}</royal-code-ui-button> }
            </div>
          </section>
        } @placeholder { <div class="h-96 w-full bg-surface-alt animate-pulse"></div> }

        <!-- NIEUW - Sectie 5: Klantgetuigenissen (Social Proof) -->
        @defer (on viewport) {
            <section class="container-max px-4">
                <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.testimonialsTitleKey | translate" blockStyle="true" blockStyleType="primary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-12" />
                <royal-code-ui-item-carousel [items]="data.testimonials" [itemTemplate]="testimonialTemplate" />
            </section>
        } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }

        <!-- Sectie 6: Sub-250g Klasse -->
        @defer (on viewport) {
          <section id="sub-250g" class="space-y-12">
            <royal-code-ui-full-width-image-card [imageUrl]="data.sub250gFullWidthCardImageUrl" [titleKey]="data.sub250gFullWidthCardTitleKey | translate" [subtitleKey]="data.sub250gFullWidthCardSubtitleKey | translate" textAlign="center" [route]="data.sub250gFullWidthCardRoute" class="h-[45vh] md:h-[60vh]" /> <!-- 25% kleiner -->
            <div class="container-max px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
              @for(product of data.sub250gDrones; track product.id) {
                <!-- DE FIX: Gebruik de nieuwe UiRtfProductCardComponent -->
                <royal-code-ui-rtf-product-card [product]="product" />
              }
            </div>
          </section>
        } @placeholder { <div class="h-96 w-full bg-surface-alt animate-pulse"></div> }

        <!-- Sectie 7: 5 Inch Klasse -->
        @defer (on viewport) {
          <section id="performance-5-inch" class="space-y-12">
            <royal-code-ui-full-width-image-card [imageUrl]="data.fiveInchFullWidthCardImageUrl" [titleKey]="data.fiveInchFullWidthCardTitleKey | translate" [subtitleKey]="data.fiveInchFullWidthCardSubtitleKey | translate" textAlign="center" [route]="data.fiveInchFullWidthCardRoute" class="h-[45vh] md:h-[60vh]" /> <!-- 25% kleiner -->
            <div class="container-max px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              @for(product of data.fiveInchDrones; track product.id) {
                <!-- DE FIX: Gebruik de nieuwe UiRtfProductCardComponent -->
                <royal-code-ui-rtf-product-card [product]="product" />
              }
            </div>
          </section>
        } @placeholder { <div class="h-96 w-full bg-surface-alt animate-pulse"></div> }

        <!-- NIEUW - Sectie 8: FAQ -->
        @if(data.faqItems) {
            @defer(on viewport) {
                <section class="container-max px-4">
                    <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="data.faqTitleKey | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!text-3xl md:!text-4xl !text-center !mb-12" />
                    <royal-code-ui-faq [faqs]="data.faqItems" />
                </section>
            } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }
        }

        <!-- Sectie 9: Ons Team -->
        @defer (on viewport) { <section class="container-max px-4"><royal-code-ui-team /></section> } @placeholder { <div class="container-max px-4 h-96 bg-surface-alt animate-pulse"></div> }

        <!-- == TEMPLATES == -->
        <!-- Oorspronkelijke productSpecTemplate is nu ingekapseld in UiRtfProductCardComponent -->

        <ng-template #testimonialTemplate let-testimonial>
            <div class="snap-start flex-shrink-0 w-80 md:w-96 p-6 bg-surface-alt border border-border rounded-lg">
                <royal-code-ui-icon [icon]="AppIcon.Quote" sizeVariant="lg" extraClass="text-primary mb-3" />
                <blockquote class="text-foreground italic mb-4">"{{ testimonial.quoteKey | translate }}"</blockquote>
                <div class="flex items-center gap-3">
                    <royal-code-ui-image [src]="testimonial.imageUrl" [alt]="testimonial.author" rounding="full" objectFit="cover" extraClasses="w-12 h-12" />
                    <div>
                        <p class="font-semibold text-foreground">{{ testimonial.author }}</p>
                    </div>
                </div>
            </div>
        </ng-template>
      </div>
    } @else {
      <div class="flex items-center justify-center h-96"><royal-code-ui-spinner size="xl" /></div>
    }
  `,
  styles: [`
    :host { display: block; }
    /* Specifieke styling voor youtube-player binnen deze component's hero section */
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
export class RtfDronesPageComponent {
  protected readonly rtfDronesData: RtfDronesPageData = RTF_DRONES_PAGE_DATA;
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  protected readonly ListTypesEnum = ListTypesEnum;

  public isBrowser: boolean;
  constructor() { this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID)); }

  getHighlightClasses(highlight: TechHighlightGridItem): string {
    // Aangepaste hoogtes om 25% kleiner te zijn.
    const baseHeightMd = 400 * 0.75; // was 400px, nu 300px
    const baseHeightLg = 400 * 0.75; // was 400px, nu 300px

    const mediumHeightMd = 188 * 0.75; // was 188px, nu 141px
    const mediumHeightLg = 188 * 0.75; // was 188px, nu 141px

    const smallHeight = 200 * 0.75; // was 200px, nu 150px
    const fullWidthHeightMd = 300 * 0.75; // was 300px, nu 225px


    if (highlight.gridClasses) {
      // Als gridClasses al is ingesteld, kunnen we proberen de h-waarde te overschrijven,
      // maar het is beter om te vertrouwen op de gedefinieerde waarden in RTF_DRONES_PAGE_DATA.
      // Deze functie wordt nu gebruikt om de klassen te *genereren* die in de data staan.
      return highlight.gridClasses;
    }

    // Fallback logica als gridClasses niet in de data staat, maar dat zou het wel moeten.
    if (highlight.size === 'large') {
        return `md:col-span-2 h-[${baseHeightMd}px] lg:h-[${baseHeightLg}px]`;
    }
    return `md:col-span-1 h-[${smallHeight}px] lg:h-[${smallHeight}px]`;
  }

  scrollToSection(fragment: string): void {
    const id = fragment.startsWith('#') ? fragment.substring(1) : fragment;
    const element = document.getElementById(id);
    if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
}