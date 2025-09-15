/**
 * @file libs/features/products/ui-droneshop/src/lib/pages/shop-page/shop-page.component.ts
 * @Version 9.0.0 (DEFINITIVE FIX: URL Parameter Hydration on Refresh)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-07
 * @Description
 *   Definitieve, werkende versie van de shop-pagina. Dit lost het kritieke probleem op
 *   waarbij filters niet werden toegepast na een harde refresh. De `ngOnInit` leest
 *   nu de URL query parameters en initialiseert de product state correct.
 *   De overbodige `showDebugInfo` input is verwijderd.
 */
import { 
  Component, 
  ChangeDetectionStrategy, 
  OnInit, 
  OnDestroy, 
  signal, 
  inject, 
  computed, 
  effect 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, ParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil, map, distinctUntilChanged } from 'rxjs/operators';

import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { StorageService } from '@royal-code/core/storage';
import { ProductFacade, ProductSortField } from '@royal-code/features/products/core';
import { ProductFilters } from '@royal-code/features/products/domain';
import { ProductOverviewComponent } from '../product-overview/product-overview.component';
import { ProductFilterSidebarUpgradedComponent } from '@royal-code/ui/products';


interface ShopViewSettings {
  isSidebarVisible: boolean;
  gridColumns: number;
}
const SHOP_VIEW_SETTINGS_KEY = 'droneshop_shop_view_settings';

