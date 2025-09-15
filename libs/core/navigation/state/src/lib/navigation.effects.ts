/**
 * @file navigation.effects.ts
 * @Version 2.3.0 (Hardcoded Data & Removed ApiService Dependency)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   NgRx effects for managing navigation state. Now hardcodes navigation data
 *   and removes the dependency on `AbstractNavigationApiService` since data
 *   is not fetched externally.
 */
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

import { NavigationActions } from './navigation.actions';
import { selectNavigationState } from './navigation.feature';
import { AppIcon, NavDisplayHintEnum, NavigationItem } from '@royal-code/shared/domain';

@Injectable()
export class NavigationEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  // DE FIX: Geen injectie van AbstractNavigationApiService meer
  // private navigationApiService = inject(AbstractNavigationApiService); 

  loadNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NavigationActions.loadNavigation),
      withLatestFrom(this.store.select(selectNavigationState)),
      switchMap(([, state]) => {
        const mockNavigationItems: NavigationItem[] = [
          {
            id: 'home',
            labelKey: 'navigation.home',
            route: '/',
            icon: AppIcon.Home,
            displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileBottom],
          },
          {
            id: 'products',
            labelKey: 'navigation.products',
            route: '/products',
            icon: AppIcon.Box,
            displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileBottom, NavDisplayHintEnum.MobileModal],
          },
          {
            id: 'challenges',
            labelKey: 'navigation.challenges',
            route: '/challenges',
            icon: AppIcon.Award,
            displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal],
            requiresAuth: true,
          },
          {
            id: 'profile',
            labelKey: 'navigation.profile',
            route: '/profile',
            icon: AppIcon.User,
            displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.UserMenu, NavDisplayHintEnum.MobileModal],
            requiresAuth: true,
          },
          {
            id: 'settings',
            labelKey: 'navigation.settings',
            route: '/settings',
            icon: AppIcon.Settings,
            displayHint: [NavDisplayHintEnum.UserMenu, NavDisplayHintEnum.MobileModal],
            requiresAuth: true,
          },
          {
            id: 'logout',
            labelKey: 'navigation.logout',
            route: '/logout',
            icon: AppIcon.LogOut,
            displayHint: [NavDisplayHintEnum.UserMenu, NavDisplayHintEnum.MobileModal],
            requiresAuth: true,
          },
        ];
        return of(NavigationActions.loadNavigationSuccess({ navigation: mockNavigationItems })).pipe(
          catchError((error) =>
            of(NavigationActions.loadNavigationFailure({ error: error.message }))
          )
        );
      })
    )
  );
}