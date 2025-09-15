/**
 * @file abstract-product-api.service.ts
 * @Version 4.3.0 (Cleaned - No Variant Image Endpoint)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @description Defines the abstract service contract for the product data-access layer.
 *              This version is cleaned of the unnecessary `getVariantImages` method.
 */
import { Observable } from 'rxjs';
import { AvailableFiltersResponse, ProductFilters, CreateProductPayload, UpdateProductPayload, Product, PhysicalProduct, ProductCategory, SearchSuggestionResponse } from '@royal-code/features/products/domain';
import { BackendPaginatedListDto, BackendProductListItemDto, BackendProductDetailDto, BackendMediaDto } from '../DTO/backend.types';
import { CustomAttributeDefinitionDto, PredefinedAttributesMap } from '@royal-code/features/products/domain';
import { ProductLookups, ProductTagLookup } from '@royal-code/features/admin-products/domain';

/**
 * @abstract
 * @class AbstractProductApiService
 * @description A pure data-access contract that returns raw backend DTOs. Mapping to
 *              domain models is the responsibility of the `ProductMappingService`.
 */
export abstract class AbstractProductApiService {
  abstract getPredefinedAttributes(): Observable<PredefinedAttributesMap>;
  abstract getCustomAttributeDefinitions(): Observable<CustomAttributeDefinitionDto[]>;
  abstract getProducts(filters?: ProductFilters | null): Observable<BackendPaginatedListDto<BackendProductListItemDto>>;
  abstract getAvailableFilters(currentFilters?: ProductFilters | null): Observable<AvailableFiltersResponse>;
  abstract getFeaturedProducts(): Observable<BackendPaginatedListDto<BackendProductListItemDto>>;
  abstract getProductById(productId: string): Observable<BackendProductDetailDto>;
  abstract getCategories(): Observable<ProductCategory[]>;
  abstract getProductsByIds(productIds: readonly string[]): Observable<BackendProductListItemDto[]>;
  abstract getRecommendations(count?: number): Observable<BackendPaginatedListDto<BackendProductListItemDto>>;
  abstract updatePhysicalStock(productId: string, variantInstanceId: string | undefined, changeInQuantity: number, reason: string, userId: string): Observable<BackendProductDetailDto>;
  abstract createProduct(payload: CreateProductPayload): Observable<BackendProductDetailDto>;
  abstract updateProduct(id: string, payload: UpdateProductPayload): Observable<BackendProductDetailDto>;
  abstract deleteProduct(id: string): Observable<void>;
  abstract bulkDeleteProducts(ids: string[]): Observable<void>;
  abstract getLookups(): Observable<ProductLookups>;
  abstract getTags(searchTerm?: string): Observable<ProductTagLookup[]>;
  abstract searchProducts(query: string, filters?: ProductFilters | null): Observable<BackendPaginatedListDto<BackendProductListItemDto>>;
  abstract getSuggestions(query: string): Observable<SearchSuggestionResponse>;

}