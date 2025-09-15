/**
 * @file product-error.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI (o.b.v. Claude AI suggestie)
 * @Date 2025-05-31
 * @Description Defines a structured error interface (`ProductError`) and a helper
 *              function (`createProductError`) for consistent and informative
 *              error handling within product-related operations in NgRx effects,
 *              services, and UI components.
 */

/**
 * @Interface ProductError
 * @Description Represents structured error information for operations related to products.
 *              This provides more context than a simple string message, aiding in
 *              debugging, logging, and displaying user-friendly error feedback.
 */
export interface ProductError {
  /** The primary, user-facing or log-friendly error message. */
  message: string;
  /**
   * Optional: A unique error code or key (e.g., 'PRODUCT_NOT_FOUND', 'VALIDATION_ERROR', 'API_UNAVAILABLE').
   * Useful for programmatic error handling or i18n of error messages.
   */
  code?: string;
  /**
   * Optional: A recordオブジェクト for additional contextual details about the error.
   * Can include things like validation failures, request parameters, or partial stack traces.
   * Avoid storing sensitive information here if the error is displayed to users.
   */
  details?: Record<string, any>;
  /** ISO 8601 timestamp string indicating when the error occurred. */
  createdAt: string;
  /**
   * Optional: Identifier for the operation that caused the error
   * (e.g., 'load_product_detail', 'update_stock_quantity', 'apply_filters').
   */
  operation?: string;
  /**
   * Optional: Boolean indicating whether the operation that caused this error
   * might succeed if retried (e.g., for transient network issues).
   */
  retryable?: boolean;
  /** Optional: HTTP status code if the error originated from an API call. */
  httpStatus?: number;
}

/**
 * @Function createProductError
 * @Description Helper factory function to create standardized `ProductError` objects.
 *              Ensures consistent structure and automatically sets the timestamp.
 * @param message The primary error message.
 * @param options Optional additional properties for the error object.
 * @returns A `ProductError` object.
 */
export function createProductError(
  message: string,
  options?: {
    code?: string;
    details?: Record<string, any>;
    operation?: string;
    retryable?: boolean;
    httpStatus?: number;
  }
): ProductError {
  return {
    message,
    code: options?.code,
    details: options?.details,
    createdAt: new Date().toISOString(),
    operation: options?.operation,
    retryable: options?.retryable ?? false, // Default to not retryable
    httpStatus: options?.httpStatus,
  };
}
