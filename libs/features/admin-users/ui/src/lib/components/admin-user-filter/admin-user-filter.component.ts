/**
 * @file admin-user-filter.component.ts
 * @version 1.0.0
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-29
 * @description Dumb component for filtering the admin user list.
 */
import { Component, ChangeDetectionStrategy, output, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UiInputComponent } from '@royal-code/ui/input';
import { AppIcon } from '@royal-code/shared/domain';

export interface UserFilters {
  searchTerm?: string;
  role?: string;
}

@Component({
  selector: 'admin-user-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInputComponent],
  template: `
    <div class="flex flex-col sm:flex-row gap-4 p-4 bg-surface-alt border border-border rounded-xs">
      <royal-code-ui-input
        [(ngModel)]="searchTerm"
        placeholder="Zoek op naam of e-mail..."
        [icon]="AppIcon.Search" iconPosition="left" extraClasses="flex-grow" />
      <select [(ngModel)]="roleFilter"
        class="w-full sm:w-48 p-2 border border-input rounded-md bg-background text-sm focus:ring-primary focus:border-primary">
        <option value="">Alle Rollen</option>
        @for (role of availableRoles(); track role) {
          <option [value]="role">{{ role }}</option>
        }
      </select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserFilterComponent {
  availableRoles = input.required<readonly string[]>();
  filtersChanged = output<UserFilters>();

  protected readonly AppIcon = AppIcon;
  protected searchTerm = '';
  protected roleFilter = '';

  constructor() {
    effect(() => {
      const filters: UserFilters = {
        searchTerm: this.searchTerm || undefined,
        role: this.roleFilter || undefined,
      };
      this.filtersChanged.emit(filters);
    });
  }
}