import { ButtonType } from "./button/ui-button.component"; 

/**
 * @fileoverview Defines models for common dialog types.
 * @path libs/shared/ui/dialogs/src/lib/dialog.model.ts
 */

/** Data structure expected by the ConfirmationDialogComponent. */
export interface ConfirmationDialogData {
    /** Translation key for the dialog title. */
    titleKey: string;
    /** Translation key for the main confirmation message/question. */
    messageKey: string;
    /** Optional: Translation key for the confirm button text (defaults to 'common.buttons.confirm'). */
    confirmButtonKey?: string;
    /** Optional: Translation key for the cancel button text (defaults to 'common.buttons.cancel'). */
    cancelButtonKey?: string;
    /** Optional: Specify the type/color of the confirm button (defaults to 'primary'). */
    confirmButtonType?: ButtonType; // Use your ButtonType union
  }

  /** Possible result values when the confirmation dialog is closed. */
  export type ConfirmationDialogResult = boolean; // true if confirmed, false if cancelled/closed