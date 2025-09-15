/**
 * @file admin-variants-api.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description Service for managing global product attributes via the admin API.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { PredefinedAttributesMap, PredefinedAttributeValueDto } from '@royal-code/features/admin-products/core';
import { CreateVariantValuePayload, UpdateVariantValuePayload } from './models/variant-payloads.dto';

@Injectable({ providedIn: 'root' })
export class AdminVariantsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/AdminProducts/attributes`;

  getAttributes(): Observable<PredefinedAttributesMap> {
    return this.http.get<PredefinedAttributesMap>(this.apiUrl);
  }

  createAttribute(payload: CreateVariantValuePayload): Observable<PredefinedAttributeValueDto> {
    return this.http.post<PredefinedAttributeValueDto>(this.apiUrl, payload);
  }

  updateAttribute(id: string, payload: UpdateVariantValuePayload): Observable<PredefinedAttributeValueDto> {
    return this.http.put<PredefinedAttributeValueDto>(`${this.apiUrl}/${id}`, payload);
  }

  deleteAttribute(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}