/**
 * @file home.component.ts (CV App)
 * @version 34.0.0 (Cleaned up after background move)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-21
 * @Description
 *   De definitieve homepage, opgeschoond nadat de full-width achtergrondgradient
 *   naar de layout component is verplaatst. Alle andere visuele elementen
 *   (Aurora, SVG Blob, Pure CSS Glow Blob) zijn behouden en functioneren correct.
 */
import {
  ChangeDetectionStrategy, Component, OnInit, inject,
  OnDestroy, ElementRef, afterNextRender, PLATFORM_ID, QueryList,
  ViewChildren
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

// === UI Library ===
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiImageComponent } from '@royal-code/ui/image';
import { AuroraBackgroundComponent, OrganicSvgBlobComponent } from '@royal-code/ui/backgrounds';

// === Domain, Services & Local Components ===
import { AppIcon, Testimonial } from '@royal-code/shared/domain';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { TestimonialDataService } from '../../core/services/testimonial-data.service';

@Component({
  selector: 'app-cv-home',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, UiTitleComponent,
    UiParagraphComponent, UiButtonComponent, UiIconComponent, UiCardComponent,
    UiImageComponent, AuroraBackgroundComponent, OrganicSvgBlobComponent
  ],
  styles: [`
    :host {
      display: block;
    }

    /* PURE CSS GLOW BLOB ACHTER PROFIELFOTO (ongewijzigd) */
    .profile-glow-blob {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 750px; /* Grootte van de blob */
      height: 750px;
      border-radius: 50%;
      background: radial-gradient(circle at center, var(--color-primary) 0%, transparent 60%);
      opacity: 0.2; /* Begin opaciteit */
      filter: blur(80px); /* Zachte gloed */
      transform: translate(-50%, -50%) scale(0.9);
      animation: css-blob-pulse 8s ease-in-out infinite alternate;
      z-index: -1; /* Zorg dat dit element achter de profielfoto zit */
      pointer-events: none; /* Zorgt dat het geen kliks onderschept */
    }
    @keyframes css-blob-pulse {
      0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.2; }
      50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.3; }
      100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.2; }
    }

    /* Stijlen voor de rest van de pagina (ongewijzigd) */
    .fade-in-section { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
    .fade-in-section.is-visible { opacity: 1; transform: translateY(0); }
    .lift-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .lift-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgb(0 0 0 / .12); }
  `],
  template: `
    <!-- De full-page gradient wordt nu afgehandeld door de AppLayoutComponent. -->
    <div id="home-main" class="container-max space-y-24 md:space-y-32 md:py-16">
      
            <!-- Sectie 1: De Hero -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh] relative">
          <!-- Aurora Background (geleverd door AuroraBackgroundComponent) -->
          <royal-aurora-background blobSize="lg" />

          <!-- Linker Hero Kolom: Tekstuele Inhoud -->
          <div class="text-center lg:text-left relative z-10">
              <royal-code-ui-title
                [level]="TitleTypeEnum.H1"
                [text]="'cv.home.hero.headline' | translate"
                extraClasses="!text-4xl sm:!text-6xl !font-black tracking-tighter"
                style="text-wrap: balance;"
              />
              <royal-code-ui-paragraph
                [text]="'cv.home.hero.subheadline' | translate"
                size="lg"
                color="primary"
                extraClasses="!font-semibold mt-4"
                style="text-wrap: balance;"
              />
              <p class="mt-4 text-sm font-mono tracking-tight text-muted-foreground">
                {{ 'cv.home.hero.proofPoint' | translate }}
                <button
                  type="button"
                  class="relative inline-block align-middle w-4 h-4 bg-muted text-muted-foreground rounded-full text-xs font-bold leading-none focus-visible:ring-2 focus-visible:ring-primary"
                  [attr.aria-label]="'cv.home.hero.proofPointContext' | translate"
                  [title]="'cv.home.hero.proofPointContext' | translate">?
                </button>
              </p>
              <article class="mt-8 max-w-2xl mx-auto lg:mx-0" data-section-id="availability-notice">
                <royal-code-ui-card borderColor="gradient" extraContentClasses="!p-4 text-left shadow-lg border-2 bg-card/80 backdrop-blur-lg">
                  <div class="flex items-start gap-4">
                    <royal-code-ui-icon [icon]="AppIcon.Search" sizeVariant="lg" colorClass="text-primary flex-shrink-0 mt-1" [attr.aria-hidden]="true" />
                    <div>
                      <h3 class="font-bold text-foreground">{{ 'cv.home.availability.title' | translate }}</h3>
                      <p class="text-secondary text-sm mt-1">
                        {{ 'cv.home.availability.line1' | translate }}<br>
                        {{ 'cv.home.availability.line2' | translate }}
                      </p>
                    </div>
                  </div>
                </royal-code-ui-card>
              </article>
              <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-8">
                <royal-code-ui-button
                  type="primary"
                  sizeVariant="lg"
                  (clicked)="openCalendlyModal()">
                  {{ 'cv.home.hero.cta' | translate }} <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" extraClass="ml-2" [attr.aria-hidden]="true" />
                </royal-code-ui-button>
                <a routerLink="/architectuur">
                  <royal-code-ui-button type="outline" sizeVariant="lg">
                    {{ 'cv.home.hero.ctaSecondary' | translate }}
                  </royal-code-ui-button>
                </a>
              </div>
              <p class="text-xs text-muted mt-3">{{ 'cv.home.hero.riskReversal' | translate }}</p>
          </div>

          <!-- Rechter Hero Kolom: Profielfoto met Achtergrondeffecten -->
          <!-- DE FIX: Deze sectie is nu TERUGGEDRAAID naar de werkende staat, ZONDER absolute positionering op de figure. -->
          <div class="flex items-center justify-center relative">
            <!-- PURE CSS GLOW BLOB -->
            <div class="profile-glow-blob"></div>

            <!-- PROFIELFOTO - Dit was al correct en wordt nu gereset. -->
            <figure class="w-92 h-92 border-4 border-primary/50 shadow-lg relative z-10 rounded-full">
              <royal-code-ui-image
                [src]="'images/profiel-roy.jpg'"
                [alt]="'Profielfoto van Roy van de Wetering'"
                objectFit="cover"
                [rounded]="true"
                class="w-full h-full"
              />
              <figcaption class="sr-only">Profielfoto van Roy van de Wetering</figcaption>
            </figure>

            <!-- SVG BLOB -->
            <royal-organic-svg-blob fill="var(--color-primary)" extraClasses="absolute w-[750px] h-[750px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 z-0" />
          </div>
        </section>

      <!-- === SECTIE 2: Social Proof === -->
      <section #animatedSection data-section-id="social-proof" class="fade-in-section text-center relative py-8 rounded-2xl">
         <div class="relative z-10">
           <p class="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">{{ 'cv.home.socialProof.trustedBy' | translate }}</p>
           <div class="flex justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-all duration-300">
                <div class="h-12 max-w-xs">
                  <royal-code-ui-image src="images/brands/heineken-logo.webp" alt="Heineken logo" class="w-full h-full" [objectFit]="'contain'" />
                </div>
                <div class="h-12 max-w-xs">
                  <royal-code-ui-image src="images/brands/fintech-logo.webp" alt="FinTech Scale-up logo" class="w-full h-full" [objectFit]="'contain'" />
                </div>
                <div class="h-12 max-w-xs">
                  <royal-code-ui-image src="images/brands/crypto-guru-logo.webp" alt="Crypto Guru logo" class="w-full h-full" [objectFit]="'contain'" />
                </div>
           </div>
           @if (featuredTestimonial(); as testimonial) {
            <div class="max-w-2xl mx-auto mt-8">
                <royal-code-ui-card borderColor="gradient" extraContentClasses="bg-card/80 backdrop-blur-lg grid grid-cols-[auto,1fr] items-center gap-4 text-left">
                    <!-- DE FIX: 'mx-auto' toegevoegd aan de wrapper div voor horizontale centrering. -->
                    <div class="w-72 h-72 border-2 border-primary/50 rounded-full mx-auto">
                      <royal-code-ui-image
                        [image]="testimonial.authorImage"
                        [fallbackSrc]="'images/users/cto-avatar.webp'"
                        [alt]="testimonial.authorName"
                        [rounding]="'full'"
                        class="w-full h-full"
                      />
                    </div>
                    <div>
                      <p class="italic text-secondary">"{{ testimonial.quoteKey | translate }}"</p>
                      <p class="font-bold text-primary mt-2">- {{ testimonial.authorName }} @ {{ testimonial.authorCompany }}</p>
                    </div>
                </royal-code-ui-card>
            </div>
           }
         </div>
     </section>

      <!-- Sectie 3: Probleem dat ik oplos -->
      <section #animatedSection data-section-id="problem-solve" class="fade-in-section text-center">
          <royal-code-ui-title
            [level]="TitleTypeEnum.H2"
            [text]="'cv.home.problemISolve.title' | translate"
            [blockStyle]="true"
            blockStyleType="primary"
            extraClasses="!mb-8"
          />
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" style="grid-auto-rows: 1fr;">
              @for(problemKey of problemKeys; track problemKey) {
                  <royal-code-ui-card borderColor="primary" extraContentClasses="lift-card !p-4 text-left" [hoverEffectEnabled]="true">
                      <div class="flex items-center gap-3 h-full">
                        <royal-code-ui-icon [icon]="AppIcon.XCircle" colorClass="text-destructive" [attr.aria-hidden]="true" />
                        <span class="text-secondary">{{ problemKey | translate }}</span>
                      </div>
                  </royal-code-ui-card>
              }
          </div>
          <p class="text-center mt-8 font-semibold">
              {{ 'cv.home.problemISolve.solution' | translate }}
              <a routerLink="/architectuur" class="text-primary hover:underline ml-1">{{ 'cv.home.problemISolve.cta' | translate }}</a>
          </p>
      </section>
      </div>
    
  `
})
export class CvHomepageComponent implements OnInit, OnDestroy {
  @ViewChildren('animatedSection') animatedSections!: QueryList<ElementRef>;
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly testimonialService = inject(TestimonialDataService);
  private readonly platformId: Object;
  private sectionObserver: IntersectionObserver | null = null;
  private trackedSections = new Set<string>();

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
  readonly problemKeys = [ 'cv.home.problemISolve.problems.item1', 'cv.home.problemISolve.problems.item2', 'cv.home.problemISolve.problems.item3', 'cv.home.problemISolve.problems.item4' ];
  readonly featuredTestimonial = toSignal(this.testimonialService.getTestimonials().pipe(map(testimonials => testimonials.find(t => t.id === 'testimonial-jasper-kruit'))));

