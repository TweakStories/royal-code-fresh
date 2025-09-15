/**
 * @file aurora-background.component.ts (Shared UI)
 * @version 3.0.0 (Theme-Aware & Dynamic)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   Een generieke, configureerbare component voor het creëren van 'Aurora'
 *   achtige achtergrond effecten. Is nu volledig 'theme-aware' en reageert
 *   dynamisch op de geselecteerde primaire themakleur.
 */
import { ChangeDetectionStrategy, Component, computed, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

type AuroraPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
type AuroraAnimationDirection = 'default' | 'reverse';

@Component({
  selector: 'royal-aurora-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="aurora-container" 
      [ngClass]="containerClasses()"
      [style.--aurora-color-one]="'var(--color-primary)'"
      [style.--aurora-color-two]="'var(--color-accent)'">
      <div class="aurora-blob one" [ngClass]="animationClasses()"></div>
      <div class="aurora-blob two" [ngClass]="animationClasses()"></div>
    </div>
  `,
  styles: [`
    :host { 
      display: block; 
      position: absolute; 
      inset: 0; 
      z-index: 0;
      overflow: hidden; 
      pointer-events: none;
    }
    .aurora-container { 
      position: relative; 
      width: 100%; 
      height: 100%; 
    }
    .aurora-blob {
      position: absolute;
      border-radius: 9999px;
      filter: blur(50px);
      opacity: 0.15;
      mix-blend-mode: overlay;
      animation-name: aurora-pulse;
      animation-duration: 10s;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
      animation-direction: alternate;
    }
    .aurora-blob.one {
      width: 400px;
      height: 400px;
      /* FIX: Gebruik de scoped CSS variabele */
      background: radial-gradient(circle at center, var(--aurora-color-one) 0%, transparent 70%);
    }
    .aurora-blob.two {
      width: 300px;
      height: 300px;
      /* FIX: Gebruik de scoped CSS variabele */
      background: radial-gradient(circle at center, var(--aurora-color-two) 0%, transparent 60%);
    }

    /* Position Classes */
    .pos-top-left .one { top: -25%; left: -25%; }
    .pos-top-left .two { top: 25%; left: 25%; }

    .pos-top-right .one { top: -25%; right: -25%; }
    .pos-top-right .two { top: 25%; right: 25%; }
    
    .pos-center .one { top: 15%; left: 20%; }
    .pos-center .two { top: 40%; left: 50%; }

    /* Animation Classes */
    .anim-reverse {
      animation-direction: alternate-reverse;
    }

    @keyframes aurora-pulse {
      from { transform: scale(1) rotate(0deg) translateX(0); }
      to { transform: scale(1.2) rotate(45deg) translateX(20px); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuroraBackgroundComponent {
  readonly position: InputSignal<AuroraPosition> = input<AuroraPosition>('center');
  readonly animation: InputSignal<AuroraAnimationDirection> = input<AuroraAnimationDirection>('default');

  protected containerClasses = computed(() => `pos-${this.position()}`);
  protected animationClasses = computed(() => `anim-${this.animation()}`);
}