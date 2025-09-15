import { Routes } from '@angular/router';

// Importeer componenten die direct op top-level routes worden gebruikt
import { LoginComponent } from '@royal-code/features/authentication';
import { PlushieParadiseHomeComponent } from './features/home/home.component';
import { i18nInitResolver } from '@royal-code/shared/utils';

export const appRoutes: Routes = [
  // De login route behandelen we apart, omdat die misschien geen vertaling nodig heeft
  // VOORDAT de gebruiker een taal kiest, of andere pre-login logica heeft.
  { path: 'login', component: LoginComponent, title: 'Login' },

  // Dit is nu de HOOFD-applicatieroute. Alle andere routes zijn children hiervan.
  // De i18n resolver wordt hier toegepast, dus vertalingen zijn beschikbaar voor alle children.
  {
    path: '', // Dit is de root van de applicatie (na inloggen, of voor openbare pagina's)
    resolve: {
      i18n: i18nInitResolver // DE i18n RESOLVER WORDT HIER TOEGEPAST
    },
    children: [
      {
        path: '', // Dit is de default child route, dus de home component
        component: PlushieParadiseHomeComponent,
        title: 'Home',
      },
      {
        path: 'products',
        // canActivate: [authGuard], // Indien nodig later activeren
        loadChildren: () =>
          import('@royal-code/features/products/ui-plushie').then(
            (m) => m.ProductsFeatureRoutes
          ),
        title: 'Products',
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('@royal-code/features/cart/ui-plushie').then((m) => m.CartFeatureRoutes),
        title: 'Cart',
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('@royal-code/features/checkout/ui-plushie').then((m) => m.CheckoutRoutes),
        title: 'Checkout',
      },
      {
        path: 'chat',
        loadChildren: () => import('@royal-code/features/chat/ui-plushie').then(m => m.ChatPlushieRoutes),
        title: 'Chat',
      },
      {
        path: 'orders',
        loadChildren: () => import('@royal-code/features/orders/ui-plushie').then(m => m.OrderPlushieRoutes),
        title: 'My Orders',
      },
    ],
  },
];