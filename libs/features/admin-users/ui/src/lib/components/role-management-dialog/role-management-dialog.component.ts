/**
 * @file role-management-dialog.component.ts
 * @version 1.0.0
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-29
 * @description Dialog for creating, updating, and deleting roles.
 */
import { Component, ChangeDetectionStrategy, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF, DynamicOverlayRef } from '@royal-code/ui/overlay';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { CreateRolePayload, Role, UpdateRolePayload } from '@royal-code/features/admin-users/domain';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'admin-role-management-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, UiTitleComponent, UiButtonComponent, UiInputComponent, UiIconComponent],
  template: `
    <div class="p-6 bg-card rounded-xs shadow-lg w-full max-w-md">
      <!-- === HEADER === -->
      <div class="flex justify-between items-center mb-4">
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'admin.roles.manageRoles' | translate" />
        <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="close()">
          <royal-code-ui-icon [icon]="AppIcon.X" />
        </royal-code-ui-button>
      </div>

      <!-- === CREATE NEW ROLE FORM === -->
      <div class="flex items-center gap-2 mb-6 pb-6 border-b border-border">
        <royal-code-ui-input
          class="flex-grow"
          [(ngModel)]="newRoleName"
          [placeholder]="'admin.roles.newRolePlaceholder' | translate"
          (keydown.enter)="onCreateRole()"
        />
        <royal-code-ui-button type="primary" (clicked)="onCreateRole()" [disabled]="!newRoleName.trim()">
          {{ 'admin.roles.createButton' | translate }}
        </royal-code-ui-button>
      </div>

      <!-- === EXISTING ROLES LIST === -->
      <div class="space-y-2 max-h-64 overflow-y-auto">
        @for(role of data.roles; track role.id) {
          <div class="flex items-center justify-between p-2 rounded-md hover:bg-hover group">
            <span class="text-foreground">{{ role.name }}</span>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <royal-code-ui-button type="outline" sizeVariant="icon" (clicked)="onUpdateRole(role)" [title]="'common.buttons.edit' | translate">
                <royal-code-ui-icon [icon]="AppIcon.Edit" sizeVariant="sm" />
              </royal-code-ui-button>
              <royal-code-ui-button type="fire" sizeVariant="icon" (clicked)="onDeleteRole(role)" [title]="'common.buttons.delete' | translate">
                <royal-code-ui-icon [icon]="AppIcon.Trash2" sizeVariant="sm" />
              </royal-code-ui-button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleManagementDialogComponent {
  // === DEPENDENCIES ===
  private readonly overlayRef = inject(DYNAMIC_OVERLAY_REF);
  public readonly data: { roles: Role[] } = inject(DYNAMIC_OVERLAY_DATA);
  private readonly translate = inject(TranslateService);

  // === OUTPUTS ===
  create = output<CreateRolePayload>();
  update = output<UpdateRolePayload>();
  delete = output<string>(); // Outputs roleId

  // === INTERNAL STATE ===
  protected newRoleName = '';
  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;

  // === PUBLIC METHODS ===
  close(): void {
    this.overlayRef.close();
  }

  onCreateRole(): void {
    const trimmedName = this.newRoleName.trim();
    if (trimmedName) {
      this.create.emit({ name: trimmedName });
      this.newRoleName = ''; // Reset form
    }
  }

  onUpdateRole(role: Role): void {
    const newName = prompt(this.translate.instant('admin.roles.prompts.newNameForRole', { roleName: role.name }));
    if (newName && newName.trim()) {
      this.update.emit({ id: role.id, name: newName.trim() });
    }
  }

  onDeleteRole(role: Role): void {
    if (confirm(this.translate.instant('admin.roles.prompts.confirmDeleteRole', { roleName: role.name }))) {
      this.delete.emit(role.id);
    }
  }
}