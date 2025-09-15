/**
 * @file admin-user-list.component.ts
 * @version 1.0.0
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-28
 * @description Dumb component to display a list of admin users.
 */
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminUser } from '@royal-code/features/admin-users/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiBadgeComponent } from '@royal-code/ui/badge';

@Component({
  selector: 'admin-user-list',
  standalone: true,
  imports: [CommonModule, DatePipe, UiIconComponent, UiButtonComponent, UiBadgeComponent],
  template: `
    <div class="bg-card border border-border rounded-xs overflow-x-auto">
      <table class="w-full text-sm text-left text-secondary whitespace-nowrap">
        <thead class="text-xs text-muted uppercase bg-surface-alt">
          <tr>
            <th scope="col" class="p-4">Display Name</th>
            <th scope="col" class="p-4">Email</th>
            <th scope="col" class="p-4">Roles</th>
            <th scope="col" class="p-4">Status</th>
            <th scope="col" class="p-4">Created At</th>
            <th scope="col" class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (user of users(); track user.id) {
            <tr class="border-b border-border hover:bg-hover">
              <td class="p-4 font-medium text-foreground">{{ user.displayName }}</td>
              <td class="p-4">{{ user.email }}</td>
              <td class="p-4">
                <div class="flex flex-wrap gap-1">
                  @for(role of user.roles; track role) {
                    <royal-code-ui-badge [color]="'primary'">{{ role }}</royal-code-ui-badge>
                  }
                </div>
              </td>
              <td class="p-4">
                @if(user.isLockedOut) {
                  <royal-code-ui-badge [color]="'error'">Locked</royal-code-ui-badge>
                } @else {
                  <royal-code-ui-badge [color]="'success'">Active</royal-code-ui-badge>
                }
              </td>
              <td class="p-4">{{ user.createdAt.iso | date:'short' }}</td>
              <td class="p-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <royal-code-ui-button type="outline" sizeVariant="icon" (clicked)="editClicked.emit(user.id)" title="Bewerken">
                    <royal-code-ui-icon [icon]="AppIcon.Edit" />
                  </royal-code-ui-button>
                  <royal-code-ui-button type="fire" sizeVariant="icon" (clicked)="deleteClicked.emit(user.id)" title="Verwijderen">
                    <royal-code-ui-icon [icon]="AppIcon.Trash2" />
                  </royal-code-ui-button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="p-8 text-center">No users found.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserListComponent {
  users = input.required<readonly AdminUser[]>();
  editClicked = output<string>();
  deleteClicked = output<string>();

  protected readonly AppIcon = AppIcon;
}