import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { DroneshopHeaderComponent } from '../droneshop-header/droneshop-header.component';
import { DroneshopFooterComponent } from '../droneshop-footer/droneshop-footer.component';
import { UiBreadcrumbsComponent } from '@royal-code/ui/breadcrumb';

@Component({
  selector: 'droneshop-layout',
  standalone: true,
  imports: [
    RouterModule,
    DroneshopHeaderComponent,
    DroneshopFooterComponent,
    UiBreadcrumbsComponent
  ],
  template: `
    <div class="flex min-h-screen flex-col bg-background text-foreground">
      <droneshop-header ngSkipHydration />

      <div class="container-max flex-1 py-4 px-4 md:px-6 lg:px-8">
        <!-- Breadcrumbs worden nu conditioneel getoond -->
        @if (!isHomepage()) {
          <royal-code-ui-breadcrumbs class="mb-4" />
        }
        <main id="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <droneshop-footer />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopLayoutComponent {
  private readonly router = inject(Router);

  // Dit signaal houdt de huidige URL bij en wordt automatisch geüpdatet bij navigatie.
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
      startWith(this.router.url)
    )
  );

  // Dit computed signaal controleert of de huidige URL de homepage is.
  readonly isHomepage = computed(() => this.currentUrl() === '/');
}