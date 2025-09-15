/**
 * @file organic-svg-blob.component.ts (Shared UI)
 * @version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Create a component to encapsulate an organic SVG blob shape.
 * @Description
 *   Een herbruikbare component voor het renderen van de abstracte, organische SVG-vorm.
 *   Bedoeld als een statisch, decoratief achtergrondelement.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'royal-organic-svg-blob',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-hidden="true" 
      [ngClass]="extraClasses()">
      <path 
        [attr.fill]="fill()" 
        d="M47.3,-63.6C59.8,-53.4,67.4,-38.3,71.2,-22.3C75,-6.3,75.1,10.6,68.8,24.9C62.5,39.2,50,50.8,36.1,59C22.2,67.2,7,72,-9,73.5C-25,74.9,-41.8,72.9,-54.2,64.2C-66.6,55.5,-74.6,40.1,-77.8,24.2C-81,-1.8,-79.4,-18.2,-71.2,-31.9C-63,-45.6,-48.2,-56.6,-33.2,-64.1C-18.2,-71.6,-3.1,-75.6,11.5,-73.4C26.1,-71.2,40.1,-64.7,47.3,-63.6Z" 
        transform="translate(100 100)">
      </path>
    </svg>
  `,
  styles: [`
    :host { 
      display: block; 
    }
    svg { 
      display: block; 
      animation: blob-float 15s ease-in-out infinite alternate;
      will-change: transform;
    }

    @keyframes blob-float {
      0% {
        transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
      }
      50% {
        transform: translateY(-10px) translateX(5px) rotate(90deg) scale(1.05);
      }
      100% {
        transform: translateY(0px) translateX(0px) rotate(180deg) scale(1);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganicSvgBlobComponent {
  readonly fill: InputSignal<string> = input<string>('currentColor');
  readonly extraClasses: InputSignal<string> = input<string>('');
}