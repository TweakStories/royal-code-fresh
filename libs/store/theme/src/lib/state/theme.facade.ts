/**
 * @file theme.facade.ts
 * @Version 1.2.1 // Versie update vanwege correctie selectSignal naar toSignal met initialValue
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-28
 * @PromptSummary Corrected ThemeFacade to use toSignal with initialValue for creating Signals from store selectors, resolving TS2353 errors.
 * @Description Biedt een abstractielaag (Facade) bovenop de NgRx store voor thema-gerelateerde functionaliteit.
 *              Componenten interageren met deze Facade in plaats van direct met de Store of Actions,
 *              wat de componentlogica vereenvoudigt en de koppeling met NgRx vermindert.
 */
import { Injectable, inject, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop'; // Import toSignal

import { ThemeActions } from '../state/theme.actions';
import {
  selectCurrentTheme,
  selectIsDarkMode,
  selectThemeConfig,
} from '../state/theme.selectors';
import { ThemeName, initialThemeState, ThemeState } from '../state/theme.state';

@Injectable({
  providedIn: 'root',
})
export class ThemeFacade {
  private store = inject(Store<ThemeState>);

  public readonly currentThemeSignal: Signal<ThemeName> = toSignal(
    this.store.select(selectCurrentTheme), // Gebruik store.select() met toSignal
    { initialValue: initialThemeState.currentTheme }
  );

  public readonly isDarkModeSignal: Signal<boolean> = toSignal(
    this.store.select(selectIsDarkMode), // Gebruik store.select() met toSignal
    { initialValue: initialThemeState.darkMode }
  );

  public readonly themeConfigSignal: Signal<{ theme: ThemeName; darkMode: boolean }> = toSignal(
    this.store.select(selectThemeConfig), // Gebruik store.select() met toSignal
    { initialValue: { theme: initialThemeState.currentTheme, darkMode: initialThemeState.darkMode } }
  );

  public setThemeState(theme: ThemeName, darkMode: boolean): void {
    this.store.dispatch(ThemeActions.setThemeState({ theme, darkMode }));
  }

  public setVisualTheme(themeName: ThemeName): void {
    this.store.dispatch(ThemeActions.setVisualTheme({ theme: themeName }));
  }

  public toggleDarkMode(): void {
    this.store.dispatch(ThemeActions.toggleDarkMode());
  }

  public setDarkMode(darkMode: boolean): void {
    this.store.dispatch(ThemeActions.setDarkMode({ darkMode }));
  }

  public cycleVisualTheme(): void {
    this.store.dispatch(ThemeActions.cycleVisualTheme());
  }

  public loadThemePreference(): void {
    this.store.dispatch(ThemeActions.loadThemePreferenceRequested());
  }
}
