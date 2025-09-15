/**
 * @file theme.providers.ts // Hernoemd van theme-feature.provider.ts voor consistentie en eenvoud
 * @Version 1.0.2 // Versie update voor review en bestandsnaamconsistentie
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28 // Huidige datum van aanpassing
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-27 // Oorspronkelijke generatiedatum blijft
 * @PromptSummary Review and cleanup of ThemeProviders; no functional changes, header updated, filename standardized.
 * @Description Bevat een provider functie voor het eenvoudig registreren van de Theme feature
 *              (state en effects) in de Angular applicatie configuratie (`app.config.ts`),
 *              specifiek voor standalone componenten en applicaties.
 */
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { themeReducer } from './state/theme.reducer';
import { ThemeEffects } from './state/theme.effects';
import { THEME_FEATURE_KEY } from './state/theme.state';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

/**
 * @function provideThemeFeature
 * @description Maakt en retourneert de environment providers die nodig zijn om de Theme NgRx feature
 *              te registreren in de applicatie. Dit omvat de state (via `provideState`) en
 *              de effects (via `provideEffects`).
 * @returns {EnvironmentProviders} Een set van providers voor de Theme feature.
 */
export function provideThemeFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(THEME_FEATURE_KEY, themeReducer),
    provideEffects([ThemeEffects]),
  ]);
}
