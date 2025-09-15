/**
 * @file search-results.component.ts
 * @Version 2.0.0 (Enhanced with Sidebar Filters & Promo Cards)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Smart component for displaying product search results, now enhanced with
 *   a filter sidebar and promotional full-width image cards. It manages
 *   search filters, UI settings, and displays results.
 */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductFacade, ProductSortField } from '@royal-code/features/products/core';
import { ProductFilters } from '@royal-code/features/products/domain'; // Importeer ProductFilters
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { StorageService } from '@royal-code/core/storage'; // Import StorageService
import { UiFullWidthImageCardComponent } from '@royal-code/ui/cards/full-width-image-card'; 
import { ProductOverviewComponent } from '../product-overview/product-overview.component'; 
import { ProductFilterSidebarUpgradedComponent } from '@royal-code/ui/products';

// Definieer een interface voor de UI-instellingen (vergelijkbaar met ShopPage)
interface SearchPageUiSettings {
  isSidebarVisible: boolean;
  gridColumns: number;
}
const SEARCH_PAGE_UI_SETTINGS_KEY = 'droneshop_search_ui_settings';

@Component({
  selector: 'droneshop-search-results',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    UiSpinnerComponent,
    UiTitleComponent,
    UiParagraphComponent,
    UiIconComponent,
    ProductFilterSidebarUpgradedComponent,
    UiFullWidthImageCardComponent,
    ProductOverviewComponent, // Voor de weergavecontrols
  ],
  template: `
    <div class="search-results-page-container flex flex-row gap-4 lg:gap-6 p-4 lg:p-6 transition-all duration-300">
      <!-- Sidebar met Filters -->
      @if (isSidebarVisible()) {
        <royal-code-ui-product-filter-sidebar-upgraded
          [filters]="facade.availableFilters()"
          [activeFilters]="currentFilters()"
          [isLoadingFilters]="facade.isLoadingFilters()"
          (filtersChanged)="handleFiltersChange($event)"
          class="order-1 md:order-none" />
      }

      <main class="flex-grow min-w-0 order-2 md:order-none space-y-8">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H1" 
          [text]="'search.resultsTitle' | translate: { query: currentSearchQuery() }"
          extraClasses="!mb-2" />

        <!-- Zoekresultaten Weergave -->
        @if (facade.isSearching()) {
          <div class="flex flex-col items-center justify-center p-12 text-secondary gap-4">
            <royal-code-ui-spinner size="xl" />
            <royal-code-ui-paragraph>{{ 'search.loading' | translate: { query: currentSearchQuery() } }}</royal-code-ui-paragraph>
          </div>
        } @else {
          @if (facade.searchResults().length > 0) {
            <royal-code-ui-paragraph color="muted" extraClasses="mb-6">
              {{ 'search.resultsFound' | translate: { count: facade.searchResults().length } }}
            </royal-code-ui-paragraph>
            <!-- Gebruik ProductOverviewComponent voor weergave controls -->
            <droneshop-royal-code-product-overview
                [products]="facade.searchResults()"
                [initialViewMode]="currentViewMode()"
                [isLoading]="facade.isSearching()"
                [initialSortBy]="currentSortBy()"
                [initialSortDirection]="currentFilters().sortDirection ?? 'asc'"
                [gridColumns]="gridColumns()"
                [isSidebarVisible]="isSidebarVisible()"
                (viewModeChanged)="handleViewModeChange($event)"
                (sortChanged)="handleSortChange($event)"
                (gridColumnsChanged)="onGridColumnsChange($event)"
                (sidebarToggled)="onSidebarToggled()"
            />
          } @else {
            <!-- Geen Resultaten Gevonden -->
            <div class="text-center p-12 bg-surface-alt rounded-xs border border-border">
              <royal-code-ui-icon [icon]="AppIcon.SearchX" sizeVariant="xl" extraClass="text-secondary mb-4" />
              <royal-code-ui-title 
                [level]="TitleTypeEnum.H3" 
                [text]="'search.noResults' | translate: { query: currentSearchQuery() }" />
              <royal-code-ui-paragraph color="muted">
                {{ 'search.noResultsSuggestion' | translate }}
              </royal-code-ui-paragraph>
            </div>
          }
        }

        <!-- Promotiekaarten onderaan -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          @for (card of promoCards(); track card.titleKey) {
            <royal-code-ui-full-width-image-card
              [imageUrl]="card.imageUrl"
              [titleKey]="card.titleKey"
              [subtitleKey]="card.subtitleKey"
              [buttonTextKey]="card.buttonTextKey"
              [route]="card.route"
              [textAlign]="card.textAlign"
              class="h-64"
            />
          }
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  readonly facade = inject(ProductFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();
  private readonly storageService = inject(StorageService); // Injecteer StorageService
  private readonly translateService = inject(TranslateService);

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  
  // Lokale state voor UI-instellingen
  readonly isSidebarVisible = signal<boolean>(true);
  readonly gridColumns = signal<number>(4);
  readonly currentViewMode = signal<'grid' | 'list'>('grid');

  // Computed signal voor de huidige zoekquery uit de URL (voor weergave in de titel)
  readonly currentSearchQuery = computed(() => this.facade.searchViewModel()?.query || '');
  // Computed signal voor de actieve filters (inclusief sorteerinstellingen)
  readonly currentFilters = computed(() => this.facade.viewModel().filters);
  readonly currentSortBy = computed<ProductSortField>(() => (this.currentFilters().sortBy as ProductSortField) ?? 'name');

  // Promotiekaarten data
  readonly promoCards = signal([
    {
      imageUrl: 'images/promo-drone-sale.webp', // Zorg dat deze afbeelding bestaat
      titleKey: 'searchPage.promo.saleTitle',
      subtitleKey: 'searchPage.promo.saleSubtitle',
      buttonTextKey: 'searchPage.promo.saleCta',
      route: '/sale',
      textAlign: 'left' as 'left' | 'right',
    },
    {
      imageUrl: 'images/promo-guides.webp', // Zorg dat deze afbeelding bestaat
      titleKey: 'searchPage.promo.guidesTitle',
      subtitleKey: 'searchPage.promo.guidesSubtitle',
      buttonTextKey: 'searchPage.promo.guidesCta',
      route: '/guides',
      textAlign: 'right' as 'left' | 'right',
    },
  ]);

  constructor() {
    // Laad UI-instellingen bij initiële constructie
    this.loadUiSettings();

    // Effect om instellingen op te slaan bij wijzigingen
    effect(() => {
      const settings: SearchPageUiSettings = {
        isSidebarVisible: this.isSidebarVisible(),
        gridColumns: this.gridColumns(),
      };
      this.storageService.setItem(SEARCH_PAGE_UI_SETTINGS_KEY, settings);
    });
  }

ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map(params => params.get('q')),
      distinctUntilChanged(),
      tap(query => {
        const currentFilters = this.currentFilters(); // Haal de huidige filters op

        this.facade.openPage({
          initialFilters: { 
            ...currentFilters, // Behoud bestaande filters
            searchTerm: query || undefined, 
            page: 1 
          },
          forceRefresh: true // Forceer een refresh voor de zoekresultaten
        });
        
        this.facade.search(query || '');
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy(): void {
    this.facade.clearSearch();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUiSettings(): void {
    const settings = this.storageService.getItem<SearchPageUiSettings>(SEARCH_PAGE_UI_SETTINGS_KEY);
    if (settings) {
      this.isSidebarVisible.set(settings.isSidebarVisible);
      this.gridColumns.set(settings.gridColumns);
    }
  }

  // === Event Handlers voor ProductOverviewComponent ===
  handleViewModeChange(mode: 'grid' | 'list'): void {
    this.currentViewMode.set(mode);
  }

  handleSortChange(sortData: { sortBy: string; sortDirection: 'asc' | 'desc' }): void {
    // Update de filters in de facade
    this.facade.updateFilters({ ...this.currentFilters(), ...sortData, page: 1 });
    // Trigger een nieuwe zoekopdracht met de bijgewerkte filters
    this.facade.search(this.currentSearchQuery());
  }

  onGridColumnsChange(columns: number): void {
    this.gridColumns.set(columns);
  }

  onSidebarToggled(): void {
    this.isSidebarVisible.update(visible => !visible);
  }

  // === Event Handler voor ProductFilterSidebarComponent ===
  handleFiltersChange(newFilters: Partial<ProductFilters>): void {
    // Voeg de huidige zoekterm toe aan de nieuwe filters
    const updatedFilters: ProductFilters = {
      ...this.currentFilters(),
      ...newFilters,
      searchTerm: this.currentSearchQuery(), // Behoud de zoekterm
      page: 1 // Reset pagina bij nieuwe filters
    };
    this.facade.updateFilters(updatedFilters);
    this.facade.search(this.currentSearchQuery()); // Trigger nieuwe zoekopdracht met bijgewerkte filters
  }
}