// libs/store/notifications/src/lib/state/notification.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
// *** FIX: Import from shared domain ***
import { AppNotification, AppNotificationType } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain'; // Import AppIcon

// Payload type remains the same
type AddNotificationPayload = Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>;

// Action group remains the same
export const NotificationActions = createActionGroup({
  source: 'Notifications',
  events: {
    'Add Notification': props<{ notification: AddNotificationPayload }>(),
    'Mark Notification As Read': props<{ id: string }>(),
    'Mark All Notifications As Read': emptyProps(),
    'Remove Notification': props<{ id: string }>(),
    'Clear All Notifications': emptyProps(),
    // Optional Load actions...
  }
});

// --- Convenience Actions (Update import paths if necessary) ---
export const addInfoNotification = (payload: { messageKeyOrText: string, routeLink?: string | any[], icon?: AppIcon }) =>
    NotificationActions.addNotification({ notification: { ...payload, type: AppNotificationType.Info } });

export const addSuccessNotification = (payload: { messageKeyOrText: string, routeLink?: string | any[], icon?: AppIcon }) =>
    NotificationActions.addNotification({ notification: { ...payload, type: AppNotificationType.Success } });

export const addWarningNotification = (payload: { messageKeyOrText: string, routeLink?: string | any[], icon?: AppIcon }) =>
    NotificationActions.addNotification({ notification: { ...payload, type: AppNotificationType.Warning } });

export const addErrorNotification = (payload: { messageKeyOrText: string, routeLink?: string | any[], icon?: AppIcon }) =>
    NotificationActions.addNotification({ notification: { ...payload, type: AppNotificationType.Error } });

export const addQuestNotification = (payload: { messageKeyOrText: string, routeLink?: string | any[], icon?: AppIcon }) =>
    NotificationActions.addNotification({ notification: { ...payload, type: AppNotificationType.Quest } });
