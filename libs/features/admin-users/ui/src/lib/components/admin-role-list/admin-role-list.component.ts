/**
 * @file admin-role-list.component.ts
 * @version 11.0.0 (SuperAdmin Protection)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description A list of roles in a table, with disabled actions for the 'SuperAdmin' role.
 */
import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role, Permission, UpdateRolePermissionsPayload } from '@royal-code/features/admin-users/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionManagerComponent } from '../permission-manager/permission-manager.component';

@Component({
  selector: 'admin-role-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiButtonComponent, UiIconComponent, PermissionManagerComponent],
  template: `
    <div class="bg-card border border-border rounded-xs overflow-x-auto">
      <table class="w-full text-sm text-left text-secondary">
        <thead class="text-xs text-muted uppercase bg-surface-alt">
          <tr>
            <th scope="col" class="p-4">Role Name</th>
            <th scope="col" class="p-4 w-48 text-right">Actions</th>
          </tr>
        </thead>
        @for(role of roles(); track role.id) {
          <tbody class="border-b border-border last:border-b-0">
            <tr class="hover:bg-hover cursor-pointer" (click)="toggleExpand(role.id)">
              <td class="p-4 font-medium text-foreground">
                {{ role.name }}
                @if (role.name === 'SuperAdmin') {
                  <span class="ml-2 text-xs text-sun">(Protected)</span>
                }
              </td>
              <td class="p-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <royal-code-ui-button 
                    type="outline" 
                    sizeVariant="icon" 
                    (click)="editClicked.emit(role); $event.stopPropagation()" 
                    [title]="'common.buttons.edit' | translate"
                    [disabled]="role.name === 'SuperAdmin'">
                      <royal-code-ui-icon [icon]="AppIcon.Edit" sizeVariant="sm" />
                  </royal-code-ui-button>
                  <royal-code-ui-button 
                    type="fire" 
                    sizeVariant="icon" 
                    (click)="deleteClicked.emit(role); $event.stopPropagation()" 
                    [title]="'common.buttons.delete' | translate"
                    [disabled]="role.name === 'SuperAdmin'">
                      <royal-code-ui-icon [icon]="AppIcon.Trash2" sizeVariant="sm" />
                  </royal-code-ui-button>
                  <div class="w-8 h-8 flex items-center justify-center">
                    <royal-code-ui-icon 
                      [icon]="AppIcon.ChevronRight" 
                      sizeVariant="sm" 
                      class="transition-transform duration-200"
                      [ngClass]="{ 'rotate-90': expandedRoleId() === role.id }"
                    />
                  </div>
                </div>
              </td>
            </tr>
            @if (expandedRoleId() === role.id) {
              <tr>
                <td colspan="2" class="p-0">
                  <admin-permission-manager
                    [allPermissions]="allPermissions()"
                    [assignedPermissions]="permissionsByRoleId()[role.id]"
                    [isLoading]="loadingPermissionsForRoleId() === role.id"
                    (savePermissions)="onSavePermissions(role.id, $event)"
                    [isSuperAdmin]="role.name === 'SuperAdmin'"
                  />
                </td>
              </tr>
            }
          </tbody>
        } @empty {
          <tbody>
            <tr>
              <td colspan="2" class="p-8 text-center text-secondary">
                {{ 'admin.roles.messages.noRolesAvailable' | translate }}
              </td>
            </tr>
          </tbody>
        }
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRoleListComponent {
  roles = input.required<readonly Role[]>();
  allPermissions = input.required<readonly Permission[]>();
  permissionsByRoleId = input.required<Record<string, readonly Permission[]>>();
  loadingPermissionsForRoleId = input<string | null>(null);
  
  editClicked = output<Role>();
  deleteClicked = output<Role>();
  permissionsUpdated = output<UpdateRolePermissionsPayload>();
  loadPermissionsForRole = output<string>();

  protected readonly AppIcon = AppIcon;
  protected expandedRoleId = signal<string | null>(null);

  toggleExpand(roleId: string): void {
    const newId = this.expandedRoleId() === roleId ? null : roleId;
    this.expandedRoleId.set(newId);
    if (newId && !this.permissionsByRoleId()[newId]) {
      this.loadPermissionsForRole.emit(newId);
    }
  }

  onSavePermissions(roleId: string, permissions: string[]): void {
    this.permissionsUpdated.emit({ roleId, permissions });
  }
}