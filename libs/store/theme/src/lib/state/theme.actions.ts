/**
 * @file theme.actions.ts
 * @Version 1.0.1 // Kleine versie-increment voor review en context-update
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28 // Huidige datum van aanpassing
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-27 // Oorspronkelijke generatiedatum blijft
 * @PromptSummary Review and cleanup of ThemeActions; no functional changes, header updated.
 * @Description Definieert de NgRx actions die gebruikt worden om interacties met en veranderingen in de thema-instellingen
 *              (visueel thema en dark mode) te signaleren binnen de applicatie.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ThemeName } from './theme.state';

/**
 * @const ThemeActions
 * @description Een actiegroep die alle thema-gerelateerde actions bundelt.
 *              Deze actions worden gebruikt om de `ThemeState` te manipuleren en side-effects te triggeren.
 * @see ThemeState
 * @see ThemeEffects
 * @see themeReducer
 */
export const ThemeActions = createActionGroup({
  source: 'Theme', // Bron van de actions, helpt bij debugging en tracering.
  events: {
    // --- UI / Effect Initiated Actions ---

    /**
     * @description Action om de volledige thema staat (zowel visueel thema als dark mode) in één keer in te stellen.
     *              Typisch gebruikt bij het initialiseren van de state vanuit localStorage of bij een expliciete reset.
     * @property {ThemeName} theme - De naam van het visuele thema dat geactiveerd moet worden.
     * @property {boolean} darkMode - De status van dark mode (true = aan, false = uit).
     */
    'Set Theme State': props<{ theme: ThemeName; darkMode: boolean }>(),

    /**
     * @description Action om alleen het visuele thema te wijzigen, terwijl de huidige dark mode status behouden blijft.
     *              Wordt gebruikt wanneer de gebruiker een nieuw visueel thema selecteert via de UI.
     * @property {ThemeName} theme - De naam van het visuele thema dat geactiveerd moet worden.
     */
    'Set Visual Theme': props<{ theme: ThemeName }>(),

    /**
     * @description Action om de dark mode status te toggelen (aan/uit), terwijl het huidige visuele thema behouden blijft.
     *              Wordt gebruikt door de dark mode switcher UI.
     */
    'Toggle Dark Mode': emptyProps(),

    /**
     * @description Action om de dark mode status expliciet in te stellen (aan of uit),
     *              terwijl het huidige visuele thema behouden blijft.
     * @property {boolean} darkMode - De gewenste status van dark mode (true = aan, false = uit).
     */
    'Set Dark Mode': props<{ darkMode: boolean }>(),

    /**
     * @description Action om naar het volgende visuele thema in de gedefinieerde lijst (`THEME_NAMES`) te cyclen.
     *              Kan gebruikt worden voor een "volgend thema" knop of voor testdoeleinden.
     *              De dark mode status blijft ongewijzigd.
     */
    'Cycle Visual Theme': emptyProps(),

    // --- Actions voor Laden/Opslaan (deze triggeren effects, worden niet direct door UI gedispatcht) ---

    /**
     * @description Action die aangeeft dat de thema voorkeuren (visueel thema en dark mode)
     *              geladen moeten worden, typisch bij applicatie initialisatie.
     *              Deze action wordt afgehandeld door `ThemeEffects` om voorkeuren uit `localStorage` te lezen.
     */
    'Load Theme Preference Requested': emptyProps(),

    /**
     * @description Action die aangeeft dat de huidige thema voorkeuren (visueel thema en dark mode)
     *              opgeslagen moeten worden, typisch na een wijziging door de gebruiker.
     *              Deze action wordt afgehandeld door `ThemeEffects` om voorkeuren naar `localStorage` te schrijven.
     * @property {ThemeName} theme - Het huidige visuele thema om op te slaan.
     * @property {boolean} darkMode - De huidige dark mode status om op te slaan.
     */
    'Save Theme Preference Requested': props<{ theme: ThemeName; darkMode: boolean }>(),
  },
});
