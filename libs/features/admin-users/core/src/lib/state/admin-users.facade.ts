/**
 * @file admin-users.facade.ts
 * @version 8.0.0 (Full Permission Management & Expanded Methods)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description Facade for Admin User, Role, and Permission Management with expanded method bodies.
 */
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { AdminUserActions } from './admin-users.actions';
import {
  adminUsersFeature,
  selectAllUsers,
  selectSelectedUser,
  selectTotalCount,
  selectIsLoading,
  selectIsSubmitting,
  selectError,
  selectAvailableRoles,
  selectAllPermissions,
  selectPermissionsByRoleId,
  selectLoadingPermissionsForRoleId,
  selectCurrentPage,
  selectPageSize,
  selectSearchTerm,
  selectRoleFilter,
} from './admin-users.feature';
import { combineLatest, map } from 'rxjs';
import { AdminUsersViewModel } from './admin-users.types';
import { CreateUserPayload, UpdateUserPayload, CreateRolePayload, UpdateRolePayload, UpdateRolePermissionsPayload } from '@royal-code/features/admin-users/domain';

@Injectable({ providedIn: 'root' })
export class AdminUsersFacade {
  private readonly store = inject(Store);

  // === ViewModels ===
  private readonly viewModel$ = combineLatest({
    users: this.store.select(selectAllUsers),
    selectedUser: this.store.select(selectSelectedUser),
    availableRoles: this.store.select(selectAvailableRoles),
    allPermissions: this.store.select(selectAllPermissions),
    permissionsByRoleId: this.store.select(selectPermissionsByRoleId),
    loadingPermissionsForRoleId: this.store.select(selectLoadingPermissionsForRoleId),
    totalCount: this.store.select(selectTotalCount),
    isLoading: this.store.select(selectIsLoading),
    isSubmitting: this.store.select(selectIsSubmitting),
    error: this.store.select(selectError),
    page: this.store.select(selectCurrentPage),
    pageSize: this.store.select(selectPageSize),
    searchTerm: this.store.select(selectSearchTerm),
    roleFilter: this.store.select(selectRoleFilter)
  }).pipe(
    map((vm): AdminUsersViewModel => ({ ...vm }))
  );
  readonly viewModel = toSignal(this.viewModel$);

  // === Page & Filter Actions ===
  initPage(): void {
    this.store.dispatch(AdminUserActions.pageInitialized());
  }

  changeFilters(filters: { searchTerm?: string; role?: string; page?: number }): void {
    this.store.dispatch(AdminUserActions.filtersChanged({ filters }));
  }

  // === User Actions ===
  selectUser(userId: string | null): void {
    this.store.dispatch(AdminUserActions.selectUser({ userId }));
  }

  createUser(payload: CreateUserPayload): void {
    this.store.dispatch(AdminUserActions.createUserSubmitted({ payload }));
  }

  updateUser(userId: string, payload: UpdateUserPayload): void {
    this.store.dispatch(AdminUserActions.updateUserSubmitted({ userId, payload }));
  }

  deleteUser(userId: string): void {
    this.store.dispatch(AdminUserActions.deleteUserConfirmed({ userId }));
  }

    // --- Account Status & Password ---
  lockUser(userId: string, lockoutEnd?: string | null): void {
    this.store.dispatch(AdminUserActions.lockUserSubmitted({ userId, payload: { lockoutEnd } }));
  }

  unlockUser(userId: string): void {
    this.store.dispatch(AdminUserActions.unlockUserSubmitted({ userId }));
  }

  setPassword(userId: string, newPassword: string): void {
    this.store.dispatch(AdminUserActions.setPasswordSubmitted({ userId, payload: { newPassword } }));
  }


  // === Role & Permission Actions ===
  createRole(payload: CreateRolePayload): void {
    this.store.dispatch(AdminUserActions.createRoleSubmitted({ payload }));
  }

  updateRole(payload: UpdateRolePayload): void {
    this.store.dispatch(AdminUserActions.updateRoleSubmitted({ payload }));
  }

  deleteRole(roleId: string): void {
    this.store.dispatch(AdminUserActions.deleteRoleConfirmed({ roleId }));
  }

  loadRolePermissions(roleId: string): void {
    this.store.dispatch(AdminUserActions.loadRolePermissions({ roleId }));
  }

  updateRolePermissions(payload: UpdateRolePermissionsPayload): void {
    this.store.dispatch(AdminUserActions.updateRolePermissionsSubmitted({ payload }));
  }
}