/**
 * @file admin-reviews.routes.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Routes for the Admin Reviews feature.
 */
import { Route } from '@angular/router';
import { provideAdminReviewsFeature } from '@royal-code/features/admin-reviews/core';

export const adminReviewsRoutes: Route[] = [
  {
    path: '',
    providers: [provideAdminReviewsFeature()],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/review-management-page/review-management-page.component').then(m => m.ReviewManagementPageComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/review-edit-page/review-edit-page.component').then(m => m.ReviewEditPageComponent),
      },
    ],
  },
];