import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'scalability-roadmap',
  standalone: true,
  imports: [CommonModule, UiIconComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div
        *ngFor="let step of steps"
        class="flex flex-col items-center text-center"
      >
        <royal-code-ui-icon
          [icon]="step.icon"
          sizeVariant="xl"
          colorClass="text-primary mb-4"
        />
        <h3 class="font-semibold mb-2">{{ step.title }}</h3>
        <p class="text-sm text-secondary">{{ step.description }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScalabilityRoadmapComponent {
  readonly AppIcon = AppIcon;
  steps = [
    {
      icon: AppIcon.Brick,
      title: 'Starter',
      description: 'Modular monolith with domain segregation',
    },
    {
      icon: AppIcon.Cpu,
      title: 'Scale-up',
      description: 'CQRS micro-services with event sourcing',
    },
    {
      icon: AppIcon.Cloud,
      title: 'Enterprise',
      description: 'Self-service platform with API gateway',
    },
  ];
}
