/**
 * @file admin-users.models.ts
 * @version 1.0.0
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-28
 * @description DTOs and domain models for the admin user management feature.
 */
import { DateTimeInfo } from '@royal-code/shared/base-models';

// === DTOs for API Communication ===

export interface AdminUserListItemDto {
  readonly id: string;
  readonly displayName: string;
  readonly fullName: string;
  readonly email: string;
  readonly roles: readonly string[];
  readonly isLockedOut: boolean;
  readonly createdAt: string; // ISO string
}

export interface AdminUserDetailDto {
  readonly id: string;
  readonly displayName: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly email: string;
  readonly bio: string | null;
  readonly emailConfirmed: boolean;
  readonly roles: readonly string[];
  readonly isLockedOut: boolean;
  readonly lockoutEnd: string | null; // ISO string
  readonly accessFailedCount: number;
}

export interface CreateUserPayload {
  email: string;
  password?: string; // Password might be optional if confirmation is separate
  displayName: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  bio?: string | null;
  roles: string[];
}

export interface UpdateUserPayload {
  displayName: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  bio: string | null;
  roles: string[];
}

// === Domain Models (for NgRx State) ===

export interface AdminUser {
  readonly id: string;
  displayName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  bio?: string | null; 
  roles: readonly string[];
  isLockedOut: boolean;
  emailConfirmed: boolean;
  lockoutEnd?: DateTimeInfo | null;
  accessFailedCount: number;
  createdAt: DateTimeInfo;
}

export interface LockUserPayload {
  lockoutEnd?: string | null; // ISO 8601 date string
}

export interface SetPasswordPayload {
  newPassword: string;
}
