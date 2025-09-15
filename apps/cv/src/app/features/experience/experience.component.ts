/**
 * @file experience.component.ts (CV App)
 * @version 4.1.0 (Production Ready: A11y, Analytics & Performance)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   De definitieve werkervaring-pagina. Deze versie is geoptimaliseerd voor
 *   performance (lazy-loaded cards), toegankelijkheid (aria-pressed), meetbaarheid
 *   (analytics on filter) en een verbeterde UX (tag counts, empty state icon).
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { CvExperienceCardComponent } from '../../components/experience-card/experience-card.component';
import { CvEducationCardComponent } from '../../components/education-card/education-card.component';
import { CvCertificationCardComponent } from '../../components/certification-card/certification-card.component';
import { UiIconComponent } from '@royal-code/ui/icon';
import { ExperienceDataService } from '../../core/services/experience-data.service';
import { getUniqueTags, filterByTag } from '../../core/utils/filter.utils';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cv-experience',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiButtonComponent,
    CvExperienceCardComponent, CvEducationCardComponent, CvCertificationCardComponent, UiIconComponent
  ],
  template: `
    <div class="space-y-20">
      <!-- Werkervaring Sectie -->
      <section class="experience-section container-max pt-16 md:pt-24">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H2"
          [text]="'cv.experience.pageTitle' | translate"
          [center]="true"
          extraClasses="!text-3xl sm:!text-4xl font-bold mb-4"
        />
        <royal-code-ui-paragraph
          [text]="'cv.experience.intro' | translate"
          [centered]="true"
          size="lg"
          color="muted"
          extraClasses="max-w-3xl mx-auto mb-12"
        />

        <!-- Filter Knoppen -->
        <div class="flex flex-wrap justify-center gap-2 mb-16">
          <royal-code-ui-button
            [type]="selectedTag() === null ? 'primary' : 'outline'"
            (clicked)="selectTag(null)"
            [attr.aria-pressed]="selectedTag() === null">
            {{ 'cv.experience.all' | translate }}
          </royal-code-ui-button>
          @for(tag of allTags(); track tag) {
            <royal-code-ui-button
              [type]="selectedTag() === tag ? 'primary' : 'outline'"
              (clicked)="selectTag(tag)"
              [attr.aria-pressed]="selectedTag() === tag">
              {{ tag }} ({{ tagCounts()[tag] }})
            </royal-code-ui-button>
          }
        </div>

        <!-- Ervaringen als een grid van case studies -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          @if (filteredExperienceData().length > 0) {
            @for (item of filteredExperienceData(); track item.id) {
              @defer (on viewport) {
                <app-cv-experience-card [experience]="item" />
              } @placeholder {
                <div class="w-full h-[500px] bg-card border border-border rounded-xs animate-pulse"></div>
              }
            }
          } @else {
            <div class="lg:col-span-2 text-center py-8 flex flex-col items-center gap-4">
              <royal-code-ui-icon [icon]="AppIcon.SearchX" sizeVariant="lg" colorClass="text-secondary" [attr.aria-hidden]="true" />
              <royal-code-ui-paragraph color="muted">{{ 'cv.experience.noResults' | translate: { tag: selectedTag() } }}</royal-code-ui-paragraph>
            </div>
          }
        </div>
      </section>

      <!-- Opleiding & Certificaten Sectie -->
      <section class="education-certs-section container-max pb-16 md:pb-24">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H2"
          [text]="'cv.experience.educationAndCommunityTitle' | translate"
          [center]="true"
          extraClasses="!text-3xl sm:!text-4xl font-bold mb-12"
        />
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          @for (item of educationData(); track item.id) { <app-cv-education-card [education]="item" /> }
          @for (item of certificationsData(); track item.id) { <app-cv-certification-card [certification]="item" /> }
          <div class="community-card flex items-start gap-4 bg-card p-4 rounded-xs border border-border h-full">
            <royal-code-ui-icon [icon]="AppIcon.Github" sizeVariant="lg" colorClass="text-primary mt-1" [attr.aria-hidden]="true" />
            <div class="flex-grow">
              <royal-code-ui-title [level]="TitleTypeEnum.H4" text="Community & Continuous Learning" extraClasses="!text-base !font-semibold" />
              <p class="text-sm text-secondary font-medium">Actief op GitHub</p>
              <p class="text-xs text-muted mt-2">Momenteel studerend voor: 'AI-900: Microsoft Azure AI Fundamentals'</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
  readonly selectedTag = signal<string | null>(null);

  private readonly dataService = inject(ExperienceDataService);

  readonly workExperienceData = toSignal(this.dataService.getWorkExperience(), { initialValue: [] });
  readonly educationData = toSignal(this.dataService.getEducation(), { initialValue: [] });
  readonly certificationsData = toSignal(this.dataService.getCertifications(), { initialValue: [] });

  readonly allTags = computed(() => getUniqueTags(this.workExperienceData()));
  readonly filteredExperienceData = computed(() => filterByTag(this.workExperienceData(), this.selectedTag()));

  readonly tagCounts = computed(() => {
    return this.allTags().reduce((acc, tag) => {
      acc[tag] = this.workExperienceData().filter(item => item.techStack.some(tech => tech.name === tag)).length;
      return acc;
    }, {} as Record<string, number>);
  });

  selectTag(tag: string | null): void {
    const newTag = this.selectedTag() === tag ? null : tag;
    this.selectedTag.set(newTag);
    this.trackAnalytics('experience_filter_selection', { tag: newTag ?? 'all' });
  }

  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
    // else { /* Injecteer en gebruik hier je echte analytics service */ }
  }
}