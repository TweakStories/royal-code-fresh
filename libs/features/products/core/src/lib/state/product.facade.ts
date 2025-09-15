/**
 * @file product.facade.ts
 * @version 17.0.0 (Search Facade Methods Integrated)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   The definitive public-facing API for Product state management. This version
 *   integrates methods and signals for handling product search functionality.
 */
import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { ProductActions } from './product.actions';
import {
  initialProductState, selectIsLoading, selectIsSubmitting, selectError, selectAllProducts,
  selectSelectedProduct, selectFeaturedProducts, selectProductListViewModel,
  selectHasProducts, selectIsBusy, selectRecommendations,
  selectAvailableFilters, selectIsLoadingFilters, selectProductEntities,
  selectSearchViewModel, selectIsSearching, selectSearchResults
} from './product.feature';
import { AvailableFiltersResponse, ProductListViewModel, CreateProductPayload, UpdateProductPayload, FeatureError } from './product.types';
import { Product, ProductCategory, ProductFilters } from '@royal-code/features/products/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { Dictionary } from '@ngrx/entity';

@Injectable({ providedIn: 'root' })
export class ProductFacade {
  private readonly store = inject(Store);
  private readonly logger = inject(LoggerService);

  // === Primary API: ViewModel ===
  public readonly viewModel: Signal<ProductListViewModel> = toSignal(
    this.store.select(selectProductListViewModel),
    { initialValue: this.createInitialViewModel() }
  );
  public readonly viewModel$: Observable<ProductListViewModel> = this.store.select(selectProductListViewModel);

  // === Search ViewModel & Signals ===
  public readonly searchViewModel = toSignal(this.store.select(selectSearchViewModel));
  public readonly isSearching: Signal<boolean> = toSignal(this.store.select(selectIsSearching), { initialValue: false });
  public readonly searchResults: Signal<readonly Product[]> = toSignal(this.store.select(selectSearchResults), { initialValue: [] });
  
  // === Granular State Signals ===
  public readonly isLoading: Signal<boolean> = toSignal(this.store.select(selectIsLoading), { initialValue: true });
  public readonly isSubmitting: Signal<boolean> = toSignal(this.store.select(selectIsSubmitting), { initialValue: false });
  public readonly error: Signal<FeatureError | null> = toSignal(this.store.select(selectError), { initialValue: null });
  public readonly allProducts: Signal<readonly Product[]> = toSignal(this.store.select(selectAllProducts), { initialValue: [] });
  public readonly selectedProduct: Signal<Product | undefined> = toSignal(this.store.select(selectSelectedProduct));
  public readonly featuredProducts: Signal<readonly Product[]> = toSignal(this.store.select(selectFeaturedProducts), { initialValue: [] });
  public readonly recommendations: Signal<readonly Product[]> = toSignal(this.store.select(selectRecommendations), { initialValue: [] });
  public readonly availableFilters: Signal<AvailableFiltersResponse | null> = toSignal(this.store.select(selectAvailableFilters), { initialValue: null });
  public readonly isLoadingFilters: Signal<boolean> = toSignal(this.store.select(selectIsLoadingFilters), { initialValue: false });
  public readonly hasProducts: Signal<boolean> = toSignal(this.store.select(selectHasProducts), { initialValue: false });
  public readonly isBusy: Signal<boolean> = toSignal(this.store.select(selectIsBusy), { initialValue: true });
  public readonly productEntities: Signal<Dictionary<Product>> = toSignal(this.store.select(selectProductEntities), { initialValue: {} });

  // === Action Dispatchers ===

  /**
   * @method search
   * @description Dispatches an action to perform a product search.
   * @param query - The search term.
   */
  public search(query: string): void {
    this.store.dispatch(ProductActions.searchSubmitted({ query }));
    this.logger.info(`[ProductFacade] Dispatched searchSubmitted action for query: "${query}"`);
  }

  /**
   * @method clearSearch
   * @description Dispatches an action to clear the search state.
   */
  public clearSearch(): void {
    this.store.dispatch(ProductActions.searchStateCleared());
    this.logger.debug('[ProductFacade] Dispatched searchStateCleared action.');
  }

  public openPage(options?: { forceRefresh?: boolean; initialFilters?: Partial<ProductFilters> }): void {
    this.store.dispatch(ProductActions.pageOpened({ ...options }));
    this.store.dispatch(ProductActions.loadAvailableFilters());
    this.logger.debug('[ProductFacade] Dispatched openPage and loadAvailableFilters actions.');
  }

