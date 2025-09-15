/**
 * @file translate-browser.loader.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-12
 * @Description
 *   Custom TranslateLoader for challenger app that supports both shared and app-specific translations.
 *   This loader merges translations from both shared assets and app-specific assets.
 */
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs'; 
import { catchError, map } from 'rxjs/operators';
import { inject, makeStateKey, TransferState } from '@angular/core'; 

// Definieer een unieke sleutel voor de TransferState. Dit moet overeenkomen met de server.
const LANG_STATE_KEY = makeStateKey<any>('lang');

export class TranslateBrowserLoader implements TranslateLoader {
  private readonly httpClient = inject(HttpClient);
  private readonly transferState: TransferState = inject(TransferState); 

  constructor(
    private sharedPrefix: string = './assets/i18n/shared/',
    private appPrefix: string = './assets/i18n/challenger/',
    private suffix: string = '.json'
  ) {}

  public getTranslation(lang: string): Observable<any> {
    // 1. Probeer de vertalingen uit de TransferState te halen
    const key = LANG_STATE_KEY;
    if (this.transferState.hasKey(key)) {
      const allTransferredTranslations = this.transferState.get(key, null);
      this.transferState.remove(key); // Verwijder de state na gebruik
      
      // Filter de specifieke taal uit de overgedragen data
      if (allTransferredTranslations && allTransferredTranslations[lang]) {
        console.info(`[TranslateBrowserLoader] Loaded translations for '${lang}' from TransferState.`);
        return of(allTransferredTranslations[lang]);
      }
    }

    // 2. Als niet in TransferState, val terug op HTTP (voor meerdere bestanden)
    console.warn(`[TranslateBrowserLoader] Translations for '${lang}' not found in TransferState. Falling back to HTTP.`);
    return forkJoin([
      this.httpClient.get(`${this.sharedPrefix}${lang}${this.suffix}`).pipe(
        catchError((error) => {
          console.error(`[TranslateBrowserLoader] Failed to load shared translation for '${lang}' via HTTP:`, error);
          return of({});
        })
      ),
      this.httpClient.get(`${this.appPrefix}${lang}${this.suffix}`).pipe(
        catchError((error) => {
          console.error(`[TranslateBrowserLoader] Failed to load app-specific translation for '${lang}' via HTTP:`, error);
          return of({});
        })
      )
    ]).pipe(
      map(([sharedJson, appJson]) => ({ ...sharedJson, ...appJson })),
      catchError((error) => {
        console.error(`[TranslateBrowserLoader] Failed to merge HTTP translations for '${lang}':`, error);
        return of({});
      })
    );
  }
}