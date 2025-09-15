import { Route } from '@angular/router';
import { provideWishlistFeature } from '@royal-code/features/wishlist/core';
import { MyWishlistPageComponent } from './pages/my-wishlist-page/my-wishlist-page.component';

export const wishlistRoutes: Route[] = [
  {
    path: '',
    providers: [provideWishlistFeature()],
    component: MyWishlistPageComponent,
    title: 'My Wishlist', // << Titel voor breadcrumbs
    data: { breadcrumb: 'navigation.myWishlist' } // << Broodkruimel label
  },
];