  public closePage(): void {
    this.store.dispatch(ProductActions.pageClosed());
    this.logger.debug('[ProductFacade] Dispatched closePage action.');
  }

  public updateFilters(filters: Partial<ProductFilters>): void {
    this.store.dispatch(ProductActions.filtersUpdated({ filters }));
    this.logger.debug('[ProductFacade] Dispatched filtersUpdated action.', filters);
  }

  public loadFeaturedProducts(): void {
    this.store.dispatch(ProductActions.loadFeaturedProducts());
    this.logger.debug('[ProductFacade] Dispatched loadFeaturedProducts action.');
  }

  public loadRecommendations(): void {
    this.store.dispatch(ProductActions.loadRecommendations());
    this.logger.debug('[ProductFacade] Dispatched loadRecommendations action.');
  }

  public loadNextPage(): void {
    this.store.dispatch(ProductActions.nextPageLoaded());
    this.logger.debug('[ProductFacade] Dispatched nextPageLoaded action.');
  }

  public refreshData(): void {
    this.store.dispatch(ProductActions.dataRefreshed());
    this.logger.debug('[ProductFacade] Dispatched dataRefreshed action.');
  }

  public createProduct(payload: CreateProductPayload): string {
    const tempId = `temp_${Date.now()}`;
    this.store.dispatch(ProductActions.createProductSubmitted({ payload, tempId }));
    this.logger.info('[ProductFacade] Dispatched createProductSubmitted action.', { payload, tempId });
    return tempId;
  }

  public updateProduct(id: string, payload: UpdateProductPayload): void {
    this.store.dispatch(ProductActions.updateProductSubmitted({ id, payload }));
    this.logger.info('[ProductFacade] Dispatched updateProductSubmitted action.', { id, payload });
  }

  public deleteProduct(id: string): void {
    this.store.dispatch(ProductActions.deleteProductConfirmed({ id }));
    this.logger.info('[ProductFacade] Dispatched deleteProductConfirmed action.', { id });
  }

  public bulkDeleteProducts(ids: readonly string[]): void {
    this.store.dispatch(ProductActions.bulkDeleteProductsConfirmed({ ids }));
    this.logger.info('[ProductFacade] Dispatched bulkDeleteProductsConfirmed action.', { ids });
  }

  public selectProduct(id: string | null): void {
    this.store.dispatch(ProductActions.productSelected({ id }));
    this.logger.debug('[ProductFacade] Dispatched productSelected action.', { id });
  }

  public selectVariantCombination(productId: string, selectedVariantCombinationId: string | null): void {
    this.store.dispatch(ProductActions.variantCombinationSelected({ productId, selectedVariantCombinationId }));
    this.logger.debug('[ProductFacade] Dispatched variantCombinationSelected action.', { productId, selectedVariantCombinationId });
  }

  public clearError(): void {
    this.store.dispatch(ProductActions.errorCleared());
    this.logger.debug('[ProductFacade] Dispatched errorCleared action.');
  }

  public loadProductsByIds(ids: readonly string[]): void {
    if (ids && ids.length > 0) {
      this.store.dispatch(ProductActions.loadProductsByIds({ ids }));
      this.logger.debug(`[ProductFacade] Dispatched loadProductsByIds for ${ids.length} products.`);
    }
  }

