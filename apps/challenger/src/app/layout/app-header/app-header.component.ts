/**
 * @fileoverview Defines the main application header component for Challenger App.
 * Handles displaying the appropriate navigation (desktop/mobile),
 * user authentication status (login/user menu), theme switching (light/dark and visual themes),
 * and triggers actions like logout or opening the mobile menu modal.
 * It adapts its layout based on screen size using Tailwind CSS responsive modifiers.
 *
 * @Component AppHeaderComponent
 * @description The main header component for the Challenger App. It orchestrates
 *              different UI elements based on screen size and authentication state.
 * @version 1.1.0 // Versie verhoogd vanwege toevoegen visual theme selector
 */
import { ChangeDetectionStrategy, Component, Signal, inject, signal, computed } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';

// --- UI Components ---
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';
import { UiThemeSwitcherComponent, UiVisualThemeSelectorComponent } from '@royal-code/ui/theme-switcher';

import { UiImageComponent } from '@royal-code/ui/media';
import { UiDesktopNavComponent } from '@royal-code/ui/navigation';
import { UiMobileNavComponent } from '@royal-code/ui/navigation';
import { UiMobileNavModalComponent } from '@royal-code/ui/navigation';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
// Temporary stubs until ChatOverlay is implemented
interface ChatOverlayInputData {
  showHeaderProfile?: boolean;
  initialConversationId?: string;
}

// Create a simple placeholder component
import { Component as AngularComponent } from '@angular/core';

@AngularComponent({
  selector: 'chat-overlay-placeholder',
  template: '<div>Chat overlay not implemented yet</div>',
  standalone: true
})
class ChatOverlayComponent {
}
import { BreadcrumbService } from '@royal-code/ui/breadcrumb';

// --- State & Facades ---
import { AuthFacade } from '@royal-code/store/auth';
import { NavigationFacade } from '@royal-code/core/navigations/state';

// --- Models & Routes ---
import { AppIcon, NavigationItem, Profile, ImageVariant, BreadcrumbItem } from '@royal-code/shared/domain';
import { ROUTES } from '@royal-code/core/routing';
import { LoggerService } from '@royal-code/core/core-logging';
import { UiBreadcrumbsComponent } from '@royal-code/ui/breadcrumb';

