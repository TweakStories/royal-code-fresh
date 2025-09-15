/**
 * @file user-form.component.ts
 * @version 5.0.0 (SuperAdmin Role Protection)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description Reusable form for users, with a disabled checkbox for the 'SuperAdmin' role.
 */
import { Component, ChangeDetectionStrategy, input, output, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CreateUserPayload, UpdateUserPayload, AdminUser, Role } from '@royal-code/features/admin-users/domain';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { AdminUsersFacade, AdminUsersViewModel } from '@royal-code/features/admin-users/core';
import { TranslateModule } from '@ngx-translate/core';
import { effect } from '@angular/core';

@Component({
  selector: 'admin-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, TranslateModule,
    UiTitleComponent, UiButtonComponent, UiInputComponent,
    UiTextareaComponent, UiSpinnerComponent
  ],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSave()">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b border-border px-4">
        <div class="flex justify-between items-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="isEditMode() ? ('admin.users.editTitle' | translate) : ('admin.users.createTitle' | translate)" />
          <div class="flex items-center gap-3">
            <royal-code-ui-button type="outline" routerLink="/users">{{ 'common.buttons.cancel' | translate }}</royal-code-ui-button>
            <royal-code-ui-button type="primary" htmlType="submit" [disabled]="!userForm.valid || viewModel().isSubmitting">
              @if (viewModel().isSubmitting) { <royal-code-ui-spinner size="sm" extraClass="mr-2" /><span>{{ 'common.buttons.saving' | translate }}</span> }
              @else { <span>{{ 'common.buttons.save' | translate }}</span> }
            </royal-code-ui-button>
          </div>
        </div>
      </div>

      <div class="p-2 md:p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Account Info -->
          <div class="p-6 bg-card border border-border rounded-xs">
            <h3 class="text-lg font-medium mb-4">{{ 'admin.users.form.accountInfo' | translate }}</h3>
            <div class="space-y-4">
              <royal-code-ui-input [label]="'admin.users.form.email' | translate" formControlName="email" type="email" [required]="true" />
              <royal-code-ui-input [label]="'admin.users.form.displayName' | translate" formControlName="displayName" [required]="true" />
            </div>
          </div>
          <!-- Profile Info -->
          <div class="p-6 bg-card border border-border rounded-xs">
            <h3 class="text-lg font-medium mb-4">{{ 'admin.users.form.profileInfo' | translate }}</h3>
            <div class="space-y-4">
              <royal-code-ui-input [label]="'admin.users.form.firstName' | translate" formControlName="firstName" />
              <royal-code-ui-input [label]="'admin.users.form.middleName' | translate" formControlName="middleName" />
              <royal-code-ui-input [label]="'admin.users.form.lastName' | translate" formControlName="lastName" />
              <royal-code-ui-textarea [label]="'admin.users.form.bio' | translate" formControlName="bio" [rows]="4" />
            </div>
          </div>
           <!-- Password Section -->
          <div class="p-6 bg-card border border-border rounded-xs">
            <h3 class="text-lg font-medium mb-4">{{ 'admin.users.form.password' | translate }}</h3>
            <div class="space-y-4">
                @if (isEditMode()) {
                    <royal-code-ui-input [label]="'admin.users.form.newPassword' | translate" formControlName="newPassword" type="password" />
                    <div class="flex justify-end">
                        <royal-code-ui-button type="primary" (clicked)="onSetPassword()" [disabled]="!userForm.get('newPassword')?.value">
                            {{ 'admin.users.form.setPasswordButton' | translate }}
                        </royal-code-ui-button>
                    </div>
                } @else {
                    <royal-code-ui-input [label]="'admin.users.form.password' | translate" formControlName="password" type="password" [required]="true" />
                }
            </div>
          </div>
        </div>
        <!-- Sidebar -->
        <aside class="lg:col-span-1 space-y-6 sticky top-24">
          <!-- Roles -->
          <div class="p-6 bg-card border border-border rounded-xs">
            <h3 class="text-lg font-medium mb-4">{{ 'admin.users.form.roles' | translate }}</h3>
            <div class="space-y-2">
              @for(role of viewModel().availableRoles; track role.id) {
                <label class="flex items-center" [class.cursor-not-allowed]="role.name === 'SuperAdmin'" [class.opacity-60]="role.name === 'SuperAdmin'">
                  <input 
                    type="checkbox" 
                    [checked]="isRoleSelected(role)" 
                    (change)="toggleRole(role)" 
                    class="mr-2 h-4 w-4 rounded text-primary focus:ring-primary border-border"
                    [disabled]="role.name === 'SuperAdmin'">
                  <span>{{ role.name }}</span>
                </label>
              }
            </div>
          </div>
          <!-- Account Status -->
          @if (isEditMode() && user()) {
            <div class="p-6 bg-card border border-border rounded-xs">
                <h3 class="text-lg font-medium mb-4">Account Status</h3>
                @if (user()!.isLockedOut) {
                    <p class="text-sm text-warning mb-4">This account is currently locked.</p>
                    <royal-code-ui-button type="primary" (clicked)="onUnlockUser()">
                        Unlock Account
                    </royal-code-ui-button>
                } @else {
                     <p class="text-sm text-secondary mb-4">This account is active.</p>
                    <royal-code-ui-button type="fire" (clicked)="onLockUser()">
                        Lock Account
                    </royal-code-ui-button>
                }
            </div>
          }
        </aside>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
  user = input<AdminUser>();
  viewModel = input.required<AdminUsersViewModel>();
  save = output<UpdateUserPayload>();
  lockUser = output<void>();
  unlockUser = output<void>();
  setPassword = output<string>();

  isEditMode = computed(() => !!this.user());
  protected readonly TitleTypeEnum = TitleTypeEnum;
  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', Validators.required],
      firstName: [''],
      middleName: [null],
      lastName: [''],
      bio: [''],
      roles: this.fb.control([] as string[]),
      password: [''],
      newPassword: [''],
    });

    effect(() => {
        const userData = this.user();
        if (this.isEditMode() && userData) {
            this.userForm.patchValue({
                ...userData,
                roles: userData.roles
            });
            this.userForm.get('email')?.disable();
            this.userForm.get('password')?.clearValidators();
            this.userForm.get('newPassword')?.reset();
        } else {
            this.userForm.reset({ roles: [] });
            this.userForm.get('email')?.enable();
            this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        }
        this.userForm.get('password')?.updateValueAndValidity();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    if (!this.isEditMode()) {
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  isRoleSelected(role: Role): boolean {
    return this.userForm.get('roles')?.value.includes(role.name);
  }

  toggleRole(role: Role): void {
    if (role.name === 'SuperAdmin') return; // Voorkom wijziging
    const rolesControl = this.userForm.get('roles');
    if (!rolesControl) return;
    const currentRoles = [...rolesControl.value as string[]];
    const index = currentRoles.indexOf(role.name);
    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(role.name);
    }
    rolesControl.setValue(currentRoles);
  }

  onSave(): void {
    if (this.userForm.invalid) return;
    const rawValue = this.userForm.getRawValue();
    if (this.isEditMode()) {
        const payload: UpdateUserPayload = {
            displayName: rawValue.displayName,
            firstName: rawValue.firstName,
            middleName: rawValue.middleName,
            lastName: rawValue.lastName,
            bio: rawValue.bio,
            roles: rawValue.roles
        };
        this.save.emit(payload);
    } else {
        const payload: CreateUserPayload = {
            email: rawValue.email,
            password: rawValue.password,
            displayName: rawValue.displayName,
            firstName: rawValue.firstName,
            middleName: rawValue.middleName,
            lastName: rawValue.lastName,
            bio: rawValue.bio,
            roles: rawValue.roles
        };
        this.save.emit(payload as any);
    }
  }

  onLockUser(): void { this.lockUser.emit(); }
  onUnlockUser(): void { this.unlockUser.emit(); }

  onSetPassword(): void {
    const newPassword = this.userForm.get('newPassword')?.value;
    if (newPassword) {
      this.setPassword.emit(newPassword);
      this.userForm.get('newPassword')?.reset();
    }
  }
}