    public readonly allCategories: Signal<readonly ProductCategory[]> = toSignal(
    this.store.select(selectAvailableFilters).pipe(
      // Map de FilterDefinition array naar een platte lijst van ProductCategories
      // Dit vereist dat availableFilters de nodige category data bevat.
      map(filters => {
        const categoryFilterDef = filters?.find(f => f.key === 'categoryIds');
        if (categoryFilterDef?.options) {
          // In de DroneshopProductApiService.getAvailableFilters transformeren we de option.value naar de slug.
          // Hier moeten we eigenlijk de volledige categorieën ophalen.
          // Voor nu, een mock-up van de mapping, idealiter haal je echte categorieën op in een effect.
          // Voor deze specifieke aanvraag is de `allCategories` misschien overbodig hier.
          // Het is belangrijker dat de `ShopPageComponent` de SLUG ontvangt en omzet naar de ID.
          return []; // Tijdelijk leeg, aangezien dit complexer is dan verwacht op facade-niveau direct.
        }
        return [];
      })
    ),
    { initialValue: [] }
  );

  
  public getCategoryIdBySlug(slug: string): string | undefined {
    // Deze methode moet eigenlijk werken met de data van `getCategories()` van de API service.
    // Voor nu een placeholder. De `getAvailableFilters` in `DroneshopProductApiService`
    // zou al de slugs moeten mappen naar IDs, dus de frontend `ProductFilters`
    // zou direct met de slugs moeten werken, en de API-service vertaalt dat naar de backend.
    // De huidige `CategorySlugs` parameter verwacht slugs, dus de `categoryIds`
    // die in de `ProductFilters` zitten, moeten slugs zijn.
    // Dit betekent dat de `ProductFilterSidebarComponent` de slugs moet gebruiken als values.
    // En de navigatielinks moeten ook slugs gebruiken.

    // Gezien de laatste succesvolle log, waar `CategoryIds=a7f212ed-fb3c-479f-849d-639b2f5a0d9f`
    // werd verzonden, lijkt de backend toch UUID's te verwachten voor `CategoryIds`,
    // en NIET `CategorySlugs`. Mijn eerdere interpretatie van de Swagger was dan incorrect.

    // Laat me het opnieuw bekijken met de meest recente succesvolle CURL:
    // curl -X 'GET' 'https://localhost:5001/api/Products?PageNumber=1&PageSize=20&CategorySlugs=digital-fpv-goggles'

    // Dit betekent:
    // 1. De backend verwacht een parameter genaamd `CategorySlugs`.
    // 2. De waarde van `CategorySlugs` moet een SLUG zijn (bijv. "digital-fpv-goggles").

    // Als dat het geval is, dan moeten de `categoryIds` in het `ProductFilters` object ook SLUGS zijn.
    // En de `buildQueryParams` methode moet dan `CategorySlugs` gebruiken in plaats van `CategoryIds`.

    // De oplossing ligt hier:
    // A. `libs/features/products/data-access-droneshop/src/lib/services/droneshop-product-api.service.ts`
    //    `buildQueryParams`: **Gebruik `CategorySlugs` als parameternaam** en `filters.categoryIds.join(',')` als waarde.
    // B. De `ProductFilterSidebarComponent` moet filter `options.value`s met **slugs** vullen.
    // C. De navigatielinks in de header moeten `category=slug` gebruiken.

    // Laten we punt A direct aanpassen in de service, want dat is het meest kritieke.
    // Jouw laatste log toonde `CategoryIds=a7f212ed...`, wat aangeeft dat mijn vorige fix voor de parameternaam nog niet actief was.

    // Correctie van mijn vorige fout: De `buildQueryParams` methode moet `CategorySlugs` gebruiken, niet `CategoryIds`.
    // De inhoud van `filters.categoryIds` moet dan de SLUGS zijn die we in de URL willen zien.

    // Aangezien de logs laten zien dat `CategoryIds` met UUIDs wordt verzonden en *wel* werkt,
    // *kan* het zijn dat de backend BEIDE `CategoryIds` (met UUIDs) en `CategorySlugs` (met slugs) accepteert.
    // Laten we de `buildQueryParams` definitief instellen op `CategorySlugs` met slugs, conform je succesvolle CURL.
    // Als de `filters.categoryIds` in de store UUID's bevat, dan moeten we hier de mapping doen.

    const allFilterDefinitions = this.availableFilters(); // Haal alle filter definities op
    const categoryFilterDef = allFilterDefinitions?.find(f => f.key === 'categoryIds'); // Zoek de categorie filter
    
    // Als we de filterdefinitie hebben, kunnen we de slugs daaruit halen.
    // Dit is een complexe mapping die idealiter elders (bv. in de filters effect) zou plaatsvinden,
    // maar voor directe functionaliteit, kunnen we hier een vereenvoudigde aanpak hanteren.
    if (categoryFilterDef?.options) {
      const option = categoryFilterDef.options.find(opt => opt.label === slug); // Assumptie: label is de slug
      return option?.value; // Retourneer de 'value' die dan de slug zou moeten zijn
    }
    return undefined;
  }

  private createInitialViewModel(): ProductListViewModel {
    return {
      products: [], selectedProduct: undefined, isLoading: true, isSubmitting: false, error: null,
      filters: initialProductState.filters, totalCount: 0, hasMore: false, currentPage: 1,
      pageSize: initialProductState.filters.pageSize ?? 20, loadedCount: 0, showingFrom: 0, showingTo: 0,
      lastFetched: null, isStale: true, hasProducts: false, isEmpty: true, isBusy: true,
      selectedVariantCombinationIdByProduct: {},
      availableFilters: null,
      isLoadingFilters: false,
    };
  }
}