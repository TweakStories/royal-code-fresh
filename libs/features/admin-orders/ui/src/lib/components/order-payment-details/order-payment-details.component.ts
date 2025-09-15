// --- MAAK BESTAND AAN: libs/features/admin-orders/ui/src/lib/components/order-payment-details/order-payment-details.component.ts ---
/**
 * @file order-payment-details.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-23
 * @Description Dumb component to display order payment details.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '@royal-code/features/orders/domain';

type PaymentDetails = Order['paymentDetails'];

@Component({
  selector: 'admin-order-payment-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (paymentDetails(); as details) {
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted">Betaalmethode</span>
          <span class="font-medium">{{ details.methodFriendlyName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted">Status</span>
          <span class="font-medium">{{ details.paymentStatus }}</span>
        </div>
        @if (details.gatewayTransactionId) {
          <div class="flex justify-between">
            <span class="text-muted">Transactie ID</span>
            <span class="font-mono text-xs">{{ details.gatewayTransactionId }}</span>
          </div>
        }
      </div>
    } @else {
      <p class="text-sm text-muted italic">Geen betaalgegevens beschikbaar.</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderPaymentDetailsComponent {
  paymentDetails = input<PaymentDetails>();
}