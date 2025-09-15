/**
 * @file order-status.pipe.ts
 * @Version 1.2.0 (Synchronized with camelCase OrderStatus Enum)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-23
 * @Description Pipe om een OrderStatus enum of string om te zetten naar een UI-vriendelijk object.
 *              Werkt nu consistent met camelCase OrderStatus enum-leden.
 */
import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '@royal-code/features/orders/domain';
import { AppIcon, BadgeColor } from '@royal-code/shared/domain';

export interface StatusInfo {
  textKey: string; // Dit is de vertaalsleutel
  icon: AppIcon;
  color: BadgeColor;
}

@Pipe({
  name: 'orderStatusInfo',
  standalone: true,
})
export class OrderStatusPipe implements PipeTransform {
  /**
   * Transforms an OrderStatus enum value or string into a StatusInfo object for UI display.
   * Ensures consistent camelCase handling and dynamic translation key generation.
   * @param status The order status as a string or OrderStatus enum.
   * @returns A StatusInfo object containing textKey, icon, and color.
   */
  transform(status: string | OrderStatus | undefined): StatusInfo {
    if (!status) {
      return { textKey: 'orders.status.unknown', icon: AppIcon.HelpCircle, color: 'muted' };
    }

    // Normaliseer de input naar een camelCase string voor betrouwbare matching.
    // Dit vangt zowel OrderStatus enum waarden als eventuele PascalCase strings op die nog binnenkomen.
    const normalizedStatusString = status.toString().charAt(0).toLowerCase() + status.toString().slice(1);

    // Genereer de basis vertaalsleutel
    const baseTextKey = `features.orders.status.${normalizedStatusString}`;

    switch (normalizedStatusString) { // Gebruik de genormaliseerde string voor de switch
      case OrderStatus.shipped:
      case OrderStatus.inTransit:
        return { textKey: baseTextKey, icon: AppIcon.Truck, color: 'info' };
      case OrderStatus.delivered:
      case OrderStatus.completed:
        return { textKey: baseTextKey, icon: AppIcon.CheckCircle, color: 'success' };
      case OrderStatus.cancelled:
      case OrderStatus.paymentFailed:
        return { textKey: baseTextKey, icon: AppIcon.XCircle, color: 'error' };
      case OrderStatus.pendingPayment:
      case OrderStatus.awaitingFulfillment:
      case OrderStatus.processing:
        return { textKey: baseTextKey, icon: AppIcon.Clock, color: 'warning' };
      case OrderStatus.refundPending:
        return { textKey: baseTextKey, icon: AppIcon.Coins, color: 'info' };
      case OrderStatus.partiallyRefunded:
        return { textKey: baseTextKey, icon: AppIcon.Coins, color: 'info' };
      case OrderStatus.fullyRefunded:
        return { textKey: baseTextKey, icon: AppIcon.Coins, color: 'success' };
      case OrderStatus.onHold:
        return { textKey: baseTextKey, icon: AppIcon.Flag, color: 'muted' };
      default:
        // Als geen van de bekende statussen overeenkomt, val terug op 'unknown'.
        return { textKey: 'orders.status.unknown', icon: AppIcon.HelpCircle, color: 'muted' };
    }
  }
}