/**
 * @file app.routes.ts (Admin Panel)
 * @Version 1.7.0 (Added Swagger Test Page Route)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the main application routes for the Admin Panel, now including a
 *              route for the new Swagger simulation test page.
 */
import { Routes } from '@angular/router';
import { AdminShellComponent } from './components/admin-shell/admin-shell.component';
import { authGuard } from '@royal-code/features/authentication';
import { i18nInitResolver } from '@royal-code/shared/utils';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { adminProductsFeature, AdminProductsEffects } from '@royal-code/features/admin-products/core';
import { AdminProductApiService } from '@royal-code/features/admin-products/data-access';
import { provideAdminOrdersFeature } from '@royal-code/features/admin-orders/core';
import { AbstractAdminOrderApiService } from '@royal-code/features/admin-orders/core';
import { AdminOrderApiService } from '@royal-code/features/admin-orders/data-access';
import { provideAdminVariantsFeature } from '@royal-code/features/admin-variants/core';
import { provideAdminUsersFeature } from '@royal-code/features/admin-users/core';

export const appRoutes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
        data: { labelKey: 'admin.dashboard.title' }
      },
      // ... (andere routes blijven ongewijzigd)
      {
        path: 'products',
        children: [
          { path: '', pathMatch: 'full', loadComponent: () => import('./pages/product-management-page/product-management-page.component').then(m => m.ProductManagementPageComponent) },
          { path: 'new', loadComponent: () => import('./pages/product-create-page/product-create-page.component').then(m => m.ProductCreatePageComponent), data: { labelKey: 'admin.products.createTitle' } },
          { path: ':id', loadComponent: () => import('./pages/product-edit-page/product-edit-page.component').then(m => m.ProductEditPageComponent), data: { labelKey: 'admin.products.editTitle' } },
        ],
        data: { labelKey: 'admin.products.title' }
      },
      {
        path: 'orders',
        providers: [ provideAdminOrdersFeature(), { provide: AbstractAdminOrderApiService, useClass: AdminOrderApiService } ],
        children: [
          { path: '', pathMatch: 'full', loadComponent: () => import('./pages/order-management-page/order-management-page.component').then(m => m.OrderManagementPageComponent) },
          { path: 'new', loadComponent: () => import('./pages/order-create-page/order-create-page.component').then(m => m.OrderCreatePageComponent), data: { labelKey: 'admin.orders.createTitle' } },
          { path: ':id', loadComponent: () => import('./pages/order-detail-page/order-detail-page.component').then(m => m.OrderDetailPageComponent), data: { labelKey: 'admin.orders.detail.title' } },
        ],
        data: { labelKey: 'admin.orders.title' },
      },
      { path: 'reviews', loadChildren: () => import('@royal-code/features/admin-reviews/ui').then(m => m.adminReviewsRoutes), data: { labelKey: 'admin.reviews.title' } },
      { path: 'variants', loadComponent: () => import('./pages/variant-management-page/variant-management-page.component').then(m => m.VariantManagementPageComponent), providers: [ provideAdminVariantsFeature() ], data: { labelKey: 'admin.variants.title' } },
      {
        path: 'users',
        providers: [ provideAdminUsersFeature() ],
        data: { labelKey: 'admin.users.title' },
        children: [
           { path: '', pathMatch: 'full', loadComponent: () => import('./pages/user-management-page/user-management-page.component').then(m => m.UserManagementPageComponent), data: { labelKey: 'admin.users.management.title' } },
           { path: 'roles', loadComponent: () => import('./pages/role-management-page/role-management-page.component').then(m => m.RoleManagementPageComponent), data: { labelKey: 'admin.roles.manageRoles' } },
           { path: 'new', loadComponent: () => import('./pages/user-create-page/user-create-page.component').then(m => m.UserCreatePageComponent), data: { labelKey: 'admin.users.createTitle' } },
           { path: ':id', loadComponent: () => import('./pages/user-edit-page/user-edit-page.component').then(m => m.UserEditPageComponent), data: { labelKey: 'admin.users.editTitle' } },
        ],
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings-page/settings-page.component').then(m => m.SettingsPageComponent),
        data: { labelKey: 'admin.settings.title' },
        children: [
          { path: '', redirectTo: 'general', pathMatch: 'full' },
          { path: 'general', loadComponent: () => import('./components/settings-general/settings-general.component').then(m => m.SettingsGeneralComponent) },
          { path: 'products', loadComponent: () => import('./components/settings-products/settings-products.component').then(m => m.SettingsProductsComponent) },
          { path: 'orders', loadComponent: () => import('./components/settings-orders/settings-orders.component').then(m => m.SettingsOrdersComponent) },
          { path: 'security', loadComponent: () => import('./components/settings-security/settings-security.component').then(m => m.SettingsSecurityComponent) },
          { path: 'compliance', loadComponent: () => import('./components/settings-compliance/settings-compliance.component').then(m => m.SettingsComplianceComponent) },
          { path: 'marketing', loadComponent: () => import('./components/settings-marketing/settings-marketing.component').then(m => m.SettingsMarketingComponent) },
          { path: 'system', loadComponent: () => import('./components/settings-system/settings-system.component').then(m => m.SettingsSystemComponent) },
          { path: 'admin-panel', loadComponent: () => import('./components/settings-admin-panel/settings-admin-panel.component').then(m => m.SettingsAdminPanelComponent) },
          { path: 'governance', loadComponent: () => import('./components/settings-governance/settings-governance.component').then(m => m.SettingsGovernanceComponent) },
          { path: 'deployment', loadComponent: () => import('./components/settings-deployment/settings-deployment.component').then(m => m.SettingsDeploymentComponent) },
        ]
      },
      // << DE FIX: Nieuwe Swagger Test Pagina route >>
      {
        path: 'swagger-test',
        loadComponent: () => import('./pages/swagger-test-page/swagger-test-page.component').then(m => m.SwaggerTestPageComponent),
        data: { labelKey: 'Swagger Test' }
      },
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('@royal-code/features/authentication').then(m => m.LoginComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];