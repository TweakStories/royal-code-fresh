/**
 * @fileoverview Defines the main application header component for Plushie Paradise.
 * Handles displaying the appropriate navigation (desktop/mobile),
 * user authentication status (login/user menu), theme switching (light/dark and visual themes),
 * and triggers actions like logout or opening the mobile menu modal.
 * It adapts its layout based on screen size using Tailwind CSS responsive modifiers.
 *
 * @Component AppHeaderComponent
 * @description The main header component for the Plushie Paradise App.
 * @version 1.3.0 // Versie verhoogd vanwege toevoegen cart dropdown
 * @author Royal-Code MonorepoAppDevAI
 */
import { ChangeDetectionStrategy, Component, Signal, inject, signal, computed, Injector } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';

// --- UI Components ---
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';
import { ExpandingThemeSelectorComponent, UiThemeSwitcherComponent } from '@royal-code/ui/theme-switcher';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiDesktopNavComponent, UiMobileNavComponent, UiMobileNavModalComponent } from '@royal-code/ui/navigation';
import { DynamicOverlayRef, DynamicOverlayService } from '@royal-code/ui/overlay';

// --- State & Facades ---
import { AuthFacade } from '@royal-code/store/auth';
import { NavigationFacade } from '@royal-code/core/navigations/state';

// --- Models & Routes ---
import { AppIcon, BreadcrumbItem, NavigationItem } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { CartFacade } from '@royal-code/features/cart/core';
import { CartDropdownComponent } from '@royal-code/features/cart/ui-plushie';
import { ChatOverlayInputData, ChatOverlayComponent } from '@royal-code/features/chat/ui-plushie';
import { ProductFacade } from '@royal-code/features/products/core';
import { Profile } from '@royal-code/shared/domain';
import { BreadcrumbService, UiBreadcrumbsComponent } from '@royal-code/ui/breadcrumb';


