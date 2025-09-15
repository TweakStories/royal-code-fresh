/**
 * @file user-edit-page.component.ts
 * @version 4.0.0 (Full Implementation with Actions)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description Smart component for editing a user, connecting form outputs to facade actions.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminUsersFacade } from '@royal-code/features/admin-users/core';
import { UpdateUserPayload } from '@royal-code/features/admin-users/domain';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { filter, map } from 'rxjs';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';

@Component({
  selector: 'admin-user-edit-page',
  standalone: true,
  imports: [CommonModule, UserFormComponent, UiSpinnerComponent],
  template: `
    @if(vm(); as viewModel) {
      @if (viewModel.isLoading && !viewModel.selectedUser) {
        <div class="flex justify-center items-center h-64">
          <royal-code-ui-spinner size="lg" />
        </div>
      } @else if (viewModel.selectedUser) {
        <admin-user-form
          [viewModel]="viewModel"
          [user]="viewModel.selectedUser"
          (save)="onUpdate($event)"
          (lockUser)="onLockUser()"
          (unlockUser)="onUnlockUser()"
          (setPassword)="onSetPassword($event)"
        />
      } @else {
        <p class="p-4 text-destructive">User not found or failed to load.</p>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditPageComponent implements OnInit {
  protected readonly facade = inject(AdminUsersFacade);
  private readonly route = inject(ActivatedRoute);
  protected readonly vm = this.facade.viewModel;
  private userId: string | null = null;

  ngOnInit(): void {
    this.facade.initPage();
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id)
    ).subscribe(id => {
      this.userId = id;
      this.facade.selectUser(id);
    });
  }

  onUpdate(payload: UpdateUserPayload): void {
    if (this.userId) {
      this.facade.updateUser(this.userId, payload);
    }
  }
  
  onLockUser(): void {
    if (this.userId) {
      // Optioneel: vraag om een 'lockoutEnd' datum. Voor nu, permanent.
      this.facade.lockUser(this.userId, null);
    }
  }

  onUnlockUser(): void {
    if (this.userId) {
      this.facade.unlockUser(this.userId);
    }
  }

  onSetPassword(newPassword: string): void {
    if (this.userId) {
      this.facade.setPassword(this.userId, newPassword);
    }
  }
}