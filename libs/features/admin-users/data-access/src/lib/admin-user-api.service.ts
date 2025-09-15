/**
 * @file admin-user-api.service.ts
 * @version 1.0.0
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-28
 * @description Service for interacting with the admin user management API endpoints.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { AdminUserDetailDto, AdminUserListItemDto, CreateRolePayload, CreateUserPayload, LockUserPayload, Permission, Role, SetPasswordPayload, UpdateUserPayload } from '@royal-code/features/admin-users/domain';
import { PaginatedList } from '@royal-code/shared/utils';

@Injectable({ providedIn: 'root' })
export class AdminUserApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/admin/users`;

  getUsers(filters: { pageNumber?: number; pageSize?: number; searchTerm?: string; role?: string; }): Observable<PaginatedList<AdminUserListItemDto>> {
    let params = new HttpParams()
      .set('pageNumber', (filters.pageNumber ?? 1).toString())
      .set('pageSize', (filters.pageSize ?? 20).toString());

    if (filters.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }
    if (filters.role) {
      params = params.set('role', filters.role);
    }

    return this.http.get<PaginatedList<AdminUserListItemDto>>(this.apiUrl, { params });
  }

  public getUserById(id: string): Observable<AdminUserDetailDto> {
    return this.http.get<AdminUserDetailDto>(`${this.apiUrl}/${id}`);
  }

  createUser(payload: CreateUserPayload): Observable<{ userId: string }> {
    return this.http.post<{ userId: string }>(this.apiUrl, payload);
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    public lockUser(id: string, payload: LockUserPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/lock`, payload);
  }

  public unlockUser(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/unlock`, {}); // Lege body
  }

  public setPassword(id: string, payload: SetPasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/set-password`, payload);
  }



  // === ROLE MANAGEMENT ===
  public getAvailableRoles(): Observable<Role[]> { // Returneert nu Role[]
    return this.http.get<Role[]>(`${this.config.backendUrl}/admin/roles`); // Nieuw Role-specifiek endpoint
  }

  public createRole(payload: CreateRolePayload): Observable<Role> { // Payload en return type zijn nu Role
    return this.http.post<Role>(`${this.config.backendUrl}/admin/roles`, payload); // Nieuw Role-specifiek endpoint
  }

  public updateRole(id: string, payload: { name: string }): Observable<Role> { // Nu met ID en payload { name }
    return this.http.put<Role>(`${this.config.backendUrl}/admin/roles/${id}`, payload); // Nieuw Role-specifiek endpoint
  }

  public deleteRole(id: string): Observable<void> { // Nu met ID
    return this.http.delete<void>(`${this.config.backendUrl}/admin/roles/${id}`); // Nieuw Role-specifiek endpoint
  }

  public getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.config.backendUrl}/admin/permissions`);
  }

  public getRolePermissions(roleId: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.config.backendUrl}/admin/roles/${roleId}/permissions`);
  }

  public updateRolePermissions(roleId: string, permissions: string[]): Observable<void> {
    return this.http.put<void>(`${this.config.backendUrl}/admin/roles/${roleId}/permissions`, { permissions });
  }


}