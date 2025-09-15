// libs/ui/src/lib/ui-dropdown/ui-dropdown.component.ts
// Version 3.0.1 - TypeScript errors fixed

import {
  Component,
  ViewChild,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  effect,
  HostListener,
  NgZone,
  PLATFORM_ID,
  Injector,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Overlay,
  OverlayRef,
  FlexibleConnectedPositionStrategy,
  OverlayConfig,
  ConnectedPosition,
  GlobalPositionStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DropdownGroupService } from '../dropdown-group.service';

export type DropdownTrigger = 'click' | 'hover' | 'longPress' | 'hold' | 'manual';
export type DropdownMenuType = 'dropdown' | 'megaMenu';
export type DropdownAlignment = 'left' | 'center' | 'right';
export type DropdownVerticalAlignment = 'below' | 'above';

@Component({
  selector: 'royal-code-ui-dropdown',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #triggerEl 
         class="dropdown-trigger inline-block" 
         tabindex="0"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-haspopup]="true"
         role="button">
       <ng-content select="[dropdown-trigger]"></ng-content>
    </div>

    <ng-template #dropdownTpl>
      <div class="dropdown-panel"
           role="menu"
           tabindex="-1"
           [attr.aria-labelledby]="dropdownId"
           (mouseenter)="handlePanelMouseEnter()"
           (mouseleave)="handlePanelMouseLeave()"
           (click)="handlePanelClick($event)">
         <ng-content select="[dropdown]" />
      </div>
    </ng-template>
  `,
  styles: [`
    :host { 
  display: inline-block; 
  position: relative; 
}

.dropdown-trigger { 
  outline: none; 
  cursor: pointer;
  width: 100%;
}

.dropdown-trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* === DROPDOWN BACKGROUND FIX === */

/* 1. Zorg ervoor dat dropdown overlays een correcte achtergrond hebben */
:host ::ng-deep .royal-code-dropdown-overlay-pane {
  background: var(--surface-card) !important;
  
  /* Zorg voor een fallback als CSS custom properties falen */
  background-color: white !important;
  
  .dark & {
    background: hsl(var(--hue-neutral) var(--sat-neutral) 11%) !important;
    background-color: hsl(215, 15%, 11%) !important;
  }
}

/* 2. Extra zekerheid - target alle dropdown gerelateerde overlays */
:host ::ng-deep .cdk-overlay-pane:has(.dropdown-panel),
:host ::ng-deep .cdk-overlay-pane[class*="dropdown"] {
  background: transparent !important; /* De pane zelf transparant */
  
  /* Target de content */
  .dropdown-panel {
    background: var(--surface-card) !important;
    
    .dark & {
      background: hsl(var(--hue-neutral) var(--sat-neutral) 11%) !important;
    }
  }
}

/* 3. Specifieke styling voor onze dropdown panels */
:host ::ng-deep .royal-code-dropdown-overlay-pane {
  /* Verbeterde visuele styling */
  border: 1px solid var(--color-border);
  border-radius: 0.375rem; /* rounded-md */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 0; /* Geen padding op de container, laat dit aan de content over */
  overflow: hidden; /* Voor mooie afgeronde hoeken */
  
  /* Zorg voor juiste z-index */
  z-index: 50;
}

/* 4. Mega menu styling (indien gebruikt) */
:host ::ng-deep .royal-code-mega-menu-overlay-pane {
  background: var(--surface-card) !important;
  border-top: 1px solid var(--color-border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  .dark & {
    background: hsl(var(--hue-neutral) var(--sat-neutral) 11%) !important;
  }
}

/* 5. Responsive improvements */
@media (max-width: 640px) {
  :host ::ng-deep .royal-code-dropdown-overlay-pane {
    /* Op mobiel: meer padding en grotere touch targets */
    min-width: 200px;
    max-width: calc(100vw - 2rem);
  }
}

/* 6. Focus states voor accessibility */
:host ::ng-deep .dropdown-panel [role="menuitem"]:focus,
:host ::ng-deep .dropdown-panel button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
  background: var(--color-hover);
}

/* 7. Smooth transitions */
:host ::ng-deep .royal-code-dropdown-overlay-pane {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
  transform-origin: top;
}

:host ::ng-deep .royal-code-dropdown-overlay-pane[data-state="open"] {
  animation: dropdown-in 0.2s ease-out;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
  `]
})
export class UiDropdownComponent implements OnDestroy {
  // === Inputs with better typing ===
  readonly triggerOn = input<DropdownTrigger>('click');
  readonly menuType = input<DropdownMenuType>('dropdown');
  readonly alignment = input<DropdownAlignment>('left');
  readonly verticalAlignment = input<DropdownVerticalAlignment>('below');
  readonly hoverDelay = input<number>(150);
  readonly longPressDelay = input<number>(500);
  readonly offsetY = input<number>(4);
  readonly offsetX = input<number>(0);
  readonly closeOnClickInside = input<boolean>(true);
  readonly forceOpen = input<boolean | undefined>(undefined);
  readonly disabled = input<boolean>(false);

  // === Outputs ===
  readonly isOpenChange = output<boolean>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  // === ViewChildren ===
  @ViewChild('triggerEl', { static: true }) triggerEl!: ElementRef<HTMLElement>;
  @ViewChild('dropdownTpl') dropdownTpl!: TemplateRef<any>;

  // === Dependencies ===
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly groupSvc = inject(DropdownGroupService, { optional: true });
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);

  // === Internal State ===
  readonly isOpen = signal(false);
  private overlayRef: OverlayRef | null = null;
  private portal: TemplatePortal<any> | null = null;
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  private pressTimeout: ReturnType<typeof setTimeout> | null = null;
  private isPointerDown = false;
  private readonly destroy$ = new Subject<void>();
  readonly dropdownId = `dropdown-${Math.random().toString(36).substring(2, 9)}`;
  private isPointerOverPanel = false;

  constructor() {
    // Effect for forceOpen
    effect(() => {
      if (this.disabled()) {
        if (this.isOpen()) this.close();
        return;
      }
      
      const forced = this.forceOpen();
      const currentlyOpen = this.isOpen();
      
      if (forced === true && !currentlyOpen) {
        this.open();
      } else if (forced === false && currentlyOpen) {
        this.close();
      }
    }, { allowSignalWrites: true, injector: this.injector });

    // Effect for group service coordination
    if (this.groupSvc) {
      effect(() => {
        // FIX: Null check voor groupSvc
        const activeId = this.groupSvc?.activeDropdown();
        if (this.isOpen() && activeId !== null && activeId !== this.dropdownId) {
          this.close();
        }
      }, { injector: this.injector });
    }
  }

  // === Event Handlers ===
  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent): void {
    if (this.disabled() || this.triggerOn() !== 'click') return;
    
    event.stopPropagation();
    this.handleTriggerInteraction();
  }

  @HostListener('mouseenter')
  handleMouseEnter(): void {
    if (this.disabled() || this.triggerOn() !== 'hover') return;
    
    this.clearTimers();
    if (!this.isOpen()) {
      this.hoverTimeout = setTimeout(() => this.open(), this.hoverDelay());
    }
  }

  @HostListener('mouseleave')
  handleMouseLeave(): void {
    if (this.disabled() || this.triggerOn() !== 'hover') return;
    
    this.clearTimers();
    this.hoverTimeout = setTimeout(() => {
      if (!this.isPointerOverPanel) this.close();
    }, 150);
  }

  handlePanelMouseEnter(): void {
    this.isPointerOverPanel = true;
    if (this.triggerOn() === 'hover') this.clearTimers();
  }

  handlePanelMouseLeave(): void {
    this.isPointerOverPanel = false;
    if (this.triggerOn() === 'hover') {
      this.clearTimers();
      this.hoverTimeout = setTimeout(() => this.close(), 150);
    }
  }

  handlePanelClick(event: MouseEvent): void {
    if (this.closeOnClickInside()) {
      // Check if the click target is a button or interactive element
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button') || target.getAttribute('role') === 'menuitem') {
        this.close();
      }
    }
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  handlePressStart(event: MouseEvent | TouchEvent): void {
    if (this.disabled() || 
        (this.triggerOn() !== 'longPress' && this.triggerOn() !== 'hold') ||
        !this.triggerEl.nativeElement.contains(event.target as Node)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.isPointerDown = true;
    this.clearTimers();
    
    this.ngZone.runOutsideAngular(() => {
      this.pressTimeout = setTimeout(() => {
        if (this.isPointerDown) {
          this.ngZone.run(() => this.handleTriggerInteraction());
        }
      }, this.longPressDelay());
    });
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  @HostListener('touchend')
  @HostListener('touchcancel')
  handlePressEnd(): void {
    if (this.triggerOn() !== 'longPress' && this.triggerOn() !== 'hold') return;
    
    this.isPointerDown = false;
    this.clearTimers();
  }

  // FIX: Expliciete KeyboardEvent typing
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  handleKeyboardToggle(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.disabled() || keyboardEvent.target !== this.triggerEl.nativeElement) return;
    
    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    this.handleTriggerInteraction();
  }

  @HostListener('keydown.escape', ['$event'])
  handleEscape(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.isOpen()) {
      keyboardEvent.preventDefault();
      this.close();
      // Return focus to trigger after closing
      this.triggerEl.nativeElement.focus();
    }
  }

  // === Core Logic ===
  private handleTriggerInteraction(): void {
    if (this.disabled()) return;
    
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled() || 
        this.isOpen() || 
        !isPlatformBrowser(this.platformId) || 
        this.overlayRef) {
      return;
    }

    try {
      this.groupSvc?.setActiveDropdown(this.dropdownId);

      const overlayConfig = this.createOverlayConfig();
      this.overlayRef = this.overlay.create(overlayConfig);

      if (!this.portal || this.portal.templateRef !== this.dropdownTpl) {
        this.portal = new TemplatePortal(this.dropdownTpl, this.viewContainerRef);
      }
      
        this.overlayRef.attach(this.portal);
  
        setTimeout(() => this.applyOverlayStyles(), 0);


      // Handle backdrop clicks and detachments
      this.overlayRef.backdropClick()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.close());
        
      this.overlayRef.detachments()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.isOpen()) {
            this.isOpen.set(false);
            this.isOpenChange.emit(false);
            this.closed.emit();
            
            if (this.groupSvc?.activeDropdown() === this.dropdownId) {
              this.groupSvc.setActiveDropdown(null);
            }
          }
        });

      this.isOpen.set(true);
      this.isOpenChange.emit(true);
      this.opened.emit();
      
    } catch (error) {
      console.error('Failed to open dropdown:', error);
      this.cleanup();
    }
  }

  close(): void {
    if (!this.isOpen() || !isPlatformBrowser(this.platformId) || !this.overlayRef) {
      return;
    }
    
    this.clearTimers();
    this.isPointerDown = false;
    this.overlayRef.detach();
    this.cleanup();
  }

  private cleanup(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.portal = null;
  }

  private createOverlayConfig(): OverlayConfig {
    const panelClasses = [
      'royal-code-dropdown-overlay-pane',
      'bg-card',
      'text-foreground',
      'border',
      'border-border',
      'rounded-md',
      'shadow-lg',
      'z-50'
    ];

    let positionStrategy: FlexibleConnectedPositionStrategy | GlobalPositionStrategy;
    let overlayWidth: string | undefined = undefined;
    let overlayMaxWidth: string | undefined = '320px';

    if (this.menuType() === 'megaMenu') {
      positionStrategy = this.overlay.position().global();
      const triggerRect = this.triggerEl.nativeElement.getBoundingClientRect();
      (positionStrategy as GlobalPositionStrategy)
        .top(`${triggerRect.bottom + this.offsetY()}px`)
        .left('0px');
      overlayWidth = '100vw';
      overlayMaxWidth = '100vw';
      panelClasses.push('royal-code-mega-menu-overlay-pane');
    } else {
      positionStrategy = this.createPositionStrategy();
    }

    return new OverlayConfig({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      width: overlayWidth,
      maxWidth: overlayMaxWidth,
      panelClass: panelClasses,
      direction: 'ltr'
    });
  }

  private applyOverlayStyles(): void {
  if (!this.overlayRef?.overlayElement) return;
  
  // Direct style manipulation als laatste resort
  const overlayPane = this.overlayRef.overlayElement.querySelector('.cdk-overlay-pane');
  if (overlayPane instanceof HTMLElement) {
    // Forceer de background style direct
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
      overlayPane.style.backgroundColor = 'hsl(215, 15%, 11%)';
      overlayPane.style.borderColor = 'hsl(215, 15%, 18%)';
    } else {
      overlayPane.style.backgroundColor = 'hsl(215, 15%, 99%)';
      overlayPane.style.borderColor = 'hsl(215, 15%, 90%)';
    }
    
    overlayPane.style.border = '1px solid';
    overlayPane.style.borderRadius = '0.375rem';
    overlayPane.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    overlayPane.style.overflow = 'hidden';
  }
}


  private createPositionStrategy(): FlexibleConnectedPositionStrategy {
    const basePositions: ConnectedPosition[] = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: this.offsetY(),
        offsetX: this.offsetX()
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -this.offsetY(),
        offsetX: this.offsetX()
      }
    ];

    // Adjust positions based on alignment
    const positions = this.adjustPositionsForAlignment(basePositions);

    return this.overlay.position()
      .flexibleConnectedTo(this.triggerEl)
      .withPositions(positions)
      .withPush(false)
      .withViewportMargin(8);
  }

  private adjustPositionsForAlignment(basePositions: ConnectedPosition[]): ConnectedPosition[] {
    const positions = [...basePositions];
    
    // Add right-aligned fallbacks
    positions.push({
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: this.offsetY(),
      offsetX: -this.offsetX()
    });

    // Adjust primary positions based on alignment preference
    if (this.alignment() === 'right') {
      return [positions[2], positions[0], positions[1]];
    } else if (this.alignment() === 'center') {
      positions[0].originX = positions[1].originX = 'center';
      positions[0].overlayX = positions[1].overlayX = 'center';
    }

    if (this.verticalAlignment() === 'above') {
      return [positions[1], positions[0], ...positions.slice(2)];
    }

    return positions;
  }

  private clearTimers(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    if (this.pressTimeout) {
      clearTimeout(this.pressTimeout);
      this.pressTimeout = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanup();
    
    if (this.groupSvc?.activeDropdown() === this.dropdownId) {
      this.groupSvc.setActiveDropdown(null);
    }
  }
}