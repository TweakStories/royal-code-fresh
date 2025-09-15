/**
 * @file droneshop-wishlist-api.service.ts
 * @Version 4.0.0 (DEFINITIVE - Correctly implements AbstractApiService contract)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description Concrete implementation of the wishlist API service, now correctly
 *              implementing the `AbstractWishlistApiService` contract by performing
 *              the mapping from backend DTOs to domain models internally.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // << TOEGEVOEGD voor mapping
import { APP_CONFIG } from '@royal-code/core/config';
import { WishlistItem } from '@royal-code/features/wishlist/domain';
import { AbstractWishlistApiService, AddWishlistItemPayload, BackendWishlistItemDto } from '@royal-code/features/wishlist/core';
import { WishlistMappingService } from '@royal-code/features/wishlist/core'; // << TOEGEVOEGD voor mapping

@Injectable({ providedIn: 'root' })
export class DroneshopWishlistApiService implements AbstractWishlistApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly mappingService = inject(WishlistMappingService); // << TOEGEVOEGD
  private readonly apiUrl = `${this.config.backendUrl}/Wishlist`;

  // << DE FIX: Map de DTO's BINNEN de service om WishlistItem[] te retourneren >>
  getWishlist(): Observable<WishlistItem[]> {
    return this.http.get<BackendWishlistItemDto[]>(this.apiUrl).pipe(
      map(dtos => this.mappingService.mapBackendWishlistItemsToDomain(dtos))
    );
  }

  // << DE FIX: Map de DTO BINNEN de service om een WishlistItem te retourneren >>
  addItem(payload: AddWishlistItemPayload): Observable<WishlistItem> {
    return this.http.post<BackendWishlistItemDto>(`${this.apiUrl}/items`, payload).pipe(
      map(dto => this.mappingService.mapBackendWishlistItemToDomain(dto))
    );
  }

  removeItem(wishlistItemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${wishlistItemId}`);
  }
}