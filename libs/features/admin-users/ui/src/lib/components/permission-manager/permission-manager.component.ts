/**
 * @file permission-manager.component.ts
 * @version 2.0.0 (SuperAdmin Protection)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description Dumb component for managing permissions of a role, with protection for SuperAdmin.
 */
import { Component, ChangeDetectionStrategy, input, output, signal, computed, effect, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Permission } from '@royal-code/features/admin-users/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'admin-permission-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, UiButtonComponent, UiSpinnerComponent],
  template: `
    <div class="p-4 bg-background border-t border-border">
      @if (isLoading()) {
        <div class="flex items-center justify-center p-4"><royal-code-ui-spinner /></div>
      } @else {
        <form (ngSubmit)="onSave()">
          <h4 class="text-sm font-semibold mb-3 text-foreground">Permissions</h4>
           @if (isSuperAdmin()) {
            <p class="text-xs text-sun bg-sun/10 p-2 rounded-md mb-3">
              SuperAdmin has all permissions by default. These cannot be changed.
            </p>
          }
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2">
            @for(permission of allPermissions(); track permission.value) {
              <label class="flex items-center text-sm p-2 rounded-md cursor-pointer" [class.hover:bg-hover]="!isSuperAdmin()">
                <input
                  type="checkbox"
                  class="mr-2 h-4 w-4 rounded text-primary focus:ring-primary border-border"
                  [checked]="selection().has(permission.value)"
                  (change)="togglePermission(permission.value)"
                  [disabled]="isSuperAdmin()"
                />
                <span class="flex flex-col">
                  <span class="font-medium text-foreground">{{ permission.value }}</span>
                  <span class="text-xs text-muted">{{ permission.description }}</span>
                </span>
              </label>
            }
          </div>
          @if (!isSuperAdmin()) {
            <div class="flex justify-end mt-4 pt-4 border-t border-border">
              <royal-code-ui-button type="primary" htmlType="submit" [disabled]="!isDirty()">
                Save Permissions
              </royal-code-ui-button>
            </div>
          }
        </form>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionManagerComponent {
  allPermissions = input.required<readonly Permission[]>();
  assignedPermissions = input<readonly Permission[] | undefined>();
  isLoading = input<boolean>(false);
  isSuperAdmin = input(false, { transform: booleanAttribute }); // Nieuwe input
  savePermissions = output<string[]>();

  protected selection = signal<Set<string>>(new Set());
  private initialSelection = new Set<string>();
  
  protected isDirty = computed(() => {
    if (this.isSuperAdmin()) return false; // SuperAdmin is nooit 'dirty'
    if (this.selection().size !== this.initialSelection.size) return true;
    for (const item of this.selection()) {
      if (!this.initialSelection.has(item)) return true;
    }
    return false;
  });

  constructor() {
    effect(() => {
      const assigned = this.assignedPermissions();
      // Als het SuperAdmin is, selecteer dan ALLES.
      const newSelection = this.isSuperAdmin()
        ? new Set(this.allPermissions().map(p => p.value))
        : new Set(assigned?.map(p => p.value) ?? []);
      
      this.selection.set(newSelection);
      this.initialSelection = new Set(newSelection);
    });
  }

  togglePermission(permissionValue: string): void {
    if (this.isSuperAdmin()) return; // Extra beveiliging
    this.selection.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(permissionValue)) {
        newSet.delete(permissionValue);
      } else {
        newSet.add(permissionValue);
      }
      return newSet;
    });
  }

  onSave(): void {
    if (this.isSuperAdmin()) return; // Extra beveiliging
    this.savePermissions.emit(Array.from(this.selection()));
    this.initialSelection = new Set(this.selection());
  }
}