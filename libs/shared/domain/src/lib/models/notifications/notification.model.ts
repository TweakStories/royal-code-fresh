/**
 * @file notification.model.ts
 * @Version 1.1.0 (Actions added to NotificationConfig)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-15
 * @Description
 *   Defines all shared models and enums for notifications and dialogs. This includes
 *   models for persistent state-stored notifications (`AppNotification`) and transient
 *   UI interactions like Snackbars (`SnackbarData`) and Dialogs. This version adds
 *   support for actionable buttons within Snackbars.
 */

// --- ENUMERATIONS ---

/**
 * @enum NotificationType
 * @description Categorizes the *semantic* type of a stored notification for potential grouping or specific handling.
 */
export enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Quest = 'quest',
  Achievement = 'achievement',
  Social = 'social',
  System = 'system',
  Challenge = 'challenge',
}

/**
 * @enum VisualNotificationType
 * @description Defines the *visual style/severity* for transient notifications (e.g., Snackbars).
 */
export enum VisualNotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}

// --- DATA MODELS ---

/**
 * @interface NotificationConfig
 * @description Configuration for displaying transient notifications, including styling, position, and actions.
 */
export interface NotificationConfig {
  duration?: number;
  verticalPosition?: 'top' | 'bottom';
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  panelClass?: string | string[];
  action?: string;
  actionHandler?: () => void;
  // relativeTo?: HTMLElement | ElementRef;
}

/**
 * @interface SnackbarData
 * @description Data structure passed to the SnackbarComponent via the dynamic overlay service.
 */
export interface SnackbarData {
  /** @property {string} message - The resolved message string to be displayed. */
  message: string;
  /** @property {VisualNotificationType} type - The visual type for styling the snackbar. */
  type: VisualNotificationType;
  /** @property {Required<NotificationConfig>} config - The fully resolved configuration for the snackbar. */
  config: NotificationConfig;
}
