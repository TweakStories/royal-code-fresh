/**
 * @file order-customer-info.component.ts
 * @Version 1.1.0 (Translated Labels)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-24
 * @Description Dumb component to display customer information and addresses for an order, now with i18n labels.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core'; // Import TranslateModule
import { Address } from '@royal-code/shared/domain';
import { UiInputComponent } from '@royal-code/ui/input';

@Component({
  selector: 'admin-order-customer-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, TranslateModule], // Add TranslateModule
  template: `
    <div [formGroup]="parentFormGroup()">
      <div formGroupName="customer">
        <royal-code-ui-input [label]="'admin.orders.detail.customerName' | translate" formControlName="customerName" [readonly]="true" />
        <royal-code-ui-input [label]="'admin.orders.detail.customerEmail' | translate" formControlName="customerEmail" [readonly]="true" />
      </div>

      <h4 class="text-md font-semibold mt-6 mb-3">{{ 'admin.orders.detail.shippingAddress' | translate }}</h4>
      <div formGroupName="shippingAddress" class="space-y-3">
        <royal-code-ui-input [label]="'admin.orders.detail.contactName' | translate" formControlName="contactName" />
        <royal-code-ui-input [label]="'admin.orders.detail.street' | translate" formControlName="street" />
        <royal-code-ui-input [label]="'admin.orders.detail.houseNumber' | translate" formControlName="houseNumber" />
        <royal-code-ui-input [label]="'admin.orders.detail.postalCode' | translate" formControlName="postalCode" />
        <royal-code-ui-input [label]="'admin.orders.detail.city' | translate" formControlName="city" />
        <royal-code-ui-input [label]="'admin.orders.detail.countryCode' | translate" formControlName="countryCode" />
      </div>

      <h4 class="text-md font-semibold mt-6 mb-3">{{ 'admin.orders.detail.billingAddress' | translate }}</h4>
      <div formGroupName="billingAddress" class="space-y-3">
        <royal-code-ui-input [label]="'admin.orders.detail.contactName' | translate" formControlName="contactName" />
        <royal-code-ui-input [label]="'admin.orders.detail.street' | translate" formControlName="street" />
        <royal-code-ui-input [label]="'admin.orders.detail.houseNumber' | translate" formControlName="houseNumber" />
        <royal-code-ui-input [label]="'admin.orders.detail.postalCode' | translate" formControlName="postalCode" />
        <royal-code-ui-input [label]="'admin.orders.detail.city' | translate" formControlName="city" />
        <royal-code-ui-input [label]="'admin.orders.detail.countryCode' | translate" formControlName="countryCode" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCustomerInfoComponent {
  parentFormGroup = input.required<FormGroup>();
}