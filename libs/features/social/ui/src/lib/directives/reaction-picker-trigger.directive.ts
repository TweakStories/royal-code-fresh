// libs/shared/ui/src/lib/directives/reaction-picker-trigger.directive.ts
// (Of plaats het in een meer geschikte shared UI library map)
import { Directive, ElementRef, inject, input, output, OnDestroy, HostListener, NgZone, OutputEmitterRef, InputSignal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ReactionPickerComponent } from '../components/reaction-picker/reaction-picker.component';
import { DynamicOverlayService, DynamicOverlayRef, DummyOverlayContentComponent } from '@royal-code/ui/overlay';
import { ReactionType } from '@royal-code/shared/domain';

/**
 * @Directive ReactionPickerTriggerDirective
 *
 * @description
 * Attaches reaction picker functionality to a host element (typically a button).
 * Opens the ReactionPickerComponent in a connected overlay on click or hover (with delay).
 * Emits the selected reaction type when the picker is closed.
 * Handles hover timers and overlay management.
 *
 * @Input currentUserReaction: Signal<ReactionType | null | undefined> - The current reaction of the logged-in user (used for potential toggling, though selection logic is in picker).
 * @Output reactionSelected: OutputEmitterRef<ReactionType | null> - Emits the selected reaction type (or null if deselected/cancelled).
 */
@Directive({
  selector: '[libRoyalCodeReactionPickerTrigger]', // Gebruik prefix
  standalone: true,
})
export class ReactionPickerTriggerDirective implements OnDestroy {
  // --- Inputs ---
  /** The current reaction to potentially pre-select or toggle off (logic might be in picker/component). */
  readonly currentUserReaction: InputSignal<ReactionType | null | undefined> = input<ReactionType | null | undefined>();

  // --- Outputs ---
  /** Emits the selected reaction, or null if nothing was selected or it was toggled off. */
  readonly reactionSelected: OutputEmitterRef<ReactionType | null> = output<ReactionType | null>();

  // --- Dependencies ---
  private elementRef = inject(ElementRef<HTMLElement>);
  private overlayService = inject(DynamicOverlayService);
  private ngZone = inject(NgZone);

  // --- Internal State ---
  private destroy$ = new Subject<void>();
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly hoverDelayMs = 150; // Delay before opening on hover
  private overlayRef: DynamicOverlayRef<ReactionType | null> | null = null; // Of alleen ReactionType

  // --- Event Listeners ---

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.clearHoverTimer();
    // Voeg een kleine timeout toe (0ms is vaak genoeg)
    // setTimeout(() => {
        this.openReactionPicker();
    // }, 0);
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    // Start timer alleen als er geen overlay al open is *voor deze trigger*
    if (!this.overlayRef) {
        this.clearHoverTimer(); // Clear any previous timer
        // Run timer outside Angular zone for performance
        this.ngZone.runOutsideAngular(() => {
            this.hoverTimer = setTimeout(() => {
                 // Check again inside timeout if overlay was opened meanwhile (e.g., by click)
                 if (!this.overlayRef) {
                    // Run open logic back inside Angular zone
                    this.ngZone.run(() => this.openReactionPicker());
                 }
            }, this.hoverDelayMs);
        });
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.clearHoverTimer();
  }

  constructor() {
    this.ngZone.run(() => { // <-- Wikkel in ngZone.run
        console.log('[DummyOverlayContentComponent] Dummy component constructor called.');
        // Als je hier een logger gebruikt die dispatcht:
        // this.logger.info('[DummyOverlayContentComponent] Initialized.');
    });
  }

  // --- Lifecycle ---

  ngOnDestroy(): void {
    this.clearHoverTimer();
    this.closeReactionPickerOverlay(null); // Close overlay if directive is destroyed, emit null
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Private Methods ---

  /** Clears the hover timer. */
  private clearHoverTimer(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

    private openReactionPicker(): void {
      if (this.overlayRef) {
          return;
      }
      console.log('[Directive] Attempting to open REACTION PICKER overlay...'); // Update log

      // --- GEBRUIK REACTION PICKER COMPONENT ---
      this.overlayRef = this.overlayService.open<ReactionType | null, { currentReaction: ReactionType | null | undefined }>({
          component: ReactionPickerComponent, // <-- ECHTE component
          data: { currentReaction: this.currentUserReaction() }, // Geef data mee
          origin: this.elementRef.nativeElement,
          positionStrategy: 'connected',
          connectedPosition: [
              { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
              { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
          ],
          backdropType: 'transparent',
          closeOnClickOutside: true,
          panelClass: ['reaction-picker-overlay'] // Geen bg-transparent meer nodig? Component heeft achtergrond.
      });
      // ----------------------------------------

      console.log('[Directive] overlayService.open called for Reaction Picker.');

      this.overlayRef.afterClosed$
          .pipe(takeUntil(this.destroy$))
          .subscribe(selectedReaction => {
              console.log('[Directive] REACTION PICKER Overlay Closed. Result:', selectedReaction);
              this.overlayRef = null;
              this.clearHoverTimer();
              // Emit de geselecteerde reactie (kan ReactionType of null/undefined zijn)
              this.reactionSelected.emit(selectedReaction ?? null); // Emit null als undefined
          });
  }


  /** Closes the overlay if it is currently open. */
  private closeReactionPickerOverlay(result: ReactionType | null): void {
    if (this.overlayRef) {
      this.overlayRef.close(result ?? undefined); // Convert null to undefined
      this.overlayRef = null;
    }
  }
}
