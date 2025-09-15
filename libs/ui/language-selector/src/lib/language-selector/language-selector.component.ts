/**
 * @file language-selector.component.ts (Refactored with UiDropdownComponent)
 * @version 3.0.0 (Gebruik UiDropdownComponent voor consistentie)
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiDropdownComponent } from '@royal-code/ui/dropdown'; // Import de dropdown component
import { AppIcon } from '@royal-code/shared/domain';
import { StorageService } from '@royal-code/core/storage';

interface Language {
  code: string;
  label: string;
  flagImageUrl: string;
}

@Component({
  selector: 'royal-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiIconComponent, UiImageComponent, UiDropdownComponent],
  template: `
    <royal-code-ui-dropdown 
      [triggerOn]="'click'"
      [alignment]="'right'"
      [verticalAlignment]="'below'"
      [offsetY]="8">
      
      <!-- Trigger Button -->
      <button dropdown-trigger 
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        @if (currentLanguage(); as lang) {
          <div class="w-5 h-auto">
            <royal-code-ui-image
              [src]="lang.flagImageUrl"
              [alt]="lang.label + ' flag'"
              [rounding]="'none'"
              objectFit="cover"
              [lazyLoad]="false"
            />
          </div>
        }
        <span class="hidden md:inline">{{ currentLanguage()?.label }}</span>
        <royal-code-ui-icon [icon]="AppIcon.ChevronDown" sizeVariant="xs" />
      </button>

      <!-- Dropdown Content -->
      <div dropdown class="w-40 py-1">
        @for (lang of languages; track lang.code) {
          <button 
            type="button"
            (click)="selectLanguage(lang.code)" 
            class="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-hover cursor-pointer transition-colors"
            [class.font-bold]="lang.code === currentLangCode()">
            <div class="w-5 h-auto">
              <royal-code-ui-image
                [src]="lang.flagImageUrl"
                [alt]="lang.label + ' flag'"
                [rounding]="'none'"
                objectFit="cover"
                [lazyLoad]="false"
              />
            </div>
            <span>{{ lang.label }}</span>
          </button>
        }
      </div>
      
    </royal-code-ui-dropdown>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectorComponent { 
  private readonly translateService = inject(TranslateService);
  private readonly storageService = inject(StorageService);

  readonly languages: Language[] = [
    { code: 'nl', label: 'Nederlands', flagImageUrl: 'images/flags/nl.svg' },
    { code: 'en', label: 'English', flagImageUrl: 'images/flags/gb.svg' },
  ];

  public readonly AppIcon = AppIcon;
  public currentLangCode = signal(this.translateService.currentLang || this.translateService.defaultLang);
  public currentLanguage = computed(() => this.languages.find(l => l.code === this.currentLangCode()));

  constructor() {
    this.translateService.onLangChange.subscribe(event => {
      this.currentLangCode.set(event.lang);
    });
  }

  selectLanguage(langCode: string): void {
    this.translateService.use(langCode);
    this.storageService.setItem('droneshopApp_language', langCode);
    this.currentLangCode.set(langCode);
  }
}