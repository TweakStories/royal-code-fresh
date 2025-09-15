/**
 * @file ui-progress.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Een eenvoudige, herbruikbare lineaire progressiebalk.
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'royal-code-ui-progress',
  standalone: true,
  template: `
    <div
      class="w-full bg-surface-alt rounded-full h-2"
      role="progressbar"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max()">
      <div
        class="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
        [style.width.%]="progressPercentage()">
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiProgressComponent {
  value = input.required<number>();
  max = input<number>(100);

  progressPercentage = computed(() => {
    const val = this.value() ?? 0;
    const maxVal = this.max() ?? 100;
    if (maxVal === 0) return 0;
    return Math.max(0, Math.min(100, (val / maxVal) * 100));
  });
}