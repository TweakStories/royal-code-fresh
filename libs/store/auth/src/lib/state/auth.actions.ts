// libs/store/auth/src/lib/state/auth.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@royal-code/auth/domain';
import { Profile } from '@royal-code/shared/domain';

export const AuthActions = createActionGroup({
  source: 'Auth', // Bron van de acties
  events: {
    // --- UI / Component Initiated Actions ---
    'Login Page Submitted': props<{ credentials: LoginCredentials }>(),
    'Logout Button Clicked': emptyProps(),
    'Check Auth Status on App Init': emptyProps(),
    'Clear Auth Error': emptyProps(),
    'Login Prompt Required': props<{
      messageKey?: string; // Optionele i18n key voor een bericht zoals "Log in om door te gaan"
      reason?: string; // Voor logging, bv. 'MESSAGE_LIMIT_REACHED'
    }>(),

    // --- Auth API / Effect Initiated Actions ---
    'Login Success': props<{ response: AuthResponse; returnUrl: string }>(),
    'Login Failure': props<{ error: string }>(),

    'Refresh Token Requested': emptyProps(),
    'Refresh Token Success': props<{ response: AuthResponse }>(),
    'Refresh Token Failure': props<{ error: string }>(),

    'Logout API Success': emptyProps(),
    'Logout API Failure': props<{ error: string }>(),

    'Session Expired And Requires Login': emptyProps(),
    'Logout Completed': emptyProps(),
    'Session Restored': props<{ accessToken: string; refreshToken: string | undefined; decodedUser: Profile }>(),
        'Silent Refresh Triggered': emptyProps(),
    'Token Will Expire Soon': props<{ secondsUntilExpiry: number }>(),

    'Register Page Submitted': props<{ credentials: RegisterCredentials }>(),

    // --- Auth API / Effect Initiated Actions ---
    'Register Success': props<{ response: AuthResponse; returnUrl: string }>(),
    'Register Failure': props<{ error: string }>(),

  }
});
