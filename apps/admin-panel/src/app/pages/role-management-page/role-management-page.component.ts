/**
 * @file role-management-page.component.ts
 * @version 3.0.0 (Integrated AdminRoleListComponent Accordion)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-29
 * @description Smart component for the role management page, now using the accordion list for roles and permission editing.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersFacade } from '@royal-code/features/admin-users/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { AppIcon } from '@royal-code/shared/domain';
import { CreateRolePayload, Role, UpdateRolePayload, UpdateRolePermissionsPayload } from '@royal-code/features/admin-users/domain';
import { AdminRoleListComponent, RoleManagementDialogComponent } from '@royal-code/features/admin-users/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { NotificationService } from '@royal-code/ui/notifications';

@Component({
  selector: 'admin-role-management-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiTitleComponent, UiButtonComponent, UiIconComponent, UiSpinnerComponent, AdminRoleListComponent],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'admin.roles.manageRoles' | translate" />
        <royal-code-ui-button type="primary" (clicked)="openCreateRoleDialog()">
          <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2"/>
          {{ 'admin.roles.prompts.newRoleName' | translate }}
        </royal-code-ui-button>
      </div>

      @if (vm(); as viewModel) {
        @if(viewModel.isLoading && viewModel.availableRoles.length === 0) {
          <div class="flex justify-center items-center h-64">
            <royal-code-ui-spinner size="lg" />
          </div>
        } @else {
          <admin-role-list
            [roles]="viewModel.availableRoles"
            [allPermissions]="viewModel.allPermissions"
            [permissionsByRoleId]="viewModel.permissionsByRoleId"
            [loadingPermissionsForRoleId]="viewModel.loadingPermissionsForRoleId"
            (editClicked)="onEditRole($event)"
            (deleteClicked)="onDeleteRole($event)"
            (loadPermissionsForRole)="onLoadPermissionsForRole($event)"
            (permissionsUpdated)="onUpdatePermissions($event)"
          />
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleManagementPageComponent implements OnInit {
  protected readonly facade = inject(AdminUsersFacade);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly translate = inject(TranslateService);
  private readonly notificationService = inject(NotificationService);

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  protected readonly vm = this.facade.viewModel;

  ngOnInit(): void {
    this.facade.initPage();
  }

  openCreateRoleDialog(): void {
    const dialogRef = this.overlayService.open({
      component: RoleManagementDialogComponent,
      data: { roles: this.vm()?.availableRoles ?? [] },
      backdropType: 'dark',
      panelClass: ['w-full', 'max-w-md']
    });

    dialogRef.componentInstance!.create.subscribe((payload: CreateRolePayload) => {
      this.facade.createRole(payload);
    });
  }

  onEditRole(role: Role): void {
    const newName = prompt(this.translate.instant('admin.roles.prompts.newNameForRole', { roleName: role.name }));
    if (newName && newName.trim().length > 0) {
      this.facade.updateRole({ id: role.id, name: newName.trim() });
    } else {
      this.notificationService.showWarning(this.translate.instant('admin.roles.messages.invalidRoleName'));
    }
  }

  onDeleteRole(role: Role): void {
    if (confirm(this.translate.instant('admin.roles.prompts.confirmDeleteRole', { roleName: role.name }))) {
      this.facade.deleteRole(role.id);
    }
  }

  onLoadPermissionsForRole(roleId: string): void {
    // Laad permissies alleen als ze nog niet in de state zitten
    if (!this.vm()?.permissionsByRoleId[roleId]) {
      this.facade.loadRolePermissions(roleId);
    }
  }
  
  onUpdatePermissions(payload: UpdateRolePermissionsPayload): void {
    this.facade.updateRolePermissions(payload);
  }
}