import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, take, of } from 'rxjs';
import { selectCurrentGuide } from '@royal-code/features/guides/core';
import { GuidesActions } from '@royal-code/features/guides/core';
import { Guide } from '@royal-code/features/guides/domain';

/**
 * Resolver die de titel van de gids ophaalt om als breadcrumb-label te gebruiken.
 * @returns Een Observable die de titel van de gids als string emitteert.
 */
export const resolveGuideBreadcrumbLabel: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const slug = route.paramMap.get('slug');

  if (!slug) {
    return of('Gids Detail'); // Fallback label
  }

  // Zorg ervoor dat de data wordt geladen
  store.dispatch(GuidesActions.detailPageOpened({ slug }));

  return store.select(selectCurrentGuide).pipe(
    filter((guide): guide is Guide => !!guide && guide.slug === slug),
    take(1),
    map(guide => guide.title) // Retourneer alleen de titel
  );
};