  constructor() {
    this.platformId = inject(PLATFORM_ID);
    afterNextRender(() => {
        if (isPlatformBrowser(this.platformId)) {
            this.setupSectionObserver();
        }
    });
  }
  ngOnInit(): void {
    this.titleService.setTitle("Digitale Fabriek → 30% Sneller • 90% Minder Bugs | Roy van de Wetering");
    this.metaService.addTags([
      { property: 'og:title', content: "Digitale Fabriek → 30% Sneller • 90% Minder Bugs | Roy van de Wetering" },
      { property: 'og:description', content: "Ik ontwerp systemen die snellere, betere & consistentere software bouwen." },
      { property: 'og:image', content: '/assets/og/ai-factory-og.png' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ]);
  }
  ngOnDestroy(): void {
      this.sectionObserver?.disconnect();
      this.trackedSections.clear();
  }
  private setupSectionObserver(): void {
    const options = { rootMargin: '0px', threshold: 0.1 };
    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          const sectionId = (entry.target as HTMLElement).dataset['sectionId'];
          if (sectionId && !this.trackedSections.has(sectionId)) {
            this.trackedSections.add(sectionId);
            this.trackAnalytics('section_visible', { section: sectionId });
          }
        }
      });
    }, options);
    this.animatedSections.forEach(section => this.sectionObserver?.observe(section.nativeElement));
  }
  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) { console.debug(`[ANALYTICS] Event: ${eventName}`, data); }
  }
  openCalendlyModal(): void {
      this.trackAnalytics('home_cta_click', { position: 'hero' });
      if (!environment.production) { alert("Simulatie: Calendly opent nu in een frictieloze overlay."); }
  }
}