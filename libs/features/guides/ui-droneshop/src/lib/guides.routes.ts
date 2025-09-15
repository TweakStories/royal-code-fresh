import { Routes } from '@angular/router';
import { provideGuidesFeature } from '@royal-code/features/guides/core';
import { resolveGuideBreadcrumbLabel } from './resolvers/guide-breadcrumb.resolver'; // << NIEUWE IMPORT

export const GuidesFeatureRoutes: Routes = [
  {
    path: '',
    providers: [provideGuidesFeature()],
    children: [
      {
        path: '',
        data: {
          breadcrumb: 'navigation.guides' // Statisch label voor de overzichtspagina
        },
        loadComponent: () =>
          import('./pages/guides-overview-page/guides-overview-page.component').then(
            (m) => m.GuidesOverviewPageComponent
          ),
      },
      {
        path: ':slug',
        data: {
          // De breadcrumb-property wijst nu naar de resolver die een string teruggeeft
          breadcrumb: resolveGuideBreadcrumbLabel 
        },
        loadComponent: () =>
          import('./pages/guide-detail-page/guide-detail-page.component').then(
            (m) => m.GuideDetailPageComponent
          ),
      },
    ],
  },
];