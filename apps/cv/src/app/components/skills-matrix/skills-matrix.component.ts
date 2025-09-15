/**
 * @file skills-matrix.component.ts (CV App)
 * @Version 1.1.0 (Removed Proficiency Bars)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-30
 * @Description Een presentational component dat een lijst van skill-categorieën
 *              en de bijbehorende skills visueel weergeeft in een matrix.
 *              De subjectieve proficiency bars zijn verwijderd voor een modernere look.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { SkillCategory } from '../../core/models/skills.model';

@Component({
  selector: 'app-cv-skills-matrix',
  standalone: true,
  imports: [
    TranslateModule,
    UiTitleComponent,
    UiParagraphComponent,
    UiIconComponent
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      @for (category of categories(); track category.categoryNameKey) {
        <div class="flex flex-col">
          <royal-code-ui-title
            [level]="TitleTypeEnum.H3"
            [text]="category.categoryNameKey | translate"
            extraClasses="!text-lg !font-semibold mb-3 border-b-2 border-primary pb-1"
          />
          <div class="space-y-3">
            @for (skill of category.skills; track skill.name) {
              <div class="flex items-center gap-3">
                <royal-code-ui-icon [icon]="skill.icon" sizeVariant="sm" colorClass="text-primary" />
                <royal-code-ui-paragraph [text]="skill.name" size="sm" />
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvSkillsMatrixComponent {
  readonly categories: InputSignal<SkillCategory[]> = input.required<SkillCategory[]>();
  readonly TitleTypeEnum = TitleTypeEnum;
}