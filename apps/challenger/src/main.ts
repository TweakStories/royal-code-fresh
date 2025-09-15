import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { TranslateService } from '@ngx-translate/core';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
  ],
}).then((appRef) => {
  const translate = appRef.injector.get(TranslateService);

  // 🔥 Standaardtaal instellen (haalt uit localStorage of browser)
  const userLang = localStorage.getItem('lang') || navigator.language.split('-')[0] || 'en';
  translate.setDefaultLang('en'); // Fallback naar Engels
  translate.use(userLang);

  console.log(`🌍 Using language: ${userLang}`);
}).catch((err) => console.error(err));

