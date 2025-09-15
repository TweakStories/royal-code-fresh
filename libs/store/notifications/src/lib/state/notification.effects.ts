// libs/store/notifications/src/lib/state/notification.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class NotificationEffects {
  private actions$ = inject(Actions);
  // No effects needed yet for basic functionality
}