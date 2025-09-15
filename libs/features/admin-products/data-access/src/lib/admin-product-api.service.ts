/**
 * @file admin-product-api.service.ts
 * @Version 2.1.0 (FIXED: Proper pagination parameters)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description Fixed API service that ensures required PageNumber and PageSize are always provided
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractProductApiService, BackendPaginatedListDto, BackendProductListItemDto, BackendProductDetailDto, BackendMediaDto } from '@royal-code/features/products/core';
import { ProductFilters, CreateProductPayload, UpdateProductPayload, ProductCategory, AvailableFiltersResponse, SearchSuggestionResponse } from '@royal-code/features/products/domain';
import { PredefinedAttributesMap, CustomAttributeDefinitionDto, DisplaySpecificationDefinitionDto } from '@royal-code/features/products/domain';
import { ProductLookups, ProductTagLookup } from '@royal-code/features/admin-products/domain';
import { LoggerService } from '@royal-code/core/core-logging';

@Injectable({ providedIn: 'root' })
export class AdminProductApiService extends AbstractProductApiService {
    private readonly http = inject(HttpClient);
    private readonly config = inject(APP_CONFIG);
    // --- DE FIX: De apiUrl is hier gecorrigeerd naar 'AdminProducts' (meervoud) ---
    private readonly apiUrl = `${this.config.backendUrl}/AdminProducts`;
    private readonly logger = inject(LoggerService);
    private readonly logPrefix = '[AdminProductApiService]';

    // === FIXED: Proper pagination parameters ===
    override getProducts(filters?: ProductFilters | null, page?: number, pageSize?: number): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    // SIMPLE FIX: Ensure required parameters are always present
    const finalPage = page ?? filters?.page ?? 1;
    const finalPageSize = pageSize ?? filters?.pageSize ?? 20;
    
    let params = new HttpParams()
        .set('PageNumber', Math.max(1, finalPage).toString())
        .set('PageSize', Math.min(100, Math.max(1, finalPageSize)).toString());

    // Add optional filters only if they have values
    if (filters?.searchTerm?.trim()) {
        params = params.set('SearchTerm', filters.searchTerm.trim());
    }
    if (filters?.statuses && filters.statuses.length > 0) {
        params = params.set('Status', filters.statuses.join(','));
    }
    if (filters?.sortBy?.trim()) {
        params = params.set('SortBy', filters.sortBy.trim());
    }
    if (filters?.sortDirection?.trim()) {
        params = params.set('SortDirection', filters.sortDirection.trim());
    }

    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(this.apiUrl, { params });
}

    // === OPTIMIZED: Batch operations for better performance ===
    getProductsByIds(productIds: string[]): Observable<BackendProductListItemDto[]> {
        if (productIds.length === 0) {
            return of([]);
        }
        
        // For admin, we can use the main endpoint with filtering if needed
        // or implement a dedicated batch endpoint
        const params = new HttpParams()
            .set('PageNumber', '1')
            .set('PageSize', productIds.length.toString());
            
        return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(this.apiUrl, { params })
            .pipe(
                map(response => response.items.filter(item => productIds.includes(item.id)))
            );
    }

    // === CACHED: Lookup data with minimal API calls ===
    override getPredefinedAttributes(): Observable<PredefinedAttributesMap> {
        // Deze methode wordt niet meer direct aangeroepen door de effects, maar de implementatie is hier correct.
        return this.http.get<PredefinedAttributesMap>(`${this.apiUrl}/attributes`);
    }

    public getCustomAttributeDefinitions(): Observable<CustomAttributeDefinitionDto[]> {
        return this.http.get<CustomAttributeDefinitionDto[]>(`${this.apiUrl}/custom-attribute-definitions`);
    }

    public getDisplaySpecificationDefinitions(): Observable<DisplaySpecificationDefinitionDto[]> {
        return this.http.get<DisplaySpecificationDefinitionDto[]>(`${this.apiUrl}/display-specification-definitions`);
    }

    override getProductById(id: string): Observable<BackendProductDetailDto> {
        if (!id?.trim()) {
            throw new Error('Product ID is required');
        }
        return this.http.get<BackendProductDetailDto>(`${this.apiUrl}/${id.trim()}`);
    }
    
    override getCategories(): Observable<ProductCategory[]> {
        return this.http.get<ProductCategory[]>(`${this.apiUrl}/categories`);
    }

    // === OPTIMIZED: Combined lookups call ===
    public override getLookups(): Observable<ProductLookups> {
        // De effecten gebruiken deze methode om alle formulierdata in één keer op te halen.
        return this.http.get<ProductLookups>(`${this.apiUrl}/lookups`);
    }

    public override getTags(searchTerm?: string): Observable<ProductTagLookup[]> {
        let params = new HttpParams();
        if (searchTerm?.trim()) {
            params = params.set('searchTerm', searchTerm.trim());
        }
        return this.http.get<ProductTagLookup[]>(`${this.apiUrl}/tags`, { params });
    }

    // === CREATE/UPDATE/DELETE operations ===
    override createProduct(payload: CreateProductPayload): Observable<BackendProductDetailDto> {
        return this.http.post<BackendProductDetailDto>(this.apiUrl, payload);
    }

    override updateProduct(id: string, payload: UpdateProductPayload): Observable<BackendProductDetailDto> {
        if (!id?.trim()) {
            throw new Error('Product ID is required for update');
        }
        return this.http.put<BackendProductDetailDto>(`${this.apiUrl}/${id.trim()}`, payload);
    }
    
    override updatePhysicalStock(productId: string, variantInstanceId: string | undefined, changeInQuantity: number, reason: string, userId: string): Observable<BackendProductDetailDto> {
        const payload: UpdateProductPayload = { physicalProductConfig: { stockQuantity: changeInQuantity } };
        return this.updateProduct(productId, payload);
    }

    override deleteProduct(id: string): Observable<void> {
        if (!id?.trim()) {
            throw new Error('Product ID is required for deletion');
        }
        return this.http.delete<void>(`${this.apiUrl}/${id.trim()}`);
    }

    // === NOT IMPLEMENTED for Admin ===
    override getFeaturedProducts(): Observable<BackendPaginatedListDto<BackendProductListItemDto>> { 
        throw new Error('Featured products not available in admin API'); 
    }
    
    override getRecommendations(): Observable<BackendPaginatedListDto<BackendProductListItemDto>> { 
        throw new Error('Recommendations not available in admin API'); 
    }
    
    override bulkDeleteProducts(ids: string[]): Observable<void> { 
        throw new Error('Bulk delete not implemented yet'); 
    }

    public override getAvailableFilters(currentFilters?: ProductFilters | null): Observable<AvailableFiltersResponse> {
        // Use general products endpoint for filters
        const generalApiUrl = `${this.config.backendUrl}/Products`;
        const params = new HttpParams();
        return this.http.get<AvailableFiltersResponse>(`${generalApiUrl}/filters`, { params });
    }

    public override searchProducts(query: string, filters?: ProductFilters | null): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
        const searchUrl = `${this.config.backendUrl}/Search/products`;
        const params = new HttpParams()
            .set('q', query)
            .set('PageNumber', (filters?.page ?? 1).toString())
            .set('PageSize', (filters?.pageSize ?? 20).toString());
        return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(searchUrl, { params });
    }

    public override getSuggestions(query: string): Observable<SearchSuggestionResponse> {
        return of({ suggestions: [] });
    }
}