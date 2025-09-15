/**
 * @file plushie-product-api.service.ts
 * @Version 2.0.0 (Corrected getProductsByIds)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-09
 * @Description
 *   Concrete implementation of the AbstractProductApiService for the
 *   Plushie Paradise backend. This version corrects the `getProductsByIds`
 *   method to use an HTTP GET request with query parameters, resolving the
 *   405 Method Not Allowed error.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractProductApiService, BackendPaginatedListDto, BackendProductListItemDto, BackendProductDetailDto, BackendMediaDto } from '@royal-code/features/products/core';
import { ProductCategory, ProductType, ProductStatus, CreateProductPayload, ProductFilters, UpdateProductPayload } from '@royal-code/features/products/domain';
import { CustomAttributeDefinitionDto, PredefinedAttributesMap } from '@royal-code/features/admin-products/core';
import { ProductLookups, ProductTagLookup } from '@royal-code/features/admin-products/domain';

@Injectable({ providedIn: 'root' })
export class PlushieProductApiService extends AbstractProductApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Products`;

  public override getRecommendations(count: number = 8): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(`${this.apiUrl}/recommendations`, { params });
    }

  public override getProducts(
    filters?: ProductFilters | null,
    page?: number,
    pageSize?: number
  ): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    const params = this.buildQueryParams(filters, page, pageSize);
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(this.apiUrl, { params });
  }

  public override getPredefinedAttributes(): Observable<PredefinedAttributesMap> {
       return this.http.get<PredefinedAttributesMap>(`${this.apiUrl}/attributes`);
  }

      public getCustomAttributeDefinitions(): Observable<CustomAttributeDefinitionDto[]> {
        return this.http.get<CustomAttributeDefinitionDto[]>(`${this.apiUrl}/custom-attribute-definitions`);
    }


  public override getFeaturedProducts(): Observable<BackendPaginatedListDto<BackendProductListItemDto>> {
    return this.http.get<BackendPaginatedListDto<BackendProductListItemDto>>(`${this.apiUrl}/featured`);
  }

  public override getProductById(productId: string): Observable<BackendProductDetailDto> {
    return this.http.get<BackendProductDetailDto>(`${this.apiUrl}/${productId}`);
  }

  public override getCategories(): Observable<ProductCategory[]> {
    return of([]);
  }

  public override getVariantImages(productId: string, attributeValueId: string): Observable<BackendMediaDto[]> {
    const mediaApiUrl = `${this.config.backendUrl}/Media`;
    const correctUrl = `${mediaApiUrl}/product/${productId}/attribute-value/${attributeValueId}`;
    return this.http.get<BackendMediaDto[]>(correctUrl);
  }

  /**
   * @method getProductsByIds
   * @description Fetches multiple products using a GET request with multiple 'ids' query parameters.
   *              This is the correct RESTful approach and resolves the 405 Method Not Allowed error.
   */
  public override getProductsByIds(productIds: string[]): Observable<BackendProductListItemDto[]> {
    if (productIds.length === 0) {
      return of([]);
    }
    // Bouw de HttpParams. De 'ids' key wordt voor elke ID herhaald.
    // Voorbeeld: ?ids=guid1&ids=guid2
    let params = new HttpParams();
    productIds.forEach(id => {
      params = params.append('ids', id);
    });
    // Gebruik de `by-ids` endpoint die een GET verwacht
    return this.http.get<BackendProductListItemDto[]>(`${this.apiUrl}/by-ids`, { params });
  }

  public override updatePhysicalStock(productId: string, variantInstanceId: string | undefined, changeInQuantity: number, reason: string, userId: string): Observable<BackendProductDetailDto> {
    const payload = { changeInQuantity, reason, userId, variantInstanceId };
    return this.http.post<BackendProductDetailDto>(`${this.apiUrl}/${productId}/stock`, payload);
  }

  public override createProduct(payload: CreateProductPayload): Observable<BackendProductDetailDto> {
    return this.http.post<BackendProductDetailDto>(this.apiUrl, payload);
  }

    override updateProduct(id: string, payload: UpdateProductPayload): Observable<BackendProductDetailDto> {
    return this.http.put<BackendProductDetailDto>(`${this.apiUrl}/${id}`, payload);
  }


  public override deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public override bulkDeleteProducts(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk-delete`, { ids });
  }

  private buildQueryParams(filters?: ProductFilters | null, page?: number, pageSize?: number): HttpParams {
    let params = new HttpParams()
      .set('pageNumber', (page ?? filters?.page ?? 1).toString())
      .set('pageSize', (pageSize ?? filters?.pageSize ?? 20).toString());

    if (filters) {
      if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy as string);
      if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);
      // Voeg hier meer filter logica toe indien nodig
    }
    return params;
  }

    public override getLookups(): Observable<ProductLookups> {
    return this.http.get<ProductLookups>(`${this.apiUrl}/lookups`);
  }

  public override getTags(searchTerm?: string): Observable<ProductTagLookup[]> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.http.get<ProductTagLookup[]>(`${this.apiUrl}/tags`, { params });
  }

}