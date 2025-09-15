/**
 * @file user-management-page.component.ts
 * @version 8.0.0 (Refactored - User List Only)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-29
 * @description Smart component focused solely on displaying and managing the user list.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminUsersFacade } from '@royal-code/features/admin-users/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { AppIcon } from '@royal-code/shared/domain';
import { AdminUserListComponent, AdminUserFilterComponent, UserFilters } from '@royal-code/features/admin-users/ui';
import { UiPaginationComponent } from '@royal-code/ui/pagination';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'admin-user-management-page',
  standalone: true,
  imports: [
    CommonModule,
    UiTitleComponent,
    UiButtonComponent,
    UiIconComponent,
    UiSpinnerComponent,
    AdminUserListComponent,
    AdminUserFilterComponent,
    UiPaginationComponent,
    TranslateModule
  ],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'admin.users.management.title' | translate" />
        <royal-code-ui-button type="primary" (clicked)="createUser()">
          <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2"/>
          {{ 'admin.users.management.newUser' | translate }}
        </royal-code-ui-button>
      </div>

      @if (vm(); as viewModel) {
        <admin-user-filter
          [availableRoles]="availableRoleNames()"
          (filtersChanged)="onFiltersChanged($event)"
        ></admin-user-filter>

        @if(viewModel.isLoading && viewModel.users.length === 0) {
          <div class="flex justify-center items-center h-64">
            <royal-code-ui-spinner size="lg" />
          </div>
        } @else {
          <admin-user-list
            [users]="viewModel.users"
            (editClicked)="editUser($event)"
            (deleteClicked)="deleteUser($event)"
          />
          <royal-code-ui-pagination
            [totalItems]="viewModel.totalCount"
            [currentPage]="viewModel.page"
            [pageSize]="viewModel.pageSize"
            (goToPage)="onPageChange($event)"
          />
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementPageComponent implements OnInit {
  protected readonly facade = inject(AdminUsersFacade);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  protected readonly vm = this.facade.viewModel;
  protected readonly availableRoleNames = computed(() => {
    return this.vm()?.availableRoles.map(r => r.name) ?? [];
  });

  ngOnInit(): void {
    this.facade.initPage();
  }

  onFiltersChanged(filters: UserFilters): void {
    this.facade.changeFilters({ ...filters, page: 1 });
  }

  createUser(): void {
    this.router.navigate(['/users/new']);
  }

  editUser(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  deleteUser(userId: string): void {
    if (confirm(this.translate.instant('admin.users.management.confirmDeleteUser'))) {
      this.facade.deleteUser(userId);
    }
  }

  onPageChange(page: number): void {
    this.facade.changeFilters({ page });
  }
}