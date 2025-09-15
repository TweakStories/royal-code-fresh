import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { UiSidebarComponent } from '@royal-code/ui/sidebar';
import { UiVerticalNavComponent } from '@royal-code/ui/navigation';
import { NavigationItem, AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-shell',
  standalone: true,
  imports: [RouterModule, AdminHeaderComponent, UiSidebarComponent, UiVerticalNavComponent],
  template: `
    <div class="flex h-screen bg-background text-foreground">
      <royal-code-ui-sidebar [isOpen]="true" mode="docked">
        <div slot="header" class="p-4 border-b border-border">
          <h1 class="font-bold text-lg">Royal-Code Admin</h1>
        </div>
        
        <royal-code-ui-vertical-nav [items]="adminNavItems()" />

        <div slot="footer" class="p-2 border-t border-border">
          <!-- Footer content like user profile -->
        </div>
      </royal-code-ui-sidebar>

      <div class="flex flex-col flex-grow">
        <admin-header />
        <main class="flex-grow p-6 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {
  // << DE FIX: Alle Settings items toegevoegd als children van het 'Settings' item >>
  adminNavItems = signal<NavigationItem[]>([
    { id: 'dashboard', labelKey: 'Dashboard', icon: AppIcon.Home, route: '/dashboard' },
    { id: 'management', labelKey: 'Management', isSectionHeader: true },
    { id: 'products', labelKey: 'Products', icon: AppIcon.Package, route: '/products' },
    { id: 'orders', labelKey: 'Orders', icon: AppIcon.ShoppingCart, route: '/orders' },
    { id: 'reviews', labelKey: 'Reviews', icon: AppIcon.Star, route: '/reviews' }, 
    { id: 'variants', labelKey: 'Attributes', icon: AppIcon.Ruler, route: '/variants' },
    {
      id: 'users',
      labelKey: 'Users',
      icon: AppIcon.Users,
      route: '/users',
      children: [
        { id: 'user-list', labelKey: 'User Management', route: '/users' },
        { id: 'role-list', labelKey: 'Role Management', route: '/users/roles' },
      ]
    },
    { id: 'system', labelKey: 'System', isSectionHeader: true },
    {
      id: 'settings',
      labelKey: 'Settings',
      icon: AppIcon.Settings,
      route: '/settings',
      children: [
        { id: 'settings-general', labelKey: 'Algemeen', route: '/settings/general' },
        { id: 'settings-products', labelKey: 'Product & Inventaris', route: '/settings/products' },
        { id: 'settings-orders', labelKey: 'Order & Checkout', route: '/settings/orders' },
        { id: 'settings-security', labelKey: 'Beveiliging', route: '/settings/security' },
        { id: 'settings-compliance', labelKey: 'Compliance (Drone)', route: '/settings/compliance' },
        { id: 'settings-marketing', labelKey: 'Marketing & SEO', route: '/settings/marketing' },
        { id: 'settings-system', labelKey: 'Systeem & Technisch', route: '/settings/system' },
        { id: 'settings-admin-panel', labelKey: 'Admin Panel Specifiek', route: '/settings/admin-panel' },
        { id: 'settings-governance', labelKey: 'Governance & Audit', route: '/settings/governance' },
        { id: 'settings-deployment', labelKey: 'Deployment', route: '/settings/deployment' },
      ]
    },
  ]);
}