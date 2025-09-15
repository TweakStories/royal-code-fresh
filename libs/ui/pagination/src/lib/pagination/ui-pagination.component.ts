/**
 * @file pagination.component.ts
 * @Version 2.0.0 (Enhanced with Styling & Robustness)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description A robust, reusable pagination component with enhanced styling.
 */
import { Component, ChangeDetectionStrategy, input, output, computed, Signal, effect, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { SelectOption } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-pagination',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiIconComponent, FormsModule, TranslateModule],
  template: `
    @if (totalItems() > 0 && totalPages() > 1) {
      <div class="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-2 bg-card border border-border rounded-xs text-foreground text-sm gap-4">
        <!-- Info -->
        <div class="hidden sm:block text-secondary">
          {{ 'pagination.showing' | translate }}
          <strong>{{ (currentPage() - 1) * pageSize() + 1 }}</strong>
          -
          <strong>{{ showingTo() }}</strong>
          {{ 'pagination.of' | translate }}
          <strong>{{ totalItems() }}</strong>
        </div>

        <!-- Paginaknoppen -->
        <div class="flex items-center gap-1 sm:gap-2">
          <royal-code-ui-button
            type="outline"
            sizeVariant="sm"
            [isRound]="false"
            extraClasses="rounded-xs"
            [disabled]="currentPage() === 1"
            (clicked)="onGoToPage(currentPage() - 1)"
            [attr.aria-label]="'pagination.previousPage' | translate"
          >
            <royal-code-ui-icon [icon]="AppIcon.ChevronLeft" />
          </royal-code-ui-button>

          @for (page of numericPageButtons(); track page) {
            <royal-code-ui-button
              [type]="page === currentPage() ? 'primary' : 'outline'"
              sizeVariant="sm"
              [isRound]="false"
              extraClasses="rounded-xs w-9 h-9"
              [disabled]="page === '...'"
              (clicked)="onGoToPage(page)"
              [attr.aria-label]="'pagination.goToPage' | translate: { page: page }"
            >
              {{ page }}
            </royal-code-ui-button>
          }

          <royal-code-ui-button
            type="outline"
            sizeVariant="sm"
            [isRound]="false"
            extraClasses="rounded-xs"
            [disabled]="currentPage() === totalPages()"
            (clicked)="onGoToPage(currentPage() + 1)"
            [attr.aria-label]="'pagination.nextPage' | translate"
          >
            <royal-code-ui-icon [icon]="AppIcon.ChevronRight" />
          </royal-code-ui-button>
        </div>

        <!-- Pagina Grootte Selector -->
        @if (showPageSizeSelector()) {
          <div class="hidden md:flex items-center gap-2 flex-shrink-0">
            <span class="text-secondary text-sm">{{ 'pagination.perPage' | translate }}:</span>
            <select
              [ngModel]="pageSize()"
              (ngModelChange)="onPageSizeChange($event)"
              class="block w-auto px-2 py-1.5 border border-input rounded-xs bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              [attr.aria-label]="'pagination.itemsPerPage' | translate">
              @for(option of pageSizeOptions(); track option.value) {
                <option [ngValue]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPaginationComponent {
  readonly totalItems = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly pageSizeOptions = input<SelectOption[]>([
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
  ]);


  readonly showPageSizeSelector = input<boolean>(true);

  readonly goToPage = output<number>();
  readonly pageSizeChanged = output<number>();

  protected readonly AppIcon = AppIcon;

  readonly totalPages: Signal<number> = computed(() => {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
  });

  readonly showingTo: Signal<number> = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  readonly numericPageButtons = computed<Array<number | '...'>>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: Array<number | '...'> = [];
    let l: number | undefined;

    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) {
      if (i < total && i > 1) {
        range.push(i);
      }
    }
    if (total > 1) {
        range.push(total);
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  });

  onGoToPage(page: number | '...'): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.goToPage.emit(page);
    }
  }

  onPageSizeChange(newSize: number): void {
    if (newSize !== this.pageSize()) {
      this.pageSizeChanged.emit(newSize);
    }
  }
}