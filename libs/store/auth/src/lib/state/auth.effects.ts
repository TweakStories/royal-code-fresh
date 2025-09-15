/**
 * @file auth.effects.ts
 * @Version 2.6.0 (Robust Session Restore & Claim Mapping)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-05
 * @Description
 *   Orchestreert alle side-effects gerelateerd aan authenticatie. Deze versie fixt een
 *   kritieke bug waarbij de gebruiker werd uitgelogd na een refresh. De `checkAuthOnInit$`
 *   effect is nu robuust gemaakt om de standaard Microsoft Identity JWT claims
 *   (zoals `nameidentifier` en `name`) correct te mappen naar de frontend `Profile`
 *   interface, waardoor sessieherstel betrouwbaar werkt.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, timer } from 'rxjs';
import { map, exhaustMap, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';

import { AuthService, TokenStorageService } from '@royal-code/auth/data-access';
import { LoggerService } from '@royal-code/core/core-logging';
import { NotificationService } from '@royal-code/ui/notifications';
import { AuthActions } from './auth.actions';
import { Profile } from '@royal-code/shared/domain';
import { Image, MediaType } from '@royal-code/shared/domain';
import { TranslateService } from '@ngx-translate/core';
// LoginComponent import removed to avoid circular dependency
import { DynamicOverlayService } from '@royal-code/ui/overlay';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly store = inject(Store);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly overlayService = inject(DynamicOverlayService);
    private readonly translate = inject(TranslateService);

  
  private readonly LOG_PREFIX = '[AuthEffects]';

  /**
   * @effect loginRequested$
   * @description Handles the full login flow.
   */
     loginRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginPageSubmitted),
      tap(() => this.logger.info(`${this.LOG_PREFIX} Handling Login Page Submitted...`)),
      map(action => ({
        action,
        returnUrl: this.router.routerState.snapshot.root.queryParamMap.get('returnUrl') || '/'
      })),
      exhaustMap(({ action, returnUrl }) =>
        this.authService.login(action.credentials).pipe(
          map(response => {
            // Gebruik de nieuwe helper functie om het profiel te mappen.
            const userProfile: Profile = this.mapRawAvatarToImageToProfile(response.user);

            this.logger.info(`${this.LOG_PREFIX} Login API Success for user ${userProfile.id}.`);
            return AuthActions.loginSuccess({ 
              response: { ...response, user: userProfile }, 
              returnUrl 
            });
          }),
          catchError((error: HttpErrorResponse) => {
            const errorKey = error.status === 401 ? 'auth.login.invalidCredentials' : 'errors.server.unknownError';
            this.logger.warn(`${this.LOG_PREFIX} Login API call failed.`, { status: error.status, error });
            return of(AuthActions.loginFailure({ error: errorKey }));
          })
        )
      )
    )
  );

   showLoginPrompt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginPromptRequired),
      tap(({ messageKey, reason }) => {
        this.logger.info(`[AuthEffects] Login prompt required. Reason: ${reason ?? 'No reason specified'}`);
        // Toon eventueel een notificatie
        if (messageKey) {
            this.notificationService.showInfo(this.translate.instant(messageKey));
        }
        // Open de login component in een overlay (lazy loaded to avoid circular dependency)
        import('@royal-code/features/authentication').then(({ LoginComponent }) => {
          this.overlayService.open({
              component: LoginComponent,
              panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
              backdropType: 'dark',
              mobileFullscreen: true
          });
        });
      })
    ),
    { dispatch: false }
  );


  handleSessionExpired$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.sessionExpiredAndRequiresLogin),
    tap(() => {
      this.logger.info(`${this.LOG_PREFIX} Session expired. Clearing tokens and showing login overlay.`);
      this.tokenStorage.clearTokens(); // Maak de ongeldige tokens schoon
      this.store.dispatch(AuthActions.logoutCompleted()); // Zorg dat de state gereset wordt

      // Open hier de overlay. Je moet nog een SessionExpiredOverlayComponent maken.
      // this.overlayService.open({
      //   component: SessionExpiredOverlayComponent,
      //   backdropType: 'dark',
      //   panelClass: 'max-w-md'
      // });
    })
  ),
  { dispatch: false }
);


   /**
   * @effect checkAuthOnInit$
   * @description Checks for an existing session on app startup and maps the token data correctly.
   *              This effect is critical for maintaining user session across page refreshes.
   */
     checkAuthOnInit$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.checkAuthStatusOnAppInit),
    switchMap(() => {
      this.logger.debug(`${this.LOG_PREFIX} Checking auth status on init.`);
      
      const accessToken = this.tokenStorage.getAccessToken();
      const refreshToken = this.tokenStorage.getRefreshToken();

      // Geen tokens = geen sessie
      if (!accessToken || !refreshToken) {
        this.logger.debug(`${this.LOG_PREFIX} Geen tokens gevonden.`);
        this.tokenStorage.clearTokens();
        return of(AuthActions.logoutCompleted());
      }

      // Check alleen access token (refresh token is opaque)
      const isAccessExpired = this.tokenStorage.isAccessTokenExpired();

      // Access token verlopen = probeer te vernieuwen
      if (isAccessExpired) {
        this.logger.info(`${this.LOG_PREFIX} Access token verlopen, vernieuwen met refresh token...`);
        return this.authService.refreshToken().pipe(
          map(response => {
            this.logger.info(`${this.LOG_PREFIX} Token succesvol vernieuwd.`);
            const decodedUser = this.tokenStorage.getDecodedAccessToken();
            const mappedProfile = this.mapRawAvatarToImageToProfile(decodedUser);
            
            return AuthActions.sessionRestored({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken || refreshToken,
              decodedUser: mappedProfile
            });
          }),
          catchError((error) => {
            // Refresh token is waarschijnlijk verlopen op de server
            this.logger.error(`${this.LOG_PREFIX} Token vernieuwing mislukt, sessie verlopen.`, error);
            this.tokenStorage.clearTokens();
            return of(AuthActions.logoutCompleted());
          })
        );
      }

      // Token is geldig, herstel sessie
      this.logger.info(`${this.LOG_PREFIX} Access token geldig (nog ${this.tokenStorage.getTimeUntilExpiry()}s), sessie herstellen.`);
      const decodedUser = this.tokenStorage.getDecodedAccessToken();
      const mappedProfile = this.mapRawAvatarToImageToProfile(decodedUser);
      
      return of(AuthActions.sessionRestored({
        accessToken,
        refreshToken,
        decodedUser: mappedProfile
      }));
    })
  )
);

  private refreshTokenWithFallback() {
    return this.authService.refreshToken().pipe(
      map(response => {
        this.logger.info(`${this.LOG_PREFIX} Token succesvol vernieuwd.`);
        const decodedUser = this.tokenStorage.getDecodedAccessToken();
        const mappedProfile = this.mapRawAvatarToImageToProfile(decodedUser);
        
        return AuthActions.sessionRestored({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || this.tokenStorage.getRefreshToken()!,
          decodedUser: mappedProfile
        });
      }),
      catchError((error) => {
        this.logger.error(`${this.LOG_PREFIX} Token vernieuwing mislukt.`, error);
        this.tokenStorage.clearTokens();
        return of(AuthActions.logoutCompleted());
      })
    );
  }

    scheduleTokenRefresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sessionRestored, AuthActions.loginSuccess, AuthActions.refreshTokenSuccess),
      switchMap(() => {
        const timeUntilExpiry = this.tokenStorage.getTimeUntilExpiry();
        if (!timeUntilExpiry || timeUntilExpiry <= 0) return of();

        // Refresh 60 seconden voor expiry
        const refreshDelay = Math.max(0, (timeUntilExpiry - 60) * 1000);
        
        this.logger.debug(`${this.LOG_PREFIX} Token refresh gepland over ${refreshDelay / 1000}s`);
        
        return timer(refreshDelay).pipe(
          map(() => AuthActions.refreshTokenRequested())
        );
      })
    )
  );


    registerRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerPageSubmitted),
      tap(() => this.logger.info(`${this.LOG_PREFIX} Handling Register Page Submitted...`)),
      exhaustMap(({ credentials }) =>
        this.authService.register(credentials).pipe(
          map(response => {
            const userProfile: Profile = this.mapRawAvatarToImageToProfile(response.user);
            this.logger.info(`${this.LOG_PREFIX} Register API Success for user ${userProfile.id}.`);
            // Stuur gebruiker na registratie altijd naar de homepagina.
            return AuthActions.registerSuccess({ response: { ...response, user: userProfile }, returnUrl: '/' });
          }),
                    catchError((error: HttpErrorResponse) => {
            const defaultErrorKey = 'auth.register.genericError';
            let errorKey = defaultErrorKey;

            // Pars de backend ValidationProblemDetails voor specifieke foutcodes
            if (error.status === 400 && error.error?.errors) {
              const validationErrors = error.error.errors;
              // Loop door de fouten om de eerste relevante foutcode te vinden
              for (const field in validationErrors) {
                if (validationErrors.hasOwnProperty(field)) {
                  const fieldErrors = validationErrors[field];
                  for (const err of fieldErrors) {
                    switch (err.code) { // Gebruik de ErrorCode van de backend
                      case 'PasswordTooShort': errorKey = 'errors.validation.password.tooShort'; break;
                      case 'PasswordNoUppercase': errorKey = 'errors.validation.password.noUppercase'; break;
                      case 'PasswordNoLowercase': errorKey = 'errors.validation.password.noLowercase'; break;
                      case 'PasswordNoDigit': errorKey = 'errors.validation.password.noDigit'; break;
                      case 'PasswordNoSpecialChar': errorKey = 'errors.validation.password.noSpecialChar'; break;
                      case 'DuplicateUserName': errorKey = 'auth.register.duplicateEmail'; break; // specifieke duplicate error
                      // Voeg hier meer custom ErrorCodes toe indien nodig
                      default:
                        // Als er geen specifieke match is, toon een generieke fout
                        if (err.description) {
                            // Als de backend een gebruikersvriendelijke beschrijving geeft, gebruik die
                            // (let op: dit kan mogelijk onvertaalde tekst zijn als de backend-string geen i18n key is)
                            errorKey = err.description; 
                        } else {
                           errorKey = 'auth.register.validationError'; // Algemene validatiefout
                        }
                        break;
                    }
                    if (errorKey !== defaultErrorKey) break; // Stop bij de eerste specifieke fout
                  }
                }
                if (errorKey !== defaultErrorKey) break;
              }
            } else if (error.status === 409) { // Conflict for duplicate unique fields, e.g., email
                errorKey = 'auth.register.duplicateEmail'; // specifieke duplicate error
            }

            this.logger.warn(`${this.LOG_PREFIX} Register API call failed.`, { status: error.status, error, resolvedErrorKey: errorKey });
            return of(AuthActions.registerFailure({ error: errorKey }));
          })

        )
      )
    )
  );

  /**
   * @effect registerSuccessNavigation$
   * @description Navigates after a successful registration.
   */
  registerSuccessNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ returnUrl }) => {
        this.logger.info(`${this.LOG_PREFIX} Register success, navigating to: ${returnUrl}`);
        this.router.navigateByUrl(returnUrl);
        this.notificationService.showSuccess('Registratie succesvol! Welkom.');
      })
    ),
    { dispatch: false }
  );

  /**
   * @effect loginSuccessNavigation$
   * @description Navigates after a successful login.
   */
  loginSuccessNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ returnUrl }) => {
        this.logger.info(`${this.LOG_PREFIX} Login success, navigating to: ${returnUrl}`);
        this.router.navigateByUrl(returnUrl);
      })
    ),
    { dispatch: false }
  );

  /**
   * @effect refreshTokenRequested$
   * @description Handles refreshing the access token.
   */
  refreshTokenRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenRequested),
      exhaustMap(() =>
        this.authService.refreshToken().pipe(
          map(response => {
            this.logger.info(`${this.LOG_PREFIX} Refresh token successful.`);
            return AuthActions.refreshTokenSuccess({ response });
          }),
          catchError((error) => {
            this.logger.error(`${this.LOG_PREFIX} Refresh token failed.`, error);
            return of(AuthActions.refreshTokenFailure({ error: 'auth.refresh.failed' }));
          })
        )
      )
    )
  );

  /**
   * @effect logoutRequested$
   * @description Handles the logout procedure.
   */
  logoutRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutButtonClicked),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => {
            this.logger.info(`${this.LOG_PREFIX} Logout API service call completed successfully.`);
            return AuthActions.logoutAPISuccess();
          }),
          catchError((error) => {
            this.logger.error(`${this.LOG_PREFIX} Logout API call failed, but proceeding with client-side logout anyway.`, error);
            return of(AuthActions.logoutAPIFailure({ error: 'Logout API call failed.' }));
          })
        )
      )
    )
  );


  /**
   * @effect logoutCleanupAndNavigate$
   * @description Cleans up storage and navigates to login after ANY logout trigger.
   */
  logoutCleanupAndNavigate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutButtonClicked, AuthActions.refreshTokenFailure),
      tap((action) => {
        this.logger.info(`${this.LOG_PREFIX} Action ${action.type} triggered cleanup and redirect to login.`);
        this.tokenStorage.clearTokens();
        this.router.navigate(['/login']);
        if (action.type === AuthActions.refreshTokenFailure.type) {
          this.notificationService.showInfo('Je sessie is verlopen, log opnieuw in.');
        }
        // Dispatch de 'completed' actie hier, NADAT de redirect is geïnitieerd.
        this.store.dispatch(AuthActions.logoutCompleted());
      })
    ),
    { dispatch: false }
  );

  /**
   * Helper function to map a raw avatar value from JWT payload to a structured Image object.
   * Handles both string URLs and already-mapped Image objects gracefully.
   */
  private mapRawAvatarToImage(rawAvatar: any, displayName: string): Image | undefined {
    if (!rawAvatar) return undefined;

    if (typeof rawAvatar === 'string' && rawAvatar.trim() !== '') {
      return {
        id: `avatar_${displayName.replace(/\s+/g, '_').toLowerCase()}`,
        type: MediaType.IMAGE,
        variants: [{ url: rawAvatar, purpose: 'original' }],
        altText: `${displayName}'s avatar`,
      };
    } else if (typeof rawAvatar === 'object' && rawAvatar.id && rawAvatar.type === MediaType.IMAGE) {
      const img = rawAvatar as Image;
      return {
        ...img,
        variants: img.variants?.map(v => ({ ...v, url: String(v.url) })) || [],
        altText: img.altText || `${displayName}'s avatar`,
      };
    }
    this.logger.warn(`${this.LOG_PREFIX} Unexpected avatar format encountered:`, rawAvatar);
    return undefined;
  }

    private mapRawAvatarToImageToProfile(rawDecodedUser: any): Profile {
      const userId = rawDecodedUser?.id ?? rawDecodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const userDisplayName = rawDecodedUser?.displayName ?? rawDecodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      
      if (!userId || !userDisplayName) {
        this.logger.error(`${this.LOG_PREFIX} Token found, but decoded user is invalid (missing ID or displayName). Cannot map to profile.`, { rawDecodedUser });
        // Return a minimal, placeholder profile or throw, depending on desired error handling
        return { id: 'unknown_id', displayName: 'Unknown User' };
      }

      const avatarImage = this.mapRawAvatarToImage(rawDecodedUser.avatar, userDisplayName); // existing method

      return {
          id: userId,
          displayName: userDisplayName,
          avatar: avatarImage,
      };
  }

}