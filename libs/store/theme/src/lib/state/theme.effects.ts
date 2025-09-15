/**
 * @file theme.effects.ts
 * @Version 1.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-27
 * @PromptSummary Cleaned up ThemeEffects: removed non-essential console/logger.debug/info logs, retained error logging, and updated header.
 * @Description Bevat de NgRx effects voor het afhandelen van side-effects gerelateerd aan thema beheer.
 *              Effects luisteren naar specifieke actions, interageren met externe services (zoals `ThemeService`
 *              voor DOM manipulatie en `localStorage`), en kunnen eventueel nieuwe actions dispatchen.
 */
import { Injectable, inject } from '@angular/core'; // NgZone verwijderd als niet direct gebruikt
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ThemeActions } from './theme.actions';
import { ThemeService, ThemePreference } from '../services/theme.service';
import { LoggerService } from '@royal-code/core/core-logging';
import { selectThemeState } from './theme.selectors';
import { APP_THEME_DEFAULTS } from '../theme-config.tokens';
import { ThemeState } from './theme.state';

@Injectable()
export class ThemeEffects {
  private readonly actions$ = inject(Actions);
  private readonly themeService = inject(ThemeService);
  private readonly logger = inject(LoggerService);
  // private readonly zone = inject(NgZone); // Verwijderd als NgZone.run niet meer gebruikt wordt
  private readonly store = inject(Store);
  private readonly appDefaults = inject(APP_THEME_DEFAULTS);
  private readonly logPrefix = '[ThemeEffects]';

  loadInitialTheme$: Observable<any> = createEffect(() =>
    this.actions$.pipe(
      ofType(ThemeActions.loadThemePreferenceRequested, '@ngrx/effects/init'),
      switchMap(() => {
          const preference: ThemePreference = this.themeService.loadThemePreference(
            this.appDefaults.defaultThemeName,
            this.appDefaults.defaultDarkMode
          );
          return [ThemeActions.setThemeState({ theme: preference.theme, darkMode: preference.darkMode })];
      })
    )
  );

applyThemeAndSavePreference$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(
        ThemeActions.setThemeState,
        ThemeActions.setVisualTheme, // BELANGRIJKSTE VOOR KLEUR KEUZE
        ThemeActions.toggleDarkMode,
        ThemeActions.setDarkMode,
        ThemeActions.cycleVisualTheme
      ),
      withLatestFrom(this.store.select(selectThemeState)),
      tap(([action, themeState]) => {
        this.logger.warn(`[ThemeEffects] applyThemeAndSavePreference$ TRIGGERED. ActionType: ${action.type}. CurrentTheme: ${themeState.currentTheme}, DarkMode: ${themeState.darkMode}`);
        this.themeService.applyTheme(themeState.currentTheme, themeState.darkMode);
        this.themeService.saveThemePreference(themeState.currentTheme, themeState.darkMode);
      })
    ),
  { dispatch: false }
);
}
