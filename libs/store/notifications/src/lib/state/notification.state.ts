// libs/store/notifications/src/lib/state/notification.state.ts
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
// *** FIX: Import from shared domain ***
import { AppNotification } from '@royal-code/shared/domain';

// Interface blijft hetzelfde
export type NotificationsState = EntityState<AppNotification>

// Adapter blijft hetzelfde
export const notificationAdapter: EntityAdapter<AppNotification> = createEntityAdapter<AppNotification>({
  selectId: (notification: AppNotification) => notification.id,
  sortComparer: (a, b) => b.timestamp - a.timestamp, // Newest first
});

// Initial state blijft hetzelfde
export const initialNotificationsState: NotificationsState = notificationAdapter.getInitialState({
  // Initial other properties if any
});

// Feature key blijft hetzelfde
export const NOTIFICATIONS_FEATURE_KEY = 'notifications';