/**
 * @file type-safety.utils.ts
 * @version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-15
 * @description
 *   Provides essential, self-contained type-safety utility functions for the
 *   products-core library to avoid external dependencies for basic checks.
 */

/**
 * @function isDefined
 * @description A strict type guard that checks if a value is not null and not undefined.
 * @param {T | null | undefined} value - The value to check.
 * @returns {boolean} True if the value is defined.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * @function withDefault
 * @description Returns the provided value if it is defined, otherwise returns the default value.
 * @param {T | null | undefined} value - The potentially undefined value.
 * @param {T} defaultValue - The value to return if the original value is not defined.
 * @returns {T} The original value or the default value.
 */
export function withDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

/**
 * @function emptyStringToNull
 * @description Converteert een lege string naar null. Dit is handig voor velden
 *              die optionele GUIDs of andere strings verwachten, om ervoor te zorgen
 *              dat de JSON-serialisatie compatibel is met backend `Guid?` of `string?` types.
 * @param value De input string, null, of undefined.
 * @returns null als de input een lege string is, anders de originele waarde.
 */
export function emptyStringToNull(value: string | null | undefined): string | null | undefined {
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  return value;
}