@Component({
  selector: 'app-header', // Behoud app-header als het specifiek is voor deze app
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    UiDesktopNavComponent,
    UiMobileNavComponent,
    UiMobileNavModalComponent,
    UiDropdownComponent,
    UiIconComponent,
    UiButtonComponent,
    UiThemeSwitcherComponent,
    UiVisualThemeSelectorComponent,
    UiImageComponent,
    UiBreadcrumbsComponent
],
  template: `
    <!-- Desktop Header Structure (hidden below md breakpoint) -->
    <header class="hidden md:flex flex-col sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

      <!-- Top Bar: Contains Logo, Theme Switcher, and User Menu/Login -->
      <div class="container-max px-4 h-14 flex justify-between items-center">
        <!-- Logo -->
        <a routerLink="/" class="flex-shrink-0 mr-6" aria-label="Homepage">
          <img src="assets/images/logo.png" alt="Challenger Logo" class="h-8 w-auto hover:opacity-80 transition-opacity" />
        </a>

        <!-- Right-aligned User Controls -->
        <div class="flex items-center space-x-3 ml-auto">
          <royal-code-ui-visual-theme-selector />
          <royal-code-ui-theme-switcher />

          @if (isAuthenticated()) {
            <royal-code-ui-button
              type="transparent"
              sizeVariant="icon"
              (clicked)="openChatOverlay()"
              class="h-9 w-9 text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              [title]="'chat.openOverlayTitle' | translate"
              aria-label="Open chat">
              <royal-code-ui-icon [icon]="AppIcon.MessageSquare" sizeVariant="md"></royal-code-ui-icon>
            </royal-code-ui-button>

             <royal-code-ui-dropdown alignment="right">
                <button dropdown-trigger
                        class="flex items-center justify-center h-9 w-9 rounded-full border border-border text-secondary hover:bg-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        aria-label="User menu"
                        aria-haspopup="true"
                        [attr.aria-expanded]="false">
                  @if (currentUser()?.avatar; as avatar) {
                      <royal-code-ui-image
                        [image]="avatar"
                        [alt]="(currentUser()?.displayName) + ' Avatar'"
                        objectFit="cover"
                        [rounded]="true" />
                  } @else {
                      <span class="text-xs font-medium">
                          {{ currentUser()?.displayName?.charAt(0)?.toUpperCase() || '?' }}
                      </span>
                  }
               </button>
               <div dropdown class="w-56 p-1">
                  <div class="px-2 py-1.5 text-sm font-semibold border-b border-border">
                     {{ currentUser()?.displayName || ('navigation.userMenu.myAccount' | translate) }}
                  </div>
                  <div class="py-1">
                     <a [routerLink]="userProfileRoute" (click)="closeDropdown()"
                        class="flex items-center relative cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full">
                        <royal-code-ui-icon [icon]="AppIcon.User" sizeVariant="sm" extraClass="mr-2 text-muted-foreground group-hover/item:text-accent-foreground"></royal-code-ui-icon>
                        {{ 'navigation.userMenu.profile' | translate }}
                     </a>
                     <a [routerLink]="userSettingsRoute" (click)="closeDropdown()"
                        class="flex items-center relative cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full">
                        <royal-code-ui-icon [icon]="AppIcon.Settings" sizeVariant="sm" extraClass="mr-2 text-muted-foreground group-hover/item:text-accent-foreground"></royal-code-ui-icon>
                        {{ 'navigation.userMenu.settings' | translate }}
                     </a>
                  </div>
                  <hr class="my-1 border-border">
                  <button (click)="logout()"
                          class="flex items-center relative cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground w-full text-destructive">
                     <royal-code-ui-icon [icon]="AppIcon.LogOut" sizeVariant="sm" extraClass="mr-2"></royal-code-ui-icon>
                     {{ 'auth.logout.logoutButton' | translate }}
                  </button>
               </div>
            </royal-code-ui-dropdown>
          } @else {
             <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="navigateToLogin()">
                  {{ 'auth.login.loginButton' | translate }}
             </royal-code-ui-button>
          }
        </div>
      </div>

      <div class="border-t border-border">
        <royal-code-ui-desktop-nav
            class="container-max px-4 h-11 flex items-center"
            [menuItems]="desktopNavItems()"
            (actionClicked)="handleDesktopAction($any($event))">
        </royal-code-ui-desktop-nav>
      </div>
    </header>

    <!-- ▼▼▼ BREADCRUMBS SECTIE ▼▼▼ -->
      @if (breadcrumbsSignal().length > 1) { <!-- Toon alleen als er meer dan 1 item is (bv. niet op homepage) -->
        <div class="container-max px-4 py-2 border-t border-border"> <!-- Pas styling aan indien nodig -->
          <royal-code-ui-breadcrumbs></royal-code-ui-breadcrumbs>
        </div>
      }
      <!-- ▲▲▲ EINDE BREADCRUMBS SECTIE ▲▲▲ -->


    <royal-code-ui-mobile-nav
        class="md:hidden"
        [menuItems]="mobileBottomNavItems()"
        (openMenuModalClicked)="openMobileModal()">
    </royal-code-ui-mobile-nav>

    <royal-code-ui-mobile-nav-modal
        [isOpen]="isMobileModalOpen()"
        [menuItems]="mobileModalNavItems()"
        (closeRequested)="closeMobileModal()"
        (navigationItemClicked)="handleMobileModalAction($event)">
    </royal-code-ui-mobile-nav-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent {
  readonly authFacade = inject(AuthFacade);
  readonly navigationFacade = inject(NavigationFacade);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly dynamicOverlayService = inject(DynamicOverlayService);
  private readonly logPrefix = '[ChallengerAppHeaderComponent]'; // Contextuele prefix

  readonly breadcrumbService = inject(BreadcrumbService);
  readonly breadcrumbsSignal: Signal<BreadcrumbItem[]> = this.breadcrumbService.breadcrumbs;


  readonly desktopNavItems: Signal<NavigationItem[]> = this.navigationFacade.desktopNavigationItems;
  readonly mobileBottomNavItems: Signal<NavigationItem[]> = this.navigationFacade.mobileBottomNavigationItems;
  readonly mobileModalNavItems: Signal<NavigationItem[]> = this.navigationFacade.mobileModalNavigationItems;
  readonly currentUser: Signal<Profile | null> = this.authFacade.currentUser;
  readonly isAuthenticated: Signal<boolean> = this.authFacade.isAuthenticated;

  readonly isMobileModalOpen = signal(false);

  readonly userProfileRoute = ROUTES.user.profile;
  readonly userSettingsRoute = ROUTES.user.settings;
  readonly AppIcon = AppIcon;

  constructor() {
    this.logger.debug(`${this.logPrefix} Initialized.`); // Aangepaste log
  }

  logout(): void {
    this.logger.info(`${this.logPrefix} Logout action initiated.`);
    this.closeDropdown();
    this.authFacade.logout();
  }

  navigateToLogin(): void {
    this.logger.info(`${this.logPrefix} Navigating to login page.`);
    this.router.navigate([ROUTES.auth.login]);
  }

  openMobileModal(): void {
    this.logger.debug(`${this.logPrefix} Opening mobile modal.`);
    this.isMobileModalOpen.set(true);
  }

  closeMobileModal(): void {
    this.logger.debug(`${this.logPrefix} Closing mobile modal.`);
    this.isMobileModalOpen.set(false);
  }

  handleDesktopAction(item: NavigationItem): void {
    this.logger.debug(`${this.logPrefix} Handling desktop action:`, item);
    if (item.id === 'logout' || item.labelKey === 'navigation.logout') {
      this.logout();
    }
    this.closeDropdown();
  }

  handleMobileModalAction(item: NavigationItem): void {
    this.logger.debug(`${this.logPrefix} Handling mobile modal action:`, item);
    if (item.id === 'logout' || item.labelKey === 'navigation.logout') {
      this.logout();
    } else if (item.route) {
      this.router.navigate([item.route]);
    } else {
      this.logger.warn(`${this.logPrefix} Clicked mobile menu item without route or action:`, item);
    }
    this.closeMobileModal();
  }

  closeDropdown(): void {
    this.logger.debug(`${this.logPrefix} Attempting to close desktop dropdown (implementation needed if required).`);
  }

  openChatOverlay(options?: { showProfile?: boolean, conversationId?: string }): void {
    this.logger.info(`${this.logPrefix} Opening chat overlay.`);
    const overlayData: ChatOverlayInputData = {
      showHeaderProfile: options?.showProfile ?? true,
      initialConversationId: options?.conversationId
    };
    this.dynamicOverlayService.open({
      data: overlayData,
      component: ChatOverlayComponent,
      panelClass: ['chat-overlay-panel', 'w-full', 'h-full', 'max-w-none', 'max-h-none'],
      backdropType: 'dark',
      closeOnClickOutside: false,
      positionStrategy: 'global-center',
      mobileFullscreen: true,
      disableCloseOnEscape: false
    });
  }
}
