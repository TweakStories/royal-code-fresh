// --- MAAK BESTAND AAN: libs/ui/sidebar/src/lib/sidebar/ui-sidebar.component.ts ---
/**
 * @file ui-sidebar.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-20
 * @Description Een generiek sidebar UI-component dat de lay-out en animatie beheert.
 *              Het is 'dom' en gebruikt content projectie voor zijn inhoud (header, navigatie, footer).
 */
import { Component, ChangeDetectionStrategy, input, output, HostBinding, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common'; // Voor ngClass indien nodig
import { animate, state, style, transition, trigger } from '@angular/animations'; // Voor animaties

@Component({
  selector: 'royal-code-ui-sidebar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // Nodig om Tailwind classes buiten component scope toe te passen
  template: `
    <div class="flex flex-col h-full bg-surface-alt border-r border-border shadow-lg">
      <header class="flex-shrink-0">
        <ng-content select="[slot='header']"></ng-content>
      </header>
      <nav class="flex-grow overflow-y-auto custom-scrollbar">
        <ng-content></ng-content> <!-- Default slot for navigation -->
      </nav>
      <footer class="flex-shrink-0">
        <ng-content select="[slot='footer']"></ng-content>
      </footer>
    </div>

    <!-- Backdrop voor Overlay mode -->
    @if (mode() === 'overlay' && isOpen()) {
      <div class="fixed inset-0 bg-black/50 z-backdrop" (click)="backdropClicked.emit()"></div>
    }
  `,
  styles: [`
    /* Scrollbar styling voor een mooie look */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: var(--color-background-secondary);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: var(--color-border);
      border-radius: 20px;
      border: 2px solid var(--color-surface-alt);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: var(--color-secondary);
    }
  `],
  animations: [
    trigger('slideAnimation', [
      state('docked-open', style({ width: 'var(--sidebar-width-open, 16rem)' })),
      state('docked-closed', style({ width: 'var(--sidebar-width-closed, 4rem)' })),
      state('overlay-open', style({ transform: 'translateX(0)' })),
      state('overlay-closed', style({ transform: 'translateX(-100%)' })),

      transition('* => docked-open', [
        animate('300ms ease-out', style({ width: 'var(--sidebar-width-open, 16rem)' }))
      ]),
      transition('* => docked-closed', [
        animate('300ms ease-in', style({ width: 'var(--sidebar-width-closed, 4rem)' }))
      ]),
      transition('* => overlay-open', [
        style({ transform: 'translateX(-100%)' }),
        animate('250ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition('* => overlay-closed', [
        animate('200ms ease-in', style({ transform: 'translateX(-100%)' }))
      ]),
    ])
  ]
})
export class UiSidebarComponent {
  mode = input<'docked' | 'overlay'>('docked');
  isOpen = input<boolean>(true);
  backdropClicked = output<void>();

  @HostBinding('@slideAnimation')
  get animationState() {
    if (this.mode() === 'docked') {
      return this.isOpen() ? 'docked-open' : 'docked-closed';
    } else { // overlay
      return this.isOpen() ? 'overlay-open' : 'overlay-closed';
    }
  }

  @HostBinding('class')
  get hostClasses() {
    return this.computedLayoutClasses();
  }

  private computedLayoutClasses = computed(() => {
    const classes = ['flex-shrink-0', 'transition-all', 'duration-300', 'ease-in-out'];
    if (this.mode() === 'docked') {
      classes.push('h-full'); // Docked sidebars nemen de volledige hoogte in
    } else { // overlay
      classes.push('fixed', 'inset-y-0', 'left-0', 'z-modal'); // Z-modal zorgt dat het boven andere content is
    }
    return classes.join(' ');
  });
}