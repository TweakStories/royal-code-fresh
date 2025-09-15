/**
 * @file abstract-account-api.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Defines the abstract contract for the account data-access layer.
 */
import { Observable } from 'rxjs';
import { Address, ApplicationSettings, ChangePasswordPayload, CreateAddressPayload, DeleteAccountPayload, UpdateAddressPayload, UpdateUserAvatarPayload, UpdateUserProfilePayload, UserProfileDetails } from '@royal-code/shared/domain';

export abstract class AbstractAccountApiService {
  abstract getProfileDetails(): Observable<UserProfileDetails>;
  abstract updateProfileDetails(payload: UpdateUserProfilePayload): Observable<UserProfileDetails>;
  abstract updateAvatar(payload: UpdateUserAvatarPayload): Observable<void>;
  abstract changePassword(payload: ChangePasswordPayload): Observable<void>;
  abstract deleteAccount(payload: DeleteAccountPayload): Observable<void>;
  abstract getUserSettings(): Observable<ApplicationSettings>;
  abstract getAddresses(): Observable<Address[]>;
  abstract createAddress(payload: CreateAddressPayload): Observable<Address>;
  abstract updateAddress(addressId: string, payload: UpdateAddressPayload): Observable<Address>;
  abstract deleteAddress(addressId: string): Observable<void>;
}

