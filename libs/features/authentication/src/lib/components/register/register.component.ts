// --- VERVANG VOLLEDIG BESTAND: libs/features/authentication/src/lib/components/register/register.component.ts ---
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';
import { LoggerService } from '@royal-code/core/core-logging';
import { AuthFacade } from '@royal-code/store/auth';
import { RegisterCredentials } from '@royal-code/auth/domain';

@Component({
  selector: 'royal-code-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    UiInputComponent,
    UiButtonComponent,
    TranslateModule
  ],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-text">
          {{ 'auth.register.title' | translate }}
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          @if (authFacade.isLoading()) {
            <div class="text-center text-sm text-secondary my-4" role="status">
              {{ 'common.messages.loading' | translate }}
            </div>
          }
          @if (authFacade.error(); as errorKey) {
            <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
               <p>{{ (errorKey) | translate }}</p>
            </div>
          }

          <royal-code-ui-input
            formControlName="firstName"
            type="text"
            [label]="'auth.register.firstName' | translate"
            [required]="true"
            autocomplete="given-name"
            [error]="getErrorMessage('firstName')" />

          <!-- NIEUW VELDE: Middle Name (optioneel) -->
          <royal-code-ui-input
            formControlName="middleName"
            type="text"
            [label]="'auth.register.middleName' | translate"
            [required]="false"
            autocomplete="additional-name"
            [error]="getErrorMessage('middleName')" />

          <royal-code-ui-input
            formControlName="lastName"
            type="text"
            [label]="'auth.register.lastName' | translate"
            [required]="true"
            autocomplete="family-name"
            [error]="getErrorMessage('lastName')" />

          <royal-code-ui-input
            formControlName="displayName"
            type="text"
            [label]="'auth.register.displayName' | translate"
            [required]="true"
            autocomplete="nickname"
            [error]="getErrorMessage('displayName')" />

          <royal-code-ui-input
            formControlName="email"
            type="email"
            [label]="'auth.login.email' | translate"
            [required]="true"
            autocomplete="email"
            [error]="getErrorMessage('email')" />

          <royal-code-ui-input
            formControlName="password"
            type="password"
            [label]="'auth.login.password' | translate"
            [required]="true"
            autocomplete="new-password"
            [error]="getErrorMessage('password')" />

          <royal-code-ui-input
            formControlName="confirmPassword"
            type="password"
            [label]="'auth.register.confirmPassword' | translate"
            [required]="true"
            autocomplete="new-password"
            [error]="getErrorMessage('confirmPassword')" />

          <div>
            <royal-code-ui-button
              type="primary"
              htmlType="submit"
              [disabled]="registerForm.invalid || authFacade.isLoading()">
              {{ 'auth.register.submit' | translate }}
            </royal-code-ui-button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm text-secondary">
          {{ 'auth.register.alreadyAccount' | translate }}
          <a routerLink="/login" class="font-semibold leading-6 text-primary hover:text-primary/80">
             {{ 'auth.login.linkText' | translate }}
          </a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  readonly authFacade = inject(AuthFacade);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  private readonly translate = inject(TranslateService);

  readonly registerForm = this.fb.group({
    firstName: ['', Validators.required],
    middleName: [null as string | null], // NIEUW: Optioneel en nullable
    lastName: ['', Validators.required],
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/[A-Z]/),
      Validators.pattern(/[a-z]/),
      Validators.pattern(/[0-9]/),
      Validators.pattern(/[^a-zA-Z0-9]/)
    ]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordsMatchValidator });

  onSubmit(): void {
    if (this.registerForm.invalid || this.authFacade.isLoading()) return;
    const { firstName, middleName, lastName, displayName, email, password } = this.registerForm.getRawValue();
    const credentials: RegisterCredentials = { 
      firstName: firstName!, 
      middleName: middleName, // Geef null of undefined door als het veld leeg is
      lastName: lastName!, 
      displayName: displayName!, 
      email: email!, 
      password: password! 
    };
    this.authFacade.register(credentials);
  }

  getErrorMessage(controlName: 'firstName' | 'middleName' | 'lastName' | 'displayName' | 'email' | 'password' | 'confirmPassword'): string {
    const control = this.registerForm.get(controlName);
    if (!control) return '';

    if (control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return this.translate.instant('errors.validation.requiredField');
      if (control.errors?.['email']) return this.translate.instant('errors.validation.invalidEmail');

      if (controlName === 'password') {
        const passwordValue = control.value;
        if (typeof passwordValue !== 'string' || passwordValue === null) {
          return this.translate.instant('errors.validation.requiredField');
        }
        if (control.errors?.['minlength']) {
          const requiredLength = control.errors['minlength'].requiredLength;
          return this.translate.instant('errors.validation.password.tooShort', { requiredLength });
        }
        if (control.errors?.['pattern']) {
          if (!passwordValue.match(/[A-Z]/)) return this.translate.instant('errors.validation.password.noUppercase');
          if (!passwordValue.match(/[a-z]/)) return this.translate.instant('errors.validation.password.noLowercase');
          if (!passwordValue.match(/[0-9]/)) return this.translate.instant('errors.validation.password.noDigit');
          if (!passwordValue.match(/[^a-zA-Z0-9]/)) return this.translate.instant('errors.validation.password.noSpecialChar');
        }
      }
    }

    if (controlName === 'confirmPassword' && this.registerForm.hasError('passwordsDoNotMatch')) {
      return this.translate.instant('errors.validation.passwordsDoNotMatch');
    }
    
    return '';
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value ? { passwordsDoNotMatch: true } : null;
  }
}