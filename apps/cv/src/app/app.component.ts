// apps/cv/src/app/app.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component'; // <-- Importeer de layout

@Component({
  selector: 'app-cv-root',
  standalone: true,
  imports: [AppLayoutComponent],
  template: `
<a href="#main-content" class="sr-only focus:not-sr-only absolute top-0 left-0 m-3 p-3 bg-background text-foreground border border-primary rounded-md z-[9999]">
  Skip to main content
</a>
<!-- De router-outlet wordt verplaatst naar de AppLayoutComponent -->
<app-cv-layout></app-cv-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}