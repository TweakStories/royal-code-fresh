/**
 * @file droneshop-products-overview.component.ts
 * @Version 2.1.0 (DEFINITIVE: Robust Initialization & QueryParam Handling)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description
 *   De definitieve, robuuste product overzichtspagina. Deze versie implementeert
 *   een architectonisch correct patroon om race conditions bij het initialiseren
 *   van de pagina en het lezen van URL query parameters te elimineren. De component
 *   triggert nu expliciet het laden van de beschikbare filters en producten bij
 *   initialisatie en reageert daarna op wijzigingen.
 */
import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil, map, distinctUntilChanged } from 'rxjs/operators';

// Core & Facades
import { ProductFacade } from '@royal-code/features/products/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { ProductFilters } from '@royal-code/features/products/domain';

// UI Components
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { ProductFilterSidebarUpgradedComponent, ProductGridComponent } from '@royal-code/ui/products';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';

@Component({
  selector: 'droneshop-products-overview',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    UiTitleComponent,
    UiParagraphComponent,
    ProductGridComponent,
    ProductFilterSidebarUpgradedComponent,
    UiSpinnerComponent,
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <header class="mb-6">
        <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'droneshop.products.pageTitle' | translate" />
        <royal-code-ui-paragraph color="muted">
          {{ 'droneshop.products.overviewMessage' | translate }}
        </royal-code-ui-paragraph>
      </header>

      <div class="flex flex-col md:flex-row gap-8">
        <!-- Filter Sidebar -->
        <royal-code-ui-product-filter-sidebar-upgraded
          [filters]="productFacade.viewModel().availableFilters"
          [activeFilters]="productFacade.viewModel().filters"
          [isLoadingFilters]="productFacade.viewModel().isLoadingFilters"
          (filtersChanged)="onFiltersChanged($event)"
          class="w-full md:w-auto md:w-60 lg:w-72 xl:w-80"
        />

        <!-- Product Grid -->
        <main class="flex-grow">
          @if (productFacade.viewModel().isLoading) {
            <div class="flex justify-center items-center h-96">
              <royal-code-ui-spinner size="xl" />
            </div>
          } @else if (productFacade.viewModel().isEmpty) {
            <div class="text-center py-12">
              <p>{{ 'productFilters.noResults' | translate }}</p>
            </div>
          } @else {
            <royal-code-ui-product-grid [products]="productFacade.viewModel().products" />
            <!-- Hier komt de paginatie -->
          }
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopProductsOverviewComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  protected readonly productFacade = inject(ProductFacade);
  private readonly logger = inject(LoggerService);
  private readonly destroy$ = new Subject<void>();

  readonly TitleTypeEnum = TitleTypeEnum;

  ngOnInit(): void {
    // Stap 1: Lees de *initiële* filters direct van de URL snapshot.
    const initialParams = this.route.snapshot.queryParamMap;
    const initialFilters = this.mapParamsToFilters(initialParams);

    // Stap 2: Dispatch de 'Page Opened' actie met deze initiële filters.
    // Dit zorgt ervoor dat de state correct wordt geïnitialiseerd en de beschikbare filters worden geladen.
    this.productFacade.openPage({ initialFilters });

    // Stap 3: Abonneer op *toekomstige* wijzigingen in de URL.
    // Dit handelt navigatie binnen de app af (bv. klikken op een categorie in de header).
    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$),
      map(params => this.mapParamsToFilters(params)),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(filtersFromUrl => {
      this.logger.info(`[ProductsOverview] URL parameters changed, updating filters.`, filtersFromUrl);
      this.productFacade.updateFilters(filtersFromUrl);
    });
  }

  ngOnDestroy(): void {
    this.productFacade.closePage();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFiltersChanged(filters: Partial<ProductFilters>): void {
    this.productFacade.updateFilters(filters);
  }

  /**
   * Een private helper-functie om de URL-parameters om te zetten naar een filterobject.
   * @param params - De ParamMap van de ActivatedRoute.
   * @returns Een Partial<ProductFilters> object.
   */
  private mapParamsToFilters(params: ParamMap): Partial<ProductFilters> {
    let newFilters: Partial<ProductFilters> = {};
    if (params.has('category')) {
      // De backend verwacht een array van slugs voor 'categoryIds'
      newFilters = {
        ...newFilters,
        categoryIds: [params.get('category')!]
      };
    }
    // Voeg hier andere parameter-mappings toe indien nodig
    // if (params.has('brand')) { ... }
    return newFilters;
  }
}