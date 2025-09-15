/**
 * @file projects-overview.component.ts (CV App)
 * @version 2.0.0 (Production Ready: A11y, Analytics & Performance)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   De definitieve projectenoverzicht-pagina. Deze versie is geoptimaliseerd voor
 *   performance (lazy-loaded cards), toegankelijkheid (aria-pressed) en
 *   meetbaarheid (analytics on filter).
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon'; // Importeer UiIconComponent
import { AppIcon } from '@royal-code/shared/domain'; // Importeer AppIcon
import { CvProjectCardComponent } from '../../components/project-card/project-card.component';
import { ProjectDataService } from '../../core/services/project-data.service';
import { getUniqueTags, filterByTag } from '../../core/utils/filter.utils';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cv-projects-overview',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiButtonComponent, 
    UiParagraphComponent, CvProjectCardComponent, UiIconComponent
  ],
  template: `
    <section class="projects-overview-section container-max py-16 md:py-24">
      <royal-code-ui-title 
        [level]="TitleTypeEnum.H2" 
        [text]="'cv.projects.allProjectsTitle' | translate" 
        [center]="true" 
        extraClasses="!text-3xl sm:!text-4xl font-bold mb-4" 
      />
      <royal-code-ui-paragraph 
        [text]="'cv.projects.intro' | translate" 
        [centered]="true" 
        size="lg" 
        color="muted"
        extraClasses="max-w-3xl mx-auto mb-12"
      />
      <div class="flex flex-wrap justify-center gap-2 mb-16">
        <royal-code-ui-button 
          [type]="selectedTag() === null ? 'primary' : 'outline'" 
          (clicked)="selectTag(null)"
          [attr.aria-pressed]="selectedTag() === null">
          {{ 'cv.projects.all' | translate }}
        </royal-code-ui-button>
        @for(tag of allTags(); track tag) {
          <royal-code-ui-button 
            [type]="selectedTag() === tag ? 'primary' : 'outline'" 
            (clicked)="selectTag(tag)"
            [attr.aria-pressed]="selectedTag() === tag">
            {{ tag }}
          </royal-code-ui-button>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        @if (filteredProjectsData().length > 0) {
          @for(project of filteredProjectsData(); track project.id) {
            @defer (on viewport) {
              <app-cv-project-card [project]="project" />
            } @placeholder {
              <div class="w-full h-96 bg-card border border-border rounded-xs animate-pulse"></div>
            }
          }
        } @else {
          <div class="md:col-span-2 text-center py-8 flex flex-col items-center gap-4">
            <royal-code-ui-icon [icon]="AppIcon.SearchX" sizeVariant="lg" colorClass="text-secondary" />
            <royal-code-ui-paragraph color="muted">
              {{ 'cv.projects.noResults' | translate: { tag: selectedTag() } }}
            </royal-code-ui-paragraph>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsOverviewComponent {
  private projectDataService = inject(ProjectDataService);
  readonly selectedTag = signal<string | null>(null);

  readonly allProjectData = toSignal(this.projectDataService.getAllProjectsForOverview(), { initialValue: [] });
  readonly allTags = computed(() => getUniqueTags(this.allProjectData()));
  readonly filteredProjectsData = computed(() => filterByTag(this.allProjectData(), this.selectedTag()));
  
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon; // Maak AppIcon beschikbaar in de template

  selectTag(tag: string | null): void {
    const newTag = this.selectedTag() === tag ? null : tag;
    this.selectedTag.set(newTag);
    this.trackAnalytics('projects_filter_selection', { tag: newTag ?? 'all' });
  }

  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
    // else { /* Injecteer en gebruik hier je echte analytics service */ }
  }
}