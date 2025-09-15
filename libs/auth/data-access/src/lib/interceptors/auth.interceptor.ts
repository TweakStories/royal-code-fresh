// --- VERVANG VOLLEDIG BESTAND: libs/auth/data-access/src/lib/auth-interceptor.ts ---
/**
 * @file auth-interceptor.ts
 * @Version 2.1.0 (Static Asset Exclusion)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Provides an HTTP interceptor for adding authentication tokens to outgoing requests.
 *   This version explicitly excludes static asset requests (e.g., i18n JSONs, images)
 *   from authentication to prevent unnecessary 401 errors or timeouts.
 *
 *   Contains both the class-based AuthInterceptor and the functional authInterceptorFn
 *   for flexible usage across the application.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix SSR hydration and i18n blocking issues by correctly configuring TransferState for translations and ensuring NgRx meta-reducer factories are resolved via DI.
 */
import { HttpHandlerFn, HttpInterceptor, HttpRequest, HttpEvent, HttpHandler, HttpInterceptorFn, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenStorageService } from '@royal-code/auth/data-access'; // Veronderstelt dat deze hier is
import { LoggerService } from '@royal-code/core/core-logging'; // Veronderstelt dat deze hier is

/**
 * Functional HTTP interceptor for adding authentication tokens.
 * This version explicitly excludes static asset requests from authentication.
 */
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const tokenStorage = inject(TokenStorageService);

  // DE FIX: Exclude static assets (like i18n JSONs and images) from AuthInterceptor.
  //          This prevents the interceptor from trying to add a token to public asset requests,
  //          which often causes 401s or timeouts for i18n files.
  const isAssetRequest = req.url.includes('/assets/') || req.url.endsWith('.json') || req.url.endsWith('.webp');
  if (isAssetRequest) {
    logger.debug(`[AuthInterceptorFn] Skipping token for asset request: ${req.url}`);
    return next(req); // Skip authentication for static assets
  }

  const accessToken = tokenStorage.getAccessToken();

  if (accessToken) {
    const authReq = req.clone({
      headers: new HttpHeaders({
        Authorization: `Bearer ${accessToken}`
      })
    });
    logger.debug(`[AuthInterceptorFn] Adding token to request: ${req.url}`);
    return next(authReq);
  }

  logger.warn(`[AuthInterceptorFn] No token found for API request: ${req.url}. This request might require authentication.`);
  return next(req);
};

/**
 * Class-based HTTP interceptor for consistency and traditional DI.
 * Delegates to the functional interceptor.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly logger = inject(LoggerService);
  private readonly tokenStorage = inject(TokenStorageService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Delegates to the functional interceptor logic.
    // NOTE: Functional interceptors are typically preferred in Angular 17+
    // If you plan to only use authInterceptorFn, you might remove this class.
    
    // De functional interceptor heeft al de logica voor asset exclusion.
    // We roepen de functional interceptor hier direct aan.
    // De HttpHandler wordt doorgegeven als de `next` parameter.
    return authInterceptorFn(req, (authReq) => next.handle(authReq));
  }
}