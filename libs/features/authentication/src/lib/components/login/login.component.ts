// libs/features/authentication/src/lib/components/login/login.component.ts

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms'; // Import FormGroup
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router'; // Nodig voor routerLink

// --- UI Components ---
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';

// --- Core Services ---
import { LoggerService } from '@royal-code/core/core-logging';

// --- Auth State & Facade ---
import { AuthFacade } from '@royal-code/store/auth';
import { LoginCredentials } from '@royal-code/auth/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';

/**
 * @Component LoginComponent
 * @Description Handles user login via email and password. It displays a form,
 *              validates input, shows loading/error states from the AuthFacade,
 *              and dispatches the login action via the AuthFacade upon submission.
 *              Navigation upon success/failure is handled by AuthEffects.
 */
@Component({
  selector: 'royal-code-login', // Consistent prefix
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    UiInputComponent,
    UiButtonComponent,
    UiParagraphComponent
],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <!-- Logo -->
        <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-text">
          {{ 'auth.login.title' | translate }}
        </h2>
        <p>administrator@localhost</p>
        <p>Administrator1!</p>
      </div>


      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">

          <!-- Loading Indicator -->
          @if (isLoading()) {
            <div class="text-center text-sm text-secondary my-4" role="status" aria-live="polite">
              {{ 'common.messages.loading' | translate }}
              <!-- Optional: Add spinner component -->
            </div>
          }

          <!-- General Authentication Error -->
          @if (authError(); as errorKey) {
            <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
               <!-- Consider mapping specific backend errors to user-friendly translation keys -->
               <p>{{ (errorKey || 'common.errors.genericAuth') | translate }}</p>
            </div>
          }

          <!-- Email Input Field -->
          <div>
            <royal-code-ui-input
              formControlName="email"
              type="email"
              [label]="'auth.login.email' | translate"
              [placeholder]="'common.placeholders.email' | translate"
              [required]="true"
              autocomplete="email"
              [error]="getErrorMessage('email')" /> <!-- Pass key directly -->
          </div>

          <!-- Password Input Field -->
          <div>
            <royal-code-ui-input
              formControlName="password"
              type="password"
              [label]="'auth.login.password' | translate"
              [placeholder]="'common.placeholders.password' | translate"
              [required]="true"
              autocomplete="current-password"
              [error]="getErrorMessage('password')" /> <!-- Pass key directly -->
             <!-- Optional: Forgot Password Link -->
             <div class="mt-1 text-right text-sm">
                <!-- TODO: Implement Forgot Password Flow -->
                <a routerLink="/forgot-password" class="font-semibold text-primary hover:text-primary/80"> <!-- Pas route aan! -->
                    {{ 'auth.login.forgotPassword' | translate }}
                </a>
             </div>
          </div>

          <!-- Submit Button -->
          <div>
            <royal-code-ui-button
              type="primary"
              htmlType="submit"
              [disabled]="loginForm.invalid || isLoading()"
              >
              {{ 'auth.login.submit' | translate }}
            </royal-code-ui-button>
          </div>
        </form>

        <!-- Link to Registration -->
<royal-code-ui-paragraph size="lg" extraClasses="mt-10 text-center text-secondary">
  {{ 'auth.login.noAccount' | translate }}
  <a routerLink="/register" class="font-semibold leading-6 text-primary hover:text-primary/80">
     {{ 'auth.register.linkText' | translate }}
  </a>
</royal-code-ui-paragraph>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  // --- Dependencies ---
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  /** Facade for interacting with Authentication state and actions. */
  readonly authFacade = inject(AuthFacade);

  // --- State Signals from Facade ---
  /** Signal indicating if an authentication process is ongoing. */
  readonly isLoading = this.authFacade.isLoading;
  /** Signal holding the latest authentication error message key, or null. */
  readonly authError = this.authFacade.error;

  /**
   * Reactive form group for login credentials.
   * Includes validators for required fields and email format.
   */
  readonly loginForm: FormGroup = this.fb.group({
    // Using NonNullableFormBuilder might be an option for stricter typing if needed
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  /**
   * Handles the form submission event.
   * Validates the form, logs details, and dispatches the login action
   * via the AuthFacade if the form is valid and not already loading.
   */
  onSubmit(): void {
    const M = '[LoginComponent] onSubmit:'; // Message prefix for logs
    this.logger.info(`${M} Triggered.`);
    this.loginForm.markAllAsTouched(); // Ensure validation messages are shown

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    // Log current state before validation checks
    this.logger.debug(`${M} Checking conditions before dispatch...`, {
        isInvalid: this.loginForm.invalid,
        isLoading: this.isLoading(),
        formStatus: this.loginForm.status,
        formErrors: this.loginForm.errors,
        emailErrors: this.loginForm.get('email')?.errors,
        passwordErrors: this.loginForm.get('password')?.errors,
        emailValueProvided: !!email,
        passwordValueProvided: !!password
    });

    // Prevent submission if form is invalid or already loading
    if (this.loginForm.invalid || this.isLoading()) {
      this.logger.warn(`${M} Submission prevented. Form invalid: ${this.loginForm.invalid}, Loading: ${this.isLoading()}.`);
      // Optionally provide user feedback if form is invalid
      // if (this.loginForm.invalid) { /* e.g., show general form error */ }
      return;
    }

    // Ensure values are present (should be guaranteed by validators, but good practice)
    if (!email || !password) {
        this.logger.error(`${M} Email or password missing unexpectedly despite form validity.`);
        // Optionally show a generic error to the user
        return;
    }

    // --- Dispatch Login Action via Facade ---
    const credentials: LoginCredentials = { email, password };
    this.logger.info(`${M} Form valid & not loading. Dispatching login action via AuthFacade.`);
    this.authFacade.login(credentials);
    // ----------------------------------------

    // Navigation logic is now handled within AuthEffects upon successful login action.
  }

  /**
   * Retrieves the appropriate translation key for a validation error
   * on a specific form control.
   * @param controlName The name of the form control ('email' or 'password').
   * @returns The translation key string for the error, or an empty string if no error should be shown.
   */
  getErrorMessage(controlName: 'email' | 'password'): string {
    const control = this.loginForm.get(controlName);

    // Only show error if control is invalid and has been touched or dirtied
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        // Return the translation key for the required field error
        return 'errors.validation.requiredField';
      }
      if (control.errors?.['email']) {
         // Return the translation key for the invalid email error
        return 'errors.validation.invalidEmail';
      }
      // Add checks for other potential validators here (e.g., minlength)
      // if (control.errors?.['minlength']) {
      //   return 'errors.validation.minLength'; // Example
      // }
    }
    // No error to display for this control
    return '';
  }
}
