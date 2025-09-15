import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AiAvatarService {
  private avatarInstance: any;

  /**
   * Initialiseert de avatar door eerst de runtime te laden en daarna het model.
   * @param container Het HTML-element waarin de avatar getoond wordt.
   */
  async initializeAvatar(container: HTMLElement): Promise<void> {
    await this.loadRuntimeScript();
    // Veronderstel dat de runtime een module biedt die we hier kunnen aanroepen
    // Je kunt dit aanpassen aan de API van jouw specifieke runtime (UE5, Three.js, etc.)
    this.avatarInstance = new window.UE5.AvatarModule();
    // Voeg de canvas toe aan de container
    container.appendChild(this.avatarInstance.canvas);
    // Initialiseer de canvas met de afmetingen van de container
    this.avatarInstance.init(container.clientWidth, container.clientHeight);
    // Laad het 3D-model (pas het pad aan naar jouw modelbestand)
    this.avatarInstance.loadModel('/assets/models/your-model.glb');
  }

  /**
   * Laadt het runtime-script (bijv. de UE5 export of een Three.js bundle) dynamisch.
   */
  private loadRuntimeScript(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = '/assets/ue5-build/js/main.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  /**
   * Ruimt de avatar netjes op (bijvoorbeeld wanneer de component wordt vernietigd).
   */
  cleanup(): void {
    if (this.avatarInstance && typeof this.avatarInstance.destroy === 'function') {
      this.avatarInstance.destroy();
    }
  }
}