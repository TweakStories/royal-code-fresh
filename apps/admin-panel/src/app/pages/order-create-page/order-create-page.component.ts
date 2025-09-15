/**
 * @file order-create-page.component.ts
 * @Version 1.1.0 (Corrected Facade Access)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-23
 * @Description Simple page for creating a new admin order.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminOrdersFacade } from '@royal-code/features/admin-orders/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';

@Component({
  selector: 'admin-order-create-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    UiTitleComponent, UiButtonComponent, UiInputComponent, UiSpinnerComponent,
  ],
  template: `
    <form [formGroup]="createOrderForm" (ngSubmit)="createOrder()">
      <div class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 px-4 border-b border-border">
        <div class="flex justify-between items-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H1" text="Nieuwe Order Maken" />
          <div class="flex items-center gap-3">
            <royal-code-ui-button type="outline" routerLink="/orders">Annuleren</royal-code-ui-button>
            <royal-code-ui-button type="primary" htmlType="submit" [disabled]="createOrderForm.invalid || facade.isSubmitting()">
              @if (facade.isSubmitting()) {
                <royal-code-ui-spinner size="sm" extraClass="mr-2" />
                <span>Maken...</span>
              } @else {
                <span>Order Maken</span>
              }
            </royal-code-ui-button>
          </div>
        </div>
      </div>

      <div class="p-2 md:p-4 space-y-6">
        <div class="p-6 bg-card border border-border rounded-xs">
          <h3 class="text-lg font-medium mb-4">Basisgegevens</h3>
          <div class="space-y-4">
            <royal-code-ui-input label="Klant E-mail" formControlName="customerEmail" type="email" [required]="true" />
            <royal-code-ui-input label="Verzendadres ID (mock)" formControlName="shippingAddressId" [required]="true" />
            <royal-code-ui-input label="Product ID (voor test, mock)" formControlName="productId" [required]="true" />
            <royal-code-ui-input label="Aantal (voor test)" formControlName="quantity" type="number" [required]="true" />
          </div>
        </div>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCreatePageComponent {
  protected readonly facade = inject(AdminOrdersFacade);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly TitleTypeEnum = TitleTypeEnum;

  createOrderForm: FormGroup = this.fb.group({
    customerEmail: ['', [Validators.required, Validators.email]],
    shippingAddressId: ['', Validators.required],
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });

  createOrder(): void {
    if (this.createOrderForm.invalid) {
      this.createOrderForm.markAllAsTouched();
      alert('Vul alle verplichte velden in.');
      return;
    }
    const formValue = this.createOrderForm.getRawValue();
    const payload = {
      customerEmail: formValue.customerEmail,
      shippingAddressId: formValue.shippingAddressId,
      items: [{ productId: formValue.productId, quantity: formValue.quantity }],
      paymentMethod: 'Credit Card',
      customerNotes: 'Created via admin panel',
    };
    alert('Order aanmaken nog niet geïmplementeerd in de facade. Payload: ' + JSON.stringify(payload, null, 2));
    // this.facade.createOrder(payload);
    this.router.navigate(['/orders']);
  }
}