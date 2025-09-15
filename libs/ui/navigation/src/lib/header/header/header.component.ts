/**
 * @file ui-header.component.ts
 * @Version 1.0.0 (Generic, Data-driven)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Een generieke, herbruikbare en data-gedreven header component. Deze component
 *   heeft geen kennis van de specifieke applicatie. Het ontvangt navigatiedata
 *   via Dependency Injection en geeft events voor app-specifieke logica (zoals zoeken)
 *   door via @Output.
 */
import { ChangeDetectionStrategy, Component, signal, inject, HostListener, ElementRef, computed, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Core & Config ---

// --- Domain & UI Components ---
import { SearchSuggestion } from '@royal-code/features/products/domain';
import { NavigationItem, AppIcon } from '@royal-code/shared/domain';
import { ExpandingThemeSelectorComponent, UiThemeSwitcherComponent } from '@royal-code/ui/theme-switcher';
import { LanguageSelectorComponent } from '@royal-code/ui/language-selector';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';
import { UiSearchSuggestionsPanelComponent } from '@royal-code/features/products/ui-droneshop';
import { AccountMenuComponent } from 'apps/droneshop/src/app/layout/account-menu/account-menu.component';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiDesktopNavComponent } from '../../navigation/desktop-nav/ui-desktop-nav.component';
import { UiMegaMenuComponent } from '../../navigation/mega-menu/mega-menu.component';
import { UiMobileNavModalComponent } from '../../navigation/mobile-nav-modal/ui-mobile-nav-modal.component';
import { APP_NAVIGATION_ITEMS, AppNavigationConfig } from '@royal-code/core';

