/**
 * @file admin-header.component.ts (Admin Panel)
 * @Version 1.1.0
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-20
 * @Description Header component for the admin panel, now with theme switcher and example action dropdowns.
 */
import { Component, ChangeDetectionStrategy, Signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '@royal-code/store/auth';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';
import { UiImageComponent } from '@royal-code/ui/media';
import { TranslateModule } from '@ngx-translate/core';
import { ExpandingThemeSelectorComponent, UiThemeSwitcherComponent } from '@royal-code/ui/theme-switcher';
import { Profile } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-header',
  standalone: true,
  imports: [RouterModule, TranslateModule, UiIconComponent, UiDropdownComponent, UiImageComponent, ExpandingThemeSelectorComponent, UiThemeSwitcherComponent],
  template: `
    <header class="h-16 flex-shrink-0 bg-surface flex items-center justify-between px-6 border-b border-border">
      <!-- Left side can be used for search or breadcrumbs later -->
      <div></div>

      <!-- Right side controls -->
      <div class="flex items-center gap-3">
        <!-- THEME SWITCHERS -->
        <royal-code-expanding-theme-selector />
        <royal-code-ui-theme-switcher />

        <!-- Voorbeeld Dropdown 1: Rapporten -->
        <royal-code-ui-dropdown alignment="right">
          <button dropdown-trigger royal-code-ui-button type="outline" sizeVariant="sm">
            <royal-code-ui-icon [icon]="AppIcon.BarChart" sizeVariant="sm" extraClass="mr-2"/>
            Rapporten
          </button>
          <div dropdown class="p-1 w-56">
             <a href="#" class="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-hover">Verkooprapport</a>
             <a href="#" class="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-hover">Gebruikersactiviteit</a>
          </div>
        </royal-code-ui-dropdown>

        <!-- Voorbeeld Dropdown 2: Nieuw Maken -->
        <royal-code-ui-dropdown alignment="right">
          <button dropdown-trigger royal-code-ui-button type="primary">
            <royal-code-ui-icon [icon]="AppIcon.Plus" sizeVariant="sm" extraClass="mr-2"/>
            Nieuw
          </button>
          <div dropdown class="p-1 w-56">
             <a routerLink="/products/new" class="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-hover">Nieuw Product</a>
             <a routerLink="/users/new" class="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-hover">Nieuwe Gebruiker</a>
             <a routerLink="/challenges/new" class="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-hover">Nieuwe Challenge</a>
          </div>
        </royal-code-ui-dropdown>

        <!-- User Menu -->
        @if (isAuthenticated()) {
          <royal-code-ui-dropdown alignment="right">
            <button dropdown-trigger class="flex items-center gap-2 p-1 rounded-full hover:bg-hover">
              <div class="h-9 w-9 rounded-full border border-border bg-muted overflow-hidden">
                @if (currentUser()?.avatar; as avatar) {
                  <royal-code-ui-image [image]="avatar" [alt]="'Admin Avatar'" objectFit="cover" [rounded]="true" />
                } @else {
                  <royal-code-ui-icon [icon]="AppIcon.UserCircle" extraClass="w-full h-full text-secondary" />
                }
              </div>
            </button>
            <div dropdown class="p-1 w-48">
              <div class="px-3 py-2 border-b border-border">
                  <p class="text-sm font-semibold text-foreground truncate">{{ currentUser()?.displayName }}</p>
              </div>
              <div class="pt-1">
                <button (click)="logout()" class="flex items-center w-full px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10">
                  <royal-code-ui-icon [icon]="AppIcon.LogOut" sizeVariant="sm" extraClass="mr-2" />
                  <span>Uitloggen</span>
                </button>
              </div>
            </div>
          </royal-code-ui-dropdown>
        }
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHeaderComponent {
  private readonly authFacade = inject(AuthFacade);

  readonly isAuthenticated: Signal<boolean> = this.authFacade.isAuthenticated;
  readonly currentUser: Signal<Profile | null> = this.authFacade.currentUser;
  readonly AppIcon = AppIcon;

  logout(): void {
    this.authFacade.logout();
  }
}