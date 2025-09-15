/**
 * @file chat-plushie.routes.ts
 * @description Lazy-loaded routes for the plushie chat feature.
 */
import { Routes } from '@angular/router';

export const ChatPlushieRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '', // For example, opens an overlay or a dedicated page
        loadComponent: () => import('./components/chat-overlay/chat-overlay.component').then(m => m.ChatOverlayComponent),
      },
    ],
  },
];
