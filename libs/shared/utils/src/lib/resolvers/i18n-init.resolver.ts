/**
 * @file i18n-init.resolver.ts
 * @Version 1.2.0 (Added Logging)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @description Een resolver die ervoor zorgt dat de i18n-vertalingen zijn geladen
 *              voordat de applicatie wordt weergegeven. Lost FOUC op en is null-safe.
 */
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs'; 

export const i18nInitResolver: ResolveFn<boolean> = () => {
  const translateService = inject(TranslateService);
  const langToUse = translateService.currentLang || translateService.defaultLang || 'en';

  return firstValueFrom(translateService.use(langToUse)).then(() => {
    return true;
  }).catch(error => {
    console.error(`[i18nInitResolver] Failed to initialize i18n for language: ${langToUse}`, error);
    return false;
  });
};