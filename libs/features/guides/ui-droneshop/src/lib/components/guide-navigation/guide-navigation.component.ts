/**
 * @file guide-navigation.component.ts
 * @Version 1.0.1 (Corrected Input Name)
 * @Description
 *   Fixes the input name mismatch for completed steps.
 */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuideStep } from '@royal-code/features/guides/domain';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'droneshop-guide-navigation',
  standalone: true,
  imports: [CommonModule, UiTitleComponent, UiIconComponent],
  template: `
    <div class="p-4 bg-surface-alt rounded-lg h-full">
      <royal-code-ui-title [level]="TitleTypeEnum.H3" text="Stappen" extraClasses="!mb-4" />
      <nav aria-label="Gids navigatie">
        <ol class="space-y-1">
          @for (step of steps(); track step.id; let i = $index) {
            <li>
              <button
                (click)="stepSelected.emit(step.id)"
                class="w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors"
                [class.bg-primary]="step.id === activeStepId()"
                [class.text-primary-on]="step.id === activeStepId()"
                [class.hover:bg-hover]="step.id !== activeStepId()"
                [attr.aria-current]="step.id === activeStepId() ? 'step' : null">
                
                <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2"
                     [class.bg-primary]="isStepCompleted(step.id)"
                     [class.border-primary]="isStepCompleted(step.id)"
                     [class.border-border]="!isStepCompleted(step.id)">
                  @if (isStepCompleted(step.id)) {
                    <royal-code-ui-icon [icon]="AppIcon.Check" sizeVariant="sm" extraClass="text-primary-on" />
                  } @else {
                    <span class="text-xs font-semibold" [class.text-primary]="step.id === activeStepId()">
                      {{ i + 1 }}
                    </span>
                  }
                </div>
                
                <span class="flex-grow font-medium text-sm">{{ step.title }}</span>
              </button>
            </li>
          }
        </ol>
      </nav>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideNavigationComponent {
  steps = input.required<readonly GuideStep[]>();
  activeStepId = input.required<string>();
  completedStepIds = input.required<Record<string, boolean>>(); // << DE FIX: Input naam is nu correct
  
  stepSelected = output<string>();

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  isStepCompleted(stepId: string): boolean {
    return this.completedStepIds()[stepId] === true;
  }
}