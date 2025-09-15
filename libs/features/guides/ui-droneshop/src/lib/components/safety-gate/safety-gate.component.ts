/**
 * @file safety-gate.component.ts
 * @Version 2.0.0 (Definitive State & Styling)
 * @Description
 *   Final version with robust state management via model() and dynamic styling
 *   based on acknowledgement and completion status.
 */
import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { UiCheckboxComponent } from '@royal-code/ui/input';

@Component({
  selector: 'droneshop-safety-gate',
  standalone: true,
  imports: [ UiCardComponent, UiTitleComponent, UiIconComponent, UiParagraphComponent, UiCheckboxComponent ],
  template: `
    <royal-code-ui-card [extraContentClasses]="'!p-6 !border-2 ' + cardBorderClass()">
      <div class="flex items-center gap-4 mb-4">
        <royal-code-ui-icon [icon]="AppIcon.AlertTriangle" sizeVariant="xl" [extraClass]="iconColorClass()" />
        <royal-code-ui-title [level]="TitleTypeEnum.H3" text="Veiligheidscontrole" />
      </div>
      <royal-code-ui-paragraph color="muted" extraClasses="mb-6">
        {{ acknowledgementText() }}
      </royal-code-ui-paragraph>

      <div class="mb-6">
        <royal-code-ui-checkbox
          label="Ik heb de risico's gelezen en begrepen."
          [(value)]="isAcknowledged"
          [disabled]="isStepCompleted()"
        />
      </div>
    </royal-code-ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SafetyGateComponent {
  acknowledgementText = input.required<string>();
  isStepCompleted = input.required<boolean>();
  isAcknowledged = model(false);

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  protected cardBorderClass = computed(() => {
    if (this.isStepCompleted()) return '!border-success'; // Groen als de hele stap af is
    if (this.isAcknowledged()) return '!border-primary'; // Primair als aangevinkt
    return '!border-error'; // Rood als standaard
  });

  protected iconColorClass = computed(() => {
    if (this.isStepCompleted()) return 'text-success';
    if (this.isAcknowledged()) return 'text-primary';
    return 'text-error';
  });
}