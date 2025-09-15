/**
 * @file theme.selectors.ts
 * @Version 1.0.1 // Kleine versie-increment voor review en context-update
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28 // Huidige datum van aanpassing
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-27 // Oorspronkelijke generatiedatum blijft
 * @PromptSummary Review and cleanup of ThemeSelectors; no functional changes, header updated.
 * @Description Bevat NgRx selectors voor het ophalen van specifieke delen van de `ThemeState`.
 *              Selectors zijn pure functies die memoization gebruiken om performance te optimaliseren,
 *              door alleen opnieuw te berekenen als de relevante state daadwerkelijk is veranderd.
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ThemeState, THEME_FEATURE_KEY, ThemeName } from './theme.state';

/**
 * @const selectThemeState
 * @description Een feature selector die de gehele `ThemeState` slice selecteert uit de globale NgRx store.
 *              Dit is de basis voor alle andere selectors binnen dit feature.
 * @returns {MemoizedSelector<object, ThemeState>} Een selector functie.
 */
export const selectThemeState = createFeatureSelector<ThemeState>(THEME_FEATURE_KEY);

/**
 * @const selectCurrentTheme
 * @description Selecteert de naam van het momenteel actieve visuele thema uit de `ThemeState`.
 * @param {ThemeState} state - De `ThemeState` slice.
 * @returns {ThemeName} De naam van het huidige visuele thema.
 */
export const selectCurrentTheme = createSelector(
  selectThemeState, // Baseert zich op de feature selector.
  (state: ThemeState): ThemeName => state.currentTheme
);

/**
 * @const selectIsDarkMode
 * @description Selecteert de huidige dark mode status (true of false) uit de `ThemeState`.
 * @param {ThemeState} state - De `ThemeState` slice.
 * @returns {boolean} `true` als dark mode actief is, anders `false`.
 */
export const selectIsDarkMode = createSelector(
  selectThemeState,
  (state: ThemeState): boolean => state.darkMode
);

/**
 * @const selectThemeConfig
 * @description Een gecombineerde selector die een object retourneert met zowel het huidige thema
 *              als de dark mode status. Handig als beide waarden tegelijkertijd nodig zijn.
 * @returns {{ theme: ThemeName; darkMode: boolean }} Een object met de thema configuratie.
 * @example
 * // In een component of facade:
 * // const themeConfigSignal = inject(Store).selectSignal(selectThemeConfig);
 */
export const selectThemeConfig = createSelector(
  selectCurrentTheme, // Combineert output van andere selectors.
  selectIsDarkMode,
  (theme: ThemeName, darkMode:boolean): { theme: ThemeName; darkMode: boolean } => ({
    theme,
    darkMode,
  })
);
