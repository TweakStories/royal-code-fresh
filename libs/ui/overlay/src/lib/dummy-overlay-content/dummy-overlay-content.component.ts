// libs/ui/overlay/src/lib/dummy-overlay-content.component.ts
import { Component, inject, Injector } from '@angular/core'; // Import Injector

import { DynamicOverlayRef, DYNAMIC_OVERLAY_REF } from '../dynamic-overlay.tokens';

@Component({
  selector: 'lib-dummy-overlay-content',
  standalone: true,
  imports: [],
  template: `
    <div class="bg-background text-text p-4 border border-border rounded shadow-lg text-center">
      <p class="text-lg font-semibold mb-4">Dummy Overlay Works!</p>
      <button (click)="close()" class="mt-2 p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Close Me</button>
    </div>
  `,
})
export class DummyOverlayContentComponent {
  private overlayRef?: DynamicOverlayRef; // Maak optioneel
  private injector = inject(Injector);    // Injecteer de huidige Injector

  close(): void {
    console.log('[DummyOverlayContentComponent] Close button clicked.');
    this.overlayRef?.close('Dummy closed via button'); // Gebruik de opgeslagen ref
  }

  constructor() {
    console.log('[DummyOverlayContentComponent] Constructor called.');
    try {
        // Probeer de provider *expliciet* op te halen uit de injector die DEZE component heeft ontvangen
        this.overlayRef = this.injector.get(DYNAMIC_OVERLAY_REF); // Haal op uit lokale injector
        console.log('[DummyOverlayContentComponent] ---> Successfully resolved DYNAMIC_OVERLAY_REF from injector:', this.overlayRef);
    } catch (e) {
        console.error('[DummyOverlayContentComponent] ---> FAILED to resolve DYNAMIC_OVERLAY_REF from injector!', e);
        // Log de injector zelf NIET, dat is te veel info.
    }
  }
}
