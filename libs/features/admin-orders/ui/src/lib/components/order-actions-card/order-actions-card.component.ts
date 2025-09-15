/**
 * @file order-actions-card.component.ts
 * @Version 1.8.0 (Translated Labels & Fire Button)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Dumb component for order actions, now with i18n labels and a 'fire' styled cancel button.
 */
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminOrderLookups } from '@royal-code/features/admin-orders/domain';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { OrderStatusPipe } from '@royal-code/features/orders/ui-plushie';
import { TranslateModule } from '@ngx-translate/core';
import { OrderStatus } from '@royal-code/features/orders/domain';

@Component({
  selector: 'admin-order-actions-card',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslateModule,
    UiInputComponent, UiButtonComponent, UiIconComponent, OrderStatusPipe
  ],
  template: `
    <div [formGroup]="parentFormGroup()">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">{{ 'admin.orders.detail.status' | translate }}</label>
          <select formControlName="status" class="w-full p-2 border border-input rounded-md bg-background text-sm">
            @for (status of lookups()?.orderStatuses; track status) {
              <option [value]="status">{{ (status | orderStatusInfo).textKey | translate }}</option>
            }
          </select>
        </div>
        <div class="space-y-3" formGroupName="shippingDetails">
          <royal-code-ui-input [label]="'admin.orders.fulfillment.trackingNumber' | translate" formControlName="trackingNumber" />
          <royal-code-ui-input [label]="'admin.orders.fulfillment.trackingUrlOptional' | translate" formControlName="trackingUrl" />
        </div>
        <div class="flex flex-col gap-2 pt-4 border-t border-border">
          <royal-code-ui-button type="fire" (clicked)="cancelOrder.emit()">
            <royal-code-ui-icon [icon]="AppIcon.XCircle" extraClass="mr-2" /> {{ 'admin.orders.detail.orderCancel' | translate }}
          </royal-code-ui-button>
          <royal-code-ui-button type="outline" (clicked)="refundOrder.emit()">
            <royal-code-ui-icon [icon]="AppIcon.Banknote" extraClass="mr-2" /> {{ 'admin.orders.detail.refund' | translate }}
          </royal-code-ui-button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderActionsCardComponent {
  parentFormGroup = input.required<FormGroup>();
  lookups = input<AdminOrderLookups | null>();
  cancelOrder = output<void>();
  refundOrder = output<void>();
  protected readonly AppIcon = AppIcon;
  protected readonly OrderStatus = OrderStatus;
}