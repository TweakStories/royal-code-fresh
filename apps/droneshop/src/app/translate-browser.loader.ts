// --- VERVANG VOLLEDIG BESTAND: apps/droneshop/src/app/translate-browser.loader.ts ---
/**
 * @file translate-browser.loader.ts
 * @Version 1.1.0 (Corrected Imports & Type Safety)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Custom TranslateLoader voor de browser-side (client). Deze loader probeert
 *   eerst vertalingen uit de `TransferState` te halen (geleverd door de server).
 *   Als de vertalingen daar niet aanwezig zijn, valt het terug op een `HttpClient`
 *   gebaseerde loader om de JSON-bestanden op te halen. Dit voorkomt onnodige
 *   HTTP-calls op de client voor reeds server-gerenderde data en lost de
 *   "TimeoutError" op door een fallback te bieden.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix SSR hydration and i18n blocking issues by correctly configuring TransferState for translations and ensuring NgRx meta-reducer factories are resolved via DI.
 */
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
// DE FIX: Importeer 'of' en 'forkJoin' direct vanuit 'rxjs', niet 'rxjs/operators'
import { Observable, of, forkJoin } from 'rxjs'; 
import { catchError, map } from 'rxjs/operators';
// DE FIX: Importeer makeStateKey en TransferState direct vanuit '@angular/core'
import { inject, makeStateKey, TransferState } from '@angular/core'; 

// Definieer een unieke sleutel voor de TransferState. Dit moet overeenkomen met de server.
const LANG_STATE_KEY = makeStateKey<any>('lang');

export class TranslateBrowserLoader implements TranslateLoader {
  private readonly httpClient = inject(HttpClient);
  // DE FIX: Geef een expliciet type aan transferState
  private readonly transferState: TransferState = inject(TransferState); 

  constructor(
    private sharedPrefix: string = './assets/i18n/shared/',
    private appPrefix: string = './assets/i18n/droneshop/',
    private suffix: string = '.json'
  ) {}

  public getTranslation(lang: string): Observable<any> {
    // 1. Probeer de vertalingen uit de TransferState te halen
    const key = LANG_STATE_KEY;
    if (this.transferState.hasKey(key)) {
      const allTransferredTranslations = this.transferState.get(key, null);
      this.transferState.remove(key); // Verwijder de state na gebruik
      
      // DE FIX: Filter de specifieke taal uit de overgedragen data
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