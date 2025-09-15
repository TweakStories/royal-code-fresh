/**
 * @file logger.token.ts
 * @Version 1.0.0
 * @Author User // (Uw naam/team)
 * @Date 2025-05-28 // (Huidige datum)
 * @Description Definieert de InjectionToken voor de LoggerConfig.
 */
import { InjectionToken } from '@angular/core';
import { LoggerConfig } from './logger.config';

export const LOGGER_CONFIG = new InjectionToken<LoggerConfig>('LOGGER_CONFIG');
