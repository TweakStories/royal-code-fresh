/**
 * @file country.model.ts
 * @Version 1.0.0
 * @Description Defines the data model for a country, used in selection controls.
 */
export interface Country {
  /** The ISO 3166-1 alpha-2 code (e.g., "NL"). */
  code: string;
  /** The full, display-friendly name of the country (e.g., "Netherlands"). */
  name: string;
}
