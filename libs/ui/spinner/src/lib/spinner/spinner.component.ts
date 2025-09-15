/**
 * @file ui-spinner.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-12
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-06-12
 * @PromptSummary "Generate a simple, reusable UI spinner component."
 * @Description A simple, standalone, and reusable loading spinner component.
 *              It uses the UiIconComponent with a loader icon and a CSS spin animation.
 *              It can be customized in size and color via inputs.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'royal-code-ui-spinner',
  standalone: true,
  imports: [UiIconComponent],
  styles: `
    :host {
      display: inline-block;
    }
  `,
  template: `
    <royal-code-ui-icon
      [icon]="AppIcon.Loader"
      [sizeVariant]="size()"
      [colorClass]="colorClass()"
      extraClass="animate-spin"
      aria-label="Loading content"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSpinnerComponent {
  /**
   * @description The size of the spinner. Maps to the icon size variants.
   */
  readonly size = input<SpinnerSize>('md');

  /**
   * @description A Tailwind CSS color class to apply to the spinner icon.
   *              Defaults to 'text-primary'.
   * @example 'text-accent', 'text-white'
   */
  readonly colorClass = input<string>('text-primary');

  // Expose AppIcon enum to the template if needed, though not required here.
  protected readonly AppIcon = AppIcon;
}
