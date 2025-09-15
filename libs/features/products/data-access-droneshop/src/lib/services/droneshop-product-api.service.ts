/**
 * @file droneshop-product-api.service.ts
 * @Version 5.1.0 (DEFINITIVE FIX: Category Count Mapping Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-07
 * @Description
 *   Definitieve, werkende versie van de API-service. De kritieke bug die ervoor
 *   zorgde dat filter-tellingen op 0 bleven, is opgelost. De `getAvailableFilters`
 *   methode past nu alleen de 'label' van categorie-opties aan en laat de 'value'
 *   (de UUID) intact, waardoor de `CategoryTreeService` de tellingen correct kan koppelen.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap, map, tap } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractProductApiService, BackendPaginatedListDto, BackendProductListItemDto, BackendProductDetailDto } from '@royal-code/features/products/core';
import { ProductCategory, ProductFilters, AvailableFiltersResponse} from '@royal-code/features/products/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { SearchSuggestionResponse } from '@royal-code/features/products/domain';

interface BackendCategory {
  id: string;
  key: string;
  parentId: string | null;
  children: BackendCategory[];
}

@Injectable({ providedIn: 'root' })
export class DroneshopProductApiService extends AbstractProductApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Products`;
  private readonly searchApiUrl = `${this.config.backendUrl}/Search`;
  private readonly logPrefix = '[DroneshopProductApiService]';
  private readonly logger = inject(LoggerService);

  public override getProducts(filters?: ProductFilters | null): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(this.apiUrl, { params });
  }

  public override getAvailableFilters(currentFilters?: ProductFilters | null): Observable<AvailableFiltersResponse> {
    const params = this.buildQueryParams(currentFilters);
    return this.http.get<AvailableFiltersResponse>(`${this.apiUrl}/filters`, { params }).pipe(
      switchMap(filterDefs => {
        const categoryFilter = filterDefs.find(f => f.key === 'categoryIds');
        if (categoryFilter?.options?.length) {
          return this.getBackendCategories().pipe(
            map(backendCategories => {
              const categoryMap = new Map<string, { key: string; displayName: string }>();
              this.buildCategoryMapFromBackend(backendCategories, categoryMap);

              // --- DE FIX: Pas alleen het label aan, laat de 'value' (UUID) intact ---
              const updatedCategoryOptions = categoryFilter.options!.map(option => {
                const categoryInfo = categoryMap.get(option.value); // option.value is de UUID
                return {
                  ...option,
                  // Gebruik de meer beschrijvende naam uit de tree als label, maar BEHOUD DE ORIGINELE 'value'
                  label: categoryInfo?.displayName || option.label
                };
              });

              return filterDefs.map(f =>
                f.key === 'categoryIds'
                  ? { ...f, options: updatedCategoryOptions }
                  : f
              );
            })
          );
        }
        return of(filterDefs);
      })
    );
  }

  private getBackendCategories(): Observable<BackendCategory[]> {
    return this.http.get<BackendCategory[]>(`${this.apiUrl}/categories`);
  }

  private buildCategoryMapFromBackend(categories: BackendCategory[], map: Map<string, { key: string; displayName: string }>): void {
    categories.forEach(category => {
      const displayName = category.key.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) || category.key;
      map.set(category.id, { key: category.key, displayName });
      if (category.children?.length) {
        this.buildCategoryMapFromBackend(category.children, map);
      }
    });
  }

  public override getCategories(): Observable<ProductCategory[]> {
    return this.getBackendCategories().pipe(
      map(backendCategories => this.transformToProductCategories(backendCategories))
    );
  }

  private transformToProductCategories(backendCategories: BackendCategory[]): ProductCategory[] {
    return backendCategories.map(cat => ({
      id: cat.id,
      key: cat.key,
      name: cat.key.split('.').pop() || cat.key,
      slug: cat.key,
      parentId: cat.parentId,
      isActive: true,
      children: cat.children ? this.transformToProductCategories(cat.children) : []
    }));
  }

  public override getProductById(productId: string): Observable<BackendProductDetailDto> {
    return this.http.get<BackendProductDetailDto>(`${this.apiUrl}/${productId}`);
  }

  public override getProductsByIds(productIds: readonly string[]): Observable<BackendProductListItemDto[]> {
    if (productIds.length === 0) return of([]);
    let params = new HttpParams();
    productIds.forEach(id => { params = params.append('ids', id); });
    return this.http.get<BackendProductListItemDto[]>(`${this.apiUrl}/by-ids`, { params });
  }

  public override getFeaturedProducts(): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(`${this.apiUrl}/featured`);
  }

  public override getRecommendations(count: number = 8): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(`${this.apiUrl}/recommendations`, { params });
  }

  public override searchProducts(query: string, filters?: ProductFilters | null): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    let httpParams = new HttpParams().set('q', query);
    if (filters) {
      const filterParams = this.buildQueryParams(filters);
      filterParams.keys().forEach(key => {
        const values = filterParams.getAll(key);
        if (values) {
          values.forEach(value => { httpParams = httpParams.append(key, value); });
        }
      });
    }
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(`${this.searchApiUrl}/products`, { params: httpParams });
  }

  public override getSuggestions(query: string): Observable<SearchSuggestionResponse> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchSuggestionResponse>(`${this.searchApiUrl}/suggest`, { params });
  }

  private buildQueryParams(filters?: ProductFilters | null): HttpParams {
    let params = new HttpParams();
    if (!filters) return params;

    params = params.set('PageNumber', (filters.page ?? 1).toString());
    params = params.set('PageSize', (filters.pageSize ?? 20).toString());
    if (filters.sortBy) params = params.set('SortBy', filters.sortBy as string);
    if (filters.sortDirection) params = params.set('SortDirection', filters.sortDirection);
    if (filters.categoryIds?.length) filters.categoryIds.forEach(slug => { params = params.append('CategorySlugs', slug); });
    if (filters.brandIds?.length) filters.brandIds.forEach(brand => { params = params.append('Brands', brand); });
    if (filters.searchTerm?.trim()) params = params.set('SearchTerm', filters.searchTerm.trim());
    if (filters.priceRange?.min !== undefined) params = params.set('MinPrice', filters.priceRange.min.toString());
    if (filters.priceRange?.max !== undefined) params = params.set('MaxPrice', filters.priceRange.max.toString());
    if (filters.minimumRating !== undefined) params = params.set('MinRating', filters.minimumRating.toString());
    if (filters.onSaleOnly === true) params = params.set('OnSaleOnly', 'true');
    if (filters.stockStatuses?.length) filters.stockStatuses.forEach(status => { params = params.append('StockStatus', status); });

    return params;
  }
  
  // Placeholder implementations
  public override getPredefinedAttributes(): Observable<any> { return of({}); }
  public override getCustomAttributeDefinitions(): Observable<any[]> { return of([]); }
  public override updatePhysicalStock(productId: string, variantInstanceId: string | undefined, changeInQuantity: number, reason: string, userId: string): Observable<BackendProductDetailDto> { return of({} as BackendProductDetailDto); }
  public override createProduct(payload: any): Observable<BackendProductDetailDto> { return of({} as BackendProductDetailDto); }
  public override updateProduct(id: string, payload: any): Observable<BackendProductDetailDto> { return of({} as BackendProductDetailDto); }
  public override deleteProduct(id: string): Observable<void> { return of(undefined); }
  public override bulkDeleteProducts(ids: string[]): Observable<void> { return of(undefined); }
  public override getLookups(): Observable<any> { return of({}); }
  public override getTags(searchTerm?: string): Observable<any[]> { return of([]); }
}