// --- VERVANG VOLLEDIG BLOK: export class DroneshopAccountApiService extends AbstractAccountApiService in libs/features/account/data-access-droneshop/src/lib/services/droneshop-account-api.service.ts ---
/**
 * @file droneshop-account-api.service.ts
 * @Version 1.2.0 (Settings & Corrected Address API Geïmplementeerd)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Concrete implementatie van de Account API service voor de Droneshop backend.
 *   Nu uitgebreid met methoden voor het beheren van gebruikersadressen en -instellingen,
 *   volgens het contract van AbstractAccountApiService, met correcte returntypes.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractAccountApiService } from '@royal-code/features/account/core';
import { Address, ApplicationSettings, ChangePasswordPayload, CreateAddressPayload, DeleteAccountPayload, UpdateAddressPayload, UpdateUserAvatarPayload, UpdateUserProfilePayload, UserProfileDetails } from '@royal-code/shared/domain'; // Importeer ApplicationSettings

@Injectable({ providedIn: 'root' })
export class DroneshopAccountApiService extends AbstractAccountApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Account`;

  override getProfileDetails(): Observable<UserProfileDetails> {
    return this.http.get<UserProfileDetails>(`${this.apiUrl}/profile-details`);
  }

  override updateProfileDetails(payload: UpdateUserProfilePayload): Observable<UserProfileDetails> {
    return this.http.put<UserProfileDetails>(`${this.apiUrl}/profile-details`, payload);
  }

  override updateAvatar(payload: UpdateUserAvatarPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/profile-avatar`, payload);
  }

  override changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, payload);
  }

  override deleteAccount(payload: DeleteAccountPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete-account`, payload);
  }

  override getUserSettings(): Observable<ApplicationSettings> {
    return this.http.get<ApplicationSettings>(`${this.apiUrl}/settings`);
  }

  override getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/addresses`);
  }

  override createAddress(payload: CreateAddressPayload): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/addresses`, payload);
  }

  override updateAddress(addressId: string, payload: UpdateAddressPayload): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/addresses/${addressId}`, payload);
  }

  override deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addresses/${addressId}`);
  }
}