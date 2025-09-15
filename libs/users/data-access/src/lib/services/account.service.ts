/**
 * @file account.service.ts
 * @Version 3.1.0 (Definitive & API-Aligned - Syntax Fixed)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Data-access service for all user self-service ("Account") API interactions.
 *   This definitive version is 100% synchronized with the latest backend API
 *   specification and correctly imports all models from the account-domain library.
 *   All `this->` syntax errors have been corrected to `this.`.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApplicationSettings, Address } from '@royal-code/shared/domain';
import { APP_CONFIG } from '@royal-code/core/config';
import { LoggerService } from '@royal-code/core/core-logging';
import { PaginatedList } from '@royal-code/shared/utils';
import { ReviewListItemDto, ReviewSortBy } from '@royal-code/features/reviews/domain';
import {
  UserPublicProfile,
  UserProfileDetails,
  UpdateUserProfilePayload,
  UpdateUserAvatarPayload,
  ChangePasswordPayload,
  DeleteAccountPayload
} from '@royal-code/features/account/domain';
import { Profile } from '@royal-code/shared/domain';

// --- Payload Type Definitions for internal use ---
type CreateAddressPayload = Omit<Address, 'id'>;
type UpdateAddressPayload = Partial<CreateAddressPayload>;
interface GetMyReviewsParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: ReviewSortBy;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly logger = inject(LoggerService);

  private readonly logPrefix = '[AccountService]';
  private readonly apiUrl = `${this.config.backendUrl}/Account`;

  // === Profile Endpoints ===

  /**
   * Fetches the simple, public profile of the currently authenticated user.
   * Maps to GET /api/Account/profile
   * @returns {Observable<UserPublicProfile>}
   */
  public getPublicProfile(): Observable<UserPublicProfile> {
    const url = `${this.apiUrl}/profile`;
    this.logger.info(`${this.logPrefix} [getPublicProfile] Fetching from ${url}`);
    return this.http.get<UserPublicProfile>(url);
  }

  /**
   * Fetches the detailed profile & account data for the management page.
   * Maps to GET /api/Account/profile-details
   * @returns {Observable<UserProfileDetails>}
   */
  public getProfileDetails(): Observable<UserProfileDetails> {
    const url = `${this.apiUrl}/profile-details`;
    this.logger.info(`${this.logPrefix} [getProfileDetails] Fetching from ${url}`);
    return this.http.get<UserProfileDetails>(url).pipe(
      catchError(error => {
        this.logger.error(`${this.logPrefix} [getProfileDetails] Failed to fetch profile details.`, { error });
        return throwError(() => error);
      })
    );
  }

  /**
   * Updates the authenticated user's profile details.
   * Maps to PUT /api/Account/profile-details
   * @param {UpdateUserProfilePayload} payload - The profile data to update.
   * @returns {Observable<UserProfileDetails>} The updated profile details.
   */
  public updateProfileDetails(payload: UpdateUserProfilePayload): Observable<UserProfileDetails> {
    const url = `${this.apiUrl}/profile-details`;
    this.logger.info(`${this.logPrefix} [updateProfileDetails] Updating profile at ${url}`);
    return this.http.put<UserProfileDetails>(url, payload);
  }

  /**
   * Updates the authenticated user's avatar.
   * Maps to PUT /api/Account/profile-avatar
   * @param {UpdateUserAvatarPayload} payload - The new avatar media ID.
   * @returns {Observable<void>}
   */
  public updateAvatar(payload: UpdateUserAvatarPayload): Observable<void> {
    const url = `${this.apiUrl}/profile-avatar`;
    this.logger.info(`${this.logPrefix} [updateAvatar] Updating avatar at ${url}`);
    return this.http.put<void>(url, payload);
  }

  // === Security Endpoints ===

  /**
   * Changes the authenticated user's password.
   * Maps to POST /api/Account/change-password
   * @param {ChangePasswordPayload} payload - The current and new password data.
   * @returns {Observable<void>}
   */
  public changePassword(payload: ChangePasswordPayload): Observable<void> {
    const url = `${this.apiUrl}/change-password`;
    return this.http.post<void>(url, payload);
  }

  /**
   * Permanently deletes the authenticated user's account.
   * Maps to POST /api/Account/delete-account
   * @param {DeleteAccountPayload} payload - The user's password for confirmation.
   * @returns {Observable<void>}
   */
  public deleteAccount(payload: DeleteAccountPayload): Observable<void> {
    const url = `${this.apiUrl}/delete-account`;
    return this.http.post<void>(url, payload);
  }

  // === Settings Endpoints ===

  public getUserSettings(options: { observe: 'response' }): Observable<HttpResponse<ApplicationSettings>>;
  public getUserSettings(options?: { observe?: 'body' }): Observable<ApplicationSettings>;
  public getUserSettings(options?: { observe?: 'body' | 'response' }): Observable<any> {
    const url = `${this.apiUrl}/settings`;
    return this.http.get<ApplicationSettings>(url, options as any);
  }

  public updateUserSettings(settingsToUpdate: Partial<ApplicationSettings>): Observable<void> {
    const url = `${this.apiUrl}/settings`;
    return this.http.put<void>(url, settingsToUpdate);
  }

  // === Address Endpoints ===

  public getAddresses(options: { observe: 'response' }): Observable<HttpResponse<Address[]>>;
  public getAddresses(options?: { observe?: 'body' }): Observable<Address[]>;
  public getAddresses(options?: { observe?: 'body' | 'response' }): Observable<any> {
    return this.http.get<Address[]>(`${this.apiUrl}/addresses`, options as any);
  }

  public createAddress(addressPayload: CreateAddressPayload): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/addresses`, addressPayload);
  }

  public updateAddress(addressId: string, addressPayload: UpdateAddressPayload): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/addresses/${addressId}`, addressPayload);
  }

  public deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addresses/${addressId}`);
  }

  // === Reviews Endpoint ===

  public getMyReviews(params: GetMyReviewsParams): Observable<PaginatedList<ReviewListItemDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber?.toString() ?? '1')
      .set('pageSize', params.pageSize?.toString() ?? '10');
    if (params.sortBy) httpParams = httpParams.set('SortBy', params.sortBy);
    if (params.searchTerm) httpParams = httpParams.set('SearchTerm', params.searchTerm);
    return this.http.get<PaginatedList<ReviewListItemDto>>(`${this.apiUrl}/reviews`, { params: httpParams });
  }

  // DEPRECATED METHOD - Kept for context during refactoring, but should be removed.
  // This was the source of the initial confusion.
  /** @deprecated Use getProfileDetails() instead. This method incorrectly fetches detailed data. */
  public getCurrentUserProfile(): Observable<Profile> {
      const url = `${this.apiUrl}/profile-details`;
      this.logger.warn(`${this.logPrefix} [DEPRECATED - getCurrentUserProfile] is being called. It should be replaced with getProfileDetails().`);
      return this.http.get<Profile>(url); // Note: The return type here is still technically incorrect vs the endpoint.
  }
}