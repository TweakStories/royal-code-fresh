/**
 * @file notification.service.ts
 * @Version 4.2.0 (DEFINITIVE FIX: Scroll Strategy for Snackbars)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description
 *   The definitive NotificationService. This version fixes a critical UX bug
 *   where snackbars would block page scrolling by setting the scrollStrategy
 *   to 'noop()' specifically for transient notifications.
 */
import { Injectable, inject } from '@angular/core';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { SnackbarData, VisualNotificationType, NotificationConfig, ErrorDialogData, ConfirmationDialogData } from '@royal-code/shared/domain';
import { SnackbarComponent } from '../components/snackbar/snackbar.component'; 
import { Observable } from 'rxjs'; 
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly overlayService = inject(DynamicOverlayService);

  // --- Snackbar methoden ---
  public showSuccess(message: string, config?: NotificationConfig): void {
    this.showNotification(message, VisualNotificationType.Success, config);
  }

  public showError(message: string, config?: NotificationConfig): void {
    this.showNotification(message, VisualNotificationType.Error, config);
  }

  public showInfo(message: string, config?: NotificationConfig): void {
    this.showNotification(message, VisualNotificationType.Info, config);
  }

  public showWarning(message: string, config?: NotificationConfig): void {
    this.showNotification(message, VisualNotificationType.Warning, config);
  }

  private showNotification(message: string, type: VisualNotificationType, config?: NotificationConfig): void {
    const finalConfig: NotificationConfig = {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-panel', `snackbar-${type}`],
      ...config, 
    };
    const snackbarData: SnackbarData = { message, type, config: finalConfig };

    this.overlayService.open({
      component: SnackbarComponent,
      data: snackbarData,
      panelClass: finalConfig.panelClass,
      backdropType: 'none', 
      closeOnClickOutside: false, 
      width: 'auto',
      height: 'auto',
      overlayConfigOptions: {
        hasBackdrop: false,
        // <<< DE FIX: Gebruik noop() om scrollen NIET te blokkeren voor snackbars >>>
        scrollStrategy: this.overlayService.overlay.scrollStrategies.noop(),
        positionStrategy: this.overlayService.overlay.position().global().centerHorizontally().bottom('20px'),
      },
    });
  }

  // --- Dialog methoden (deze behouden de standaard block() strategie) ---
  public showErrorDialog(title: string, message: string): Observable<'closed'> {
    const dialogData: ErrorDialogData = { title, message };
    const dialogRef = this.overlayService.open({
      component: ErrorDialogComponent,
      data: dialogData,
      panelClass: 'dialog-panel',
      backdropType: 'dark',
      closeOnClickOutside: false,
      maxWidth: '450px'
    });
    return dialogRef.afterClosed$ as Observable<'closed'>;
  }

  public showConfirmationDialog(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef = this.overlayService.open({
      component: ConfirmationDialogComponent,
      data: data,
      panelClass: 'dialog-panel',
      backdropType: 'dark',
      closeOnClickOutside: false,
      maxWidth: '450px'
    });
    return dialogRef.afterClosed$ as Observable<boolean>;
  }
}