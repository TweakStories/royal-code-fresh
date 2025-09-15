// --- VERVANG VOLLEDIG BESTAND: apps/droneshop/src/app/translate-server.loader.ts ---
/**
 * @file translate-server.loader.ts
 * @Version 1.3.0 (TransferState Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Custom TranslateLoader voor Server-Side Rendering (SSR). Deze versie leest
 *   vertaalbestanden van het server-filesystem en **plaatst de geladen vertalingen
 *   in de TransferState**, zodat de browser-side applicatie ze direct kan hergebruiken.
 *   Het laadt meerdere JSON-bestanden en merget deze.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix SSR hydration and i18n blocking issues by correctly configuring TransferState for translations and ensuring NgRx meta-reducer factories are resolved via DI.
 */
import { join } from 'path';
// DE FIX: Importeer 'of' direct vanuit 'rxjs', niet 'rxjs/operators'
import { Observable, of } from 'rxjs'; 
import { TranslateLoader } from '@ngx-translate/core';
import * as fs from 'fs';
// DE FIX: Importeer makeStateKey en TransferState direct vanuit '@angular/core'
import { inject, makeStateKey, TransferState } from '@angular/core'; 

// Definieer een unieke sleutel voor de TransferState. Dit moet overeenkomen met de client.
const LANG_STATE_KEY = makeStateKey<any>('lang');

export class TranslateServerLoader implements TranslateLoader {
  // DE FIX: Geef een expliciet type aan transferState
  private readonly transferState: TransferState = inject(TransferState); 

  constructor(
    private basePath: string,
    private sharedPrefix: string = 'assets/i18n/shared/',
    private appPrefix: string = 'assets/i18n/droneshop/',
    private suffix: string = '.json'
  ) {}

  public getTranslation(lang: string): Observable<any> {
    try {
      // Pas de join-logica aan om met de prefixes te werken
      const sharedFilePath = join(this.basePath, this.sharedPrefix, `${lang}${this.suffix}`);
      const appFilePath = join(this.basePath, this.appPrefix, `${lang}${this.suffix}`);

      const sharedJson = fs.existsSync(sharedFilePath) ? JSON.parse(fs.readFileSync(sharedFilePath, 'utf8')) : {};
      const appJson = fs.existsSync(appFilePath) ? JSON.parse(fs.readFileSync(appFilePath, 'utf8')) : {};

      const merged = { ...sharedJson, ...appJson };

      // DE FIX: Plaats de geladen vertalingen in de TransferState.
      //         We slaan alle vertalingen op onder één generieke sleutel 'lang',
      //         en de browser-loader filtert dan de specifieke `lang`.
      //         Dit is efficiënter dan een sleutel per taal.
      let existingTranslations = this.transferState.get(LANG_STATE_KEY, {});
      existingTranslations = { ...existingTranslations, [lang]: merged };
      this.transferState.set(LANG_STATE_KEY, existingTranslations);
      console.info(`[TranslateServerLoader] Loaded translations for '${lang}' and set in TransferState.`);

      return of(merged);
    } catch (e) {
      console.error(`[TranslateServerLoader] Error reading translation files for lang "${lang}" from base path "${this.basePath}"`, e);
      return of({});
    }
  }
}