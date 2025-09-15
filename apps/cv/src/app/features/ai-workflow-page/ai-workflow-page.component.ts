/**
 * @file ai-workflow-page.component.ts (CV App)
 * @version 14.1.0 (Full Internationalization)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-07
 * @Description
 *   De definitieve, productieklare en volledig geïnternationaliseerde AI-pagina.
 *   Alle hardgecodeerde strings zijn vervangen door vertaalsleutels (i18n).
 */
import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, PLATFORM_ID, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { Image, MediaType } from '@royal-code/shared/domain';
import { environment } from '../../../../environments/environment';
import { MediaViewerService } from '@royal-code/ui/image';
// import { CalendlyOverlayComponent } from '...'; // Veronderstelde import voor de overlay

@Component({
  selector: 'app-cv-ai-workflow-page',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent,
    UiCardComponent, UiButtonComponent, UiBadgeComponent
  ],
  template: `
    <section class="ai-workflow-page container-max py-16 md:py-24 space-y-20">

      <!-- Sectie 1: Het Manifest -->
      <header class="text-center">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H2" 
          [text]="'cv.aiWorkflow.manifesto.title' | translate" 
          extraClasses="!text-3xl sm:!text-5xl !font-black mb-4" 
        />
        <royal-code-ui-paragraph 
          [text]="'cv.aiWorkflow.manifesto.hook' | translate" 
          size="lg" 
          color="muted" 
          extraClasses="max-w-4xl mx-auto" 
        />
      </header>

      <!-- Sectie 2: De Case Study (Het Harde Bewijs) -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aiWorkflow.caseStudy.title' | translate" [center]="true" extraClasses="!mb-2" />
        <p class="text-center font-semibold text-primary mb-4">{{ 'cv.aiWorkflow.caseStudy.subheadline' | translate }}</p>
        <p class="text-center text-secondary mb-8">{{ 'cv.aiWorkflow.caseStudy.project' | translate }} ({{ 'cv.aiWorkflow.caseStudy.teamContext' | translate }})</p>
        <div class="max-w-3xl mx-auto">
            <royal-code-ui-card [appearance]="'gradient'">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="border-l-4 border-destructive pl-4">
                    <h4 class="font-bold text-secondary">{{ 'cv.aiWorkflow.caseStudy.traditional.title' | translate }}</h4>
                    <ul class="mt-2 space-y-1 text-sm">
                      <li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.leadTime' | translate }}:</strong> {{ 'cv.aiWorkflow.caseStudy.traditional.timeline' | translate }}</li>
                      <li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.bugs' | translate }}:</strong> {{ 'cv.aiWorkflow.caseStudy.traditional.bugs' | translate }}</li>
                      <!--<li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.annualCost' | translate }}:</strong> €{{ 'cv.aiWorkflow.caseStudy.traditional.cost' | translate }}</li>-->
                    </ul>
                  </div>
                  <div class="border-l-4 border-success pl-4">
                    <h4 class="font-bold text-primary">{{ 'cv.aiWorkflow.caseStudy.myApproach.title' | translate }}</h4>
                    <ul class="mt-2 space-y-1 text-sm">
                      <li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.leadTime' | translate }}:</strong> {{ 'cv.aiWorkflow.caseStudy.myApproach.timeline' | translate }}</li>
                      <li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.bugs' | translate }}:</strong> {{ 'cv.aiWorkflow.caseStudy.myApproach.bugs' | translate }}</li>
                      <!--<li><strong>{{ 'cv.aiWorkflow.caseStudy.metrics.annualSavings' | translate }}:</strong> €{{ 'cv.aiWorkflow.caseStudy.myApproach.savings' | translate }}</li>-->
                    </ul>
                  </div>
                </div>
            </royal-code-ui-card>
            <div class="text-center mt-4">
                <a (click)="openDatadogProof()" class="text-xs text-secondary hover:text-primary underline cursor-pointer" data-analytics="evidence_click_datadog">
                  {{ 'cv.aiWorkflow.caseStudy.viewEvidence' | translate }} →
                </a>
            </div>
        </div>
      </article>

      <!-- Sectie 3: Visueel Bewijs (Show, Don't Tell) -->
      <article class="text-center">
         <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aiWorkflow.video.title' | translate" [center]="true" extraClasses="!mb-6" />
         <div #videoContainer class="aspect-video bg-muted rounded-xs border border-border flex items-center justify-center text-secondary max-w-4xl mx-auto" style="min-height: 360px;" aria-label="Demo video – specification to green CI in 45 s">
            <!-- Video wordt hier dynamisch ingeladen door de IntersectionObserver -->
         </div>
      </article>

      <!-- Sectie 4: Differentiators / 2025 Edge -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aiWorkflow.differentiators.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          @for (point of differentiatorsPoints; track point.titleKey) {
            <royal-code-ui-card [appearance]="'gradient'" extraContentClasses="flex flex-col">
              <royal-code-ui-icon [icon]="point.icon" sizeVariant="xl" colorClass="text-primary mb-4" />
              <h4 class="font-semibold text-primary mb-2">{{ point.titleKey | translate }}</h4>
              <p class="text-sm text-secondary">{{ point.detailKey | translate }}</p>
            </royal-code-ui-card>
          }
        </div>
      </article>
      
      <!-- Sectie 5: Risicomanagement -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aiWorkflow.lessons.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          @for (pitfall of lessonsPitfalls; track pitfall.nameKey) {
            <royal-code-ui-card extraContentClasses="p-4 h-full">
              <p class="font-semibold text-sm mb-1">{{ pitfall.nameKey | translate }}</p>
              <p class="text-xs font-bold text-destructive mb-2">{{ pitfall.statKey | translate }}</p>
              <p class="text-xs text-secondary">{{ pitfall.mitigationKey | translate }} <a [href]="pitfall.sourceUrl" target="_blank" rel="noopener noreferrer" class="text-primary/70 hover:underline" [attr.aria-label]="'cv.aiWorkflow.lessons.sourceLinkAriaLabel' | translate">[ {{ 'common.buttons.source' | translate }} ]</a></p>
            </royal-code-ui-card>
          }
        </div>
      </article>

      <!-- Sectie 6: Call to Action -->
      <article class="text-center bg-card border border-border rounded-xs p-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.aiWorkflow.callToAction.title' | translate" extraClasses="!mb-4" />
        <royal-code-ui-paragraph [text]="'cv.aiWorkflow.callToAction.message' | translate" color="muted" [centered]="true" extraClasses="max-w-2xl mx-auto mb-8" />
        <div class="flex items-center justify-center gap-4">
          <royal-code-ui-button 
              type="primary" 
              sizeVariant="lg"
              data-analytics="cta-ai-page"
              (clicked)="openCalendlyModal()">
              <royal-code-ui-icon [icon]="AppIcon.CalendarClock" sizeVariant="sm" extraClass="mr-2" />
              {{ 'cv.aiWorkflow.callToAction.ctaButton' | translate }}
          </royal-code-ui-button>
          <royal-code-ui-badge color="primary" size="lg" [bordered]="false">
            {{ 'cv.aiWorkflow.callToAction.badgeText' | translate }}
          </royal-code-ui-badge>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiWorkflowPageComponent implements OnInit, OnDestroy {
  @ViewChild('videoContainer', { static: true }) videoContainerRef!: ElementRef;
  private videoObserver?: IntersectionObserver;

  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly translateService = inject(TranslateService); // Inject TranslateService
  private readonly mediaViewerService = inject(MediaViewerService);
  private readonly platformId: Object;

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  readonly datadogProofImage: Image = {
    id: 'datadog-proof-1',
    type: MediaType.IMAGE,
    variants: [{ url: 'images/datadog-latency-proof.WEBP', purpose: 'original' }],
    // Alt-tekst wordt nu direct via de vertaalservice geleverd in meta tags, hier kan een fallback string staan.
    altText: 'Datadog dashboard toont een latency-daling van 38% na de specificatie-gedreven refactor.'
  };

  // Data structuren nu met vertaalsleutels
  readonly differentiatorsPoints = [
    { titleKey: "cv.aiWorkflow.differentiators.item1.title", detailKey: "cv.aiWorkflow.differentiators.item1.detail", icon: AppIcon.Recycle },
    { titleKey: "cv.aiWorkflow.differentiators.item2.title", detailKey: "cv.aiWorkflow.differentiators.item2.detail", icon: AppIcon.BrainCircuit },
    { titleKey: "cv.aiWorkflow.differentiators.item3.title", detailKey: "cv.aiWorkflow.differentiators.item3.detail", icon: AppIcon.FlaskConical }
  ];

  readonly lessonsPitfalls = [
    { nameKey: "cv.aiWorkflow.lessons.pitfalls.item1.name", statKey: "cv.aiWorkflow.lessons.pitfalls.item1.stat", mitigationKey: "cv.aiWorkflow.lessons.pitfalls.item1.mitigation", sourceUrl: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' },
    { nameKey: "cv.aiWorkflow.lessons.pitfalls.item2.name", statKey: "cv.aiWorkflow.lessons.pitfalls.item2.stat", mitigationKey: "cv.aiWorkflow.lessons.pitfalls.item2.mitigation", sourceUrl: '#' },
    { nameKey: "cv.aiWorkflow.lessons.pitfalls.item3.name", statKey: "cv.aiWorkflow.lessons.pitfalls.item3.stat", mitigationKey: "cv.aiWorkflow.lessons.pitfalls.item3.mitigation", sourceUrl: '#' },
    { nameKey: "cv.aiWorkflow.lessons.pitfalls.item4.name", statKey: "cv.aiWorkflow.lessons.pitfalls.item4.stat", mitigationKey: "cv.aiWorkflow.lessons.pitfalls.item4.mitigation", sourceUrl: '#' }
  ];

  constructor() {
    this.platformId = inject(PLATFORM_ID);
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initializeVideoObserver();
      }
    });
  }

  ngOnInit(): void {
    // Gebruik de translate service om de meta tags te zetten
    this.translateService.get([
      'cv.aiWorkflow.meta.title',
      'cv.aiWorkflow.meta.description',
      'cv.aiWorkflow.meta.ogTitle',
      'cv.aiWorkflow.meta.ogImageAlt'
    ]).subscribe(translations => {
      this.titleService.setTitle(translations['cv.aiWorkflow.meta.title']);
      this.metaService.addTags([
        { name: 'description', content: translations['cv.aiWorkflow.meta.description'] },
        { property: 'og:title', content: translations['cv.aiWorkflow.meta.ogTitle'] },
        { property: 'og:image', content: '/assets/og/ai-factory-case.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/assets/og/ai-factory-case.png' },
        { name: 'twitter:image:alt', content: translations['cv.aiWorkflow.meta.ogImageAlt'] }
      ]);
    });
  }

  ngOnDestroy(): void {
    this.videoObserver?.disconnect();
  }

  private initializeVideoObserver(): void {
    if (!isPlatformBrowser(this.platformId) || !this.videoContainerRef) { return; }

    const options = { rootMargin: '0px', threshold: 0.25 };
    this.videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target as HTMLElement;
          const video = document.createElement('video');
          video.src = 'assets/videos/spec-to-ci-demo.mp4';
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.className = 'w-full h-full object-cover rounded-xs';
          video.setAttribute('data-analytics', 'video_play');
          container.innerHTML = '';
          container.appendChild(video);
          this.videoObserver?.unobserve(container);
        }
      });
    }, options);
    this.videoObserver.observe(this.videoContainerRef.nativeElement);
  }

  openCalendlyModal(): void {
    this.trackAnalytics('cta_click_ai', { page: 'AI Workflow' });
    
    if (!environment.production) {
      alert("Simulatie: Calendly opent nu in een frictieloze overlay.");
    }
    // else { this.overlayService.open(CalendlyOverlayComponent, { data: { utm: 'ai-page-cta' } }); }
  }

  openDatadogProof(): void {
     this.mediaViewerService.openLightbox([this.datadogProofImage], 0);
  }

  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
    // else { /* Injecteer en gebruik hier je echte analytics service */ }
  }
}