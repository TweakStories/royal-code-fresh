/**
 * @file swipe.directive.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-02
 * @Description Standalone Angular directive to detect horizontal swipe gestures
 *              (left and right) on a host element. Supports both touch and mouse input.
 *              Emits `swipeleft` or `swiperight` events.
 *
 * @Usage
 * <div
 *   appSwipeable
 *   (swipeleft)="onSwipeLeft()"
 *   (swiperight)="onSwipeRight()"
 *   [swipeThreshold]="75"
 * >
 *   Swipeable content here...
 * </div>
 */
import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject, input, output } from '@angular/core';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

@Directive({
  selector: '[libRoyalCodeSwipeable]',
  standalone: true,
})
export class SwipeDirective {
  readonly swipeThreshold = input<number>(50);
  readonly swipeleft = output<TouchEvent | MouseEvent>();
  readonly swiperight = output<TouchEvent | MouseEvent>();

  // private elementRef = inject(ElementRef<HTMLElement>); // Niet direct gebruikt, maar kan handig zijn voor complexere scenario's

  private touchstartX = 0;
  private touchstartY = 0;
  private touchendX = 0;

  private isSwiping = false;
  private isMouseDown = false;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement.closest('button, a, input, select, textarea')) {
      return;
    }
    this.touchstartX = event.changedTouches[0].screenX;
    this.touchstartY = event.changedTouches[0].screenY;
    this.isSwiping = true;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isSwiping) {
      return;
    }
    const deltaX = Math.abs(event.changedTouches[0].screenX - this.touchstartX);
    const deltaY = Math.abs(event.changedTouches[0].screenY - this.touchstartY);

    if (deltaX > 10 && deltaX > deltaY) { // Primair horizontale beweging
      event.preventDefault();
    } else if (deltaY > deltaX && deltaY > 10) { // Primair verticale beweging, swipe afbreken voor scroll
      this.isSwiping = false;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.isSwiping) {
      return;
    }
    this.touchendX = event.changedTouches[0].screenX;
    this.isSwiping = false;
    this.handleHorizontalSwipe(this.touchstartX, this.touchendX, event);
  }

  @HostListener('touchcancel', ['$event'])
  onTouchCancel(event: TouchEvent): void {
    this.isSwiping = false;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;
    const targetElement = event.target as HTMLElement;
    if (targetElement.closest('button, a, input, select, textarea')) {
      return;
    }
    this.touchstartX = event.screenX;
    this.touchstartY = event.screenY;
    this.isMouseDown = true;
    event.preventDefault();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    // Geen actie nodig hier als isMouseDown niet actief is
    if (!this.isMouseDown) {
        return;
    }
    // Wel preventDefault als we actief aan het "slepen" zijn om ongewenste browseracties te voorkomen
    event.preventDefault();
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (!this.isMouseDown) {
      return;
    }
    this.touchendX = event.screenX;
    this.isMouseDown = false;
    this.handleHorizontalSwipe(this.touchstartX, this.touchendX, event);
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    if (this.isMouseDown) {
      this.touchendX = event.screenX;
      this.isMouseDown = false;
      this.handleHorizontalSwipe(this.touchstartX, this.touchendX, event);
    }
  }

  private handleHorizontalSwipe(startX: number, endX: number, originalEvent: TouchEvent | MouseEvent): void {
    const deltaX = endX - startX;
    const absDeltaX = Math.abs(deltaX);

    if (absDeltaX >= this.swipeThreshold()) {
      if (deltaX > 0) {
        this.swiperight.emit(originalEvent);
      } else {
        this.swipeleft.emit(originalEvent);
      }
    }
  }
}
