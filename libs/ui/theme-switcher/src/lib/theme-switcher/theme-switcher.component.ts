/**
 * @file theme-switcher.component.ts
 * @Version 2.2.0 (Dynamic Label & Definitive Signal Binding)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   A standalone component for switching between light and dark mode. This definitive
 *   version correctly implements one-way and event binding for `UiToggleButtonComponent`
 *   to work with a readonly `Signal` from the NgRx store. The label now dynamically
 *   reflects the current theme mode.
 */
import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectIsDarkMode, ThemeActions } from '@royal-code/store/theme';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'royal-code-ui-theme-switcher',
  standalone: true,
  imports: [UiToggleButtonComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <royal-code-ui-toggle-button
      [label]="currentThemeLabel() | translate"
      [value]="isDarkMode()"
      (valueChange)="toggleDarkMode()"
    >
    </royal-code-ui-toggle-button>
  `,
})
export class UiThemeSwitcherComponent {
  private store = inject(Store);

  readonly isDarkMode = toSignal(this.store.select(selectIsDarkMode), { initialValue: false });

  // Compute the label dynamically based on current dark mode state
  readonly currentThemeLabel = computed(() => {
    return this.isDarkMode() ? 'Dark' : 'Light';
  });

  toggleDarkMode(): void {
    this.store.dispatch(ThemeActions.toggleDarkMode());
  }
}