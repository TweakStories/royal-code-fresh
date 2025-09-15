/**
 * @file snackbar.component.ts
 * @Version 2.4.0 (Final ngClass fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-24
 * @Description Component for displaying transient notifications (snackbars).
 *              Final fix for ngClass array syntax.
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { SnackbarData } from '@royal-code/shared/domain';
import { DYNAMIC_OVERLAY_REF, DYNAMIC_OVERLAY_DATA, DynamicOverlayRef } from '@royal-code/ui/overlay';

@Component({
  selector: 'royal-code-snackbar',
  standalone: true,
  imports: [CommonModule, NgClass],
  template: `
    <!-- DE FIX: Bind ngClass nu direct aan de gecombineerde string array 'combinedClasses' -->
    <div [ngClass]="combinedClasses">
      <span class="text-sm font-medium flex-grow">{{ data.message }}</span>
      <button *ngIf="data.config.duration === 0" (click)="close()" class="text-text-on-color opacity-70 hover:opacity-100">
        ×
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarComponent implements OnInit {
  protected data: SnackbarData;
  protected combinedClasses: string[] = []; // Nieuwe property voor de gecombineerde klassen
  private overlayRef: DynamicOverlayRef<any>;

  constructor() {
    this.overlayRef = inject(DYNAMIC_OVERLAY_REF as any);
    this.data = inject(DYNAMIC_OVERLAY_DATA as any);
  }

  ngOnInit(): void {
    const baseClasses = this.getBaseStyling(this.data.type);
    const configClasses = Array.isArray(this.data.config.panelClass) 
                        ? this.data.config.panelClass 
                        : (this.data.config.panelClass ? [this.data.config.panelClass] : []);
    
    // DE FIX: Combineer alle klassen in één array in de TypeScript-code
    this.combinedClasses = [
      'flex', 'items-center', 'gap-3', 'p-4', 'rounded-md', 'shadow-lg',
      ...baseClasses,
      ...configClasses
    ];
    
    if (this.data.config.duration && this.data.config.duration > 0) {
      setTimeout(() => {
        this.close();
      }, this.data.config.duration);
    }
  }

  private getBaseStyling(type: SnackbarData['type']): string[] {
    switch (type) {
      case 'success': return ['bg-success', 'text-success-on'];
      case 'error':   return ['bg-error',   'text-error-on'];
      case 'warning': return ['bg-warning', 'text-warning-on'];
      case 'info':    return ['bg-info',    'text-info-on'];
      default:        return ['bg-surface-alt', 'text-foreground'];
    }
  }

  close(): void {
    this.overlayRef.close('closed');
  }
}