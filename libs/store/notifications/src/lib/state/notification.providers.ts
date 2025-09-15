// libs/store/notifications/src/lib/notification.providers.ts
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { NotificationEffects } from './state/notification.effects';
import { NotificationsState, NOTIFICATIONS_FEATURE_KEY } from './state/notification.state';
import { notificationReducer } from './state/notification.reducer';

export function provideNotificationFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState<NotificationsState>(NOTIFICATIONS_FEATURE_KEY, notificationReducer),
    provideEffects(NotificationEffects)
  ]);
}