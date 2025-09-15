/**
 * @file dataflow-diagram.component.ts (Shared UI)
 * @description Visualiseert de "reis van een klik" dataflow als een diagram.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain'; // <-- Importeer AppIcon correct
import { CommonModule } from '@angular/common';

@Component({
  selector: 'royal-ui-dataflow-diagram', // <-- Correcte selector
  standalone: true,
  imports: [CommonModule, UiIconComponent],
  template: `
    <div class="flow-container bg-card p-6 rounded-xs border border-border shadow-md">
      <div class="flow-steps">
        <div class="flow-item">
          <div class="flow-node">
            <span class="font-bold">UI Component</span>
            <small>(bv. ProductDetail)</small>
          </div>
          <div class="flow-arrow"><royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="sm" /></div>
        </div>
        
        <div class="flow-item">
          <div class="flow-node">
            <span class="font-bold">Facade</span>
            <small>(Stuurt NgRx Action)</small>
          </div>
          <div class="flow-arrow"><royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="sm" /></div>
        </div>

        <div class="flow-item">
          <div class="flow-node">
            <span class="font-bold">NgRx Effect</span>
            <small>(Orkestreert Side-Effect)</small>
          </div>
          <div class="flow-arrow"><royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="sm" /></div>
        </div>

        <div class="flow-item">
          <div class="flow-node">
            <span class="font-bold">API Service</span>
            <small>(Voert HTTP Call uit)</small>
          </div>
          <div class="flow-arrow"><royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="sm" /></div>
        </div>

        <div class="flow-item">
          <div class="flow-node">
            <span class="font-bold">NgRx Reducer</span>
            <small>(Update Immutable State)</small>
          </div>
          <div class="flow-arrow"><royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="sm" /></div>
        </div>

        <div class="flow-item">
          <div class="flow-node">
            <span class="font-bold">UI Component</span>
            <small>(Reageert op State)</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .flow-container {
      @apply overflow-x-auto;
      padding-bottom: 0.5rem; /* Voor eventuele scrollbar */
    }
    .flow-steps {
      @apply flex items-center justify-start min-w-full; /* justify-start om scroll te forceren op kleine schermen */
      width: max-content; /* Zorgt ervoor dat content breder kan zijn dan container */
    }
    .flow-item {
      @apply flex items-center;
    }
    .flow-node {
      @apply bg-background border border-border rounded-md p-3 text-center flex flex-col items-center flex-shrink-0;
      min-width: 120px; /* Vaste breedte voor consistentie */
      white-space: nowrap; /* Voorkom afbreken van tekst */
    }
    .flow-node small {
      @apply text-xs text-secondary mt-1;
    }
    .flow-arrow {
      @apply text-center text-secondary px-2 flex-shrink-0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataflowDiagramComponent {
  readonly AppIcon = AppIcon;
}