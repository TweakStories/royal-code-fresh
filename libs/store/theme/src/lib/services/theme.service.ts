/**
 * @file theme.service.ts
 * @Version 1.2.0
 * @Author User & Royal-Code MonorepoAppDevAI
 * @Date 2025-05-28
 * @PromptSummary Cleaned up ThemeService: removed non-essential logger.debug/info logs, retained warn/error logging, and updated header.
 * @Description Service verantwoordelijk voor de daadwerkelijke interactie met de DOM en localStorage
 *              om thema (visueel thema en dark mode) voorkeuren toe te passen en te persisteren.
 *              Deze service wordt aangeroepen door `ThemeEffects` en dient als brug tussen de
 *              NgRx state en de browseromgeving.
 */
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { ThemeName, THEME_NAMES } from '../state/theme.state';

const THEME_STORAGE_KEY = 'royalApp_visualTheme';
const DARK_MODE_STORAGE_KEY = 'royalApp_darkMode';

export interface ThemePreference {
  theme: ThemeName;
  darkMode: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT as any) as Document;
  private readonly logger = inject(LoggerService);
  private readonly platformId: Object;
  private readonly isBrowser: boolean;
  private readonly logPrefix = '[ThemeService]';

  constructor() {
    this.platformId = inject(PLATFORM_ID); 
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

public applyTheme(theme: ThemeName, darkMode: boolean): void {
  this.logger.warn(`[ThemeService] APPLYING THEME VIA applyTheme(). Theme: '${theme}', DarkMode: ${darkMode}, IsBrowser: ${this.isBrowser}`); // GEBRUIK WARN VOOR ZICHTBAARHEID
  if (!this.isBrowser) {
    return;
  }
  try {
    const rootElement = this.document.documentElement;
    this.logger.warn(`[ThemeService] Setting data-theme='${theme}' on HTML element.`);
    rootElement.setAttribute('data-theme', theme);

    if (darkMode) {
      this.logger.warn(`[ThemeService] Adding 'dark' class to HTML element.`);
      rootElement.classList.add('dark');
    } else {
      this.logger.warn(`[ThemeService] Removing 'dark' class from HTML element.`);
      rootElement.classList.remove('dark');
    }
  } catch (error) {
     this.logger.error(`${this.logPrefix} Failed to apply theme to DOM.`, { error, theme, darkMode });
  }
}

  public saveThemePreference(theme: ThemeName, darkMode: boolean): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem(DARK_MODE_STORAGE_KEY, JSON.stringify(darkMode));
    } catch (error) {
      this.logger.error(`${this.logPrefix} Failed to save theme preference to localStorage.`, { error, theme, darkMode });
    }
  }

  public loadThemePreference(
    appDefaultThemeName: ThemeName,
    appDefaultDarkModeState = true
  ): ThemePreference {
    if (!this.isBrowser) {
      return { theme: appDefaultThemeName, darkMode: appDefaultDarkModeState };
    }

    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
      const storedDarkModeString = localStorage.getItem(DARK_MODE_STORAGE_KEY);

      const theme: ThemeName = (storedTheme && (THEME_NAMES as readonly string[]).includes(storedTheme))
                              ? storedTheme
                              : appDefaultThemeName;

      let darkMode: boolean = appDefaultDarkModeState;
      if (storedDarkModeString !== null) {
        try {
          const parsedDarkMode = JSON.parse(storedDarkModeString);
          if (typeof parsedDarkMode === 'boolean') {
            darkMode = parsedDarkMode;
          } else {
            this.logger.warn(`${this.logPrefix} Parsed dark mode preference from localStorage is not a boolean, using app default: ${appDefaultDarkModeState}. Stored value:`, storedDarkModeString);
          }
        } catch (parseError) {
          this.logger.warn(`${this.logPrefix} Failed to parse stored dark mode preference from localStorage, using app default: ${appDefaultDarkModeState}. Stored value:`, storedDarkModeString, { parseError });
        }
      }
      return { theme, darkMode };
    } catch (error) {
      this.logger.error(`${this.logPrefix} Failed to load theme preference from localStorage, returning app defaults.`, { error, appDefaultThemeName, appDefaultDarkModeState });
      return { theme: appDefaultThemeName, darkMode: appDefaultDarkModeState };
    }
  }
}
