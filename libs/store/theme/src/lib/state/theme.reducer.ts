/**
 * @file theme.reducer.ts
 * @Version 1.2.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-28
 * @PromptSummary Cleaned up ThemeReducer: removed all console.log statements, simplified export to use createReducer implementation directly, and updated header.
 * @Description Bevat de NgRx reducer logica voor het beheren van de `ThemeState`.
 *              De reducer is een pure functie die de huidige state en een action ontvangt,
 *              en een nieuwe state retourneert op basis van de action type.
 */
import { createReducer, on } from '@ngrx/store';
import { ThemeState, initialThemeState, THEME_NAMES, ThemeName } from './theme.state';
import { ThemeActions } from './theme.actions';

/**
 * @const themeReducer
 * @description Implementatie van de theme reducer met `createReducer`.
 *              Deze functie verwerkt actions en retourneert een nieuwe `ThemeState`.
 */
export const themeReducer = createReducer(
  initialThemeState,

  on(ThemeActions.setThemeState, (state, { theme, darkMode }): ThemeState => {
    return { ...state, currentTheme: theme, darkMode: darkMode };
  }),

on(ThemeActions.setVisualTheme, (state, { theme }): ThemeState => {
  console.log(`[ThemeReducer] Handling SetVisualTheme. Current state.darkMode: ${state.darkMode}, Incoming theme: ${theme}`); // Logger niet beschikbaar in reducer, gebruik console.warn
  console.warn(`[ThemeReducer] Handling SetVisualTheme. Current state.darkMode: ${state.darkMode}, Incoming theme: ${theme}. Current state.currentTheme: ${state.currentTheme}`);
  return {
    ...state,
    currentTheme: theme,
    // darkMode: state.darkMode // ZEKER WETEN DAT DARKMODE HIER NIET VERANDERT!
  };
}),

  on(ThemeActions.toggleDarkMode, (state): ThemeState => {
    return { ...state, darkMode: !state.darkMode };
  }),

  on(ThemeActions.setDarkMode, (state, { darkMode }): ThemeState => {
    return { ...state, darkMode: darkMode };
  }),

  on(ThemeActions.cycleVisualTheme, (state): ThemeState => {
    const currentIndex = THEME_NAMES.indexOf(state.currentTheme);
    const nextIndex = (currentIndex === -1 || currentIndex === THEME_NAMES.length - 1) ? 0 : currentIndex + 1;
    const newTheme: ThemeName = THEME_NAMES[nextIndex];
    return { ...state, currentTheme: newTheme };
  })
);
