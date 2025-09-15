/**
 * @file product-stock.utils.ts
 * @version 1.7.2 (no non‑null assertions, ESLint clean)
 * @author Royal‑Code MonorepoAppDevAI
 * @date 2025‑07‑15
 * @description
 *   Converts raw inventory data into an object suitable for UI presentation.
 *   v1.7.2 removes all non‑null (!) assertions to satisfy
 *   @typescript-eslint/no-non-null-assertion, relying on type‑narrowing instead.
 */

import {
  Product,
  ProductVariantCombination,
  StockStatus,
} from '@royal-code/features/products/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { StockDisplayInfo } from '../state/product.types';
import { isPhysicalProduct } from './product-type-guards';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';

registerLocaleData(localeNl, 'nl-NL');

export function getStockDisplayInfo(
  product: Product | undefined,
  variant: ProductVariantCombination | undefined,
  stockQuantity: number | null | undefined,
  stockStatus: StockStatus | undefined,
  options: {
    lowThreshold?: number;
    criticalThreshold?: number;
    availableFromDate?: string | Date;
    translate: (key: string, params?: Record<string, any>) => string;
    log?: (message: string, context?: any) => void;
  },
): StockDisplayInfo {
  const t = options.translate;
  const log = options.log ?? (() => {});

  /* Derived configuration */
  const lowThreshold = options.lowThreshold ?? 10;
  const criticalThreshold = options.criticalThreshold ?? 5;

  log('--- START getStockDisplayInfo v1.7.2 ---');
  log('Inputs', {
    product,
    variant,
    stockQuantity,
    stockStatus,
    lowThreshold,
    criticalThreshold,
  });

  /* PRIORITY 1 — absolute statuses */
  switch (stockStatus) {
    case StockStatus.OUT_OF_STOCK:
      return { text: t('productDetail.outOfStock'), icon: AppIcon.CircleX, colorClass: 'muted' };

    case StockStatus.ON_BACKORDER: {
      const datePipe = new DatePipe('nl-NL');
      const formatted = options.availableFromDate
        ? datePipe.transform(options.availableFromDate, 'd MMMM yyyy')
        : null;
      const suffix = formatted ? ` (${t('productDetail.availableFrom', { date: formatted })})` : '';
      return {
        text: t('productDetail.onBackorder') + suffix,
        icon: AppIcon.Clock,
        colorClass: 'water',
      };
    }

    case StockStatus.PRE_ORDER:
      return { text: t('productDetail.preOrder'), icon: AppIcon.CalendarClock, colorClass: 'primary' };

    case StockStatus.COMING_SOON:
      return { text: t('productDetail.comingSoon'), icon: AppIcon.Hourglass, colorClass: 'muted' };

    case StockStatus.DISCONTINUED:
      return { text: t('productDetail.discontinued'), icon: AppIcon.Slash, colorClass: 'muted' };
  }

  /* PRIORITY 2 — quantity based statuses */
  const quantityLogicAllowed =
    typeof stockQuantity === 'number' && (product ? isPhysicalProduct(product) : true);
  log('quantityLogicAllowed', quantityLogicAllowed);

  if (quantityLogicAllowed) {
    // At this point TS knows stockQuantity is a number
    if (stockQuantity <= 0) {
      return { text: t('productDetail.outOfStock'), icon: AppIcon.CircleX, colorClass: 'muted' };
    }

    if (stockQuantity <= criticalThreshold) {
      return {
        text: t('productDetail.onlyXLeft', { quantity: stockQuantity }),
        icon: AppIcon.Flame,
        colorClass: 'fire',
      };
    }

    if (stockQuantity <= lowThreshold) {
      return {
        text: t('productDetail.almostSoldOut'),
        icon: AppIcon.AlertTriangle,
        colorClass: 'sun',
      };
    }
  }

  /* PRIORITY 3 — default (plenty in stock) */
  return { text: t('productDetail.inStock'), icon: AppIcon.CircleCheck, colorClass: 'primary' };
}
