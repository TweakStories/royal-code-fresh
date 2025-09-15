/**
 * @file product-filter-sidebar-upgraded.component.ts
 * @Version 2.8.1 (DEFINITIVE FIX: Re-added showDebugInfo and helper methods)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-07
 * @Description
 *   Definitieve, werkende versie van de filter-sidebar. De `showDebugInfo` input
 *   en de bijbehorende helper-methoden voor de debug-sectie zijn correct
 *   teruggeplaatst, wat alle compilatiefouten oplost.
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
  computed,
  inject,
  OnInit,
  signal,
  booleanAttribute
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { UiButtonComponent } from '@royal-code/ui/button';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { ProductFilters, FilterDefinition } from '@royal-code/features/products/domain';
import { UiCheckboxComponent } from '@royal-code/ui/input';
import { AppIcon, CategorySelectionEvent, CategoryToggleEvent, CategoryTreeNode } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { CategoryTreeService } from '@royal-code/features/products/core';
import { CategoryTreeNodeComponent } from '../category-tree-node/category-tree-node.component';


@Component({
  selector: 'royal-code-ui-product-filter-sidebar-upgraded',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    UiButtonComponent,
    UiSpinnerComponent,
    UiParagraphComponent,
    UiCheckboxComponent,
    CategoryTreeNodeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="w-full md:w-64 lg:w-72 xl:w-80 flex-shrink-0 bg-card rounded-lg shadow-lg border border-border self-start">
      
      <div class="p-4 border-b border-border">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-foreground">
            {{ 'productFilters.title' | translate }}
          </h2>
          @if (hasActiveFilters()) {
            <royal-code-ui-button
              type="link"
              sizeVariant="sm"
              (clicked)="clearAllFilters()">
              {{ 'productFilters.clearAll' | translate }}
            </royal-code-ui-button>
          }
        </div>
        
        @if (totalProductCount() > 0) {
          <p class="text-xs text-muted-foreground mt-1">
            {{ totalProductCount() }} producten gevonden
          </p>
        }
      </div>

      <div class="flex-1 overflow-hidden">
        @if (isLoadingFilters()) {
          <div class="flex flex-col items-center justify-center py-8 text-secondary gap-3">
            <royal-code-ui-spinner size="md" />
            <p class="text-sm">{{ 'productFilters.loading' | translate }}</p>
          </div>
        } @else {
          <div class="h-full overflow-y-auto">
            
            <div class="p-4 border-b border-border">
              <h3 class="text-sm font-medium text-foreground mb-3">
                {{ 'productFilters.categories' | translate }}
              </h3>
              @if (categoryTree().length > 0) {
                <div class="category-tree-container max-h-80 overflow-y-auto pr-1">
                  @for (rootNode of categoryTree(); track rootNode.id) {
                    <royal-code-ui-category-tree-node
                      [node]="rootNode"
                      (categorySelected)="onCategorySelected($event)"
                      (categoryToggled)="onCategoryToggled($event)" />
                  }
                </div>
              } @else {
                 <royal-code-ui-paragraph size="sm" color="muted" extraClasses="text-center py-4">
                  {{ 'productFilters.noCategoriesAvailable' | translate }}
                </royal-code-ui-paragraph>
              }
            </div>

            @if (brandOptions().length > 0) {
              <div class="p-4 border-b border-border">
                <h3 class="text-sm font-medium text-foreground mb-3">
                  {{ 'productFilters.brands' | translate }}
                </h3>
                <div class="space-y-1 max-h-60 overflow-y-auto pr-1">
                  @for (brand of brandOptions(); track brand.value) {
                    @if(brand.count > 0 || brand.isSelected) {
                      <div class="flex items-center justify-between group">
                        <royal-code-ui-checkbox
                          [explicitId]="'brand-' + brand.value"
                          [label]="brand.label"
                          [checked]="brand.isSelected"
                          (changed)="onBrandSelectionChange(brand.value, $event)"
                          labelClasses="flex-grow"
                        />
                        <span class="text-xs text-secondary bg-surface-alt px-1.5 py-0.5 rounded-md">
                          {{ brand.count }}
                        </span>
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Debug Panel (Development Only) -->
      @if (showDebugInfo()) {
        <div class="p-3 bg-yellow-50 border-t border-yellow-200 text-xs">
          <details>
            <summary class="cursor-pointer font-semibold">Debug Info</summary>
            <div class="mt-2 space-y-1">
              <div><strong>Categories Tree:</strong> {{ categoryTree().length }} root nodes</div>
              <div><strong>Selected Categories:</strong> {{ getSelectedCategoryIds().join(', ') || 'None' }}</div>
              <div><strong>Selected Brands:</strong> {{ getSelectedBrandIds().join(', ') || 'None' }}</div>
              <div><strong>Total Product Count:</strong> {{ totalProductCount() }}</div>
              <div><strong>Loading:</strong> {{ isLoadingFilters() }}</div>
            </div>
          </details>
        </div>
      }
    </aside>
  `,
})
export class ProductFilterSidebarUpgradedComponent implements OnInit {
  readonly filters = input.required<FilterDefinition[] | null>();
  readonly activeFilters = input.required<ProductFilters>();
  readonly isLoadingFilters = input(false, { transform: booleanAttribute });
  readonly showDebugInfo = input(false, { transform: booleanAttribute });
  
  readonly filtersChanged = output<Partial<ProductFilters>>();

  private readonly categoryTreeService = inject(CategoryTreeService);
  private readonly logger = inject(LoggerService);
  protected readonly AppIcon = AppIcon;

  private readonly categoryTreeSubject = new BehaviorSubject<CategoryTreeNode[]>([]);
  readonly categoryTree = toSignal(this.categoryTreeSubject.asObservable(), { initialValue: [] });

  readonly brandOptions = computed(() => {
    const filters = this.filters();
    const activeFilters = this.activeFilters();
    if (!filters) return [];
    const brandFilter = filters.find(f => f.key === 'brandIds');
    if (!brandFilter?.options) return [];
    const selectedBrands = activeFilters.brandIds || [];
    return brandFilter.options.map(option => ({ ...option, isSelected: selectedBrands.includes(option.value) }));
  });

  readonly hasActiveFilters = computed(() => {
    const f = this.activeFilters();
    return !!(f.categoryIds?.length || f.brandIds?.length || f.searchTerm || f.onSaleOnly || f.inStockOnly || f.isFeatured);
  });

  readonly totalProductCount = computed(() => {
    const categoryFilter = this.filters()?.find(f => f.key === 'categoryIds');
    if (!categoryFilter?.options) return 0;
    const uniqueOptions = new Map(categoryFilter.options.map(opt => [opt.value, opt.count]));
    return Array.from(uniqueOptions.values()).reduce((sum, count) => sum + count, 0);
  });

  constructor() {
    effect(() => {
      const filters = this.filters();
      if (filters) {
        this.updateCategoryTreeWithCounts(filters, this.activeFilters());
      }
    });
  }

  ngOnInit(): void {
    this.loadCategoryTree();
  }

  private async loadCategoryTree(): Promise<void> {
    try {
      const backendCategories = await this.categoryTreeService.getCategoryTreeAsync();
      const treeNodes = this.categoryTreeService.transformToTreeNodes(backendCategories);
      this.categoryTreeSubject.next(treeNodes);
    } catch (error) {
      this.logger.error('[ProductFilterSidebar] Failed to load category tree:', error);
    }
  }

  private updateCategoryTreeWithCounts(filters: FilterDefinition[], activeFilters: ProductFilters): void {
    const categoryFilter = filters.find(f => f.key === 'categoryIds');
    const currentTree = this.categoryTreeSubject.value;
    if (!categoryFilter?.options || currentTree.length === 0) return;

    const enrichedTree = this.categoryTreeService.enrichTreeWithCounts(currentTree, categoryFilter.options, activeFilters.categoryIds);
    this.categoryTreeSubject.next(enrichedTree);
  }

  onCategorySelected(event: CategorySelectionEvent): void {
    const currentSlugs = this.activeFilters().categoryIds || [];
    const newSlugs = event.isSelected
      ? [...currentSlugs, event.node.slug]
      : currentSlugs.filter(slug => slug !== event.node.slug);
    this.filtersChanged.emit({ categoryIds: newSlugs.length > 0 ? newSlugs : undefined, page: 1 });
  }

  onCategoryToggled(event: CategoryToggleEvent): void {
    const updatedTree = this.categoryTreeService.toggleNodeExpanded(this.categoryTreeSubject.value, event.categoryId);
    this.categoryTreeSubject.next(updatedTree);
  }

  onBrandSelectionChange(brandValue: string, isSelected: boolean): void {
    const currentBrandIds = this.activeFilters().brandIds || [];
    const newBrandIds = isSelected
      ? [...currentBrandIds, brandValue]
      : currentBrandIds.filter(id => id !== brandValue);
    this.filtersChanged.emit({ brandIds: newBrandIds.length > 0 ? newBrandIds : undefined, page: 1 });
  }

  clearAllFilters(): void {
    this.filtersChanged.emit({
      page: 1, searchTerm: undefined, categoryIds: undefined, brandIds: undefined,
      onSaleOnly: undefined, inStockOnly: undefined, isFeatured: undefined,
      stockStatuses: undefined, priceRange: undefined,
    });
  }
  
  protected getSelectedCategoryIds(): readonly string[] {
    return this.activeFilters().categoryIds || [];
  }

  protected getSelectedBrandIds(): readonly string[] {
    return this.activeFilters().brandIds || [];
  }
}
