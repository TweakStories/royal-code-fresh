// libs/shared/domain/src/lib/routing/router-state-url.model.ts
import { Params, Data } from '@angular/router';

/**
 * Interface for the custom router state information stored in NgRx.
 * Contains relevant parts of the RouterStateSnapshot.
 */
export interface RouterStateUrl {
  url: string;                // The full URL
  params: Params;             // Route parameters (e.g., { id: '123' })
  queryParams: Params;        // Query parameters (e.g., { search: 'test' })
  fragment?: string | null;    // URL fragment (e.g., 'section-1')
  data: Data;                 // Route data defined in route configuration
  // Voeg eventueel andere properties toe die je uit de snapshot wilt halen
  // routeConfigPath?: string; // Pad van de geactiveerde route config
}
