import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { UiPaginationComponent } from '@royal-code/ui/pagination';

@Component({
  selector: 'royal-code-ui-generic-overview',
  imports: [CommonModule, InfiniteScrollDirective, UiPaginationComponent],
  template: `
    @if (loading) {
      <div class="text-center my-6">
        <span class="text-primary font-medium text-lg">Loading...</span>
      </div>
    }
    
    <!-- Infinite Scroll -->
    @if (viewMode === 'infinite') {
      <div
        infiniteScroll
        [infiniteScrollDistance]="2"
        [infiniteScrollThrottle]="150"
        (scrolled)="onScroll()"
        class="space-y-4"
        >
        @for (item of items; track item) {
          <ng-container
            *ngTemplateOutlet="itemTemplate; context: { $implicit: item }"
          ></ng-container>
        }
      </div>
    } @else {
      <div class="space-y-4">
        @for (item of items; track item) {
          <ng-container
            *ngTemplateOutlet="itemTemplate; context: { $implicit: item }"
          ></ng-container>
        }
        <royal-code-ui-pagination
          [totalItems]="totalItems ?? 0"
          [currentPage]="currentPage"
          [pageSize]="pageSize"
          (pageChange)="onPageChange($event)"
        ></royal-code-ui-pagination>
      </div>
    }
    
    <!-- Pagination View -->
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiGenericOverviewComponent<T> implements OnInit {
  @Input() items: T[] | null = [];
  @Input() totalItems: number | null = null;
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() viewMode: 'pagination' | 'infinite' = 'pagination';
  @Input() itemTemplate!: TemplateRef<any>;
  @Input() loading = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() scrolled = new EventEmitter<void>();
  @Output() itemSelected = new EventEmitter<T>();

  constructor() {}

  ngOnInit(): void {}

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  onScroll() {
    if (this.viewMode === 'infinite') {
      this.scrolled.emit();
    }
  }

  onItemSelected(item: T) {
    this.itemSelected.emit(item);
  }
}
