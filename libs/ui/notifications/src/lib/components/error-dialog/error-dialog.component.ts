// libs/ui/notifications/src/lib/components/error-dialog/error-dialog.component.ts
import { Component, ChangeDetectionStrategy, inject, HostListener } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { ErrorDialogData, ErrorDialogResult } from '@royal-code/shared/domain';
import { DYNAMIC_OVERLAY_DATA, DynamicOverlayRef, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'royal-code-error-dialog',
  standalone: true,
  imports: [UiButtonComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rc-error-dialog p-6 rounded-xs bg-modal-background shadow-xl border border-border max-w-md w-full"
         role="alertdialog"
         aria-modal="true"
         aria-labelledby="error-dialog-title"
         aria-describedby="error-dialog-message"
         tabindex="-1">
      <h2 id="error-dialog-title" class="text-xl font-semibold text-destructive mb-3">
        {{ data?.title ?? ('common.messages.error' | translate) }}
      </h2>
      <p id="error-dialog-message" class="text-text mb-6">
        {{ data?.message ?? ('errors.server.unknownError' | translate) }}
      </p>
      <div class="flex justify-end">
        <royal-code-ui-button
          type="primary"
          (clicked)="close()"
          cdkFocusInitial>
          {{ 'common.buttons.ok' | translate }}
        </royal-code-ui-button>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ErrorDialogComponent {
  readonly data: ErrorDialogData | null = inject(DYNAMIC_OVERLAY_DATA as any, { optional: true });
  private overlayRef = inject(DYNAMIC_OVERLAY_REF as any) as DynamicOverlayRef<ErrorDialogResult, ErrorDialogData>;

  close(): void {
    this.overlayRef.close('closed');
  }

@HostListener('keydown.escape', ['$event'])
onEscapeKey(event: any): void {
  const keyboardEvent = event as KeyboardEvent;
  keyboardEvent.stopPropagation();
  this.close();
}


}