/**
 * @file expanding-theme-selector.component.ts
 * @Version 2.1.0 (Layout & Animation Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-20
 * @Description
 *   Een geanimeerde, "expanding" theme selector met verbeterde layout consistency,
 *   correcte height/width berekeningen en smooth animaties.
 */
import {
  Component, inject, ChangeDetectionStrategy, Signal, signal, computed, HostBinding
} from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { ThemeFacade, ThemeName } from '@royal-code/store/theme';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, ButtonType } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';

interface ThemeChoice {
  name: ThemeName;
  displayNameKey: string;
  buttonType: ButtonType;
  icon?: AppIcon;
}

@Component({
  selector: 'royal-code-expanding-theme-selector',
  standalone: true,
  imports: [TranslateModule, UiButtonComponent, UiIconComponent],
  styles: [`
    :host {
      display: inline-block;
      position: relative;
    }

    .expanding-theme-selector {
      /* Container met vaste hoogte en transitie voor breedte */
      height: var(--selector-height);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: visible; /* Zorgt ervoor dat neon effects zichtbaar blijven */
    }

    .theme-option-wrapper {
      position: absolute;
      top: 50%;
      left: 0;
      height: var(--button-size); /* Match button size exactly */
      width: var(--button-size);
      transform: translateY(-50%); /* Perfect vertical centering */
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.25s ease-in-out;
    }

    /* Actieve knop is relatief gepositioneerd en altijd zichtbaar */
    .theme-option-wrapper.is-active {
      position: relative;
      z-index: 2;
      /* Zorgt voor ruimte aan de rechterkant voor inactieve buttons */
      margin-right: 0;
    }

    /* Gesloten staat - verberg inactieve knoppen */
    :host:not(.is-open) .theme-option-wrapper:not(.is-active) {
      transform: translateY(-50%) scale(0.3);
      opacity: 0;
      pointer-events: none;
    }

    /* Open staat - toon alle knoppen met staggered animation */
    :host.is-open .theme-option-wrapper:not(.is-active) {
      transform: translateY(-50%) translateX(var(--translate-x)) scale(1);
      opacity: 1;
      transition-delay: var(--delay);
      pointer-events: auto;
      z-index: 1;
    }

    /* Zorg ervoor dat buttons de volledige ruimte innemen */
    .theme-option-wrapper royal-code-ui-button {
      width: var(--button-size);
      height: var(--button-size);
    }
  `],
  template: `
    <div
      class="expanding-theme-selector flex items-center p-1.5 rounded-full bg-surface border border-border shadow-sm"
      role="group"
      [attr.aria-label]="'themeSelector.ariaLabel.selectVisualTheme' | translate"
      (mouseenter)="open()"
      (mouseleave)="close()"
      [style.width.px]="containerWidth()"
      [style.--selector-height.px]="SELECTOR_HEIGHT"
      [style.--button-size.px]="BUTTON_SIZE"
    >
      <!-- Actieve theme knop -->
      <div
        class="theme-option-wrapper is-active"
        (click)="toggle()"
        (keydown.enter)="toggle()"
        (keydown.space)="toggle(); $event.preventDefault()"
        tabindex="0"
        role="button"
        [attr.aria-label]="'themeSelector.actions.toggleSelector' | translate"
      >
        <royal-code-ui-button
          [type]="activeChoice().buttonType"
          sizeVariant="dot"
          [isRound]="true"
          [isAnimated]="true"
          [enableNeonEffect]="true"
          [title]="activeChoice().displayNameKey | translate"
        >
          @if (activeChoice().icon) {
            <royal-code-ui-icon [icon]="activeChoice().icon!" sizeVariant="xs" />
          }
        </royal-code-ui-button>
      </div>

      <!-- Inactieve theme knoppen -->
      @for (theme of inactiveChoices(); track theme.name; let i = $index) {
        <div
          class="theme-option-wrapper"
          [style.--translate-x.px]="getTranslateX(i)"
          [style.--delay]="getAnimationDelay(i)"
        >
          <royal-code-ui-button
            [type]="theme.buttonType"
            sizeVariant="dot"
            [isRound]="true"
            [isAnimated]="true"
            [enableNeonEffect]="isHovered(theme.name)"
            [title]="theme.displayNameKey | translate"
            (click)="selectTheme(theme.name); $event.stopPropagation()"
            (mouseenter)="setHovered(theme.name)"
            (mouseleave)="setHovered(null)"
          >
            @if (theme.icon) {
              <royal-code-ui-icon [icon]="theme.icon" sizeVariant="xs" />
            }
          </royal-code-ui-button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandingThemeSelectorComponent {
  private readonly themeFacade = inject(ThemeFacade);

  // Constanten voor consistente sizing
  readonly BUTTON_SIZE = 28; // h-7 w-7 in Tailwind
  readonly CONTAINER_PADDING = 12; // p-1.5 = 6px each side = 12px total
  readonly SELECTOR_HEIGHT = this.BUTTON_SIZE + this.CONTAINER_PADDING; // 40px voor perfecte fit
  readonly BUTTON_GAP = 6; // Ruimte tussen knoppen

  readonly isOpen = signal(false);
  readonly hoveredTheme = signal<ThemeName | null>(null);

  @HostBinding('class.is-open')
  get hostIsOpenClass(): boolean {
    return this.isOpen();
  }

  readonly themeChoices: ThemeChoice[] = [
    { name: 'balancedGold', displayNameKey: 'themeSelector.themes.balancedGold', buttonType: 'theme-sun', icon: AppIcon.SunDim },
    { name: 'oceanicFlow', displayNameKey: 'themeSelector.themes.oceanicFlow', buttonType: 'theme-water', icon: AppIcon.Droplets },
    { name: 'verdantGrowth', displayNameKey: 'themeSelector.themes.verdantGrowth', buttonType: 'theme-forest', icon: AppIcon.Sprout },
    { name: 'arcaneMyst', displayNameKey: 'themeSelector.themes.arcaneMyst', buttonType: 'theme-arcane', icon: AppIcon.Sparkles },
  ];

  readonly currentThemeSignal: Signal<ThemeName> = this.themeFacade.currentThemeSignal;

  readonly activeChoice = computed(() =>
    this.themeChoices.find(t => t.name === this.currentThemeSignal()) || this.themeChoices[0]
  );

  readonly inactiveChoices = computed(() =>
    this.themeChoices.filter(t => t.name !== this.currentThemeSignal())
  );

  readonly containerWidth = computed(() => {
    if (this.isOpen()) {
      // Open staat: padding + actieve button + gap + alle inactieve buttons met gaps + padding
      const PADDING_TOTAL = 12; // 6px left + 6px right
      const activeButtonWidth = this.BUTTON_SIZE;
      const gapAfterActive = this.BUTTON_GAP;
      const inactiveCount = this.inactiveChoices().length;
      const inactiveButtonsWidth = inactiveCount * this.BUTTON_SIZE;
      const gapsBetweenInactive = Math.max(0, inactiveCount - 1) * this.BUTTON_GAP;

      return PADDING_TOTAL + activeButtonWidth + gapAfterActive +
             inactiveButtonsWidth + gapsBetweenInactive;
    } else {
      // Gesloten: Vierkant voor perfecte cirkel (height = width)
      return this.SELECTOR_HEIGHT;
    }
  });

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.setHovered(null); // Reset hover state bij sluiten
  }

  toggle(): void {
    this.isOpen.update(open => !open);
    if (!this.isOpen()) {
      this.setHovered(null);
    }
  }

  setHovered(themeName: ThemeName | null): void {
    this.hoveredTheme.set(themeName);
  }

  isHovered(themeName: ThemeName): boolean {
    return this.hoveredTheme() === themeName;
  }

  selectTheme(themeName: ThemeName): void {
    if (this.currentThemeSignal() !== themeName) {
      this.themeFacade.setVisualTheme(themeName);
    }
    // Sluit na een korte delay zodat de gebruiker de selectie ziet
    setTimeout(() => this.close(), 100);
  }

  getTranslateX(index: number): number {
    // PROBLEEM OPGELOST: Actieve button eindigt op (padding + button_size)
    // Inactieve buttons moeten starten na (padding + button_size + gap)
    const PADDING_LEFT = 6; // p-1.5 left padding
    const activeButtonEnd = PADDING_LEFT + this.BUTTON_SIZE; // 6 + 28 = 34px
    const firstInactiveStart = activeButtonEnd + this.BUTTON_GAP; // 34 + 6 = 40px
    const subsequentSpacing = this.BUTTON_SIZE + this.BUTTON_GAP; // 28 + 6 = 34px

    return firstInactiveStart + (index * subsequentSpacing);
  }

  getAnimationDelay(index: number): string {
    // Staggered animation met kortere delays voor snappier gevoel
    return this.isOpen() ? `${(index + 1) * 0.03}s` : '0s';
  }
}
