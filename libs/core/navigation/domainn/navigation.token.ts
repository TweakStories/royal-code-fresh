/**
 * @file navigation.token.ts
 * @Version 1.1.0 (Footer Config Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Definieert de InjectionToken en de configuratie-interface voor het leveren van
 *   app-specifieke navigatiedata aan gedeelde componenten. Nu inclusief een
 *   optionele 'footer' property.
 */
import { InjectionToken } from '@angular/core';
import { NavigationItem } from '@royal-code/shared/domain';

export interface AppNavigationConfig {
  primary: NavigationItem[];
  topBar: NavigationItem[];
  mobileModal: NavigationItem[];
  footer?: { 
    supportLinks: NavigationItem[];
    shopLinks: NavigationItem[];
    companyLinks: NavigationItem[];
  };
}

export const APP_NAVIGATION_ITEMS = new InjectionToken<AppNavigationConfig>('APP_NAVIGATION_ITEMS');