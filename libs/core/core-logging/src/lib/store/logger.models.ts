/**
 * @file logger.models.ts
 * @Version 1.0.0
 * @Author User
 * @Date 2025-05-28
 * @Description Definieert gedeelde interfaces voor de logger feature om circulaire dependencies te voorkomen.
 */
import { LogLevel } from '../logger.config';

/**
 * @interface LogEntry
 * @description Definieert de structuur van een individueel logbericht.
 */
export interface LogEntry {
  /** @description Unieke identifier voor het logbericht. */
  id: string;
  /** @description Het log level (debug, info, warn, error). */
  level: LogLevel;
  /** @description Het daadwerkelijke logbericht. */
  message: string;
  /** @description Optionele gestructureerde data geassocieerd met het logbericht. */
  data?: unknown;
  /** @description Tijdstip van het logbericht (milliseconds since epoch). */
  createdAt: number;
  /** @description Optionele context, zoals de applicatienaam. */
  context?: string;
}

/**
 * @interface LoggerState
 * @description Definieert de structuur van de logger state slice.
 */
export interface LoggerState {
  /** @description Een array van alle opgeslagen logberichten. */
  logs: LogEntry[];
  /** @description Optionele error state voor het loggen zelf. */
  error?: unknown | null;
}