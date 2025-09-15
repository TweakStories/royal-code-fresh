/**
 * @file etag.interceptor.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-19
 * @Description
 *   A smart HTTP interceptor that automates client-side caching using ETags.
 *   It reads version numbers from the NgRx state, adds the 'If-None-Match' header
 *   to requests, and dispatches actions to update the version in the state when
 *   the server provides a new ETag.
 */
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, switchMap, take, tap } from 'rxjs';
// Remove direct dependency on user store
import { LoggerService } from '@royal-code/core/core-logging';

// Configuration token for etag endpoints - to be provided at app level
export interface EtagEndpointConfig {
  selector: (store: Store) => Observable<number>;
  updateAction: (version: number) => any;
}

// Default empty configuration to avoid circular dependencies
const versionedEndpoints: Record<string, EtagEndpointConfig> = {};

// Function to configure etag endpoints from app level
export function configureEtagEndpoints(config: Record<string, EtagEndpointConfig>) {
  Object.assign(versionedEndpoints, config);
}

export const etagInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const store = inject(Store);
  const logger = inject(LoggerService);
  const endpointConfig = Object.keys(versionedEndpoints).find(key => req.url.endsWith(key));

  // Als de request URL niet is geconfigureerd voor versioning, doe niets.
  if (!endpointConfig || req.method !== 'GET') {
    return next(req);
  }

  const config = versionedEndpoints[endpointConfig];

  return config.selector(store).pipe(
    take(1),
    switchMap(localVersion => {
      let headers = req.headers;
      // Voeg de If-None-Match header toe als we een lokale versie hebben.
      if (localVersion > 0) {
        headers = headers.set('If-None-Match', `"${localVersion}"`);
        logger.debug(`[EtagInterceptor] Attaching If-None-Match: "${localVersion}" for ${req.url}`);
      }

      const modifiedReq = req.clone({ headers });

      return next(modifiedReq).pipe(
        tap((event: HttpEvent<any>) => {
          // Kijk alleen naar succesvolle responses
          if (event instanceof HttpResponse && event.status === 200) {
            const serverEtag = event.headers.get('ETag');
            if (serverEtag) {
              // Verwijder quotes en parse naar een nummer
              const newVersion = parseInt(serverEtag.replace(/"/g, ''), 10);
              if (!isNaN(newVersion) && newVersion !== localVersion) {
                logger.info(`[EtagInterceptor] New version detected for ${req.url}. Server: ${newVersion}, Local: ${localVersion}. Dispatching update.`);
                store.dispatch(config.updateAction(newVersion));
              }
            }
          } else if (event instanceof HttpResponse && event.status === 304) {
             logger.info(`[EtagInterceptor] Received 304 Not Modified for ${req.url}. State is up-to-date.`);
          }
        })
      );
    })
  );
};
