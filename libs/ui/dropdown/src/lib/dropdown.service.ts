// dropdown.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DropdownService {
  private hostEl: HTMLDivElement | null = null;

  createHost(panelClass: string = 'my-dropdown-panel'): HTMLDivElement {
    if (!this.hostEl) {
      this.hostEl = document.createElement('div');
      this.hostEl.style.position = 'absolute';
      this.hostEl.style.zIndex = '99999'; // Zorgt ervoor dat de dropdown boven andere elementen komt
      this.hostEl.classList.add(panelClass);
      document.body.appendChild(this.hostEl);
    }
    return this.hostEl;
  }

  removeHost(): void {
    if (this.hostEl && this.hostEl.parentNode) {
      this.hostEl.parentNode.removeChild(this.hostEl);
    }
    this.hostEl = null;
  }

// Wijzig de methode zodat deze extra parameters accepteert:
positionDropdown(
  triggerEl: HTMLElement,
  hostEl: HTMLElement,
  fullWidth: boolean,
  alignment: string,
  verticalAlignment: string,
  offsetX: number,
  offsetY: number
): void {
  const rect = triggerEl.getBoundingClientRect();
  let top: number;
  if (verticalAlignment === 'above') {
    top = rect.top + window.scrollY - hostEl.offsetHeight + offsetY;
  } else {
    // Default: "below"
    top = rect.bottom + window.scrollY + offsetY;
  }
  
  let left: number;
  if (fullWidth) {
    left = 0;
    hostEl.style.width = window.innerWidth + 'px';
  } else {
    if (alignment === 'right') {
      left = rect.right + window.scrollX - hostEl.offsetWidth + offsetX;
    } else if (alignment === 'center') {
      left = rect.left + window.scrollX + (rect.width - hostEl.offsetWidth) / 2 + offsetX;
    } else {
      // Default: "left"
      left = rect.left + window.scrollX + offsetX;
    }
  }
  
  hostEl.style.top = top + 'px';
  hostEl.style.left = left + 'px';
}
}