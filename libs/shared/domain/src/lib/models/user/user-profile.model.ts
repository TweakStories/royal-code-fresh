/**
 * @file user-profile.model.ts
 * @Version 2.1.0 (Refactored - Pure Domain Models)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-11
 * @Description
 *   Definitive frontend domain models for user profile data, fully aligned
 *   with the /api/Account backend endpoints. This file contains ONLY pure DTOs
 *   and API payloads to prevent circular dependencies.
 */

import { Address } from "../locations/address.model";
import { Profile } from "./profile.model";
import { ApplicationSettings } from "./user-application-settings";

/**
 * Represents the simple, public user profile.
 * Maps to: GET /api/Account/profile
 */
export interface UserPublicProfile {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly avatarUrl?: string;
  readonly bio?: string;
}

/**
 * Represents the detailed user profile data for the account management page.
 * Maps to: GET /api/Account/profile-details
 */
export interface UserProfileDetails {
  readonly id: string;
  readonly email: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  displayName: string;
  bio: string | null;
  avatarMediaId: string | null;
  isTwoFactorEnabled: boolean;
}

// === Payloads (for CUD operations) ===

/**
 * Payload for updating the user's core profile information.
 * Maps to: PUT /api/Account/profile-details
 */
export interface UpdateUserProfilePayload {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  displayName: string;
  bio: string | null;
}

/**
 * Payload for updating the user's avatar.
 * Maps to: PUT /api/Account/profile-avatar
 */
export interface UpdateUserAvatarPayload {
  avatarMediaId: string;
}

/**
 * Payload for changing the user's password.
 * Maps to: POST /api/Account/change-password
 */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Payload for permanently deleting the user's account.
 * Maps to: POST /api/Account/delete-account
 */
export interface DeleteAccountPayload {
  password: string;
}

/** Payload for creating a new address. */
export type CreateAddressPayload = Omit<Address, 'id' | 'createdAt' | 'lastModified' | 'createdBy' | 'lastModifiedBy'>;

/** Payload for updating an existing address. */
export type UpdateAddressPayload = Partial<Omit<Address, 'id' | 'createdAt' | 'lastModified' | 'createdBy' | 'lastModifiedBy'>>;

/** A type alias for the detailed user profile. */
export type UserProfile = Profile;

/** Payload for updating user settings. */
export type UpdateSettingsPayload = Partial<ApplicationSettings>;