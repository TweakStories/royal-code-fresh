/**
 * @file ui-visual-theme-selector.component.ts
 * @Version 1.2.0 // Versie update voor correct gebruik UiButtonComponent types
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-05-28
 * @PromptSummary Updated UiVisualThemeSelectorComponent to correctly use UiButtonComponent's built-in theme types for background colors.
 * @Description Een standalone Angular component die een UI biedt voor het selecteren van een visueel thema (skin).
 *              Het toont een reeks keuzes als ronde, gekleurde knoppen (gebruikmakend van `UiButtonComponent`'s
 *              thema types) en stelt de gebruiker in staat het actieve thema van de applicatie te wijzigen
 *              via de `ThemeFacade`.
 */
import { Component, inject, ChangeDetectionStrategy, Signal } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { ThemeFacade, ThemeName } from '@royal-code/store/theme'; // Pas pad aan indien nodig
import { UiIconComponent } from '@royal-code/ui/icon'; // Pas pad aan indien nodig
import { AppIcon, ButtonType } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button'; // Import ButtonType

/**
 * @interface ThemeChoice
 * @description Definieert de structuur voor elk thema dat getoond wordt als een keuze in de selector.
 */
interface ThemeChoice {
  /** @description De unieke naam van het thema, corresponderend met `ThemeName` (uit NgRx state). */
  name: ThemeName;
  /** @description De i18n key voor de gebruiksvriendelijke naam van het thema. */
  displayNameKey: string;
  /** @description De `ButtonType` die gebruikt wordt voor de `UiButtonComponent` om de juiste themakleur te renderen. */
  buttonType: ButtonType;
  /** @description Optioneel: Een icoon dat het thema kan representeren. */
  icon?: AppIcon;
  /**
   * @description De Tailwind CSS class voor de *icoonkleur*, om goed contrast te garanderen
   *              met de achtergrondkleur die door `buttonType` wordt bepaald.
   *              Moet overeenkomen met de `-on` kleur van de corresponderende `buttonType`.
   */
  iconContrastColorClass?: string;
}

@Component({
  selector: 'royal-code-ui-visual-theme-selector',
  standalone: true,
  imports: [
    TranslateModule,
    UiButtonComponent,
    UiIconComponent
],
  template: `
    <div
      class="visual-theme-selector flex items-center space-x-2 p-1.5 rounded-xs bg-surface border border-border shadow-sm"
      role="group"
      [attr.aria-label]="'themeSelector.ariaLabel.selectVisualTheme' | translate"
    >
      @for (theme of themeChoices; track theme.name) {
        <royal-code-ui-button
          [type]="theme.buttonType"
          sizeVariant="dot"
          [isRound]="true"
          [extraClasses]="generateButtonRingClasses(theme)"
          [attr.aria-label]="theme.displayNameKey | translate"
          [attr.aria-pressed]="theme.name === currentThemeSignal()"
          [title]="theme.displayNameKey | translate"
          (clicked)="selectTheme(theme.name)"
          [enableNeonEffect]="true"   благоприятен
          [useHueGradient]="false"
        >
          @if (theme.icon) {
            <royal-code-ui-icon
              [icon]="theme.icon"
              sizeVariant="xs"
              [colorClass]="theme.iconContrastColorClass"
              extraClassSignal="opacity-90"
            />
          }
        </royal-code-ui-button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiVisualThemeSelectorComponent {
  private themeFacade = inject(ThemeFacade);

  public readonly themeChoices: ThemeChoice[] = [
    {
      name: 'balancedGold',
      displayNameKey: 'themeSelector.themes.balancedGold',
      buttonType: 'theme-sun',
      icon: AppIcon.SunDim,
    },
    {
      name: 'oceanicFlow',
      displayNameKey: 'themeSelector.themes.oceanicFlow',
      buttonType: 'theme-water',
      icon: AppIcon.Droplets,
    },
    {
      name: 'verdantGrowth',
      displayNameKey: 'themeSelector.themes.verdantGrowth',
      buttonType: 'theme-forest',
      icon: AppIcon.Sprout,
    },
    {
      name: 'arcaneMyst',
      displayNameKey: 'themeSelector.themes.arcaneMyst',
      buttonType: 'theme-arcane',
      icon: AppIcon.Sparkles,
    },
    // {
    //   name: 'fieryHeart', // Veronderstelt dat je 'fieryHeart' aan THEME_NAMES toevoegt
    //   displayNameKey: 'themeSelector.themes.fieryHeart',
    //   buttonType: 'theme-fire',
    //   icon: AppIcon.Flame,
    //   iconContrastColorClass: 'text-[var(--color-theme-fire-on)]',
    // },
  ];

  public readonly currentThemeSignal: Signal<ThemeName> = this.themeFacade.currentThemeSignal;

  public selectTheme(themeName: ThemeName): void {
     console.log('[VisualThemeSelector] Selecting theme:', themeName); // LOG DIT!
     this.themeFacade.setVisualTheme(themeName);
  }

  /**
   * @method generateButtonRingClasses
   * @description Genereert de string voor `extraClasses` die alleen de ring-styling en transities bevat.
   *              De achtergrondkleur wordt nu afgehandeld door de `type` input van `UiButtonComponent`.
   * @param {ThemeChoice} theme - Het thema object waarvoor de classes gegenereerd worden.
   * @returns {string} Een string met Tailwind CSS classes voor ring en transities.
   */
  public generateButtonRingClasses(theme: ThemeChoice): string {
    const isActive = theme.name === this.currentThemeSignal();
    const ringClasses = isActive
      ? 'ring-2 ring-offset-2 ring-offset-surface ring-primary' // ring-primary pakt de actieve globale --color-primary
      : 'ring-transparent hover:ring-secondary/50 focus:ring-primary/70';
    // De transform hover:scale is al onderdeel van UiButton base classes of kan daar toegevoegd worden.
    // Hier alleen de specifieke ring-gerelateerde classes.
    const transitionClasses = 'transition-all duration-150 ease-in-out'; // Voor ring en andere effecten.

    return `${ringClasses} ${transitionClasses}`;
  }
}
