/**
 * @file account-menu.component.ts
 * @Version 2.0.0 (Consolidated Mobile Actions)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description
 *   Dropdown content voor het gebruikersaccount. Deze versie consolideert
 *   secundaire acties (Thema, Taal, Wishlist) die op mobiel uit de header zijn
 *   verwijderd, en toont deze hier voor een opgeruimde UI.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AuthActions, authFeature } from '@royal-code/store/auth';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { LanguageSelectorComponent } from '@royal-code/ui/language-selector';
import { ExpandingThemeSelectorComponent, UiThemeSwitcherComponent } from '@royal-code/ui/theme-switcher';

@Component({
  selector: 'droneshop-account-menu',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, UiIconComponent,
    LanguageSelectorComponent, ExpandingThemeSelectorComponent, UiThemeSwitcherComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-60 bg-background rounded-xs shadow-lg border border-border py-2">
      @if (isAuthenticated()) {
        <div class="px-4 py-2 border-b border-border mb-2">
          <span class="text-sm font-semibold text-foreground">{{ 'accountMenu.welcomeBack' | translate }}</span>
        </div>
        <a routerLink="/account" class="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.LayoutDashboard" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.myDashboard' | translate }}</span>
        </a>
        <a routerLink="/orders" class="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.FileText" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.myOrders' | translate }}</span>
        </a>
        <!-- DE FIX: Wishlist is nu hier geplaatst -->
        <a routerLink="/account/wishlist" class="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary lg:hidden">
            <royal-code-ui-icon [icon]="AppIcon.Heart" sizeVariant="sm" extraClass="text-secondary"/>
            <span>{{ 'droneshop.navigation.myWishlist' | translate }}</span>
        </a>
        <button (click)="logout()" class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.LogOut" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.logout' | translate }}</span>
        </button>
      } @else {
         <a routerLink="/login" class="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.LogIn" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.login' | translate }}</span>
        </a>
         <a routerLink="/register" class="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-hover hover:text-primary">
          <royal-code-ui-icon [icon]="AppIcon.UserPlus" sizeVariant="sm" extraClass="text-secondary"/>
          <span>{{ 'accountMenu.register' | translate }}</span>
        </a>
      }

      <!-- DE FIX: Geconsolideerde instellingen (nu ook zichtbaar op desktop) -->
      <hr class="my-2 border-border" />

      <div class="px-4 pt-2 pb-1 text-xs font-semibold uppercase text-secondary">
        {{ 'accountMenu.settings.title' | translate }}
      </div>
      <div class="px-2 py-1 flex items-center justify-between text-sm text-foreground lg:hidden">
        <span class="flex items-center gap-3">
            <royal-code-ui-icon [icon]="AppIcon.Sun" sizeVariant="sm" extraClass="text-secondary"/>
            <span>{{ 'accountMenu.settings.theme' | translate }}</span>
        </span>
        <royal-code-ui-theme-switcher />
      </div>
       <div class="px-2 py-1 flex items-center justify-between text-sm text-foreground lg:hidden">
        <span class="flex items-center gap-3">
            <royal-code-ui-icon [icon]="AppIcon.Palette" sizeVariant="sm" extraClass="text-secondary"/>
            <span>{{ 'accountMenu.settings.skin' | translate }}</span>
        </span>
        <royal-code-expanding-theme-selector />
      </div>
      <div class="px-4 py-2 text-sm text-foreground lg:hidden">
        <royal-language-selector />
      </div>
    </div>
  `
})
export class AccountMenuComponent {
  private readonly store = inject(Store);
  readonly isAuthenticated = this.store.selectSignal(authFeature.selectIsAuthenticated);
  protected readonly AppIcon = AppIcon;

  logout(): void {
    this.store.dispatch(AuthActions.logoutButtonClicked());
  }
}