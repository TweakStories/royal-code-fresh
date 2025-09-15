/**
 * @file guide-mobile-nav.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   A fixed bottom navigation bar for mobile guide view, providing easy access
 *   to step navigation and the main menu.
 */
import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';

@Component({
  selector: 'droneshop-guide-mobile-nav',
  standalone: true,
  imports: [UiButtonComponent, UiIconComponent, UiParagraphComponent],
  template: `
    <div class="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border z-40"
         style="padding-bottom: env(safe-area-inset-bottom);">
      <div class="flex items-center justify-between h-16 px-4">
        <royal-code-ui-button type="default" (clicked)="previousClicked.emit()" [disabled]="isFirstStep()">
          <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" extraClass="mr-2" />
          Vorige
        </royal-code-ui-button>

        <royal-code-ui-paragraph size="sm" class="font-semibold">
          Stap {{ currentStepNumber() }} / {{ totalSteps() }}
        </royal-code-ui-paragraph>

        <royal-code-ui-button [type]="isLastStep() ? 'success' : 'primary'" (clicked)="nextClicked.emit()">
           {{ isLastStep() ? 'Voltooien' : 'Volgende' }}
          <royal-code-ui-icon [icon]="isLastStep() ? AppIcon.CheckCheck : AppIcon.ArrowRight" extraClass="ml-2" />
        </royal-code-ui-button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideMobileNavComponent {
  currentStepNumber = input.required<number>();
  totalSteps = input.required<number>();
  isFirstStep = input(false, { transform: booleanAttribute });
  isLastStep = input(false, { transform: booleanAttribute });

  previousClicked = output<void>();
  nextClicked = output<void>();
  menuClicked = output<void>(); // Behoud voor eventuele toekomstige menu knop

  protected readonly AppIcon = AppIcon;
}