@Component({
  selector: 'app-header',
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
    ExpandingThemeSelectorComponent,
    UiImageComponent,
    UiBreadcrumbsComponent,
    CartDropdownComponent
],
  template: `
    <!-- Desktop Header Structure (hidden below md breakpoint) -->
    <header class="hidden md:flex flex-col sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

      <!-- Top Bar: Contains Logo, Theme Switcher, and User Menu/Login -->
      <div class="container-max px-4 h-14 flex justify-between items-center">
        <!-- Logo -->
        <a routerLink="/" class="flex-shrink-0 mr-6" aria-label="Homepage">
          <img src="assets/images/plushie-paradise-logo.webp" alt="Plushie Paradise Logo" class="h-10 w-auto hover:opacity-80 transition-opacity" />
        </a>

        <!-- Right-aligned User Controls -->
        <div class="flex items-center space-x-3 ml-auto">

          <!-- Cart Dropdown -->
          <royal-code-ui-dropdown alignment="right" [offsetY]="8" >
            <button dropdown-trigger
                    type="button"
                    class="relative h-9 w-9 flex items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    [title]="'cart.viewCart' | translate"
                    aria-label="Open shopping cart">
              <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" sizeVariant="md" />
              @if(cartItemCount() > 0) {
                <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-on text-[10px] font-bold">
                  {{ cartItemCount() }}
                </span>
              }
            </button>
            <div dropdown class="">
              <plushie-royal-code-cart-dropdown [viewModel]="cartFacade.viewModel()"
                                        (viewCartClicked)="navigateToCart()"
                                        (checkoutClicked)="navigateToCheckout()" />
            </div>
          </royal-code-ui-dropdown>
          <!-- Einde Cart Dropdown -->

         <!-- geanimeerde theme selector -->
          <royal-code-expanding-theme-selector />
          <royal-code-ui-theme-switcher />


           @if (isAuthenticated()) {
            <!-- User Menu Dropdown -->
            <royal-code-ui-dropdown alignment="right" [offsetY]="8">
              <button dropdown-trigger
                      class="flex items-center justify-center h-9 w-9 rounded-full border border-border text-secondary hover:bg-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Gebruikersmenu openen"
                      aria-haspopup="true">
                @if (currentUser()?.avatar; as avatar) {
                    <royal-code-ui-image [image]="avatar" [alt]="(currentUser()?.displayName || 'User') + ' Avatar'" objectFit="cover" [rounded]="true" />
                } @else {
                    <royal-code-ui-icon [icon]="AppIcon.UserCircle" sizeVariant="lg" />
                }
              </button>

              <div dropdown class="w-56">
                <div class="px-3 py-2 border-b border-border">
                  <p class="text-sm text-muted-foreground">{{ 'navigation.userMenu.welcome' | translate }}</p>
                  <p class="text-sm font-semibold text-foreground truncate">{{ currentUser()?.displayName }}</p>
                </div>
                <div class="py-1">
                  <a [routerLink]="orderHistoryRoute" (click)="closeDropdown()" class="flex items-center w-full px-3 py-2 text-sm hover:bg-hover focus:bg-hover outline-none rounded-xs">
                    <royal-code-ui-icon [icon]="AppIcon.Package" sizeVariant="sm" extraClass="mr-2.5 text-secondary"/>
                    <span>{{ 'navigation.userMenu.orders' | translate }}</span>
                  </a>
                  <a [routerLink]="userProfileRoute" (click)="closeDropdown()" class="flex items-center w-full px-3 py-2 text-sm hover:bg-hover focus:bg-hover outline-none rounded-xs">
                    <royal-code-ui-icon [icon]="AppIcon.User" sizeVariant="sm" extraClass="mr-2.5 text-secondary"/>
                    <span>{{ 'navigation.userMenu.profile' | translate }}</span>
                  </a>
                   <a [routerLink]="userSettingsRoute" (click)="closeDropdown()" class="flex items-center w-full px-3 py-2 text-sm hover:bg-hover focus:bg-hover outline-none rounded-xs">
                    <royal-code-ui-icon [icon]="AppIcon.Settings" sizeVariant="sm" extraClass="mr-2.5 text-secondary"/>
                    <span>{{ 'navigation.userMenu.settings' | translate }}</span>
                  </a>
                </div>
                <div class="py-1 border-t border-border">
                  <button (click)="logout()" class="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 outline-none rounded-xs">
                    <royal-code-ui-icon [icon]="AppIcon.LogOut" sizeVariant="sm" extraClass="mr-2.5"/>
                    <span>{{ 'auth.logout.logoutButton' | translate }}</span>
                  </button>
                </div>
              </div>
            </royal-code-ui-dropdown>

          } @else {
             <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="navigateToLogin()">
                  {{ 'auth.login.loginButton' | translate }}
             </royal-code-ui-button>
          }
        </div>
      </div>

      <!-- Breadcrumbs Sectie -->
        @if (breadcrumbsSignal().length > 1) {
          <div class="container-max px-4 py-2 border-t border-border">
            <royal-code-ui-breadcrumb [items]="breadcrumbsSignal()"></royal-code-ui-breadcrumb>
          </div>
        }

      <!-- Navigatiebalk -->
      <div class="border-t border-border">
        <royal-code-ui-desktop-nav
            class="container-max px-4 h-11 flex items-center"
            [menuItems]="desktopNavItems()"
            (actionClicked)="handleDesktopAction($event)">
        </royal-code-ui-desktop-nav>
      </div>
    </header>

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
  readonly cartFacade = inject(CartFacade);
  readonly productFacade = inject(ProductFacade);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly dynamicOverlayService = inject(DynamicOverlayService);
  private readonly logPrefix = '[PlushieParadiseAppHeaderComponent]';
  private readonly injector = inject(Injector);

  readonly desktopNavItems: Signal<NavigationItem[]> = this.navigationFacade.desktopTopNavItems$;
  readonly mobileBottomNavItems: Signal<NavigationItem[]> = this.navigationFacade.mobileBottomNavItems$;
  readonly mobileModalNavItems: Signal<NavigationItem[]> = this.navigationFacade.mobileModalNavItems$;
  readonly currentUser: Signal<Profile | null> = this.authFacade.currentUser;
  readonly isAuthenticated: Signal<boolean> = this.authFacade.isAuthenticated;
  readonly isProductsLoading: Signal<boolean> = this.productFacade.isLoading;
  readonly cartItemCount = computed(() => this.cartFacade.viewModel().totalItemCount);

  readonly breadcrumbService = inject(BreadcrumbService);
  readonly breadcrumbsSignal: Signal<BreadcrumbItem[]> = this.breadcrumbService.breadcrumbs$;

  readonly isMobileModalOpen = signal(false);

  readonly userProfileRoute = ROUTES.user.profile;
  readonly userSettingsRoute = ROUTES.user.settings;
  readonly orderHistoryRoute = '/orders'; 
  readonly AppIcon = AppIcon;

  constructor() {
    this.logger.debug(`${this.logPrefix} Initialized.`);
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
    if (item.action === 'logout') this.logout();
    this.closeDropdown();
  }

  handleMobileModalAction(item: NavigationItem): void {
    this.logger.debug(`${this.logPrefix} Handling mobile modal action:`, item);
    if (item.action === 'logout') this.logout();
    else if (item.route) this.router.navigate([item.route]);
    else this.logger.warn(`${this.logPrefix} Clicked mobile menu item without route or action:`, item);
    this.closeMobileModal();
  }

  closeDropdown(): void {
    this.logger.debug(`${this.logPrefix} Attempting to close desktop dropdown.`);
  }

openChatOverlay(options?: { showProfile?: boolean, conversationId?: string }): void {
  this.logger.info(`${this.logPrefix} Opening chat overlay.`);
  const overlayData: ChatOverlayInputData = {
    showHeaderProfile: options?.showProfile ?? true,
    initialConversationId: options?.conversationId
  };

  this.dynamicOverlayService.open({
    component: ChatOverlayComponent,
    data: overlayData,
    panelClass: ['chat-overlay-panel', 'w-full', 'h-full', 'max-w-none', 'max-h-none'],
    backdropType: 'dark',
    closeOnClickOutside: false,
    positionStrategy: 'global-center',
    mobileFullscreen: true,
    disableCloseOnEscape: false
  });
}

  navigateToCart(): void {
    this.logger.info(`${this.logPrefix} Navigating to cart page.`);
    this.closeDropdown();
    this.router.navigate(['/cart']);
  }

  navigateToCheckout(): void {
    this.logger.info(`${this.logPrefix} Navigating to checkout page.`);
    this.closeDropdown();
    this.router.navigate(['/checkout']);
  }
}
