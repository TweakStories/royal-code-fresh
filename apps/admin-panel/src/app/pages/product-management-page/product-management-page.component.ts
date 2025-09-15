/**
 * @file product-management-page.component.ts
 * @Version 4.8.0 (Definitive - All Fixes Applied & Correct Commenting)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-26
 * @Description Definitive smart component for product management, with all fixes applied and correct commenting.
 */
import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef, OnInit } from '@angular/core'; // OnInit import
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toObservable, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiInputComponent } from '@royal-code/ui/input';
import { AppIcon } from '@royal-code/shared/domain';
import { Product, ProductFilters, ProductStatus } from '@royal-code/features/products/domain';

import { AdminProductsFacade, AdminProductListViewModel } from '@royal-code/features/admin-products/core';
import { ProductListComponent } from '@royal-code/features/admin-products/ui';
import { UiPaginationComponent } from '@royal-code/ui/pagination';

@Component({
  selector: 'admin-product-management-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiTitleComponent,
    ProductListComponent,
    UiButtonComponent,
    UiIconComponent,
    UiInputComponent,
    TitleCasePipe,
    UiPaginationComponent
  ],
  template: `
    <!-- === PRODUCT MANAGEMENT HEADER === -->
    <div class="flex justify-between items-center mb-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H1" text="Productbeheer" />
      <royal-code-ui-button type="primary" (clicked)="createProduct()">
        <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2"/>
        Nieuw Product
      </royal-code-ui-button>
    </div>

    <!-- === FILTERS GROUP === -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-surface-alt border border-border rounded-xs">
      <royal-code-ui-input
        [ngModel]="searchTerm()"
        (ngModelChange)="onSearchTermChange($event)"
        placeholder="Zoek op naam of SKU..."
        [icon]="AppIcon.Search" iconPosition="left" extraClasses="flex-grow" />
       <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)"
        class="w-full sm:w-48 p-2 border border-input rounded-md bg-background text-sm focus:ring-primary focus:border-primary">
        <option value="all">Alle Statussen</option>
        @for (status of productStatuses; track status) {
          <option [value]="status">{{ status | titlecase }}</option>
        }
       </select>
    </div>

    <!-- === PRODUCT LISTING & PAGINATION === -->
    <div class="mt-4">
      <!-- --- Loading State --- -->
      @if (viewModel().isLoading && viewModel().products.length === 0) {
        <p>Producten laden...</p>
      } @else if (viewModel().error) {
        <!-- --- Error State --- -->
        <div class="text-center p-8 text-destructive">{{ viewModel().error }}</div>
      } @else {
        <!-- --- Product List Component --- -->
        <admin-product-list
          [products]="viewModel().products"
          (editClicked)="editProduct($event)"
          (deleteClicked)="deleteProduct($event)"
          (statusChanged)="updateStatus($event)"
          (stockChanged)="updateStock($event)" />
        
        <!-- --- Pagination Component --- -->
        <royal-code-ui-pagination
          [totalItems]="viewModel().totalCount"
          [currentPage]="viewModel().filters.page ?? 1"
          [pageSize]="viewModel().filters.pageSize ?? 20"
          (goToPage)="onPageChange($event)"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductManagementPageComponent implements OnInit {
  private readonly facade = inject(AdminProductsFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  protected readonly productStatuses = Object.values(ProductStatus);

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal('all');

  readonly viewModel = this.facade.viewModel;

  private readonly filters = computed<Partial<ProductFilters>>(() => ({
    searchTerm: this.searchTerm() || undefined,
    statuses: this.statusFilter() === 'all' ? undefined : [this.statusFilter() as ProductStatus],
  }));

  ngOnInit(): void {
    this.facade.initPage();
  }

  constructor() {
    const filters$ = toObservable(this.filters);
    filters$.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((currentFilters: Partial<ProductFilters>) => {
      this.facade.changeFilters(currentFilters);
    });
  }
  
  onPageChange(page: number): void { this.facade.changeFilters({ page }); }
  onSearchTermChange(term: string): void { this.searchTerm.set(term); }
  createProduct(): void { this.router.navigate(['/products/new']); }
  editProduct(id: string): void { this.router.navigate(['/products', id]); }
  deleteProduct(id: string): void {
    if (confirm(`Weet u zeker dat u dit product wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      this.facade.deleteProduct(id);
    }
  }
  updateStatus(event: { productId: string; newStatus: ProductStatus }): void { this.facade.updateProduct(event.productId, { status: event.newStatus }); }
  updateStock(event: { productId: string; newStock: number }): void {
    this.facade.updateProduct(event.productId, {
      physicalProductConfig: { stockQuantity: event.newStock }
    });
  }
}