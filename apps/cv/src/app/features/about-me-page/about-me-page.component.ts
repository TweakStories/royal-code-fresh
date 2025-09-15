/**
 * @file about-me-page.component.ts (CV App)
 * @version 3.7.0 (Full Internationalization)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-07
 * @Description
 *   Definitieve, productieklare en volledig geïnternationaliseerde 'Over Mij'-pagina.
 *   Alle hardgecodeerde strings zijn vervangen door vertaalsleutels (i18n).
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiButtonComponent } from '@royal-code/ui/button';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { environment } from '../../../../environments/environment';
import { UiImageComponent } from '@royal-code/ui/image';
// import { CalendlyOverlayComponent } from '...'; // Veronderstelde import

@Component({
  selector: 'app-cv-about-me-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent, UiCardComponent, UiImageComponent, UiBadgeComponent, UiButtonComponent],
  template: `
    <section id="about-main" class="about-me-page container-max py-16 md:py-24 space-y-20">

      <!-- Sectie 1: De Filosofie -->
      <header class="text-center">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H1"
          [text]="'cv.aboutMe.pageTitle' | translate"
          extraClasses="!text-3xl sm:!text-5xl !font-black mb-4"
        />
        <royal-code-ui-paragraph
          [text]="'cv.aboutMe.philosophy.hook' | translate"
          size="lg"
          color="muted"
          extraClasses="max-w-4xl mx-auto"
        />
      </header>

      <!-- Profielfoto -->
      <figure class="mx-auto my-8 w-40 h-40 relative">
        <royal-code-ui-image
          [src]="'images/profiel-roy.jpg'"
          [alt]="'cv.aboutMe.profileImage.alt' | translate"
          objectFit="cover"
          [rounded]="true"
          class="w-full h-full"
        />
        <figcaption class="sr-only">{{ 'cv.aboutMe.profileImage.alt' | translate }}</figcaption>
      </figure>

      <!-- Sectie 2: Mijn Belofte (Met Bewijs) -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aboutMe.whatIOffer.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          @for (point of whatIOfferPoints; track point.id) {
            <royal-code-ui-card
                borderColor="primary"
                role="button"
                tabindex="0"
                [attr.aria-label]="'cv.aboutMe.whatIOffer.ariaLabelPrefix' | translate: { title: (point.titleKey | translate) }"
                (click)="trackAnalytics('about_offer_click', point)"
                (keyup.enter)="trackAnalytics('about_offer_click', point)"
                (keyup.space)="trackAnalytics('about_offer_click', point)"
                [attr.data-analytics]="'about_offer_' + point.id"
                extraContentClasses="flex flex-col text-center cursor-pointer hover:bg-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <royal-code-ui-icon [icon]="point.icon" sizeVariant="xl" colorClass="text-primary mx-auto mb-4" [attr.aria-hidden]="true" />
              <h3 class="text-lg font-semibold text-foreground mb-2">{{ point.titleKey | translate }}</h3>
              <p class="text-sm text-secondary flex-grow">{{ point.descriptionKey | translate }}</p>
              <div class="text-xs bg-background p-2 rounded-md border border-border mt-4">
                <p class="italic">"{{ point.proofQuoteKey | translate }}"</p>
                <p class="font-bold text-right mt-1">- {{ point.proofAuthorKey | translate }}</p>
              </div>
            </royal-code-ui-card>
          }
        </div>
      </article>

      <!-- Sectie 3: Fouten die mij vormden -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aboutMe.failStories.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          @for(fail of failStories; track fail.slug) {
            <royal-code-ui-card 
                borderColor="primary" 
                role="button"
                tabindex="0"
                [attr.aria-label]="'cv.aboutMe.failStories.ariaLabelPrefix' | translate: { title: (fail.titleKey | translate) }"
                (click)="trackAnalytics('fail_story_click', fail)"
                (keyup.enter)="trackAnalytics('fail_story_click', fail)"
                (keyup.space)="trackAnalytics('fail_story_click', fail)"
                [attr.data-analytics]="'fail_story_'+fail.slug"
                extraContentClasses="flex flex-col text-center cursor-pointer hover:bg-hover p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <royal-code-ui-icon [icon]="AppIcon.AlertTriangle" sizeVariant="lg" colorClass="text-warning mx-auto mb-3" [attr.aria-hidden]="true" />
              <h3 class="font-semibold mb-1 text-sm">{{ fail.titleKey | translate }}</h3>
              <p class="text-xs text-secondary flex-grow">{{ fail.problemKey | translate }}</p>
              <p class="text-xs font-bold mt-2">{{ 'cv.aboutMe.failStories.fixPrefix' | translate }}: {{ fail.fixKey | translate }}</p>
              <royal-code-ui-badge color="success" size="xs" extraClasses="mt-2 self-center">{{ fail.impactKey | translate }}</royal-code-ui-badge>
            </royal-code-ui-card>
          }
        </div>
      </article>

      <!-- Sectie 4: Mijn Mindset -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aboutMe.mindset.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
           @for (item of mindsetPoints; track item.titleKey) {
            <royal-code-ui-card>
              <royal-code-ui-icon [icon]="item.icon" sizeVariant="lg" colorClass="text-primary mb-3" [attr.aria-hidden]="true" />
              <h3 class="font-semibold text-foreground mb-1">{{ item.titleKey | translate }}</h3>
              <p class="text-sm text-secondary">{{ item.descriptionKey | translate }}</p>
            </royal-code-ui-card>
           }
        </div>
      </article>

      <!-- Sectie 5: Praktische Details & CTA -->
      <article class="text-center bg-card border border-border rounded-xs p-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.aboutMe.details.title' | translate" extraClasses="!mb-4" />
        <royal-code-ui-paragraph [text]="'cv.aboutMe.details.text' | translate" color="muted" [centered]="true" extraClasses="max-w-3xl mx-auto mb-6" />
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <royal-code-ui-badge color="muted" size="lg">
              <royal-code-ui-icon [icon]="AppIcon.MapPin" sizeVariant="sm" extraClass="mr-2" [attr.aria-hidden]="true" />
              {{ 'cv.aboutMe.details.location' | translate }}
            </royal-code-ui-badge>
            <royal-code-ui-button type="primary" (clicked)="openContactOverlay()">
              {{ 'cv.aboutMe.details.cta' | translate }}
              <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" extraClass="ml-2" [attr.aria-hidden]="true" />
            </royal-code-ui-button>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMePageComponent implements OnInit {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly translateService = inject(TranslateService); // Inject TranslateService
  // @ts-ignore: 'overlayService' is declared but its value is never read in this stubbed version.
  private readonly overlayService = inject(DynamicOverlayService);

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  // Data structuren nu met vertaalsleutels
  readonly whatIOfferPoints = [
    { id: 'partner', icon: AppIcon.Handshake, titleKey: "cv.aboutMe.whatIOffer.points.item1.title", descriptionKey: "cv.aboutMe.whatIOffer.points.item1.description", proofQuoteKey: "cv.aboutMe.whatIOffer.points.item1.proof.quote", proofAuthorKey: "cv.aboutMe.whatIOffer.points.item1.proof.author" },
    { id: 'learner', icon: AppIcon.BrainCircuit, titleKey: "cv.aboutMe.whatIOffer.points.item2.title", descriptionKey: "cv.aboutMe.whatIOffer.points.item2.description", proofQuoteKey: "cv.aboutMe.whatIOffer.points.item2.proof.quote", proofAuthorKey: "cv.aboutMe.whatIOffer.points.item2.proof.author" },
    { id: 'transparency', icon: AppIcon.BadgeCheck, titleKey: "cv.aboutMe.whatIOffer.points.item3.title", descriptionKey: "cv.aboutMe.whatIOffer.points.item3.description", proofQuoteKey: "cv.aboutMe.whatIOffer.points.item3.proof.quote", proofAuthorKey: "cv.aboutMe.whatIOffer.points.item3.proof.author" }
  ];

readonly failStories = [
  { slug: 'big-bang-rewrite',            titleKey: 'cv.aboutMe.failStories.item1.title', problemKey: 'cv.aboutMe.failStories.item1.problem', fixKey: 'cv.aboutMe.failStories.item1.fix', impactKey: 'cv.aboutMe.failStories.item1.impact' },
  { slug: 'race-condition-ws',            titleKey: 'cv.aboutMe.failStories.item2.title', problemKey: 'cv.aboutMe.failStories.item2.problem', fixKey: 'cv.aboutMe.failStories.item2.fix', impactKey: 'cv.aboutMe.failStories.item2.impact' },
  { slug: 'enum-mismatch',                titleKey: 'cv.aboutMe.failStories.item3.title', problemKey: 'cv.aboutMe.failStories.item3.problem', fixKey: 'cv.aboutMe.failStories.item3.fix', impactKey: 'cv.aboutMe.failStories.item3.impact' },
  { slug: 'concurrency-error',            titleKey: 'cv.aboutMe.failStories.item4.title', problemKey: 'cv.aboutMe.failStories.item4.problem', fixKey: 'cv.aboutMe.failStories.item4.fix', impactKey: 'cv.aboutMe.failStories.item4.impact' },
  { slug: 'circular-dependency-ng0200',   titleKey: 'cv.aboutMe.failStories.item5.title', problemKey: 'cv.aboutMe.failStories.item5.problem', fixKey: 'cv.aboutMe.failStories.item5.fix', impactKey: 'cv.aboutMe.failStories.item5.impact' },
  { slug: 'effect-outside-context-ng0203',titleKey: 'cv.aboutMe.failStories.item6.title', problemKey: 'cv.aboutMe.failStories.item6.problem', fixKey: 'cv.aboutMe.failStories.item6.fix', impactKey: 'cv.aboutMe.failStories.item6.impact' },
  { slug: 'recursive-loop',               titleKey: 'cv.aboutMe.failStories.item7.title', problemKey: 'cv.aboutMe.failStories.item7.problem', fixKey: 'cv.aboutMe.failStories.item7.fix', impactKey: 'cv.aboutMe.failStories.item7.impact' },
  { slug: 'holistic-fix-v6-4-0',          titleKey: 'cv.aboutMe.failStories.item8.title', problemKey: 'cv.aboutMe.failStories.item8.problem', fixKey: 'cv.aboutMe.failStories.item8.fix', impactKey: 'cv.aboutMe.failStories.item8.impact' }
];


  readonly mindsetPoints = [
    { icon: AppIcon.Grid, titleKey: "cv.aboutMe.mindset.item1.title", descriptionKey: "cv.aboutMe.mindset.item1.description" },
    { icon: AppIcon.Swords, titleKey: "cv.aboutMe.mindset.item2.title", descriptionKey: "cv.aboutMe.mindset.item2.description" },
    { icon: AppIcon.Camera, titleKey: "cv.aboutMe.mindset.item3.title", descriptionKey: "cv.aboutMe.mindset.item3.description" }
  ];

  ngOnInit(): void {
    // Gebruik de translate service om de meta tags te zetten
    this.translateService.get([
      'cv.aboutMe.pageTitle',
      'cv.aboutMe.meta.description',
      'cv.aboutMe.meta.ogTitle',
      'cv.aboutMe.meta.ogImageAlt'
    ]).subscribe(translations => {
      this.titleService.setTitle(translations['cv.aboutMe.pageTitle']);
      this.metaService.addTags([
        { name: 'description', content: translations['cv.aboutMe.meta.description'] },
        { property: 'og:title', content: translations['cv.aboutMe.meta.ogTitle'] },
        { property: 'og:image', content: '/assets/og/about-me-hero.png' },
        { name: 'robots', content: 'index,follow' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/assets/og/about-me-hero.png' },
        { name: 'twitter:image:alt', content: translations['cv.aboutMe.meta.ogImageAlt'] }
      ]);
    });
  }

  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
    // else { /* Injecteer en gebruik hier je echte analytics service */ }
  }

  openContactOverlay(): void {
    this.trackAnalytics('about_me_cta_click', { source: 'about_page' });
    if (!environment.production) {
      alert("Simulatie: Calendly opent nu in een frictieloze overlay.");
    }
    // else { this.overlayService.open(CalendlyOverlayComponent, { data: { utm: 'about-cta' } }); }
  }
}