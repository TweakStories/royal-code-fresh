// apps/plushie-paradise/src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // <-- Import de volledige config
import { AppComponent } from './app/app.component';
import { TranslateService } from '@ngx-translate/core';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    const translate = appRef.injector.get(TranslateService);

    const userLang = localStorage.getItem('lang') || navigator.language.split('-')[0] || 'en';
    translate.setDefaultLang('en'); // Fallback naar Engels
    translate.use(userLang);

    console.log(`🌍 Using language: ${userLang}`);
  })
  .catch((err) => console.error(err));
