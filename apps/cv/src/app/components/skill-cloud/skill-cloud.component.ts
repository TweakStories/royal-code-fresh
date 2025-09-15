/**
 * @file skill-cloud.component.ts (CV App)
 * @version 1.0.0
 * @description Een visueel component dat skills weergeeft als een interactieve "tag cloud",
 *              waarbij de grootte en kleur de belangrijkheid van een skill aangeven.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

export interface SkillCloudItem {
  name: string;
  icon: AppIcon;
  level: 'expert' | 'advanced' | 'proficient'; // Bepaalt grootte en kleur
}

@Component({
  selector: 'app-cv-skill-cloud',
  standalone: true,
  imports: [CommonModule, UiIconComponent],
  template: `
    <div class="skill-cloud-container flex flex-wrap justify-center items-center gap-4 p-6 bg-card border border-border rounded-xs shadow-inner">
      @for (skill of skills(); track skill.name) {
        <div 
          class="skill-item flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
          [ngClass]="getSkillClasses(skill.level)">
          <royal-code-ui-icon [icon]="skill.icon" [sizeVariant]="skill.level === 'expert' ? 'md' : 'sm'" />
          <span class="font-medium whitespace-nowrap">{{ skill.name }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .skill-item.expert {
      font-size: 1.125rem;
      background-color: hsl(var(--primary) / 0.1);
      border-color: hsl(var(--primary) / 0.5);
      color: hsl(var(--primary));
    }
    .skill-item.advanced {
      font-size: 1rem;
      background-color: hsl(var(--card));
      border-color: hsl(var(--border));
      color: hsl(var(--foreground));
    }
    .skill-item.proficient {
      font-size: 0.875rem;
      background-color: hsl(var(--card));
      border-color: hsl(var(--border));
      color: hsl(var(--secondary));
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvSkillCloudComponent {
  skills: InputSignal<SkillCloudItem[]> = input.required<SkillCloudItem[]>();

  getSkillClasses(level: 'expert' | 'advanced' | 'proficient'): string {
    return level;
  }
}