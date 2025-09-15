/**
 * @file admin-users.effects.ts
 * @version 5.0.0 (Fixed Race Condition & Conflicting Notifications for User Creation)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-09-02
 * @description NgRx Effects for Admin User, Role, and Permission Management, with fixes for user creation flow.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom, tap, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AdminUserApiService } from '@royal-code/features/admin-users/data-access';
import { AdminUserMappingService } from '../mappers/admin-user-mapping.service';
import { AdminUserActions } from './admin-users.actions';
import { adminUsersFeature } from './admin-users.feature';
import { NotificationService } from '@royal-code/ui/notifications';
import { Router } from '@angular/router';
import { AdminUser } from '@royal-code/features/admin-users/domain';
import { Update } from '@ngrx/entity';

@Injectable()
export class AdminUsersEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private router = inject(Router);
  private apiService = inject(AdminUserApiService);
  private mappingService = inject(AdminUserMappingService);
  private notificationService = inject(NotificationService);

  // === PAGE LIFECYCLE ===
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.pageInitialized),
      switchMap(() => {
        return [
          AdminUserActions.loadUsers({ page: 1, pageSize: 20 }),
          AdminUserActions.loadAvailableRoles(),
          AdminUserActions.loadAllPermissions()
        ];
      })
    )
  );

  changeFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.filtersChanged),
      withLatestFrom(this.store.select(adminUsersFeature.selectAdminUsersState)),
      map(([, state]) => {
        return AdminUserActions.loadUsers({
          page: state.currentPage,
          pageSize: state.pageSize,
          searchTerm: state.searchTerm,
          role: state.roleFilter
        });
      })
    )
  );

  // === USER EFFECTS ===
  // --- Read (List) ---
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.loadUsers),
      withLatestFrom(
        this.store.select(adminUsersFeature.selectCurrentPage),
        this.store.select(adminUsersFeature.selectPageSize),
        this.store.select(adminUsersFeature.selectSearchTerm),
        this.store.select(adminUsersFeature.selectRoleFilter)
      ),
      switchMap(([action, currentPage, pageSize, searchTerm, roleFilter]) =>
        this.apiService.getUsers({
          pageNumber: currentPage,
          pageSize: pageSize,
          searchTerm: searchTerm,
          role: roleFilter
        }).pipe(
          map(response => AdminUserActions.loadUsersSuccess({
            users: response.items.map(dto => this.mappingService.mapListItemToAdminUser(dto)),
            totalCount: response.totalCount
          })),
          catchError(error => {
            this.notificationService.showError(`Failed to load users: ${error.message}`);
            return of(AdminUserActions.loadUsersFailure({ error: error.message }));
          })
        )
      )
    )
  );

  // --- Read (Detail Trigger): selectUser => loadUserDetail ---
  triggerLoadUserDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.selectUser),
      filter(({ userId }) => !!userId),
      map(({ userId }) => AdminUserActions.loadUserDetail({ userId: userId! }))
    )
  );

  // --- Read (Detail Load): loadUserDetail => API Call ---
  loadUserDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.loadUserDetail),
      switchMap(({ userId }) =>
        this.apiService.getUserById(userId).pipe(
          map(dto => AdminUserActions.loadUserDetailSuccess({ user: this.mappingService.mapDetailDtoToAdminUser(dto) })),
          catchError(error => {
            this.notificationService.showError(`Failed to load user details: ${error.message}`);
            return of(AdminUserActions.loadUserDetailFailure({ error: error.message }));
          })
        )
      )
    )
  );

  // --- Create User (API Call Only) ---
  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.createUserSubmitted),
      switchMap(({ payload }) =>
        this.apiService.createUser(payload).pipe(
          map((response) => AdminUserActions.createUserSuccess({ user: { id: response.userId, ...payload, createdAt: {} as any, fullName: '', isLockedOut: false, emailConfirmed: false, accessFailedCount: 0 } as AdminUser })), // Map response to AdminUser
          catchError(error => {
            this.notificationService.showError(`Failed to create user: ${error.message}`);
            return of(AdminUserActions.createUserFailure({ error: error.message }));
          })
        )
      )
    )
  );

  // --- Handle Create User Success (Navigation & Load Detail) ---
  createUserSuccessRedirectAndLoadDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.createUserSuccess),
      tap(({ user }) => {
        this.notificationService.showSuccess(`Gebruiker '${user.displayName}' succesvol aangemaakt!`);
        this.router.navigate(['/users', user.id]);
      }),
      map(({ user }) => AdminUserActions.loadUserDetail({ userId: user.id }))
    )
  );

  // --- Update User ---
   updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.updateUserSubmitted),
      switchMap(({ userId, payload }) =>
        this.apiService.updateUser(userId, payload).pipe(
          map(() => {
            this.notificationService.showSuccess('User successfully updated.');
            return AdminUserActions.updateUserSuccess({ userUpdate: { id: userId, changes: payload } });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to update user: ${error.message}`);
            return of(AdminUserActions.updateUserFailure({ error: error.message }));
          })
        )
      )
    )
  );
  // --- Delete User ---
  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.deleteUserConfirmed),
      switchMap(({ userId }) =>
        this.apiService.deleteUser(userId).pipe(
          map(() => {
            this.notificationService.showSuccess('User successfully deleted.');
            return AdminUserActions.deleteUserSuccess({ userId });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to delete user: ${error.message}`);
            return of(AdminUserActions.deleteUserFailure({ error: error.message }));
          })
        )
      )
    )
  );

    // --- Account Status & Password Effects ---
  lockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.lockUserSubmitted),
      switchMap(({ userId, payload }) =>
        this.apiService.lockUser(userId, payload).pipe(
          map(() => {
            this.notificationService.showSuccess('User account locked successfully.');
            // Creëer een update voor de state
            const userUpdate: Update<AdminUser> = {
              id: userId,
              changes: { isLockedOut: true }
            };
            return AdminUserActions.lockUserSuccess({ userUpdate });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to lock user: ${error.message}`);
            return of(AdminUserActions.lockUserFailure({ error: error.message }));
          })
        )
      )
    )
  );

  unlockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.unlockUserSubmitted),
      switchMap(({ userId }) =>
        this.apiService.unlockUser(userId).pipe(
          map(() => {
            this.notificationService.showSuccess('User account unlocked successfully.');
            const userUpdate: Update<AdminUser> = {
              id: userId,
              changes: { isLockedOut: false, lockoutEnd: null } // Reset ook lockoutEnd
            };
            return AdminUserActions.unlockUserSuccess({ userUpdate });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to unlock user: ${error.message}`);
            return of(AdminUserActions.unlockUserFailure({ error: error.message }));
          })
        )
      )
    )
  );

  setPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.setPasswordSubmitted),
      switchMap(({ userId, payload }) =>
        this.apiService.setPassword(userId, payload).pipe(
          map(() => {
            this.notificationService.showSuccess("User's password has been updated successfully.");
            return AdminUserActions.setPasswordSuccess();
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to set password: ${error.message}`);
            return of(AdminUserActions.setPasswordFailure({ error: error.message }));
          })
        )
      )
    )
  );


  // === ROLE & PERMISSION EFFECTS ===
  // --- Roles - Read ---
  loadRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.loadAvailableRoles),
      switchMap(() =>
        this.apiService.getAvailableRoles().pipe(
          map(roles => {
            return AdminUserActions.loadAvailableRolesSuccess({ roles });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to load roles: ${error.message}`);
            return of(AdminUserActions.loadAvailableRolesFailure({ error: error.message }));
          })
        )
      )
    )
  );
  // --- Roles - Create ---
  createRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.createRoleSubmitted),
      switchMap(({ payload }) =>
        this.apiService.createRole(payload).pipe(
          map((newRole) => {
            this.notificationService.showSuccess(`Role '${newRole.name}' successfully created.`);
            return AdminUserActions.createRoleSuccess({ role: newRole });
          }),
          catchError(error => {
            const errorMessage = error.status === 409 ? `Role '${payload.name}' already exists.` : error.message;
            this.notificationService.showError(`Failed to create role: ${errorMessage}`);
            return of(AdminUserActions.createRoleFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
  // --- Roles - Update ---
  updateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.updateRoleSubmitted),
      switchMap(({ payload }) =>
        this.apiService.updateRole(payload.id, { name: payload.name }).pipe(
          map((updatedRole) => {
            this.notificationService.showSuccess(`Role '${updatedRole.name}' was updated.`);
            return AdminUserActions.updateRoleSuccess({ role: updatedRole });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to update role: ${error.message}`);
            return of(AdminUserActions.updateRoleFailure({ error: error.message }));
          })
        )
      )
    )
  );
  // --- Roles - Delete ---
  deleteRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.deleteRoleConfirmed),
      switchMap(({ roleId }) =>
        this.apiService.deleteRole(roleId).pipe(
          map(() => {
            this.notificationService.showSuccess(`Role was successfully deleted.`);
            return AdminUserActions.deleteRoleSuccess({ roleId });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to delete role: ${error.message}`);
            return of(AdminUserActions.deleteRoleFailure({ error: error.message }));
          })
        )
      )
    )
  );

  // --- Permissions - Read All ---
  loadAllPermissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.loadAllPermissions),
      switchMap(() =>
        this.apiService.getAllPermissions().pipe(
          map(permissions => {
            return AdminUserActions.loadAllPermissionsSuccess({ permissions });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to load all permissions: ${error.message}`);
            return of(AdminUserActions.loadAllPermissionsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  // --- Permissions - Read Role Specific ---
  loadRolePermissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.loadRolePermissions),
      switchMap(({ roleId }) =>
        this.apiService.getRolePermissions(roleId).pipe(
          map(permissions => {
            return AdminUserActions.loadRolePermissionsSuccess({ roleId, permissions });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to load permissions for role ${roleId}: ${error.message}`);
            return of(AdminUserActions.loadRolePermissionsFailure({ roleId, error: error.message }));
          })
        )
      )
    )
  );

  // --- Permissions - Update Role Specific ---
  updateRolePermissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminUserActions.updateRolePermissionsSubmitted),
      switchMap(({ payload }) =>
        this.apiService.updateRolePermissions(payload.roleId, payload.permissions).pipe(
          // Na een succesvolle PUT, roepen we de GET opnieuw aan om de *volledige* permissie-objecten op te halen
          switchMap(() => this.apiService.getRolePermissions(payload.roleId)),
          map(permissions => {
            this.notificationService.showSuccess('Permissions updated successfully.');
            return AdminUserActions.updateRolePermissionsSuccess({ roleId: payload.roleId, permissions });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to update permissions for role ${payload.roleId}: ${error.message}`);
            return of(AdminUserActions.updateRolePermissionsFailure({ roleId: payload.roleId, error: error.message }));
          })
        )
      )
    )
  );
}