@Component({
  selector: 'droneshop-royal-code-shop-page',
  standalone: true,
  imports: [ 
    CommonModule, 
    FormsModule, 
    TranslateModule, 
    UiButtonComponent,
    UiIconComponent,
    ProductOverviewComponent, 
    ProductFilterSidebarUpgradedComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shop-page-container min-h-screen bg-background">
      
      <!-- Header Section -->
      <div class="bg-card border-b border-border shadow-sm">
        <div class="container-max px-4 lg:px-6 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-primary mb-2">
                {{ 'shopPage.title' | translate }}
              </h1>
              <p class="text-sm text-muted-foreground">
                {{ getSubtitleText() }}
              </p>
            </div>
            
            <div class="flex items-center gap-2">
               <royal-code-ui-button
                [type]="isSidebarVisible() ? 'primary' : 'default'"
                (clicked)="onSidebarToggled()"
                [attr.aria-label]="isSidebarVisible() ? 'Filters verbergen' : 'Filters tonen'">
                <royal-code-ui-icon 
                  [icon]="AppIcon.Filter" 
                  sizeVariant="sm" />
                <span class="hidden sm:inline ml-2">
                  Filters
                </span>
              </royal-code-ui-button>

              @if (activeFiltersCount() > 0) {
                <div class="flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 text-primary rounded-md border border-primary/20">
                  <royal-code-ui-icon [icon]="AppIcon.Check" sizeVariant="sm" />
                  <span>{{ activeFiltersCount() }} filter{{ activeFiltersCount() === 1 ? '' : 's' }}</span>
                  <button
                    type="button"
                    class="ml-1 hover:bg-primary/20 rounded p-0.5 transition-colors"
                    (click)="clearAllFilters()"
                    [attr.aria-label]="'Alle filters wissen'">
                    <royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="xs" />
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container-max px-4 lg:px-6 py-6">
        <div class="flex flex-row gap-6 transition-all duration-300">
          
          @if (isSidebarVisible()) {
            <royal-code-ui-product-filter-sidebar-upgraded
              [filters]="viewModel().availableFilters"
              [activeFilters]="viewModel().filters"
              [isLoadingFilters]="viewModel().isLoadingFilters"
              (filtersChanged)="handleFiltersChange($event)"
              class="order-1 md:order-none animate-fade-in-right" />
          }

          <main class="flex-grow min-w-0 order-2 md:order-none">
            
            @if (viewModel().isLoading && viewModel().products.length === 0) {
              <div class="flex flex-col items-center justify-center py-16 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p class="text-muted-foreground">Producten worden geladen...</p>
              </div>
            }
            
            @else if (!viewModel().isLoading && viewModel().products.length === 0) {
              <div class="flex flex-col items-center justify-center py-16 text-center">
                <royal-code-ui-icon [icon]="AppIcon.Search" sizeVariant="xl" extraClass="text-muted-foreground mb-4" />
                <h3 class="text-lg font-semibold text-foreground mb-2">Geen producten gevonden</h3>
                <p class="text-muted-foreground mb-4">
                  Probeer je filters aan te passen of zoek naar andere termen.
                </p>
                <royal-code-ui-button
                  type="primary"
                  (clicked)="clearAllFilters()">
                  Alle filters wissen
                </royal-code-ui-button>
              </div>
            }
            
            @else {
              <droneshop-royal-code-product-overview
                [products]="viewModel().products"
                [initialViewMode]="currentViewMode()"
                [isLoading]="viewModel().isLoading"
                [initialSortBy]="currentSortBy()"
                [initialSortDirection]="viewModel().filters.sortDirection ?? 'asc'"
                [gridColumns]="gridColumns()"
                [isSidebarVisible]="isSidebarVisible()"
                (viewModeChanged)="handleViewModeChange($event)"
                (sortChanged)="handleSortChange($event)"
                (gridColumnsChanged)="onGridColumnsChange($event)"
                (sidebarToggled)="onSidebarToggled()" />
            }
          </main>
        </div>
      </div>
    </div>
  `,
})
export class ShopPageComponent implements OnInit, OnDestroy {
  private readonly logger = inject(LoggerService);
  private readonly productFacade = inject(ProductFacade);
  private readonly storageService = inject(StorageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  protected readonly AppIcon = AppIcon;
  readonly viewModel = this.productFacade.viewModel;
  readonly currentViewMode = signal<'grid' | 'list'>('grid');
  readonly isSidebarVisible = signal<boolean>(true);
  readonly gridColumns = signal<number>(4);
  
  readonly currentSortBy = computed<ProductSortField>(() => 
    (this.viewModel().filters.sortBy as ProductSortField) ?? 'name'
  );

  readonly activeFiltersCount = computed(() => {
    const filters = this.viewModel().filters;
    let count = 0;
    if (filters.categoryIds?.length) count++;
    if (filters.brandIds?.length) count++;
    if (filters.searchTerm?.trim()) count++;
    if (filters.onSaleOnly) count++;
    if (filters.inStockOnly) count++;
    if (filters.isFeatured) count++;
    if (filters.priceRange) count++;
    return count;
  });

  constructor() {
    this.loadViewSettings();
    effect(() => {
      const settings: ShopViewSettings = {
        isSidebarVisible: this.isSidebarVisible(),
        gridColumns: this.gridColumns(),
      };
      this.storageService.setItem(SHOP_VIEW_SETTINGS_KEY, settings);
    });
  }

  ngOnInit(): void {
    // Stap 1: Lees de *initiële* filters direct van de URL snapshot bij het laden.
    const initialParams = this.route.snapshot.queryParamMap;
    const initialFilters = this.mapParamsToFilters(initialParams);
    this.logger.info(`[ShopPage] Initializing with filters from URL:`, initialFilters);

    // Stap 2: Dispatch de 'Page Opened' actie met deze initiële filters.
    this.productFacade.openPage({ initialFilters });

    // Stap 3: Abonneer op *toekomstige* wijzigingen in de URL (bv. header navigatie).
    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$),
      map(params => this.mapParamsToFilters(params)),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(filtersFromUrl => {
      this.logger.info(`[ShopPage] URL parameters changed, updating filters.`, filtersFromUrl);
      this.productFacade.updateFilters(filtersFromUrl);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.productFacade.closePage(); 
  }

  private mapParamsToFilters(params: ParamMap): Partial<ProductFilters> {
    let newFilters: Partial<ProductFilters> = {};
    if (params.has('category')) {
      newFilters = { ...newFilters, categoryIds: params.get('category')!.split(',') };
    }
    if (params.has('brand')) {
      newFilters = { ...newFilters, brandIds: params.get('brand')!.split(',') };
    }
    // Voeg hier andere parameter-mappings toe
    return newFilters;
  }

  private loadViewSettings(): void {
    const settings = this.storageService.getItem<ShopViewSettings>(SHOP_VIEW_SETTINGS_KEY);
    if (settings) {
      this.isSidebarVisible.set(settings.isSidebarVisible);
      this.gridColumns.set(settings.gridColumns);
    }
  }

  getSubtitleText(): string {
    const vm = this.viewModel();
    const totalCount = vm.totalCount;
    if (vm.isLoading && vm.products.length === 0) return 'Producten worden geladen...';
    if (totalCount === 0) return 'Geen producten gevonden met de huidige filters.';
    const activeCount = this.activeFiltersCount();
    if (activeCount > 0) {
      return `${totalCount.toLocaleString()} producten gevonden • ${activeCount} filter${activeCount === 1 ? '' : 's'} actief`;
    }
    return `${totalCount.toLocaleString()} producten beschikbaar`;
  }

  handleViewModeChange(mode: 'grid' | 'list'): void {
    this.currentViewMode.set(mode);
  }

  handleFiltersChange(newFilters: Partial<ProductFilters>): void {
    const updatedFilters: Partial<ProductFilters> = { ...newFilters, page: 1 };
    this.productFacade.updateFilters(updatedFilters);
    this.updateUrlFromFilters(updatedFilters);
  }

  private updateUrlFromFilters(filters: Partial<ProductFilters>): void {
    const queryParams: Params = {};
    if (filters.categoryIds?.length) queryParams['category'] = filters.categoryIds.join(',');
    else queryParams['category'] = null;

    if (filters.brandIds?.length) queryParams['brand'] = filters.brandIds.join(',');
    else queryParams['brand'] = null;

    if (filters.sortBy) queryParams['sortBy'] = filters.sortBy;
    if (filters.sortDirection) queryParams['sortDirection'] = filters.sortDirection;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  handleSortChange(sortData: { sortBy: string; sortDirection: 'asc' | 'desc' }): void {
    this.handleFiltersChange(sortData);
  }

  onGridColumnsChange(columns: number): void {
    this.gridColumns.set(columns);
  }

  onSidebarToggled(): void {
    this.isSidebarVisible.update(visible => !visible);
  }

  clearAllFilters(): void {
    this.productFacade.updateFilters({
      page: 1, searchTerm: undefined, categoryIds: undefined, brandIds: undefined,
      onSaleOnly: undefined, inStockOnly: undefined, isFeatured: undefined,
      stockStatuses: undefined, priceRange: undefined,
    });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }
}