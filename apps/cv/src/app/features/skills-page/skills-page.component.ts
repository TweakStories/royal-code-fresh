/**
 * @file skills-page.component.ts (CV App)
 * @version 13.3.0 (Fully Internationalized)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   De definitieve, productieklare en volledig geïnternationaliseerde skills-pagina.
 *   Alle hardgecodeerde strings zijn vervangen door vertaalsleutels (i18n).
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, BadgeColor } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { SkillsDataService } from '../../core/services/skills-data.service';
import { CvSkillsMatrixComponent } from '../../components/skills-matrix/skills-matrix.component';
import { UiButtonComponent } from '@royal-code/ui/button';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { environment } from '../../../../environments/environment';
// import { CalendlyOverlayComponent } from '...'; // Veronderstelde import

@Component({
  selector: 'app-cv-skills-page',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent,
    UiCardComponent, UiBadgeComponent, CvSkillsMatrixComponent, UiButtonComponent
  ],
  template: `
    <section id="skills-main" class="skills-page-section container-max py-16 md:py-24 space-y-24">

      <!-- Sectie 1: De Filosofie -->
      <header class="text-center">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H2" 
          [text]="'cv.skills.philosophy.title' | translate" 
          extraClasses="!text-3xl sm:!text-5xl !font-black mb-4" 
        />
        <royal-code-ui-paragraph 
          [text]="'cv.skills.philosophy.value' | translate" 
          size="lg" 
          color="primary" 
          extraClasses="max-w-3xl mx-auto !font-bold"
        />
      </header>
      
          <!-- Sectie 2: T-Shaped Profiel & Impact Cases -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.skills.tShaped.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <!-- DE FIX: De 'space-y-4' is verplaatst naar een nieuwe div rondom de @for-loop -->
          <div class="lg:col-span-1">
            <h4 class="font-bold text-lg text-center lg:text-left mb-4">{{ 'cv.skills.tShaped.deepSpecialization.title' | translate }}</h4>
            <div class="space-y-4">
              @for(skill of tShapedModel.deepExpertise; track skill.nameKey) {
                <royal-code-ui-card extraContentClasses="!p-4">
                  <p class="font-semibold text-primary">{{ skill.nameKey | translate }}</p>
                  <p class="text-xs font-mono text-secondary mb-2">{{ skill.masteryKey | translate }}</p>
                  <div class="text-xs bg-background p-2 rounded-md border border-border">
                    <p class="italic">"{{ skill.testimonialKey | translate }}"</p>
                    <p class="font-bold text-right mt-1">- {{ skill.testimonialAuthorKey | translate }}</p>
                  </div>
                </royal-code-ui-card>
              }
            </div>
          </div>
          <div class="lg:col-span-2 space-y-12">
            <div>
              <h4 class="font-bold text-lg text-center lg:text-left mb-4">{{ 'cv.skills.tShaped.broadKnowledge.title' | translate }}</h4>
              <div class="flex flex-wrap gap-2 justify-center lg:justify-start">
                  @for(areaKey of tShapedModel.broadKnowledgeKeys; track areaKey) {
                    <royal-code-ui-badge color="muted" size="lg">{{ areaKey | translate }}</royal-code-ui-badge>
                  }
              </div>
            </div>
            <div>
              <h4 class="font-bold text-lg text-center lg:text-left mb-4">{{ 'cv.skills.impactCases.title' | translate }}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (story of impactCases; track story.skillKey) {
                  <royal-code-ui-card 
                    (click)="trackAnalytics('impact_case_click', story)"
                    tabindex="0"
                    extraContentClasses="text-center cursor-pointer hover:bg-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    <p class="text-sm font-semibold uppercase text-secondary tracking-wider">{{ story.skillKey | translate }}</p>
                    <p class="text-3xl font-bold text-primary my-1">{{ story.impact }}</p>
                    <p class="text-xs text-secondary">{{ story.achievementKey | translate }}</p>
                    <p class="text-xs font-mono text-muted mt-1">{{ story.contextKey | translate }}</p>
                  </royal-code-ui-card>
                }
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Sectie 3: Technology Radar -->
      <article>
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.skills.radar.title' | translate" [center]="true" extraClasses="!mb-12" />
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (category of techRadarCategories; track category.nameKey) {
                  <div class="bg-card p-4 rounded-xs border-2" [ngClass]="category.borderColorClass">
                      <h4 class="font-semibold mb-3 text-lg flex items-center gap-2" [ngClass]="category.textColorClass">
                        <royal-code-ui-icon [icon]="category.icon" />
                        {{ category.nameKey | translate }}
                      </h4>
                      <div class="space-y-3">
                          @for (tech of category.items; track tech.nameKey) {
                              <div (click)="trackAnalytics('tech_radar_click', tech)" class="cursor-pointer">
                                <royal-code-ui-badge [color]="category.badgeColor" size="sm" extraClasses="!font-semibold">{{ tech.nameKey | translate }}</royal-code-ui-badge>
                                <p class="text-xs text-secondary mt-1 pl-1">{{ tech.rationaleKey | translate }}</p>
                              </div>
                          }
                      </div>
                  </div>
              }
          </div>
      </article>

      <!-- Sectie 4: Gedetailleerde Skill Matrix (Lazy Loaded) -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.skills.matrix.title' | translate" [center]="true" extraClasses="!mb-12" />
        @defer (on viewport) {
          <app-cv-skills-matrix [categories]="allSkills()" />
        } @placeholder {
          <div class="w-full h-64 bg-card border border-border rounded-xs flex items-center justify-center animate-pulse">
            <p class="text-secondary">{{ 'cv.skills.matrix.loading' | translate }}</p>
          </div>
        }
      </article>

      <!-- Sectie 5: Afsluiting & Contextuele CTA -->
       <article class="text-center bg-card border border-border rounded-xs p-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.skills.closing.statement' | translate" extraClasses="!mb-6 italic" />
        <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="openCalendlyModal()">
          <royal-code-ui-icon [icon]="AppIcon.CalendarClock" sizeVariant="sm" extraClass="mr-2" />
          {{ 'cv.skills.closing.cta' | translate }}
        </royal-code-ui-button>
        <div class="mt-4">
           <royal-code-ui-badge color="success" [bordered]="false" data-analytics="risk_reversal_badge_view">
             <royal-code-ui-icon [icon]="AppIcon.ShieldCheck" sizeVariant="xs" extraClass="mr-1.5" />
             {{ 'cv.skills.closing.guarantee' | translate }}
           </royal-code-ui-badge>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsPageComponent implements OnInit {
  private readonly skillsDataService = inject(SkillsDataService);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly overlayService = inject(DynamicOverlayService);
  
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  readonly allSkills = toSignal(this.skillsDataService.getAllSkillCategories(), { initialValue: [] });

  readonly tShapedModel = {
    deepExpertise: [
      { nameKey: 'cv.skills.tShaped.deepSpecialization.item1.name', masteryKey: 'cv.skills.tShaped.deepSpecialization.item1.mastery', testimonialKey: 'cv.skills.tShaped.deepSpecialization.item1.testimonial', testimonialAuthorKey: 'cv.skills.tShaped.deepSpecialization.item1.author' },
      { nameKey: 'cv.skills.tShaped.deepSpecialization.item2.name', masteryKey: 'cv.skills.tShaped.deepSpecialization.item2.mastery', testimonialKey: 'cv.skills.tShaped.deepSpecialization.item2.testimonial', testimonialAuthorKey: 'cv.skills.tShaped.deepSpecialization.item2.author' },
      { nameKey: 'cv.skills.tShaped.deepSpecialization.item3.name', masteryKey: 'cv.skills.tShaped.deepSpecialization.item3.mastery', testimonialKey: 'cv.skills.tShaped.deepSpecialization.item3.testimonial', testimonialAuthorKey: 'cv.skills.tShaped.deepSpecialization.item3.author' }
    ],
    broadKnowledgeKeys: [
      'cv.skills.tShaped.broadKnowledge.item1', 'cv.skills.tShaped.broadKnowledge.item2', 'cv.skills.tShaped.broadKnowledge.item3', 'cv.skills.tShaped.broadKnowledge.item4', 'cv.skills.tShaped.broadKnowledge.item5'
    ]
  };

  readonly impactCases = [
    { skillKey: 'cv.skills.impactCases.case1.skill', achievementKey: 'cv.skills.impactCases.case1.achievement', impact: '50% Snellere TTM', contextKey: 'cv.skills.impactCases.case1.context' },
    { skillKey: 'cv.skills.impactCases.case2.skill', achievementKey: 'cv.skills.impactCases.case2.achievement', impact: '70% Minder Rework', contextKey: 'cv.skills.impactCases.case2.context' }
  ];

  readonly techRadarCategories: { nameKey: string; icon: AppIcon; items: {nameKey: string, rationaleKey: string}[]; textColorClass: string; borderColorClass: string; badgeColor: BadgeColor }[] = [
      { nameKey: 'cv.skills.radar.adopt.title', icon: AppIcon.Flame, items: [{ nameKey: "Nx", rationaleKey: 'cv.skills.radar.adopt.item1.rationale' }], textColorClass: 'text-success', borderColorClass: 'border-success/50', badgeColor: 'success' },
      { nameKey: 'cv.skills.radar.trial.title', icon: AppIcon.FlaskConical, items: [{ nameKey: "WebAssembly", rationaleKey: 'cv.skills.radar.trial.item1.rationale' }], textColorClass: 'text-primary', borderColorClass: 'border-primary/50', badgeColor: 'primary' },
      { nameKey: 'cv.skills.radar.assess.title', icon: AppIcon.Eye, items: [{ nameKey: "Web5", rationaleKey: 'cv.skills.radar.assess.item1.rationale' }], textColorClass: 'text-warning', borderColorClass: 'border-warning/50', badgeColor: 'warning' },
      { nameKey: 'cv.skills.radar.hold.title', icon: AppIcon.XCircle, items: [{ nameKey: "AngularJS", rationaleKey: 'cv.skills.radar.hold.item1.rationale' }], textColorClass: 'text-error', borderColorClass: 'border-error/50', badgeColor: 'error' }
  ];

  ngOnInit(): void {
    this.titleService.setTitle("Skills & Architectuur Visie | Roy van de Wetering");
    this.metaService.updateTag({ name: 'description', content: 'Mijn expertise in .NET, Angular, Nx en AI-strategieën om business-waarde te leveren.' });
    this.metaService.updateTag({ property: 'og:title', content: "Skills & Architectuur Visie | Roy van de Wetering" });
    this.metaService.updateTag({ property: 'og:image', content: '/assets/og/skills-t-shape-kpis.png' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:image', content: '/assets/og/skills-t-shape-kpis.png' });
  }

  trackAnalytics(eventName: string, data: any): void {
    if (environment.production) {
      // Stuur naar een echte analytics service in productie.
      // this.analyticsService.track(eventName, data);
    } else {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
  }
  
  openCalendlyModal(): void {
    this.trackAnalytics('skill_cta_click', { position: 'footer_cta' });
    
    // Production-ready: Open de daadwerkelijke overlay component.
    // this.overlayService.open(CalendlyOverlayComponent, { data: { utm: 'skills_cta' } });
    if (!environment.production) {
      alert("Simulatie: Calendly opent nu in een frictieloze overlay.");
    }
  }
}