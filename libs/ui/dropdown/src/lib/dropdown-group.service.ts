import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DropdownGroupService {
  // Gebruik een signal om de actieve ID bij te houden
  readonly activeDropdown = signal<string | null>(null);

  /**
   * Stel de ID in van de dropdown die momenteel actief/open is binnen een groep.
   * @param id De unieke ID van de actieve dropdown, of null als er geen actief is.
   */
  setActiveDropdown(id: string | null): void {
    // console.log('Setting active dropdown:', id); // Debug log
    this.activeDropdown.set(id);
  }

  // Functie om de huidige waarde op te vragen (indien nodig buiten effecten)
  getActiveDropdown(): string | null {
      return this.activeDropdown();
  }
}