// apps/challenger/src/app/app.component.ts
import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router'; // Nodig voor RouterOutlet in AppLayoutComponent
import { Store } from '@ngrx/store'; // Store nog steeds nodig om init actions te dispatchen

// --- Layout Component ---
// Importeer de component die de header en router-outlet bevat
import { AppLayoutComponent } from './layout/app-layout.component';

// --- State Actions (alleen voor initialisatie) ---
import { AuthActions } from '@royal-code/store/auth';
import { NavigationFacade } from '@royal-code/core/navigations/state'; // Facade om laden te triggeren
import { LoggerService } from '@royal-code/core/core-logging';
import { TailwindDictionaryComponent } from '@royal-code/core';

/**
 * @Component AppComponent
 * @description Root component van de applicatie. Laadt de hoofdlayout en
 *              triggert initiële data laad acties.
 */
@Component({
  selector: 'app-royal-code-root', // Behoud je root selector
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,       // Essentieel voor routing functionaliteit
    AppLayoutComponent,  // De enige component die we hier direct renderen
    TailwindDictionaryComponent
  ],
  // De template bevat nu alleen de AppLayoutComponent.
  // AppLayoutComponent bevat op zijn beurt de AppHeaderComponent en de <router-outlet>.
  template: `<app-layout></app-layout>

      <lib-tailwind-dictionary />

  ` ,
  // Geen specifieke styles meer nodig hier, tenzij voor globale zaken buiten de layout.
})
export class AppComponent implements OnInit {
  // --- Dependencies (alleen voor init actions) ---
  private readonly store = inject(Store);
  private readonly navigationFacade = inject(NavigationFacade); // Facade om load te triggeren
  private readonly logger = inject(LoggerService);

  // --- Lifecycle Hook ---
  ngOnInit(): void {
    this.logger.info('[AppComponent] ngOnInit - Dispatching initial data load actions.');
    // Dispatch acties om essentiële data te laden bij het starten van de app.
    this.store.dispatch(AuthActions.checkAuthStatusOnAppInit());
    this.navigationFacade.loadNavigation(); // Roep de facade methode aan
  }

  // --- GEEN State Signals meer hier ---
  // De signalen voor isAuthenticated, currentUser, menuItems, etc.
  // worden nu beheerd en gebruikt binnen de AppHeaderComponent via de facades.

  // --- GEEN Event Handlers meer hier ---
  // De handlers voor logout, navigateToLogin, openMobileModal etc.
  // zijn nu verplaatst naar de AppHeaderComponent.
}
