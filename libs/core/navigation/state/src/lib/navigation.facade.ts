/**
 * @file navigation.facade.ts
 * @Version 2.2.0 (Type-Safe Navigation Filtering & Corrected Imports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Facade for managing navigation-related state, providing a simplified API
 *   for UI components.
 */
import { inject, Injectable, Signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { NavigationActions } from './navigation.actions';
// DE FIX (TS2459): Importeer State niet meer, is intern. Importeer selectors en feature.
import { selectAllNavigation, selectError, selectIsLoading } from './navigation.feature';
import { NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { authFeature } from '@royal-code/store/auth';

@Injectable({ providedIn: 'root' })
export class NavigationFacade {
  private readonly store = inject(Store);
  private readonly isAuthenticated = this.store.selectSignal(authFeature.selectIsAuthenticated);

  readonly isLoading$: Observable<boolean> = this.store.select(selectIsLoading);
  readonly error$: Observable<string | null> = this.store.select(selectError);
  readonly allNavigationItems$: Observable<NavigationItem[]> = this.store.select(selectAllNavigation);

  // Signaal-gebaseerde API
  readonly isLoading: Signal<boolean> = toSignal(this.isLoading$, { initialValue: true });
  readonly error: Signal<string | null> = toSignal(this.error$, { initialValue: null });
  readonly allNavigationItems: Signal<NavigationItem[]> = toSignal(this.allNavigationItems$, { initialValue: [] });

  readonly visibleNavigationItems = computed(() => {
    const items = this.allNavigationItems();
    const isAuthenticated = this.isAuthenticated();
    return items.filter(item => !item.requiresAuth || isAuthenticated);
  });

  readonly desktopNavigationItems = computed(() => this.filterByHint(this.visibleNavigationItems(), NavDisplayHintEnum.Desktop));
  readonly mobileBottomNavigationItems = computed(() => this.filterByHint(this.visibleNavigationItems(), NavDisplayHintEnum.MobileBottom));
  readonly mobileModalNavigationItems = computed(() => this.filterByHint(this.visibleNavigationItems(), NavDisplayHintEnum.MobileModal));
  readonly userMenuNavigationItems = computed(() => this.filterByHint(this.visibleNavigationItems(), NavDisplayHintEnum.UserMenu));

  loadNavigation(): void {
    this.store.dispatch(NavigationActions.loadNavigation());
  }

  private filterByHint(items: NavigationItem[], hint: NavDisplayHintEnum): NavigationItem[] {
    return items.filter(item => item.displayHint?.includes(hint));
  }
}