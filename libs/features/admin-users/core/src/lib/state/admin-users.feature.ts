/**
 * @file admin-users.feature.ts
 * @version 12.0.0 (Definitive State with Full Permission Management)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description The definitive NgRx Feature for Admin User, Role, and Permission Management.
 */
import { createFeature, createReducer, on, createSelector, MemoizedSelector } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { AdminUser, Role, Permission } from '@royal-code/features/admin-users/domain';
import { AdminUserActions } from './admin-users.actions';
import { createSafeEntitySelectors } from '@royal-code/shared/utils';

export const ADMIN_USERS_FEATURE_KEY = 'adminUsers';

// === STATE INTERFACE ===
export interface AdminUsersState extends EntityState<AdminUser> {
  totalCount: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  selectedUserId: string | null;
  // Role & Permission State
  availableRoles: readonly Role[];
  allPermissions: readonly Permission[];
  permissionsByRoleId: Record<string, readonly Permission[]>;
  loadingPermissionsForRoleId: string | null;
  // Pagination & Filter State
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  roleFilter: string;
}

// === ENTITY ADAPTER ===
export const adminUserAdapter: EntityAdapter<AdminUser> = createEntityAdapter<AdminUser>();

// === INITIAL STATE ===
export const initialAdminUsersState: AdminUsersState = adminUserAdapter.getInitialState({
  totalCount: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,
  selectedUserId: null,
  availableRoles: [],
  allPermissions: [],
  permissionsByRoleId: {},
  loadingPermissionsForRoleId: null,
  currentPage: 1,
  pageSize: 20,
  searchTerm: '',
  roleFilter: '',
});

