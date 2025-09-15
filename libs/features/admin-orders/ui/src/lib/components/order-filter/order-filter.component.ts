/**
 * @file order-filter.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-22
 * @Description UI component for filtering the admin order list.
 */
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminOrderLookups } from '@royal-code/features/admin-orders/domain';
import { OrderFilters } from '@royal-code/features/orders/domain';
import { UiInputComponent } from '@royal-code/ui/input';
import { AppIcon } from '@royal-code/shared/domain';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'admin-order-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInputComponent],
  template: `
    <div class="flex flex-col sm:flex-row gap-4 p-4 bg-surface-alt border border-border rounded-xs">
      <royal-code-ui-input
        [ngModel]="searchTerm()"
        (ngModelChange)="onSearchTermChange($event)"
        placeholder="Zoek op ordernr, klant..."
        [icon]="AppIcon.Search" iconPosition="left" extraClasses="flex-grow" />
      <select [ngModel]="statusFilter" (ngModelChange)="onStatusChange($event)"
        class="w-full sm:w-48 p-2 border border-input rounded-md bg-background text-sm focus:ring-primary focus:border-primary">
        <option value="all">Alle Statussen</option>
        @if (lookups(); as lookupData) {
          @for (status of lookupData.orderStatuses; track status) {
            <option [value]="status">{{ status | titlecase }}</option>
          }
        }
       </select>
       <!-- Date pickers can be added here later -->
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFilterComponent {
  lookups = input<AdminOrderLookups | null>();
  filtersChanged = output<Partial<OrderFilters>>();

  protected readonly AppIcon = AppIcon;
  protected statusFilter: string = 'all';

  private searchTermSubject = new Subject<string>();
  protected searchTerm = toSignal(this.searchTermSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ), { initialValue: '' });

  constructor() {
    toObservable(this.searchTerm).subscribe(term => {
      this.filtersChanged.emit({ searchTerm: term });
    });
  }

  onSearchTermChange(term: string): void {
    this.searchTermSubject.next(term);
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.filtersChanged.emit({ status: status as any });
  }
}