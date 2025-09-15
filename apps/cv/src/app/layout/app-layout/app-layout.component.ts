/**
 * @file app-layout.component.ts (CV App)
 * @version 2.0.0 (Footer Integration)
 * @description
 *   De hoofdlayout voor de CV-applicatie, nu inclusief de nieuwe
 *   app-specifieke <app-cv-footer> component.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CvHeaderComponent } from '../cv-header/cv-header.component';
import { CvFooterComponent } from '../cv-footer/cv-footer.component';

@Component({
  selector: 'app-cv-layout',
  standalone: true,
  imports: [RouterModule, CvHeaderComponent, CvFooterComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <app-cv-header />
      <main id="main-content" class="container-max flex-1 py-4 px-4 md:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
      <app-cv-footer /> <!-- <-- Voeg footer selector toe -->
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {}