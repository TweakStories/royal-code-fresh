// libs/store/notifications/src/lib/state/notification.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationsState, notificationAdapter, NOTIFICATIONS_FEATURE_KEY } from './notification.state';
// *** FIX: Import from shared domain ***
import { AppNotification } from '@royal-code/shared/domain';

// Selectors remain the same, relying on the adapter and state structure
export const selectNotificationsState = createFeatureSelector<NotificationsState>(NOTIFICATIONS_FEATURE_KEY);
const { selectAll, selectEntities, selectIds, selectTotal } = notificationAdapter.getSelectors();

export const selectNotificationEntities = createSelector(selectNotificationsState, selectEntities);
export const selectNotificationIds = createSelector(selectNotificationsState, selectIds);
export const selectAllNotifications = createSelector(selectNotificationsState, selectAll);
export const selectNotificationTotal = createSelector(selectNotificationsState, selectTotal);
export const selectUnreadNotifications = createSelector(
    selectAllNotifications,
    (notifications: AppNotification[]) => notifications.filter(n => !n.isRead)
);
export const selectUnreadNotificationsCount = createSelector(
    selectUnreadNotifications,
    (unreadNotifications) => unreadNotifications.length
);
export const selectReadNotifications = createSelector(
    selectAllNotifications,
    (notifications: AppNotification[]) => notifications.filter(n => n.isRead)
);
export const selectNotificationById = (id: string) => createSelector(
    selectNotificationEntities,
    (entities) => entities[id]
);