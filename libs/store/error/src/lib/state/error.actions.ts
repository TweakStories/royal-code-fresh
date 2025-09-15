/**
 * @file error.actions.ts
 * @Version 4.0.0 (Simplified Payload)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-28
 * @description
 *   Defines NgRx actions for the global error handling system. This version
 *   simplifies the 'Report Error' action to directly use a StructuredError payload,
 *   removing the redundant ReportErrorPayload wrapper.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StructuredError } from '@royal-code/shared/domain';

export const ErrorActions = createActionGroup({
  source: 'Global Error Handling',
  events: {
    'Report Error': props<{ error: StructuredError }>(), 

    'Clear Current Error': emptyProps(),

    'Clear Error History': emptyProps(),
  }
});