/**
 * @file account.routes.ts
 * @Version 2.0.0 (Corrected Breadcrumb Definition)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Definieert de lazy-loaded routes voor de 'Mijn Account' sectie.
 *   Verwijderd de redundante breadcrumb-definitie op de parent route
 *   om duplicatie in de breadcrumb-navigatie te voorkomen.
 */
import { Routes } from '@angular/router';
import { AccountLayoutComponent } from './lib/layout/account-layout/account-layout.component';

export const AccountRoutes: Routes = [
  {
    path: '',
    component: AccountLayoutComponent,
    // << DE FIX: VERWIJDER DEZE REGEL OM DUPLICATIE TE VOORKOMEN >>
    // data: { breadcrumb: 'navigation.account' }, 
    children: [
      {
        path: '', // Default route is het overzicht
        pathMatch: 'full',
        loadComponent: () => import('./lib/pages/account-overview-page/account-overview-page.component').then(m => m.AccountOverviewPageComponent),
        title: 'Mijn Account Overzicht',
        data: { breadcrumb: 'navigation.accountOverview' } // Broodkruimel voor Overzicht
      },
      {
        path: 'orders',
        loadChildren: () => import('@royal-code/features/orders/ui-plushie').then(m => m.OrderPlushieRoutes),
        title: 'Mijn Bestellingen',
        // Geen expliciete breadcrumb data hier nodig. De `OrderPlushieRoutes` zelf kan een label definiëren.
        // of het wordt overgenomen van de navigatie-tree indien ingesteld.
      },
      {
        path: 'profile',
        loadComponent: () => import('./lib/pages/my-profile-page/my-profile-page.component').then(m => m.MyProfilePageComponent),
        title: 'Mijn Profiel',
        data: { breadcrumb: 'navigation.myProfile' } // Broodkruimel voor Profiel
      },
      {
        path: 'addresses',
        loadComponent: () => import('./lib/pages/my-addresses-page/my-addresses-page.component').then(m => m.MyAddressesPageComponent),
        title: 'Mijn Adressen',
        data: { breadcrumb: 'navigation.myAddresses' } // Broodkruimel voor Adressen
      },
      {
        path: 'settings',
        loadComponent: () => import('./lib/pages/account-settings-page/account-settings-page.component').then(m => m.AccountSettingsPageComponent),
        title: 'Instellingen',
        data: { breadcrumb: 'navigation.settings' } // Broodkruimel voor Instellingen
      },
      {
        path: 'reviews',
        loadComponent: () => import('./lib/pages/my-product-reviews-page/my-product-reviews-page.component').then(m => m.MyProductReviewsPageComponent),
        title: 'Mijn Productreviews',
        data: { breadcrumb: 'navigation.myReviews' } // Broodkruimel voor Mijn Productreviews
      },
      {
        path: 'wishlist',
        loadChildren: () => import('@royal-code/features/wishlist/ui-droneshop').then(m => m.wishlistRoutes),
        title: 'Mijn Verlanglijst',
        data: { breadcrumb: 'navigation.myWishlist' } // Broodkruimel label
      }
    ]
  }
];