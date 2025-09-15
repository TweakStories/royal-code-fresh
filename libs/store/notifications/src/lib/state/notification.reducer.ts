// libs/store/notifications/src/lib/state/notification.reducer.ts
import { createReducer, on, Action } from '@ngrx/store';
import { NotificationsState, initialNotificationsState, notificationAdapter } from './notification.state';
import { NotificationActions } from './notification.actions';
// *** FIX: Import from shared domain ***
import { AppNotification } from '@royal-code/shared/domain';

// Reducer logic remains the same
const _notificationReducer = createReducer(
  initialNotificationsState,
  on(NotificationActions.addNotification, (state, { notification }) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      isRead: false,
    };
    return notificationAdapter.addOne(newNotification, state);
  }),
  on(NotificationActions.markNotificationAsRead, (state, { id }) =>
    notificationAdapter.updateOne({ id: id, changes: { isRead: true } }, state)
  ),
  on(NotificationActions.markAllNotificationsAsRead, (state) => {
    const updates = state.ids
        .map(id => state.entities[id])
        .filter((notification): notification is AppNotification => !!notification && !notification.isRead)
        .map(notification => ({ id: notification.id, changes: { isRead: true } }));
    return notificationAdapter.updateMany(updates, state);
  }),
  on(NotificationActions.removeNotification, (state, { id }) =>
    notificationAdapter.removeOne(id, state)
  ),
  on(NotificationActions.clearAllNotifications, (state) =>
    notificationAdapter.removeAll(state)
  ),
  // Load actions handlers...
);

export function notificationReducer(state: NotificationsState | undefined, action: Action): NotificationsState {
  return _notificationReducer(state, action);
}
