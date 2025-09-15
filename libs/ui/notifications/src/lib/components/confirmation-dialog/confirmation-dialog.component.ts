// libs/ui/notifications/src/lib/components/confirmation-dialog/confirmation-dialog.component.ts
/**
 * @fileoverview Defines the ConfirmationDialogComponent for seeking user confirmation.
 * @path libs/shared/ui/dialogs/src/lib/components/confirmation-dialog/confirmation-dialog.component.ts
 */
import { Component, ChangeDetectionStrategy, inject, HostListener } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { UiButtonComponent } from '@royal-code/ui/button';
import { DYNAMIC_OVERLAY_DATA, DynamicOverlayRef, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';
import { ConfirmationDialogResult, ConfirmationDialogData } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-confirmation-dialog',
  standalone: true,
  imports: [UiButtonComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rc-confirmation-dialog p-6 rounded-xs bg-modal-background shadow-xl border border-border max-w-md w-full"
         role="dialog"
         aria-modal="true"
         aria-labelledby="confirmation-dialog-title"
         aria-describedby="confirmation-dialog-message"
         tabindex="-1">
      <h2 id="confirmation-dialog-title" class="text-xl font-semibold text-text mb-3">
        {{ (data?.titleKey || 'common.titles.confirmation') | translate }}
      </h2>
      <p id="confirmation-dialog-message" class="text-text-secondary mb-6">
        {{ (data?.messageKey || 'common.messages.areYouSure') | translate }}
      </p>
      <div class="flex justify-end space-x-3">
        <royal-code-ui-button
          type="default"
          (clicked)="cancel()">
          {{ (data?.cancelButtonKey || 'common.buttons.cancel') | translate }}
        </royal-code-ui-button>
        <royal-code-ui-button
          [type]="data?.confirmButtonType || 'primary'"
          (clicked)="confirm()"
          cdkFocusInitial>
          {{ (data?.confirmButtonKey || 'common.buttons.confirm') | translate }}
        </royal-code-ui-button>
      </div>
    </div>
  `,
   styles: [`:host { display: block; }`]
})
export class ConfirmationDialogComponent {
  readonly data: ConfirmationDialogData | null = inject(DYNAMIC_OVERLAY_DATA as any, { optional: true });
  private overlayRef = inject(DYNAMIC_OVERLAY_REF as any) as DynamicOverlayRef<ConfirmationDialogResult, ConfirmationDialogData>;

@HostListener('keydown.escape', ['$event'])
onEscapeKey(event: any): void {
  const keyboardEvent = event as KeyboardEvent;
  keyboardEvent.stopPropagation();
  this.cancel();
}

  confirm(): void {
    this.overlayRef.close(true);
  }

  cancel(): void {
    this.overlayRef.close(false);
  }
}