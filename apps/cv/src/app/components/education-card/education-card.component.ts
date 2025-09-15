// --- IN apps/cv/src/app/components/education-card/education-card.component.ts, VERVANG HET VOLLEDIGE BESTAND ---
/**
 * @file education-card.component.ts (CV App)
 * @description Een presentational component die een enkele opleiding toont.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
// Aangepast importpad voor de verplaatste modellen
import { EducationItem } from '../../core/models/experience.model'; // <-- CORRECT PAD
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'app-cv-education-card',
  standalone: true,
  imports: [TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent],
  template: `
    <div class="education-card flex items-start gap-4 bg-card p-4 rounded-xs border border-border h-full">
      <royal-code-ui-icon [icon]="AppIcon.Award" sizeVariant="lg" colorClass="text-primary mt-1" />
      <div class="flex-grow">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H4" 
          [text]="education().degreeKey | translate"
          extraClasses="!text-base !font-semibold"
        />
        <p class="text-sm text-secondary font-medium">{{ education().institutionName }}</p>
        <p class="text-xs text-muted mt-1">{{ education().periodKey | translate }}</p>
        @if (education().descriptionKey) {
          <!-- HIER IS DE DEFINITIEVE FIX: Gebruik de nullish coalescing operator (??) -->
          <royal-code-ui-paragraph [text]="(education().descriptionKey ?? '') | translate" size="sm" color="muted" extraClasses="mt-2" />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvEducationCardComponent {
  education = input.required<EducationItem>();
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}