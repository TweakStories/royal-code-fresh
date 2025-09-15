/**
 * @file project-detail.component.ts (CV App)
 * @version 3.1.0 (Narrative-Aligned)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description Detailpagina voor een specifiek project, nu geherstructureerd als een
 *              overtuigende case study met de "Hoe de Digitale Fabriek..." sectie.
 */
import { ChangeDetectionStrategy, Component, inject, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ProjectDetail } from '../../core/models/project.model';
import { ProjectDataService } from '../../core/services/project-data.service';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiImageComponent, MediaViewerService } from '@royal-code/ui/media';
import { AppIcon } from '@royal-code/shared/domain';
import type { Image } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { ArchitectureDeepDiveComponent } from '../../components/architecture-deep-dive/architecture-deep-dive.component';

@Component({
  selector: 'app-cv-project-detail',
  standalone: true,
  imports: [ CommonModule, TranslateModule, RouterModule, UiTitleComponent, UiParagraphComponent, UiIconComponent, ArchitectureDeepDiveComponent, UiBadgeComponent, UiButtonComponent, UiImageComponent ],
  template: `
    @if (project(); as proj) {
      <div class="project-detail-page container-max py-16 md:py-24">
        <!-- Header -->
        <header class="text-center mb-12">
          <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="proj.titleKey | translate" extraClasses="!text-4xl sm:!text-5xl font-extrabold" />
        </header>

        <!-- Hero Image -->
        <div class="mb-12 rounded-xs overflow-hidden shadow-lg aspect-video">
          <royal-code-ui-image
            [image]="proj.heroImage"
            [fallbackSrc]="'images/default-image.webp'"
            objectFit="cover"
            class="w-full h-full" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Main Content -->
          <main class="lg:col-span-2 space-y-8">
            <section>
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.challenge' | translate" extraClasses="!text-2xl font-bold mb-4" />
              <!-- FIX: Gebruik proj.challengeKey -->
              <royal-code-ui-paragraph [text]="proj.challengeKey | translate" extraClasses="prose" />
            </section>
            
            <!-- NIEUWE SECTIE: Architecture Context -->
            @if(proj.architectureContext) {
              <section class="bg-card border border-primary/20 rounded-xs p-6">
                <div class="flex items-start gap-4">
                  <royal-code-ui-icon [icon]="proj.architectureContext.icon" sizeVariant="xl" colorClass="text-primary mt-1"/>
                  <div>
                    <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="proj.architectureContext.titleKey | translate" extraClasses="!text-xl !font-semibold mb-2" />
                    <royal-code-ui-paragraph [text]="proj.architectureContext.descriptionKey | translate" size="sm" color="muted" />
                    <a routerLink="/architectuur" class="inline-flex items-center text-sm text-primary hover:underline mt-4">
                      Lees meer over mijn architectuur <royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="xs" extraClass="ml-1.5" />
                    </a>
                  </div>
                </div>
              </section>
            }

            <section>
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.approach' | translate" extraClasses="!text-2xl font-bold mb-4" />
              <!-- FIX: Gebruik proj.myApproachKey -->
              <royal-code-ui-paragraph [text]="proj.myApproachKey | translate" extraClasses="prose" />
            </section>
            <section>
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.result' | translate" extraClasses="!text-2xl font-bold mb-4" />
              <!-- FIX: Gebruik proj.resultKey -->
              <royal-code-ui-paragraph [text]="proj.resultKey | translate" extraClasses="prose" />
            </section>

           @if (proj.id === 'royal-code-monorepo') {
              <app-cv-architecture-deep-dive />
            }
          </main>

          <!-- Sidebar -->
          <aside class="space-y-8">
            <div class="bg-card p-6 rounded-xs border border-border">
              <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.projects.techStack' | translate" extraClasses="!text-lg font-semibold mb-4" />
              <div class="flex flex-wrap gap-2">
                @for (tech of proj.techStack; track tech.name) {
                  <royal-code-ui-badge [icon]="tech.icon" color="muted">{{ tech.name }}</royal-code-ui-badge>
                }
              </div>
            </div>
            <div class="bg-card p-6 rounded-xs border border-border">
              <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.projects.detail.links' | translate" extraClasses="!text-lg font-semibold mb-4" />
              <div class="flex flex-col gap-3">
                @if (proj.liveUrl) {
                  <a [href]="proj.liveUrl" target="_blank" class="inline-flex items-center"><royal-code-ui-button type="primary" ><royal-code-ui-icon [icon]="AppIcon.Eye" extraClass="mr-2"/>{{ 'cv.projects.detail.liveDemo' | translate }}</royal-code-ui-button></a>
                }
                @if (proj.githubUrl) {
                  <a [href]="proj.githubUrl" target="_blank" class="inline-flex items-center"><royal-code-ui-button type="outline" ><royal-code-ui-icon [icon]="AppIcon.Github" extraClass="mr-2"/>{{ 'cv.projects.detail.sourceCode' | translate }}</royal-code-ui-button></a>
                }
              </div>
            </div>
          </aside>
        </div>
      </div>
    } @else if (isLoading()) {
      <div class="text-center py-24"><royal-code-ui-icon [icon]="AppIcon.Loader" sizeVariant="xl" extraClass="animate-spin text-primary" /></div>
    } @else {
      <div class="text-center py-24">
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.notFound' | translate" />
        <a routerLink="/projects" class="mt-4 inline-block"><royal-code-ui-button type="primary">{{ 'cv.projects.detail.backToOverview' | translate }}</royal-code-ui-button></a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  private route = inject(ActivatedRoute);
  private projectDataService = inject(ProjectDataService);
  private mediaViewerService = inject(MediaViewerService);
  private logger = inject(LoggerService);

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
  readonly isLoading: WritableSignal<boolean> = signal(true);

  private readonly project$: Observable<ProjectDetail | undefined> = this.route.paramMap.pipe(
    tap(() => this.isLoading.set(true)),
    switchMap(params => {
      const id = params.get('id');
      this.logger.debug(`[ProjectDetailComponent] Loading project with ID: ${id}`);
      return id ? this.projectDataService.getProjectById(id) : of(undefined);
    }),
    tap(project => {
      if (!project) {
        this.logger.warn(`[ProjectDetailComponent] Project with ID not found.`);
      }
      this.isLoading.set(false);
    })
  );

  readonly project = toSignal(this.project$, { initialValue: undefined });

  openLightbox(images: Image[], startIndex: number): void {
    this.mediaViewerService.openLightbox(images, startIndex);
  }
}