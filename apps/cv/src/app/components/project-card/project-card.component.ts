/**
 * @file project-card.component.ts (CV App)
 * @version 3.4.0 (FIX: Image Corner Radius)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   FIX: De afronding van de afbeelding aan de bovenkant is gecorrigeerd naar
 *   'rounded-t-xs' om consistent te zijn met de 'rounded-xs' van de kaart zelf.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { ProjectCardData } from '../../core/models/project.model';

@Component({
  selector: 'app-cv-project-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiImageComponent, UiTitleComponent, UiParagraphComponent, UiBadgeComponent, UiIconComponent],
  template: `
  <a [routerLink]="project().routePath" class="project-card block bg-card border border-border rounded-xs shadow-md hover:shadow-xl hover:border-primary/50 transition-all duration-200 ease-out h-full group flex flex-col overflow-hidden">
    <div class="w-full h-48 flex-shrink-0 rounded-t-xs overflow-hidden">
      <royal-code-ui-image
        [image]="project().image"
        [fallbackSrc]="'images/default-image.webp'"
        objectFit="cover"
        [rounding]="'none'"
        class="w-full h-full"
      />
    </div>

    <div class="p-6 flex flex-col flex-grow">

      <!-- Deze div bevat nu alleen de titel en beschrijving en krijgt flex-grow -->
      <div class="flex-grow">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="project().titleKey | translate" extraClasses="!text-lg !font-semibold group-hover:text-primary transition-colors" />
        <royal-code-ui-paragraph [text]="project().descriptionKey | translate" size="sm" color="muted" extraClasses="mt-2" />
      </div>

      <!-- De metrics sectie is nu een zibling van de groeiende div, niet erin -->
      @if (project().impactMetrics && project().impactMetrics!.length > 0) {
        <div class="mt-4 pt-4 border-t border-border/60 flex flex-wrap gap-4">
          @for (metric of project().impactMetrics; track metric.label) {
            <div class="flex items-center gap-2 text-sm">
              <royal-code-ui-icon [icon]="metric.icon" sizeVariant="sm" colorClass="text-primary" />
              <div>
                <p class="font-bold text-foreground">{{ metric.value }}</p>
                <p class="text-xs text-secondary">{{ metric.label | translate }}</p>
              </div>
            </div>
          }
        </div>
      }

      <!-- De tech stack sectie is ook een zibling -->
      <div class="mt-4 pt-4 border-t border-border/60">
        <h4 class="text-xs font-semibold uppercase text-secondary mb-2">{{ 'cv.projects.techStack' | translate }}</h4>
        <div class="flex flex-wrap gap-2">
          @for(tech of project().techStack; track tech.name) {
            <royal-code-ui-badge [icon]="tech.icon" color="primary">
              {{ tech.name }}
            </royal-code-ui-badge>
          }
        </div>
      </div>
    </div>
  </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvProjectCardComponent {
  readonly project: InputSignal<ProjectCardData> = input.required<ProjectCardData>();
  readonly TitleTypeEnum = TitleTypeEnum;
}