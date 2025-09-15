// apps/challenger/src/app/layout/app-layout.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from './app-header/app-header.component';

/**
 * @Component AppLayoutComponent
 * @description Defines the main structure of the application interface,
 * including the header and the main content area where routed components are displayed.
 * It applies global responsive padding and max-width constraints to the main content.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, AppHeaderComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-background text-text">
      <!-- Application Header -->
      <app-header />
      <!-- Main Content Area -->
      <!--
        - container-max: Applies max-width and centers the content (defined globally or in styles.scss).
        - flex-1: Allows this area to grow and fill available vertical space.
        - py-6 md:py-8 lg:py-10: Adds RESPONSIVE vertical padding for optimal rhythm.
        - px-4 sm:px-6 lg:px-8: Adds responsive horizontal padding (gutters).
      -->
      <main class="container-max flex-1 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        <!-- Router Outlet: Where components corresponding to the current route are rendered -->
        <router-outlet></router-outlet>
      </main>
      <!-- Optional Footer could go here -->
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {}
