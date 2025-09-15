/**
 * @file account-layout.component.ts
 * @Version 2.0.0 (Upgraded Navigation Menu)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-01
 * @Description
 *   De hoofdlayout voor de 'Mijn Account' sectie. Deze versie implementeert de
 *   nieuwe, door de gebruiker gedefinieerde, verticale navigatiestructuur.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiVerticalNavComponent } from '@royal-code/ui/navigation';
import { NavigationItem, NavDisplayHintEnum, AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'droneshop-account-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, UiVerticalNavComponent, TranslateModule],
  template: `
    <div class="flex flex-col lg:flex-row gap-8 py-8">
      <!-- Zijbalk Navigatie -->
      <aside class="w-full lg:w-64 flex-shrink-0">
        <royal-code-ui-vertical-nav [items]="accountNavItems" />
      </aside>

      <!-- Hoofdcontent (Router Outlet) -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLayoutComponent {
  // De navigatie-items zijn nu bijgewerkt volgens jouw specificaties.
  readonly accountNavItems: NavigationItem[] = [
    {
      id: 'overview',
      labelKey: 'navigation.accountOverview',
      route: '/account',
      icon: AppIcon.LayoutDashboard,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'profile',
      labelKey: 'navigation.myProfile',
      route: '/account/profile',
      icon: AppIcon.UserCircle,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'orders',
      labelKey: 'navigation.myOrders',
      route: '/account/orders',
      icon: AppIcon.Package,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'wishlist',
      labelKey: 'navigation.myWishlist',
      route: '/account/wishlist',
      icon: AppIcon.Heart,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'reviews',
      labelKey: 'navigation.myReviews',
      route: '/account/reviews',
      icon: AppIcon.Star,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'addresses',
      labelKey: 'navigation.myAddresses',
      route: '/account/addresses',
      icon: AppIcon.MapPin,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'settings',
      labelKey: 'navigation.settings',
      route: '/account/settings',
      icon: AppIcon.Settings,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'divider-1',
      labelKey: '',
      dividerBefore: true,
      displayHint: [NavDisplayHintEnum.Desktop],
    },
    {
      id: 'logout',
      labelKey: 'accountMenu.logout',
      route: '/', // Of een specifieke logout route
      icon: AppIcon.LogOut,
      displayHint: [NavDisplayHintEnum.Desktop],
    }
  ];
}