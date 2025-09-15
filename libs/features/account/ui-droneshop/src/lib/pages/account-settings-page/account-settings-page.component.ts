/**
 * @file account-settings-page.component.ts
 * @Version 2.0.0 (Definitive Functional Implementation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Pagina voor het beheren van account-specifieke instellingen zoals wachtwoord
 *   en accountverwijdering, nu volledig functioneel en gekoppeld aan de state.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractControl, ReactiveFormsModule, FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';

import { UiTitleComponent } from '@royal-code/ui/title';
import { ChangePasswordPayload, DeleteAccountPayload, TitleTypeEnum } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { NotificationService } from '@royal-code/ui/notifications';
import { AccountFacade } from '@royal-code/features/account/core';

@Component({
  selector: 'droneshop-account-settings-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, UiTitleComponent, UiCardComponent, UiButtonComponent, UiInputComponent, UiSpinnerComponent],
  template: `
    <div class="space-y-8">
      <royal-code-ui-title 
        [level]="TitleTypeEnum.H1" 
        [text]="'navigation.settings' | translate" 
      />

      <!-- Sectie: Wachtwoord Wijzigen -->
      <royal-code-ui-card>
        <form [formGroup]="changePasswordForm" (ngSubmit)="onChangePasswordSubmit()" class="space-y-6">
          <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'account.profile.security.changePassword.title' | translate" />
          
          <div class="p-4 bg-surface-alt rounded-md space-y-4">
             <royal-code-ui-input 
               type="password"
               [label]="'account.profile.security.changePassword.currentPassword' | translate"
               formControlName="currentPassword"
               [required]="true"
             />
             <royal-code-ui-input 
               type="password"
               [label]="'account.profile.security.changePassword.newPassword' | translate"
               formControlName="newPassword"
               [required]="true"
             />
             <royal-code-ui-input 
               type="password"
               [label]="'account.profile.security.changePassword.confirmNewPassword' | translate"
               formControlName="confirmNewPassword"
               [required]="true"
               [error]="changePasswordForm.hasError('passwordsDoNotMatch') ? ('account.profile.security.errors.passwordsDoNotMatch' | translate) : null"
             />
          </div>
          <div class="flex justify-end">
            <royal-code-ui-button type="primary" htmlType="submit" [disabled]="changePasswordForm.invalid || viewModel().isSubmitting">
              @if(viewModel().isSubmitting) { <royal-code-ui-spinner size="sm" /> }
              @else { <span>{{ 'account.profile.security.changePassword.button' | translate }}</span> }
            </royal-code-ui-button>
          </div>
        </form>
      </royal-code-ui-card>
      
      <!-- Sectie: Account Verwijderen -->
       <royal-code-ui-card>
          <form [formGroup]="deleteAccountForm" (ngSubmit)="onDeleteAccountSubmit()" class="space-y-4">
            <div>
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'account.profile.deleteAccount.title' | translate" extraClasses="!text-error" />
              <p class="text-secondary mt-1 text-sm">{{ 'account.profile.deleteAccount.description' | translate }}</p>
            </div>
             <royal-code-ui-input 
               type="password"
               [label]="'account.profile.deleteAccount.passwordConfirmation' | translate"
               formControlName="password"
               [required]="true"
             />
            <div class="flex justify-end">
              <royal-code-ui-button type="theme-fire" htmlType="submit" [disabled]="deleteAccountForm.invalid || viewModel().isSubmitting">
                @if(viewModel().isSubmitting) { <royal-code-ui-spinner size="sm" /> }
                @else { <span>{{ 'account.profile.deleteAccount.button' | translate }}</span> }
              </royal-code-ui-button>
            </div>
          </form>
       </royal-code-ui-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsPageComponent {
  protected readonly TitleTypeEnum = TitleTypeEnum;
  private readonly facade = inject(AccountFacade);
  private readonly notificationService = inject(NotificationService);

  readonly viewModel = this.facade.viewModel;

  changePasswordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmNewPassword: new FormControl('', [Validators.required]),
  }, { validators: this.passwordsMatchValidator });

  deleteAccountForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
  });

  onChangePasswordSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
    const payload: ChangePasswordPayload = this.changePasswordForm.getRawValue() as ChangePasswordPayload;
    this.facade.changePassword(payload);
  }

  onDeleteAccountSubmit(): void {
    if (this.deleteAccountForm.invalid) {
      this.deleteAccountForm.markAllAsTouched();
      return;
    }
    this.notificationService.showConfirmationDialog({
      titleKey: 'account.profile.deleteAccount.confirmTitle',
      messageKey: 'account.profile.deleteAccount.confirmMessage',
      confirmButtonKey: 'common.buttons.delete',
      cancelButtonKey: 'common.buttons.cancel',
      confirmButtonType: 'theme-fire',
    }).subscribe(confirmed => {
      if (confirmed) {
        const payload: DeleteAccountPayload = this.deleteAccountForm.getRawValue() as DeleteAccountPayload;
        this.facade.deleteAccount(payload);
      }
    });
  }

  // Custom validator om te controleren of de nieuwe wachtwoorden overeenkomen
  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');
    return newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value 
      ? { passwordsDoNotMatch: true } 
      : null;
  };
}