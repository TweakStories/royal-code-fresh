/**
 * @file theme.state.ts
 * @Version 1.0.1 // Kleine versie-increment voor review en context-update
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28 // Huidige datum van aanpassing
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-27 // Oorspronkelijke generatiedatum blijft
 * @PromptSummary Review and cleanup of ThemeState; no functional changes, header updated for current task.
 * @Description Definieert de state, types, en initiële waarden voor het beheer van thema's (inclusief light/dark mode en visuele thema's) binnen de applicatie.
 *              Dit bestand is de bron van waarheid voor beschikbare themanamen en de structuur van de `ThemeState`.
 */

/**
 * @const THEME_NAMES
 * @description Een read-only array (const assertion) van beschikbare visuele themanamen.
 *              Deze namen worden gebruikt als waarde voor het `data-theme` attribuut op het `<html>` element
 *              en voor het identificeren van het actieve thema in de `ThemeState`.
 *              Elke naam correspondeert met een set CSS variabelen gedefinieerd in `styles.scss`.
 */
export const THEME_NAMES = [
  'balancedGold',  // Geel/Goud, dient als default-achtig thema.
  'oceanicFlow',   // Blauw/Water-gebaseerd thema.
  'verdantGrowth', // Groen/Forest-gebaseerd thema.
  'arcaneMyst',    // Paars/Arcane-gebaseerd thema.
  // Voeg hier eventueel 'fieryHeart' toe als vijfde optie.
] as const;

/**
 * @type ThemeName
 * @description Een type dat alle mogelijke waarden van de themanamen vertegenwoordigt,
 *              afgeleid van de `THEME_NAMES` constante.
 *              Dit zorgt voor type-veiligheid bij het werken met themanamen.
 */
export type ThemeName = typeof THEME_NAMES[number];

/**
 * @interface ThemeState
 * @description Definieert de structuur van de NgRx state slice voor thema beheer.
 *              Het bevat het momenteel actieve visuele thema en de dark mode status.
 */
export interface ThemeState {
  /**
   * @property currentTheme
   * @description De naam van het momenteel actieve visuele thema.
   *              De waarde moet een van de gedefinieerde `ThemeName` types zijn.
   */
  currentTheme: ThemeName;

  /**
   * @property darkMode
   * @description Een boolean die aangeeft of de dark mode momenteel geactiveerd is.
   *              `true` betekent dark mode is aan, `false` betekent light mode is aan.
   */
  darkMode: boolean;
}

/**
 * @const initialThemeState
 * @description De initiële staat voor de `ThemeState` slice.
 *              Deze wordt gebruikt wanneer de applicatie voor het eerst laadt of wanneer er geen
 *              opgeslagen thema voorkeur gevonden wordt.
 *              De daadwerkelijke defaults worden echter in `ThemeEffects` bepaald via `APP_THEME_DEFAULTS`.
 */
export const initialThemeState: ThemeState = {
  currentTheme: 'balancedGold', // Deze default wordt overschreven door `loadThemePreference` in effects.
  darkMode: true,               // Deze default wordt overschreven door `loadThemePreference` in effects.
};

/**
 * @const THEME_FEATURE_KEY
 * @description De unieke string key die gebruikt wordt om de `ThemeState` feature slice
 *              te registreren in de NgRx store.
 */
export const THEME_FEATURE_KEY = 'theme';
