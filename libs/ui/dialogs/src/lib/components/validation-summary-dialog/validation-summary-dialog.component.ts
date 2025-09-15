/**
 * @file validation-summary-dialog.component.ts
 * @Version 1.1.0 (With Full Form Data Debug)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-07
 * @Description A dialog to display form validation errors and, optionally, the full form data for debugging.
 */
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common'; // Importeer JsonPipe
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum, ValidationSummaryDialogData } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';


@Component({
  selector: 'lib-validation-summary-dialog',
  standalone: true,
  imports: [CommonModule, JsonPipe, TranslateModule, UiTitleComponent, UiButtonComponent, UiIconComponent], // Voeg JsonPipe toe
  template: `
    <div class="bg-card p-6 rounded-xs shadow-xl w-full max-w-md border border-border">
      <div class="flex items-center mb-4">
        <royal-code-ui-icon [icon]="AppIcon.AlertTriangle" sizeVariant="lg" extraClass="text-destructive mr-3" />
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'admin.validation.summaryTitle' | translate" />
      </div>
      <p class="text-sm text-secondary mb-4">{{ 'admin.validation.summaryDescription' | translate }}</p>
      <ul class="space-y-2 max-h-60 overflow-y-auto pr-2">
        @for(error of data.errors; track $index) {
          <li class="text-sm">
            <span class="font-semibold text-foreground">{{ error.label }}:</span>
            <span class="text-secondary ml-1">{{ error.message }}</span>
          </li>
        }
      </ul>
      
      <!-- === NIEUW: Debug-sectie voor volledige formulierdata === -->
      @if (data.fullFormData) {
        <div class="mt-6 pt-4 border-t border-border">
          <h4 class="text-sm font-semibold mb-2">{{ 'admin.validation.debugDataTitle' | translate }}</h4>
          <pre class="bg-surface-alt p-3 rounded-md text-xs max-h-48 overflow-auto">{{ data.fullFormData | json }}</pre>
        </div>
      }

      <div class="mt-6 flex justify-end">
        <royal-code-ui-button type="primary" (clicked)="close()">{{ 'common.buttons.ok' | translate }}</royal-code-ui-button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationSummaryDialogComponent {
  protected readonly data: ValidationSummaryDialogData = inject(DYNAMIC_OVERLAY_DATA);
  private readonly overlayRef = inject(DYNAMIC_OVERLAY_REF);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  close(): void {
    this.overlayRef.close();
  }
}