// === FEATURE (REDUCER & SELECTORS) ===
export const adminUsersFeature = createFeature({
  name: ADMIN_USERS_FEATURE_KEY,
  reducer: createReducer(
    initialAdminUsersState,
    // === PAGE LIFECYCLE & FILTERS ===
    on(AdminUserActions.pageInitialized, (state) => ({ ...state, isLoading: true, error: null })),
    on(AdminUserActions.filtersChanged, (state, { filters }) => ({
      ...state,
      isLoading: true,
      currentPage: filters.page ?? 1,
      searchTerm: filters.searchTerm ?? state.searchTerm,
      roleFilter: filters.role ?? state.roleFilter,    
      error: null
    })),


    // === USER CRUD OPERATIONS ===
    // --- Read ---
    on(AdminUserActions.loadUsersSuccess, (state, { users, totalCount }) =>
      adminUserAdapter.setAll(users, { ...state, totalCount, isLoading: false, error: null })
    ),
    on(AdminUserActions.loadUsersFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
    on(AdminUserActions.loadUserDetailSuccess, (state, { user }) => adminUserAdapter.upsertOne(user, { ...state, isLoading: false, selectedUserId: user.id, error: null })),
    on(AdminUserActions.createUserSuccess, (state, { user }) => adminUserAdapter.addOne(user, { ...state, totalCount: state.totalCount + 1, isSubmitting: false, error: null })),
    on(AdminUserActions.updateUserSuccess, (state, { userUpdate }) => adminUserAdapter.updateOne(userUpdate, { ...state, isSubmitting: false, error: null })),
    on(AdminUserActions.deleteUserSuccess, (state, { userId }) => adminUserAdapter.removeOne(userId, { ...state, totalCount: state.totalCount - 1, isSubmitting: false, error: null })),
    on(AdminUserActions.selectUser, (state, { userId }) => ({ ...state, selectedUserId: userId, isLoading: !!userId })),
    
    // --- Common submission/failure states for user operations ---
    on(AdminUserActions.createUserSubmitted, AdminUserActions.updateUserSubmitted, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(AdminUserActions.createUserFailure, AdminUserActions.updateUserFailure, (state) => ({ ...state, isSubmitting: false })),
    on(AdminUserActions.deleteUserConfirmed, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(AdminUserActions.deleteUserFailure, (state) => ({ ...state, isSubmitting: false })),
    on(AdminUserActions.loadUserDetail, (state) => ({ ...state, isLoading: true, error: null })),
    on(AdminUserActions.loadUserDetailFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    // --- Account Status ---
    on(AdminUserActions.lockUserSubmitted, AdminUserActions.unlockUserSubmitted, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(AdminUserActions.lockUserSuccess, AdminUserActions.unlockUserSuccess, (state, { userUpdate }) =>
      adminUserAdapter.updateOne(userUpdate, { ...state, isSubmitting: false })
    ),
    on(AdminUserActions.lockUserFailure, AdminUserActions.unlockUserFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),


    // === ROLE & PERMISSION MANAGEMENT ===
    // --- Roles ---
    on(AdminUserActions.loadAvailableRolesSuccess, (state, { roles }) => ({ ...state, availableRoles: [...roles].sort((a, b) => a.name.localeCompare(b.name)), error: null })),
    on(AdminUserActions.loadAvailableRolesFailure, (state, { error }) => ({ ...state, error })),
    on(AdminUserActions.createRoleSubmitted, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(AdminUserActions.createRoleSuccess, (state, { role }) => ({ ...state, isSubmitting: false, availableRoles: [...state.availableRoles, role].sort((a, b) => a.name.localeCompare(b.name)),})),
    on(AdminUserActions.createRoleFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),
    on(AdminUserActions.updateRoleSubmitted, (state) => ({...state, isSubmitting: true, error: null })),
    on(AdminUserActions.updateRoleSuccess, (state, { role }) => ({ ...state, isSubmitting: false, availableRoles: [...state.availableRoles.map(r => r.id === role.id ? role : r)].sort((a, b) => a.name.localeCompare(b.name)) })),
    on(AdminUserActions.updateRoleFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),
    on(AdminUserActions.deleteRoleConfirmed, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(AdminUserActions.deleteRoleSuccess, (state, { roleId }) => ({ ...state, isSubmitting: false, availableRoles: state.availableRoles.filter(r => r.id !== roleId) })),
    on(AdminUserActions.deleteRoleFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),
    // --- Permissions ---
    on(AdminUserActions.loadAllPermissionsSuccess, (state, { permissions }) => ({ ...state, allPermissions: permissions })),
    on(AdminUserActions.loadAllPermissionsFailure, (state, { error }) => ({ ...state, error })),
    on(AdminUserActions.loadRolePermissions, (state, { roleId }) => ({ ...state, loadingPermissionsForRoleId: roleId })),
    on(AdminUserActions.loadRolePermissionsSuccess, (state, { roleId, permissions }) => ({
      ...state,
      permissionsByRoleId: { ...state.permissionsByRoleId, [roleId]: permissions },
      loadingPermissionsForRoleId: null
    })),
    on(AdminUserActions.loadRolePermissionsFailure, (state, { roleId, error }) => ({ ...state, loadingPermissionsForRoleId: null, error: `Failed to load permissions for role ${roleId}: ${error}` })),
    on(AdminUserActions.updateRolePermissionsSubmitted, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(AdminUserActions.updateRolePermissionsSuccess, (state, { roleId, permissions }) => ({
      ...state,
      permissionsByRoleId: { ...state.permissionsByRoleId, [roleId]: permissions },
      isSubmitting: false,
    })),
    on(AdminUserActions.updateRolePermissionsFailure, (state, { roleId, error }) => ({ ...state, isSubmitting: false, error: `Failed to update permissions for role ${roleId}: ${error}` })),

  ),
  extraSelectors: ({ selectAdminUsersState, selectSelectedUserId, selectPermissionsByRoleId }) => {
    const { selectAll, selectEntities } = createSafeEntitySelectors(adminUserAdapter, selectAdminUsersState as MemoizedSelector<object, AdminUsersState | undefined>);

    return {
      selectAllUsers: selectAll,
      selectUserEntities: selectEntities,
      selectSelectedUser: createSelector(
        selectEntities,
        selectSelectedUserId,
        (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
      ),
      selectPermissionsForRole: (roleId: string) => createSelector(
        selectPermissionsByRoleId,
        (permissions) => permissions[roleId]
      )
    };
  }
});

// === EXPORTED SELECTORS ===
export const {
  name,
  reducer,
  selectAdminUsersState,
  selectTotalCount,
  selectIsLoading,
  selectIsSubmitting,
  selectError,
  selectSelectedUserId,
  selectAvailableRoles,
  selectAllPermissions,
  selectPermissionsByRoleId,
  selectLoadingPermissionsForRoleId,
  selectCurrentPage,
  selectPageSize,
  selectSearchTerm,
  selectRoleFilter,
  selectAllUsers,
  selectUserEntities,
  selectSelectedUser,
  selectPermissionsForRole,
} = adminUsersFeature;