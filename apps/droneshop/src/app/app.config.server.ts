// --- VERVANG VOLLEDIG BESTAND: apps/droneshop/src/app/app.config.server.ts ---
/**
 * @file app.config.server.ts
 * @Version 2.2.0 (SSR TranslateLoader TransferState & NgRx MetaReducer Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Server-side application configuration. This version integrates a `TranslateServerLoader`
 *   that places translations into `TransferState`, ensuring proper hydration on the client.
 *   Also ensures NgRx meta-reducers are correctly configured for server-side execution.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix SSR hydration and i18n blocking issues by correctly configuring TransferState for translations and ensuring NgRx meta-reducer factories are resolved via DI.
 */
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateServerLoader } from './translate-server.loader';
import { join } from 'path';
import { transferStateMetaReducer } from './state-transfer';

// DE FIX: Factory-functie voor onze nieuwe server-loader
export function translateServerLoaderFactory(): TranslateLoader {
  // `process.cwd()` is de root van je Nx monorepo op de server.
  // We moeten verwijzen naar de gebouwde client-assets (`browser` folder).
  const browserDistFolder = join(process.cwd(), 'dist/apps/droneshop/browser');
  // DE FIX: Retourneer een instantie van de gewijzigde TranslateServerLoader
  return new TranslateServerLoader(
    browserDistFolder,
    './assets/i18n/shared/', // Shared prefix
    './assets/i18n/droneshop/', // App-specifiek prefix
    '.json'
  );
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: translateServerLoaderFactory,
      },
    }),
    // DE FIX: transferStateMetaReducer wordt direct in app.config.ts al toegevoegd aan provideStore
    //         en is dus hier niet opnieuw nodig als multi-provider.
    // {
    //   provide: 'META_REDUCERS',
    //   useFactory: () => [transferStateMetaReducer],
    //   multi: true,
    // },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);