// --- MAAK BESTAND AAN: libs/features/admin-orders/ui/src/lib/components/order-financials-card/order-financials-card.component.ts ---
/**
 * @file order-financials-card.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-23
 * @Description Dumb component to display the financial summary of an order.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Order } from '@royal-code/features/orders/domain';

@Component({
  selector: 'admin-order-financials-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    @if (order(); as o) {
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted">Subtotaal</span>
          <span class="font-medium">{{ o.subTotal | currency:'EUR' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted">Verzendkosten</span>
          <span class="font-medium">{{ o.shippingCost | currency:'EUR' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted">BTW</span>
          <span class="font-medium">{{ o.taxAmount | currency:'EUR' }}</span>
        </div>
        @if (o.discountAmount > 0) {
          <div class="flex justify-between text-success">
            <span class="text-muted">Korting</span>
            <span class="font-medium">- {{ o.discountAmount | currency:'EUR' }}</span>
          </div>
        }
        <div class="flex justify-between text-base font-semibold pt-2 border-t border-border mt-2">
          <span>Totaal</span>
          <span>{{ o.grandTotal | currency:'EUR' }}</span>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderFinancialsCardComponent {
  order = input.required<Order>();
}