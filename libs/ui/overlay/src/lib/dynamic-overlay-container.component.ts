import {
  Component, ChangeDetectionStrategy, inject, ViewChild, HostBinding
} from '@angular/core';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { DYNAMIC_OVERLAY_REF, DynamicOverlayConfig } from './dynamic-overlay.tokens';
import { DOCUMENT } from '@angular/common'; // Importeer DOCUMENT

@Component({
  selector: 'royal-code-dynamic-overlay-container',
  standalone: true,
  imports: [CdkPortalOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- 
      DE FIX: Voeg een inline background-color toe die gegarandeerd werkt.
      Dit zal de ultimate test zijn.
    -->
    <div 
      class="text-foreground rounded-lg shadow-xl p-6" 
      [style.background-color]="getBackgroundColor()"
      (click)="$event.stopPropagation()"
      role="dialog" 
      aria-modal="true" 
      tabindex="-1">
      
      <!-- De daadwerkelijke content (bv. AddressFormComponent) wordt hierin geprojecteerd. -->
      <ng-template cdkPortalOutlet></ng-template>

    </div>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      width: 100%;
      height: 100%;
      outline: none;
    }
  `]
})
export class DynamicOverlayContainerComponent {
  config: DynamicOverlayConfig = inject(DYNAMIC_OVERLAY_REF).data;
  private overlayRef = inject(DYNAMIC_OVERLAY_REF);
  private document = inject(DOCUMENT); // Injecteer DOCUMENT
  
  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet!: CdkPortalOutlet;

  // Hulpfunctie om de juiste achtergrondkleur te bepalen op basis van het thema.
  getBackgroundColor(): string {
    if (this.document.documentElement.classList.contains('dark')) {
      // Gebruik hier direct de Dark Mode kleurwaarde
      return 'hsl(215, 15%, 11%)'; // Bijv. var(--surface-card) in dark mode
    } else {
      // Gebruik hier direct de Light Mode kleurwaarde
      return 'hsl(215, 15%, 99%)'; // Bijv. var(--surface-card) in light mode
    }
  }
}