import { inject, Injectable, signal, Signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router, NavigationEnd, ResolveFn, Data } from '@angular/router';
import { filter, switchMap, of, Observable, forkJoin, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { BreadcrumbItem } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly logger = inject(LoggerService);
  private readonly logPrefix = '[BreadcrumbService]';

  private readonly _breadcrumbs = signal<BreadcrumbItem[]>([]);
  public readonly breadcrumbs: Signal<BreadcrumbItem[]> = this._breadcrumbs.asReadonly();

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        switchMap(() => this.createBreadcrumbs(this.router.routerState.snapshot.root))
      )
      .subscribe((breadcrumbs: BreadcrumbItem[]) => {
        this._breadcrumbs.set(breadcrumbs);
        this.logger.debug(`${this.logPrefix} Breadcrumbs updated:`, breadcrumbs);
      });
  }

  private createBreadcrumbs(route: ActivatedRouteSnapshot): Observable<BreadcrumbItem[]> {
    const breadcrumbObservables: Observable<BreadcrumbItem>[] = [];
    this.buildBreadcrumbTrail(route, '', breadcrumbObservables);
    
    // Gebruik forkJoin om alle observables te combineren. Het geeft een lege array terug als er geen observables zijn.
    return breadcrumbObservables.length > 0 ? forkJoin(breadcrumbObservables) : of([]);
  }

  private buildBreadcrumbTrail(
    route: ActivatedRouteSnapshot,
    url: string,
    breadcrumbObservables: Observable<BreadcrumbItem>[]
  ): void {
    let newUrl = url;
    const path = route.url.map(segment => segment.path).join('/');
    
    if (path) {
      newUrl += `/${path}`;
    }

    const breadcrumbData = route.data['breadcrumb'];
    if (breadcrumbData) {
      breadcrumbObservables.push(this.getBreadcrumbItem(route.data, newUrl, route));
    }

    if (route.firstChild) {
      this.buildBreadcrumbTrail(route.firstChild, newUrl, breadcrumbObservables);
    }
  }

  private getBreadcrumbItem(data: Data, url: string, route: ActivatedRouteSnapshot): Observable<BreadcrumbItem> {
      const breadcrumbData = data['breadcrumb'];
      // FIX: Gebruik de volledige URL (inclusief query parameters en fragment) voor een echt unieke ID
      const fullUrl = this.router.serializeUrl(this.router.createUrlTree([url], {
        queryParams: route.queryParams,
        fragment: route.fragment ?? undefined
      }));
      const uniqueId = btoa(fullUrl); // Base64-encode de volledige, unieke URL

      if (typeof breadcrumbData === 'function') {
        const result: Observable<string> = breadcrumbData(route, this.router.routerState.snapshot);
        if (result instanceof Observable) {
          return result.pipe(map(label => ({ id: uniqueId, label, url: fullUrl, isCurrent: false })));
        }
      }
      
      if (typeof breadcrumbData === 'string') {
        return of({ id: uniqueId, label: breadcrumbData, url: fullUrl, isCurrent: false });
      }
      
      return of({ id: uniqueId, label: '...', url: fullUrl, isCurrent: false });
    }


  public goBack(): void {
    this.logger.debug(`${this.logPrefix} Executing history.back()`);
    history.back();
  }
}