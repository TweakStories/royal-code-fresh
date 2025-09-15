/**
 * @file admin-users.actions.ts
 * @version 4.0.0 (Full Permission Management)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description NgRx Actions for Admin User, Role, and Permission Management.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AdminUser, CreateUserPayload, UpdateUserPayload, CreateRolePayload, UpdateRolePayload, Role, Permission, UpdateRolePermissionsPayload, LockUserPayload, SetPasswordPayload } from '@royal-code/features/admin-users/domain';

export const AdminUserActions = createActionGroup({
  source: 'Admin Users',
  events: {
    // === PAGE LIFECYCLE & FILTERS ===
    'Page Initialized': emptyProps(),
    'Filters Changed': props<{ filters: { searchTerm?: string; role?: string; page?: number } }>(),

    // === USER CRUD OPERATIONS ===
    // --- Read ---
    'Load Users': props<{ page: number, pageSize: number, searchTerm?: string, role?: string }>(),
    'Load Users Success': props<{ users: AdminUser[], totalCount: number }>(),
    'Load Users Failure': props<{ error: string }>(),
    'Load User Detail': props<{ userId: string }>(),
    'Load User Detail Success': props<{ user: AdminUser }>(),
    'Load User Detail Failure': props<{ error: string }>(),
    // --- Create ---
    'Create User Submitted': props<{ payload: CreateUserPayload }>(),
    'Create User Success': props<{ user: AdminUser }>(),
    'Create User Failure': props<{ error: string }>(),
    // --- Update ---
    'Update User Submitted': props<{ userId: string, payload: UpdateUserPayload }>(),
    'Update User Success': props<{ userUpdate: Update<AdminUser> }>(),
    'Update User Failure': props<{ error: string }>(),
    // --- Delete ---
    'Delete User Confirmed': props<{ userId: string }>(),
    'Delete User Success': props<{ userId: string }>(),
    'Delete User Failure': props<{ error: string }>(),
    // --- Selection ---
    'Select User': props<{ userId: string | null }>(),

    // --- Account Status & Password ---
    'Lock User Submitted': props<{ userId: string, payload: LockUserPayload }>(),
    'Lock User Success': props<{ userUpdate: Update<AdminUser> }>(),
    'Lock User Failure': props<{ error: string }>(),

    'Unlock User Submitted': props<{ userId: string }>(),
    'Unlock User Success': props<{ userUpdate: Update<AdminUser> }>(),
    'Unlock User Failure': props<{ error: string }>(),

    'Set Password Submitted': props<{ userId: string, payload: SetPasswordPayload }>(),
    'Set Password Success': emptyProps(), // We hoeven de state niet te updaten
    'Set Password Failure': props<{ error: string }>(),


    // === ROLE & PERMISSION MANAGEMENT ===
    // --- Roles ---
    'Load Available Roles': emptyProps(),
    'Load Available Roles Success': props<{ roles: Role[] }>(),
    'Load Available Roles Failure': props<{ error: string }>(),
    'Create Role Submitted': props<{ payload: CreateRolePayload }>(),
    'Create Role Success': props<{ role: Role }>(),
    'Create Role Failure': props<{ error: string }>(),
    'Update Role Submitted': props<{ payload: UpdateRolePayload }>(),
    'Update Role Success': props<{ role: Role }>(),
    'Update Role Failure': props<{ error: string }>(),
    'Delete Role Confirmed': props<{ roleId: string }>(),
    'Delete Role Success': props<{ roleId: string }>(),
    'Delete Role Failure': props<{ error: string }>(),
    // --- Permissions ---
    'Load All Permissions': emptyProps(),
    'Load All Permissions Success': props<{ permissions: Permission[] }>(),
    'Load All Permissions Failure': props<{ error: string }>(),
    'Load Role Permissions': props<{ roleId: string }>(),
    'Load Role Permissions Success': props<{ roleId: string, permissions: Permission[] }>(),
    'Load Role Permissions Failure': props<{ roleId: string, error: string }>(),
    'Update Role Permissions Submitted': props<{ payload: UpdateRolePermissionsPayload }>(),
    'Update Role Permissions Success': props<{ roleId: string, permissions: Permission[] }>(),
    'Update Role Permissions Failure': props<{ roleId: string, error: string }>(),
  },
});