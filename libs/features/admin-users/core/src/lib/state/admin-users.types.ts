/**
 * @file admin-users.types.ts
 * @version 4.0.0 (Confirmed Full Permission Management Types)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description Type definitions for the Admin Users feature, including full permission management.
 *              This version explicitly confirms the presence of all required properties.
 */
import { AdminUser, Role, Permission } from '@royal-code/features/admin-users/domain';

export interface AdminUsersViewModel {
  users: readonly AdminUser[];
  selectedUser: AdminUser | undefined;
  // Role & Permission State - DEZE ZIJN CRUCIAAL
  availableRoles: readonly Role[];
  allPermissions: readonly Permission[]; // MOET HIER ZIJN
  permissionsByRoleId: Record<string, readonly Permission[]>; // MOET HIER ZIJN
  loadingPermissionsForRoleId: string | null; // MOET HIER ZIJN
  // General State
  totalCount: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  // Pagination & Filter State
  page: number;
  pageSize: number;
  searchTerm?: string;
  roleFilter?: string;
}