@Component({
  selector: 'royal-code-ui-header',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, FormsModule, UiThemeSwitcherComponent,
    ExpandingThemeSelectorComponent, UiMobileNavModalComponent, LanguageSelectorComponent,
    UiIconComponent, UiInputComponent, UiDropdownComponent, AccountMenuComponent,
    UiMegaMenuComponent, UiDesktopNavComponent, UiSearchSuggestionsPanelComponent,
    UiButtonComponent,
  ],
  template: `
    <header class="relative top-0 z-40 w-full">
      <div class="bg-background border-b border-black">
        <div class="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div class="h-8 bg-surface-alt">
            <div class="container-max h-full px-4 md:px-6 flex items-center justify-end">
              <royal-code-ui-desktop-nav [menuItems]="topBarNavItems()" [isSubtle]="true" />
            </div>
          </div>
          
          <div class="h-20">
            <div class="container-max h-full px-4 md:px-6 flex items-center justify-between gap-4">
              <!-- Logo -->
              <a routerLink="/" class="text-2xl font-bold text-primary flex-shrink-0">Droneshop</a>
              
              <div class="flex-grow max-w-2xl mx-4 hidden lg:block relative">
                <royal-code-ui-input
                  type="search"
                  [placeholder]="'droneshop.search.placeholder' | translate"
                  [appendButtonIcon]="AppIcon.Search"
                  [appendButtonAriaLabel]="'droneshop.search.submit' | translate"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearchQueryChange($event)"
                  (enterPressed)="onSearchSubmit(searchQuery)"
                  (appendButtonClicked)="onSearchSubmit(searchQuery)"
                  extraClasses="!px-4 !pr-12 !h-11 !text-lg !rounded-none !border-2 !border-border !bg-input focus:!ring-primary focus:!border-primary"
                  extraButtonClasses="!px-4 !h-full"
                />
                @if (searchQuery.length > 1 && suggestions() && suggestions()!.length > 0) {
                  <royal-code-ui-search-suggestions-panel 
                    [suggestions]="suggestions()!"
                    (suggestionSelected)="onSuggestionSelect($event)" />
                }
              </div>
              
              <!-- Rechter iconen -->
              <div class="flex items-center gap-2">
                <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="openMobileSearch()" extraClasses="lg:hidden">
                  <royal-code-ui-icon [icon]="AppIcon.Search" sizeVariant="md" />
                </royal-code-ui-button>
                
                <div class="relative z-50 hidden lg:block"><royal-code-expanding-theme-selector /></div>
                <div class="relative z-50 hidden lg:block"><royal-code-ui-theme-switcher /></div>
                <div class="relative z-50 hidden lg:block"><royal-language-selector /></div>
                <a routerLink="/account/wishlist" class="p-2 rounded-none text-foreground hover:text-primary hidden lg:block" [attr.aria-label]="'droneshop.navigation.myWishlist' | translate">
                  <royal-code-ui-icon [icon]="AppIcon.Heart" sizeVariant="md" />
                </a>

                <div class="relative z-50">
                  <royal-code-ui-dropdown [triggerOn]="'click'" alignment="right" [offsetY]="8">
                    <button dropdown-trigger class="p-2 rounded-none text-foreground hover:text-primary" [attr.aria-label]="'droneshop.navigation.account' | translate">
                      <royal-code-ui-icon [icon]="AppIcon.User" sizeVariant="md" />
                    </button>
                    <div dropdown><droneshop-account-menu /></div>
                  </royal-code-ui-dropdown>
                </div>
                <a routerLink="/cart" class="relative p-2 rounded-none text-foreground hover:text-primary" [attr.aria-label]="'droneshop.navigation.cart' | translate">
                  <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" sizeVariant="md" />
                  @if (cartItemCount() > 0) {
                    <div class="absolute -top-1 -right-1 bg-primary text-primary-on text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {{ cartItemCount() }}
                    </div>
                  }
                </a>

                <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="openMobileMenu()" extraClasses="lg:hidden -mr-2">
                  <royal-code-ui-icon [icon]="AppIcon.Menu" />
                </royal-code-ui-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <nav class="hidden lg:flex h-14 bg-primary border-t border-black z-20 shadow-md" (mouseleave)="startCloseMenuTimer()">
        <div class="container-max h-full flex items-center justify-start">
          <ul class="flex items-center h-full">
            @for (item of primaryNavItems(); track item.id; let i = $index) {
              <li (mouseenter)="handleMouseEnter(item)" class="h-full flex items-center">
                <a [routerLink]="item.route" [queryParams]="item.queryParams" [queryParamsHandling]="item.queryParamsHandling || 'merge'"
                   class="flex items-center gap-2 font-semibold transition-colors duration-200 h-full px-4 border-b-4" 
                   [class.border-black]="isLinkActive(item)" [class.border-transparent]="!isLinkActive(item)" 
                   [ngClass]="{ 'bg-black text-primary': i === 0, 'text-black hover:bg-black/10': i > 0, 'text-base lg:text-lg': true }">
                  <span>{{ item.labelKey | translate }}</span>
                  @if (item.menuType === 'mega-menu') {
                    <royal-code-ui-icon [icon]="AppIcon.ChevronDown" sizeVariant="sm" extraClass="opacity-70" />
                  }
                </a>
              </li>
            }
          </ul>
        </div>
      </nav>
      
      @if (activeMegaMenuItem(); as menuItem) {
        <div class="container-max relative">
          <div class="absolute left-0 right-0 top-0 z-30" (mouseenter)="cancelCloseMenuTimer()" (mouseleave)="startCloseMenuTimer()">
            <royal-code-ui-mega-menu [menuItem]="menuItem" />
          </div>
        </div>
      }

      @if (isMobileSearchVisible() && enableSearch()) {
        <div class="absolute inset-x-0 top-0 z-50 p-4 bg-background border-b border-border shadow-lg lg:hidden animate-fade-in-down">
          <royal-code-ui-input
            type="search"
            [placeholder]="'droneshop.search.placeholder' | translate"
            [appendButtonIcon]="AppIcon.X"
            [appendButtonAriaLabel]="'droneshop.search.close' | translate"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchQueryChange($event)"
            (enterPressed)="onSearchSubmit(searchQuery)"
            (appendButtonClicked)="closeMobileSearch()"
            extraClasses="!h-12 !text-lg !rounded-none"
            [focusOnLoad]="true"
          />
           @if (searchQuery.length > 1 && suggestions() && suggestions()!.length > 0) {
            <royal-code-ui-search-suggestions-panel 
              [suggestions]="suggestions()!"
              (suggestionSelected)="onSuggestionSelect($event)" />
           }
        </div>
      }
    </header>

    <royal-code-ui-mobile-nav-modal 
      [isOpen]="isMobileMenuOpen()" 
      [menuItems]="mobileModalRootItems()" 
      (closeRequested)="closeMobileMenu()" 
      (navigationItemClicked)="handleMobileNavigation($event)" />
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiHeaderComponent {
  // --- Inputs & Outputs voor App-Specifieke Logica ---
  readonly logoText = input('DefaultApp');
  readonly enableSearch = input(false);
  readonly searchPlaceholder = input('droneshop.search.placeholder');
  readonly cartItemCount = input(0);
  readonly suggestions = input<SearchSuggestion[] | undefined | null>([]);
  readonly searchQueryChanged = output<string>();
  readonly searchSubmitted = output<string>();
  readonly suggestionSelected = output<SearchSuggestion>();

  // --- Geïnjecteerde Navigatie Data ---
  private readonly navConfig = inject<AppNavigationConfig>(APP_NAVIGATION_ITEMS);
  readonly primaryNavItems = signal<NavigationItem[]>(this.navConfig.primary);
  readonly topBarNavItems = signal<NavigationItem[]>(this.navConfig.topBar);
  readonly mobileModalRootItems = signal<NavigationItem[]>(this.navConfig.mobileModal);

  // --- Interne State ---
  readonly isMobileMenuOpen = signal(false);
  readonly isMobileSearchVisible = signal(false);
  readonly activeMegaMenuItem = signal<NavigationItem | null>(null);
  searchQuery = '';
  private closeMenuTimer?: number;

  // --- Dependencies & Helpers ---
  protected readonly AppIcon = AppIcon;
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node) && this.activeMegaMenuItem()) {
      this.closeMegaMenu();
    }
  }

  // --- Event Handlers die @Outputs gebruiken ---
  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.searchQueryChanged.emit(query);
  }

  onSearchSubmit(query: string): void {
    this.searchSubmitted.emit(query);
    this.closeMobileSearch(); // UI logica blijft hier
  }

  onSuggestionSelect(suggestion: SearchSuggestion): void {
    this.suggestionSelected.emit(suggestion);
    this.closeMobileSearch();
  }

  openMobileSearch(): void { this.isMobileSearchVisible.set(true); }
  closeMobileSearch(): void { this.isMobileSearchVisible.set(false); }

  openMobileMenu(): void { this.isMobileMenuOpen.set(true); }
  closeMobileMenu(): void { this.isMobileMenuOpen.set(false); }
  
  handleMouseEnter(item: NavigationItem): void { 
    this.cancelCloseMenuTimer(); 
    if (item.menuType === 'mega-menu') { this.activeMegaMenuItem.set(item); } 
  }
  
  startCloseMenuTimer(): void { 
    this.closeMenuTimer = window.setTimeout(() => { this.activeMegaMenuItem.set(null); }, 150); 
  }
  
  cancelCloseMenuTimer(): void { 
    if (this.closeMenuTimer) { clearTimeout(this.closeMenuTimer); this.closeMenuTimer = undefined; } 
  }
  
  closeMegaMenu(): void { this.activeMegaMenuItem.set(null); }
  
  isLinkActive(item: NavigationItem): boolean {
    if (this.activeMegaMenuItem()?.id === item.id) return true;
    if (item.route) {
      const urlTree = this.router.createUrlTree(Array.isArray(item.route) ? item.route : [item.route], { queryParams: item.queryParams });
      return this.router.isActive(urlTree, { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' });
    }
    return false;
  }

  handleMobileNavigation(item: NavigationItem): void {
    if (item.route) {
      const routeSegments = Array.isArray(item.route) ? item.route : [item.route];
      this.router.navigate(routeSegments, { queryParams: item.queryParams, queryParamsHandling: item.queryParamsHandling || 'merge' });
    }
    this.closeMobileMenu();
  }
}