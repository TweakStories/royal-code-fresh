import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./features/home/droneshop-homepage.component').then(m => m.DroneshopHomePageComponent),
    title: 'Home | Droneshop',
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products-overview/droneshop-products-overview.component').then(m => m.DroneshopProductsOverviewComponent),
    title: 'Products | Droneshop',
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/droneshop-cart.component').then(m => m.DroneshopCartComponent),
    title: 'Shopping Cart | Droneshop',
  },
  {
    path: 'diy-kits',
    loadComponent: () => import('./features/products/diy-kits-page/diy-kits-page.component').then(m => m.DiyKitsPageComponent),
    title: 'DIY Kits | Droneshop',
  },
  {
    path: 'about',
    loadComponent: () => import('./features/info/droneshop-about/droneshop-about.component').then(m => m.DroneshopAboutComponent),
    title: 'About Us | Droneshop',
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/home/droneshop-contact/droneshop-contact.component').then(m => m.DroneshopContactComponent),
    title: 'Contact | Droneshop',
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/info/droneshop-faq/droneshop-faq.component').then(m => m.DroneshopFaqComponent),
    title: 'FAQ | Droneshop',
  },
  {
    path: 'shipping',
    loadComponent: () => import('./features/info/droneshop-shipping/droneshop-shipping.component').then(m => m.DroneshopShippingComponent),
    title: 'Shipping Info | Droneshop',
  },
  {
    path: 'blog',
    loadComponent: () => import('./features/info/droneshop-blog/droneshop-blog.component').then(m => m.DroneshopBlogComponent),
    title: 'Blog | Droneshop',
  },
  {
    path: 'careers',
    loadComponent: () => import('./features/info/droneshop-careers/droneshop-careers.component').then(m => m.DroneshopCareersComponent),
    title: 'Careers | Droneshop',
  },
  {
    path: '**', // Fallback route
    redirectTo: '',
    pathMatch: 'full'
  }
];