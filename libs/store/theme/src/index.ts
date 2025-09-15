/**
 * @file index.ts (libs/store/theme/src)
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-27
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-27
 * @PromptSummary Generation of index file for the Theme store library, exporting all necessary NgRx elements and the facade.
 * @Description Publiek toegangspunt voor de NgRx theme store module.
 *              Exporteert alle relevante symbolen (actions, reducer, selectors, state, facade, service)
 *              zodat andere delen van de applicatie deze kunnen importeren vanuit `@royal-code/store/theme`.
 */

// State definitie en initiële waarden
export * from './lib/state/theme.state';

// Actions
export * from './lib/state/theme.actions';

// Reducer
export * from './lib/state/theme.reducer';

// Selectors
export * from './lib/state/theme.selectors';

// Effects
export * from './lib/state/theme.effects';

// Facade
export * from './lib/state/theme.facade';

// Token
export * from './lib/theme-config.tokens';

// Service (indien nodig direct vanuit andere libraries, hoewel interactie meestal via facade/effects gaat)
export * from './lib/services/theme.service';

// Provider functie voor het opzetten van de feature state (nieuw, voor standalone registratie)
export * from './lib/theme.providers';
