/**
 * @file order-filter.component.ts
 * @Version 3.0.0 (Uses UiInputComponent for Searchbar look)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   A presentational component for filtering orders, now using the flexible
 *   `UiInputComponent` to achieve a consistent searchbar look and feel.
 */
import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OrderFilters } from '@royal-code/features/orders/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { UiInputComponent } from '@royal-code/ui/input'; // Gebruikt nu UiInputComponent

@Component({
  selector: 'plushie-order-filter',
  standalone: true,
  imports: [TranslateModule, UiInputComponent], // Imports: UiInputComponent
  template: `
    <royal-code-ui-input 
      type="search"
      [placeholder]="'orders.overview.searchPlaceholder' | translate"
      [appendButtonIcon]="AppIcon.Search"
      [appendButtonAriaLabel]="'common.buttons.search' | translate"
      (enterPressed)="onSearchTermChange($event)"
      (appendButtonClicked)="onSearchTermChange($event)"
      extraClasses="!px-4 !pr-12 !h-11 !text-lg !rounded-none !border-2 !border-border !bg-input focus:!ring-primary focus:!border-primary"
      extraButtonClasses="!px-4 !h-full"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFilterComponent {
  readonly filtersChanged = output<Partial<OrderFilters>>();
  
  protected readonly AppIcon = AppIcon;

  onSearchTermChange(term: string): void { // Event handler verwacht string
    this.filtersChanged.emit({ searchTerm: term.trim() });
  }
}