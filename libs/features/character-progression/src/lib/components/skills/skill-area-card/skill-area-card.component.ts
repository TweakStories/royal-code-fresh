import { Component, ChangeDetectionStrategy, input, computed, InputSignal } from '@angular/core';

import { UiIconComponent } from '@royal-code/ui/icon'; // Hergebruik je UI icon component
import { AppIcon } from '@royal-code/shared/domain';   // Importeer je AppIcon enum

export interface SkillArea {
  title: string;
  icon: AppIcon;
  skills: string[];
  badges?: { icon: AppIcon; label: string }[]; // Optionele badges/certificaten
  projectLink?: string; // Optionele link naar projecten
}

@Component({
  selector: 'royal-code-skill-area-card', // Prefix van de 'cv' app
  standalone: true,
  imports: [UiIconComponent],
  template: `
    <div class="bg-card-secondary text-foreground p-4 rounded-xs shadow-md border border-border h-full flex flex-col">
      <div class="flex flex-col items-center text-center mb-3">
        @if (areaData()?.icon; as iconName) {
          <royal-code-ui-icon
            [icon]="iconName"
            sizeVariant="xl"
            colorClass="text-primary mb-2"
            extraClass="w-12 h-12"
          />
        }
        <h3 class="text-lg font-semibold text-text">
          {{ areaData()?.title }}
        </h3>
      </div>

      @if (areaData()?.skills; as skills) {
        <ul class="space-y-1 text-sm text-text-secondary mb-3 list-disc list-inside flex-grow">
          @for (skill of skills; track skill) {
            <li>{{ skill }}</li>
          }
        </ul>
      }

      @if (areaData()?.badges; as badges) {
        <div class="flex flex-wrap justify-center gap-2 mt-auto mb-3">
          @for (badge of badges; track badge.label) {
            <div class="flex items-center text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full" [title]="badge.label">
              <royal-code-ui-icon [icon]="badge.icon" sizeVariant="xs" extraClass="mr-1" />
              {{ badge.label }}
            </div>
          }
        </div>
      }

      @if (areaData()?.projectLink) {
        <a [href]="areaData()?.projectLink" target="_blank" rel="noopener noreferrer"
           class="mt-auto text-xs font-medium text-primary hover:underline text-center">
          Bekijk Relevante Projecten →
        </a>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillAreaCardComponent {
  readonly areaData: InputSignal<SkillArea | undefined> = input<SkillArea>();
}