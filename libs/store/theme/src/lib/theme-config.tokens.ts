/**
 * @file theme-config.tokens.ts
 * @Version 1.0.1 // Kleine versie-increment voor review en context-update
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28 // Huidige datum van aanpassing
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-28 // Oorspronkelijke generatiedatum blijft
 * @PromptSummary Review and cleanup of ThemeConfigTokens; no functional changes, header updated.
 * @Description Definieert een InjectionToken (`APP_THEME_DEFAULTS`) en een interface (`AppThemeDefaults`)
 *              om applicatie-specifieke standaard thema-instellingen te kunnen injecteren
 *              in de gedeelde ThemeEffects.
 */
import { InjectionToken } from '@angular/core';
import { ThemeName } from './state/theme.state';

/**
 * @interface AppThemeDefaults
 * @description Interface die de structuur definieert voor app-specifieke standaard thema-instellingen.
 */
export interface AppThemeDefaults {
  /**
   * @property defaultThemeName
   * @description De standaard `ThemeName` die voor deze specifieke applicatie gebruikt moet worden
   *              als er geen voorkeur in localStorage is gevonden.
   */
  defaultThemeName: ThemeName;

  /**
   * @property defaultDarkMode
   * @description De standaard dark mode status (true = dark, false = light) voor deze applicatie.
   */
  defaultDarkMode: boolean;
}

/**
 * @const APP_THEME_DEFAULTS
 * @description Een `InjectionToken` die gebruikt wordt om een instantie van `AppThemeDefaults` te providen
 *              en te injecteren. Dit stelt elke applicatie in staat zijn eigen standaard
 *              thema-instellingen te specificeren voor de gedeelde `ThemeEffects`.
 */
export const APP_THEME_DEFAULTS = new InjectionToken<AppThemeDefaults>('App specific theme defaults');
