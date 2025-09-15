/**
 * @file common.model.ts
 * @Version 1.4.0 (Corrected DateTimeInfo for backend DateTimeOffset parity)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-06-23
 * @Description Definieert algemene, zeer herbruikbare datamodellen die niet specifiek zijn
 *              voor één functiedomein. Dit omvat structuren voor datum-tijd
 *              representaties en fysieke afmetingen, die nauwkeurig de backend
 *              <c>DateTimeOffset</c> en <c>Dimension</c> types weerspiegelen voor JSON-transacties.
 */

/**
 * @interface DateTimeInfo
 * @description Gestandaardiseerde structuur voor het consistent representeren van datum- en tijdinformatie.
 *              Komt typisch overeen met de JSON-serialisatie van de backend <c>DateTimeOffset</c>.
 */
export interface DateTimeInfo {
  /**
   * @property iso
   * @description De datum en tijd in ISO 8601 string-formaat (bijv. "2025-06-23T10:30:00.000Z" of "2025-06-23T12:30:00+02:00").
   *              Dit is de primaire, menselijk leesbare en uitwisselbare representatie.
   */
  iso: string;

  /**
   * @property timestamp
   * @description Optioneel: De UNIX-tijdstempel in milliseconden (aantal milliseconden sinds 1 januari 1970 UTC).
   *              Dit is een veelgebruikte numerieke representatie voor efficiënte vergelijkingen en manipulaties.
   */
  timestamp?: number; // ✅ Gecorrigeerd: was 'createdAt', nu 'timestamp' en optioneel.

  /**
   * @property utcOffsetMinutes
   * @description Optioneel: De afwijking van UTC in minuten voor de lokale tijdzone van de datum/tijd.
   *              Bijv. 60 voor CET (+1 uur), 120 voor CEST (+2 uur).
   */
  utcOffsetMinutes?: number;

  /**
   * @property formatted
   * @description Optioneel: Een vooraf opgemaakte, menselijk leesbare string (bijv. "23 juni 2025, 10:30 AM").
   *              Vooral handig voor UI-weergave, maar minder voor logica.
   */
  formatted?: string;

  /**
   * @property timezoneId
   * @description Optioneel: De IANA-tijdzone-ID (bijv. "Europe/Amsterdam", "America/New_York").
   *              Biedt volledige tijdzonecontext.
   */
  timezoneId?: string;
}

/**
 * @interface Dimension
 * @description Definieert een generieke structuur voor fysieke afmetingen en gewicht.
 *              Komt overeen met de backend <c>Dimension</c> Value Object.
 */
export interface Dimension {
  /** Breedte in centimeters. */
  width?: number;
  /** Hoogte in centimeters. */
  height?: number;
  /** Diepte of lengte in centimeters. */
  depth?: number;
  /** Gewicht in gram. */
  weightGrams?: number;
  /** Optionele eenheid van de dimensies. */
  unit?: 'cm' | 'mm' | 'm' | 'inch';
}