
/**
 * @file experience-card.component.ts (CV App)
 * @version 3.5.0 (Hero Image Final Shape)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   Presentational component voor een werkervaring. De hero-afbeelding is nu
 *   definitief vierkant en zonder ronde hoeken, gepositioneerd onder de card-header,
 *   voor een strakke en consistente visuele presentatie.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { WorkExperienceItem } from '../../core/models/experience.model';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'app-cv-experience-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent, UiBadgeComponent], // Voeg UiImageComponent toe aan imports
  template: `
    <div class="experience-card bg-card rounded-xs border border-border shadow-sm hover:shadow-xl hover:border-primary/40 hover:border-2 transition-all duration-300 h-full flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="p-6 border-b border-border">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H3" 
          [text]="experience().jobTitleKey | translate" 
          extraClasses="!text-xl !font-bold text-primary" 
        />
        <div class="flex items-baseline gap-2 text-sm text-foreground font-medium">
          <span>{{ experience().companyName }}</span><span>•</span><span>{{ experience().location }}</span>
        </div>
        <royal-code-ui-paragraph [text]="experience().periodKey | translate" size="sm" color="muted" extraClasses="mt-1 font-semibold" />
      </header>
      
      <!-- HERO AFBEELDING: NU VIERKANT en ZONDER RONDE HOEKEN -->
       <!--<div class="h-60"> 
        <royal-code-ui-image 
          [src]="experience().companyLogoUrl" 
          [fallbackSrc]="'images/default-image.webp'" 
          [alt]="experience().companyName + ' hero image'" 
          objectFit="cover" 
          class=""
        />
      </div> -->

      <!-- Body: Case Study -->
      <div class="p-6 flex-grow flex flex-col">
        <!-- Uitdaging -->
        <div class="mb-4">
          <h4 class="font-semibold text-sm flex items-center gap-2 mb-2 text-foreground"><royal-code-ui-icon [icon]="AppIcon.Target" colorClass="text-destructive"/> De Uitdaging</h4>
          <royal-code-ui-paragraph [text]="experience().situationKey | translate" size="sm" color="muted" />
        </div>
        
        <!-- Mijn Oplossing -->
        <div class="mb-6">
          <h4 class="font-semibold text-sm flex items-center gap-2 mb-2 text-foreground"><royal-code-ui-icon [icon]="AppIcon.Wrench" colorClass="text-primary"/> Mijn Oplossing</h4>
          <royal-code-ui-paragraph [text]="experience().actionKey | translate" size="sm" />
        </div>
        
        <!-- Resultaten -->
        <div class="mt-auto">
          <h4 class="font-semibold text-sm flex items-center gap-2 mb-3 text-foreground"><royal-code-ui-icon [icon]="AppIcon.Zap" colorClass="text-success"/> Resultaten</h4>
          <div class="space-y-2">
            @for (result of experience().results; track result.descriptionKey) {
              <div class="flex items-start gap-2 text-sm">
                <royal-code-ui-icon [icon]="result.icon || AppIcon.Check" sizeVariant="sm" colorClass="text-success mt-0.5 flex-shrink-0" />
                <royal-code-ui-paragraph [text]="result.descriptionKey | translate" size="sm" extraClasses="font-medium" />
              </div>
            }
          </div>
        </div>
      </div>
      
      <!-- Footer: Tech Stack -->
      <footer class="p-6 border-t border-border/60 bg-surface-alt">
        <h4 class="text-xs font-semibold uppercase text-secondary mb-2">{{ 'cv.projects.techStack' | translate }}</h4>
        <div class="flex flex-wrap gap-2">
          @for(tech of experience().techStack; track tech.name) {
            <royal-code-ui-badge [icon]="tech.icon" color="primary" size="sm">{{ tech.name }}</royal-code-ui-badge>
          }
        </div>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvExperienceCardComponent {
  readonly experience: InputSignal<WorkExperienceItem> = input.required<WorkExperienceItem>();
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}