/**
 * @file global-error.interceptor.ts
 * @Version 3.0.0 (Synchronized with StructuredError)
 * @Author User & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-28
 * @Description
 *   A production-ready, global HTTP interceptor. This version is fully synchronized
 *   with the `StructuredError` interface for consistent error reporting.
 */
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { ErrorActions } from '@royal-code/store/error'; // << Import ReportErrorPayload
import { StructuredError } from '@royal-code/shared/domain'; // << Import StructuredError

interface ErrorContext {
  feature: string;
  operation: string;
  method: string;
}

function getErrorContext(request: HttpRequest<any>): ErrorContext {
  const url = request.url;
  const method = request.method.toUpperCase();
  const apiMatch = url.match(/\/api\/([^\/]+)(?:\/([^\/\?]+))?/);

  if (!apiMatch) {
    return { feature: 'Unknown', operation: `${method} request to ${url}`, method };
  }

  const [, feature, resource] = apiMatch;
  return {
    feature: capitalize(feature),
    operation: getOperationDescription(method, resource),
    method,
  };
}

function getOperationDescription(method: string, resource?: string): string {
  const resourceName = translateResource(resource);
  switch (method) {
    case 'GET': return `ophalen van ${resourceName}`;
    case 'POST': return `aanmaken van ${resourceName}`;
    case 'PUT': case 'PATCH': return `bijwerken van ${resourceName}`;
    case 'DELETE': return `verwijderen van ${resourceName}`;
    default: return `${method} actie op ${resourceName}`;
  }
}

function translateResource(resource: string = 'data'): string {
  const translations: Record<string, string> = {
    items: 'items', products: 'producten', cart: 'winkelwagen',
    orders: 'bestellingen', users: 'gebruikers', reviews: 'beoordelingen',
  };
  return translations[resource] || resource;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getUserMessage(status: number, operation: string): string {
  const messages: Record<number, string> = {
    400: `Ongeldige gegevens voor ${operation}. Controleer uw invoer.`,
    401: 'U bent niet geautoriseerd voor deze actie.',
    403: 'U heeft geen rechten om deze actie uit te voeren.',
    404: `Het gevraagde item voor ${operation} kon niet worden gevonden.`,
    409: `Er is een conflict opgetreden bij ${operation}. De data is mogelijk gewijzigd.`,
    422: `De ingevoerde gegevens voor ${operation} konden niet worden verwerkt.`,
    429: 'Te veel verzoeken. Probeer het over een moment opnieuw.',
    500: `Er is een serverfout opgetreden bij ${operation}. Probeer het later opnieuw.`,
    502: 'De service is tijdelijk niet bereikbaar. Probeer het later opnieuw.',
    503: 'De service is tijdelijk niet beschikbaar. Probeer het later opnieuw.',
    504: 'De verbinding duurde te lang. Controleer uw netwerk en probeer het opnieuw.',
  };
  return messages[status] || `Er is een onverwachte fout opgetreden bij ${operation}.`;
}

function getSeverity(status: number): 'error' | 'warning' | 'info' | 'critical' { // << Critical toegevoegd
  if (status >= 500) return 'error';
  if (status === 429 || status === 503 || status === 408 || status === 504) return 'warning';
  return 'error';
}

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {

        if (error.status === 200 && error.error instanceof ProgressEvent) {
          console.warn(
            `[GlobalErrorInterceptor] Caught a 200 OK response with a parse error for ${req.url}. This is likely a successful PUT/PATCH/DELETE with an empty body, or an empty i18n JSON file. Passing the error through without dispatching a global error notification.`
          );
          return throwError(() => error);
        }

        if (error.status === 404 && (req.url.includes('/api/Users/settings') || req.url.includes('/api/Users/addresses') || req.url.includes('/assets/'))) {
          return throwError(() => error);
        }

        const context = getErrorContext(req);
const structuredError: StructuredError = {
  message: getUserMessage(error.status, context.operation),
  source: `[API ${context.feature}]`,
  severity: getSeverity(error.status),
  isPersistent: getSeverity(error.status) === 'error',
  operation: context.operation,
  context: {
    httpStatus: error.status,
    method: context.method,
    url: error.url,
  },
  timestamp: Date.now(),
};

store.dispatch(ErrorActions.reportError({ error: structuredError })); // << PAYLOAD IS NU { error: StructuredError }
      }
      return throwError(() => error);
    })
  );
};