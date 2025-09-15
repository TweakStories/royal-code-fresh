/**
 * @file settings-page.component.ts
 * @Version 3.0.0 (Simplified Layout Container - Navigation Moved to AdminShell)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Simplified settings page component, now acting purely as a layout container
 *              for its sub-routes, with navigation responsibilities moved to AdminShell.
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // Alleen RouterOutlet nodig

@Component({
  selector: 'admin-settings-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // Verwijder RouterModule en UiTitleComponent
  template: `
    <div class="space-y-6">
      <!-- Hoofdtitel kan hier komen, of in elke individuele settings-subcomponent -->
      <!-- <royal-code-ui-title [level]="TitleTypeEnum.H1" text="Instellingen" /> -->
      <router-outlet />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  // << DE FIX: navItems en TitleTypeEnum verwijderd >>
  // protected readonly TitleTypeEnum = TitleTypeEnum; // Niet langer nodig
  // protected readonly navItems = signal<SettingsNavigationItem[]>([]); // Niet langer nodig
}