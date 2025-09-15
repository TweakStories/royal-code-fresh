// apps/challenger/src/app/app.component.ts
import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router'; // Nodig voor RouterOutlet in AppLayoutComponent
import { Store } from '@ngrx/store'; // Store nog steeds nodig om init actions te dispatchen

// --- Layout Component ---
// Importeer de component die de header en router-outlet bevat
import { DroneshopLayoutComponent } from './layout/app-layout/droneshop-layout.component';

// --- State Actions (alleen voor initialisatie) ---
import { AuthActions } from '@royal-code/store/auth';
import { NavigationFacade } from '@royal-code/core/navigations/state'; // Facade om laden te triggeren
import { LoggerService } from '@royal-code/core/core-logging';
import { TailwindDictionaryComponent } from '@royal-code/core';
import { StorageService } from '@royal-code/core/storage';
import { ChatActions } from 'libs/features/chat/core/src/lib/state/chat.actions';

/**
 * @Component AppComponent
 * @description Root component van de applicatie. Laadt de hoofdlayout en
 *              triggert initiële data laad acties.
 */
@Component({
  selector: 'droneshop-royal-code-root', // Behoud je root selector
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,       // Essentieel voor routing functionaliteit
    DroneshopLayoutComponent,  // De enige component die we hier direct renderen
    TailwindDictionaryComponent
  ],
  // De template bevat nu alleen de AppLayoutComponent.
  // AppLayoutComponent bevat op zijn beurt de AppHeaderComponent en de <router-outlet>.
  template: `<droneshop-layout></droneshop-layout>

      <lib-tailwind-dictionary />

  ` ,
  // Geen specifieke styles meer nodig hier, tenzij voor globale zaken buiten de layout.
})
export class AppComponent implements OnInit {
  // --- Dependencies (alleen voor init actions) ---
  private readonly store = inject(Store);
  private readonly navigationFacade = inject(NavigationFacade); // Facade om load te triggeren
  private readonly logger = inject(LoggerService);
  private readonly storageService = inject(StorageService);

  // --- Lifecycle Hook ---
 ngOnInit(): void {
    this.logger.info('[AppComponent] ngOnInit - Dispatching initial data load actions.');
    this.store.dispatch(AuthActions.checkAuthStatusOnAppInit());
    this.navigationFacade.loadNavigation();

    const anonymousSessionId = this.storageService.getItem<string>('anonymousAiSessionId');
    if (anonymousSessionId) {
      this.logger.info(`[AppComponent] Found anonymous session ID: ${anonymousSessionId}. Restoring conversation.`);
      this.store.dispatch(ChatActions.loadAnonymousConversationRequested({ anonymousSessionId }));
    }
  }
}