/**
 * @file error.model.ts
 * @Version 1.1.0 (Added source and isPersistent)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-28
 * @description
 *   Defines the enterprise-standard `StructuredError` interface for consistent
 *   error handling across the entire monorepo, now including `source` and `isPersistent`
 *   properties for comprehensive error tracking.
 */
export interface StructuredError {
  /** A user-friendly, potentially i18n-keyed, error message. */
  message: string;
  /** A unique, machine-readable code for the error (e.g., 'API_AUTH_FAILED', 'FORM_VALIDATION'). */
  code?: string;
  /** The name of the operation that failed (e.g., 'loadProducts', 'sendMessage'). */
  operation?: string;
  /** Additional, non-sensitive context for debugging (e.g., entity IDs, parameters). */
  context?: Record<string, any>;
  /** The timestamp (in milliseconds since epoch) when the error occurred. */
  timestamp: number;
  /** Severity level of the error. */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** Optional: The source of the error (e.g., '[ReviewsEffects]', '[API Products]'). */
  source?: string; // << TOEGEVOEGD
  /** Optional: Indicates if the error should remain in history even after 'Clear Current Error'. */
  isPersistent?: boolean; // << TOEGEVOEGD
}


export interface ValidationError {
  label: string;
  message: string;
}

// === NIEUW: Uitgebreide interface voor de data van de dialog ===
export interface ValidationSummaryDialogData {
  errors: ValidationError[];
  fullFormData?: any; // Optioneel: de volledige ruwe formulierdata
}
