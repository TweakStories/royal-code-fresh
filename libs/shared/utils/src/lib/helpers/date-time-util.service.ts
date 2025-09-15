// libs/shared/utils/src/lib/helpers/date-time-util.service.ts
/**
 * @file date-time-util.service.ts
 * @Version 1.1.0 - Added factory function `createDateTimeInfo`.
 * @Author ChallengerAppDevAI
 * @Description Provides utility functions for creating and manipulating DateTimeInfo objects.
 */
import { Injectable } from '@angular/core';
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { DateTime } from 'luxon'; 

@Injectable({
  providedIn: 'root'
})
export class DateTimeUtil {

  /**
   * Creates a DateTimeInfo object from a Date object, Date string, or Unix timestamp (milliseconds).
   * Ensures dates are treated as UTC for ISO string and timestamp generation.
   * @param dateInput - The Date object, ISO string, or timestamp (in ms). If undefined, defaults to current UTC time.
   * @param timezoneId - Optional: IANA timezone identifier (e.g., "Europe/Amsterdam"). If provided, 'formatted' will reflect this.
   * @returns A DateTimeInfo object.
   */
  static createDateTimeInfo(
    dateInput?: Date | string | number,
    timezoneId?: string
  ): DateTimeInfo {
    let dt: DateTime;

    if (dateInput instanceof Date) {
      dt = DateTime.fromJSDate(dateInput).toUTC();
    } else if (typeof dateInput === 'string') {
      dt = DateTime.fromISO(dateInput, { zone: 'utc' });
      if (!dt.isValid) {
        // Probeer als RFC 2822 of HTTP datum als ISO faalt
        dt = DateTime.fromRFC2822(dateInput, { zone: 'utc' });
        if (!dt.isValid) {
          dt = DateTime.fromHTTP(dateInput, { zone: 'utc' });
        }
      }
    } else if (typeof dateInput === 'number') {
      dt = DateTime.fromMillis(dateInput, { zone: 'utc' });
    } else {
      dt = DateTime.utc(); // Default to current UTC time
    }

    if (!dt.isValid) {
      console.warn(`[DateTimeUtil] Invalid dateInput for createDateTimeInfo: ${dateInput}. Falling back to current UTC time.`);
      dt = DateTime.utc(); // Fallback
    }

    // Formatteer met Luxon voor meer controle, indien een timezoneId is meegegeven
    let formattedString: string | undefined;
    if (timezoneId) {
      formattedString = dt.setZone(timezoneId).toFormat('dd LLLL yyyy, HH:mm ZZZZ'); // 'LLLL' voor volledige maandnaam
    } else {
      // Standaard UTC format als geen specifieke timezoneId
      formattedString = dt.toFormat('dd LLLL yyyy, HH:mm \'UTC\'');
    }

    return {
      iso: dt.toISO() as string,
      timestamp: dt.toMillis(),
      utcOffsetMinutes: dt.offset, // dt.offset is number, dus dit is correct
      formatted: formattedString,
      timezoneId: timezoneId ?? dt.zoneName ?? undefined
    };
  }

  /**
   * Converteert een ISO-string naar een DateTimeInfo object.
   * Behandelt de input als UTC.
   * @param isoString - De ISO 8601 string.
   * @returns Een DateTimeInfo object.
   */
  static fromISO(isoString: string): DateTimeInfo {
    return DateTimeUtil.createDateTimeInfo(isoString);
  }

  /**
   * Converteert een Unix timestamp (in milliseconden) naar een DateTimeInfo object.
   * Behandelt de input als UTC.
   * @param timestamp - De timestamp in milliseconden.
   * @returns Een DateTimeInfo object.
   */
  static fromTimestamp(timestamp: number): DateTimeInfo {
    return DateTimeUtil.createDateTimeInfo(timestamp);
  }

  /**
   * Geeft het huidige DateTimeInfo object terug, gebaseerd op UTC tijd.
   * @returns Een DateTimeInfo object voor het huidige moment in UTC.
   */
  static now(): DateTimeInfo {
    return DateTimeUtil.createDateTimeInfo(); // Zonder argument, default naar nu
  }

  /**
   * Utility om een DateTimeInfo object te formatteren naar een specifieke string,
   * gebruikmakend van Luxon's formatting tokens en optioneel een timezone.
   * @param dateTimeInfo - Het DateTimeInfo object om te formatteren.
   * @param formatString - De Luxon format string (e.g., 'DDDD, HH:mm').
   * @param timezoneId - Optioneel: IANA timezone om naar te converteren voor formattering.
   * @returns De geformatteerde datum/tijd string, of de ISO string bij een fout.
   */
  static format(dateTimeInfo: DateTimeInfo, formatString: string, timezoneId?: string): string {
    try {
      let dt = DateTime.fromISO(dateTimeInfo.iso, { zone: 'utc' }); // Start vanuit UTC ISO
      if (timezoneId) {
        dt = dt.setZone(timezoneId); // Converteer naar doel timezone voor formattering
      }
      return dt.toFormat(formatString);
    } catch (e) {
      console.error(`[DateTimeUtil] Error formatting DateTimeInfo:`, e, dateTimeInfo);
      return dateTimeInfo.iso; // Fallback
    }
  }
}
