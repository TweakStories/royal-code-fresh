// --- VERVANG VOLLEDIG BESTAND: libs/ui/products/src/lib/product-grid/product-grid.component.ts ---
/**
 * @file product-grid.component.ts
 * @Version 1.1.0 (Dynamic Columns)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   A reusable, presentational component for displaying a responsive grid of products.
 *   Now accepts a dynamic Tailwind CSS class string to control the number of columns.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-30
 * @PromptSummary Added user-configurable grid columns and sidebar visibility with localStorage persistence.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@royal-code/features/products/domain';
import { ProductHeroCardComponent } from '../product-hero-card/product-hero-card.component';

@Component({
  selector: 'royal-code-ui-product-grid',
  standalone: true,
  imports: [CommonModule, ProductHeroCardComponent],
  template: `
    @if (products() && products().length > 0) {
      <div class="grid gap-4 md:gap-6" [class]="columnClasses()">
        @for (product of products(); track product.id) {
          <royal-code-ui-product-hero-card [productInput]="product" />
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGridComponent {
  /**
   * @property products
   * @description The array of products to display in the grid.
   */
  readonly products = input.required<readonly Product[]>();
  /**
   * @property columnClasses
   * @description A string of Tailwind CSS classes to control the grid columns.
   *              Example: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
   */
  readonly columnClasses = input<string>('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
}