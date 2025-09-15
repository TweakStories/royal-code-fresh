/**
 * @file ui-paragraph.component.ts
 * @Version 1.1.0 // Assuming version increment for this change
 * @Author Royal-Code MonorepoAppDevAI (o.b.v. User input)
 * @Date 2025-07-27 // Huidige datum
 * @PromptSummary Modified UiParagraphComponent to support content projection as a fallback if 'text' input is not provided.
 * @Description A standalone UI component for rendering paragraph text with various styling options.
 *              Supports text via 'text' input or direct content projection.
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Type definities voor de kleuren
export type ParagraphThemeColor =
  | 'primary'
  | 'secondary' 
  | 'sun'
  | 'fire'
  | 'water'
  | 'forest'
  | 'arcane'
  | 'text'
  | 'muted'
  | 'foreground'
  | 'accent'
  | 'error';


export type ParagraphShade =
  | 'white'
  | 'slate-100'
  | 'slate-200'
  | 'slate-300'
  | 'slate-400'
  | 'slate-500'
  | 'slate-600'
  | 'slate-700'
  | 'slate-800'
  | 'slate-900'
  | 'black';

export type ParagraphColor = ParagraphThemeColor | ParagraphShade;

@Component({
  selector: 'royal-code-ui-paragraph',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p [ngClass]="paragraphClasses()">
      @if (text() && text() !== '') {
        {{ text() }}
      } @else {
        <ng-content></ng-content>
      }
    </p>
  `,
  // De styles array kan leeg blijven als er geen component-specifieke stijlen zijn.
  // styles: []
})
export class UiParagraphComponent {
  // Inputs met signal-based API
  text = input<string>('');
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  centered = input<boolean>(false);

  /**
   * Kleur van de paragraaf.
   * Kan een themakleur zijn (e.g., 'primary', 'fire')
   * of een grijstint/shade (e.g., 'white', 'slate-500', 'black').
   * Indien niet gespecificeerd, wordt de standaard tekstkleur van de parent gebruikt.
   */
  color = input<ParagraphColor | undefined>(undefined);

  /**
   * Extra Tailwind CSS klassen die toegevoegd kunnen worden aan de paragraaf.
   * Bijvoorbeeld: "font-bold italic"
   */
  extraClasses = input<string>('');

  // Computed signal voor de klassen
  readonly paragraphClasses = computed(() => {
    const baseClasses: { [key: string]: boolean } = {
      'text-xs': this.size() === 'xs',
      'text-sm': this.size() === 'sm',
      'text-base': this.size() === 'md',
      'text-lg': this.size() === 'lg',
      'text-center': this.centered(),
    };

    const selectedColor = this.color();
    const colorClasses: { [key: string]: boolean } = {};

    if (selectedColor) {
      switch (selectedColor) {
        case 'primary':    colorClasses['text-[var(--color-primary)]'] = true; break;
        case 'sun':        colorClasses['text-[var(--color-theme-sun)]'] = true; break;
        case 'fire':       colorClasses['text-[var(--color-theme-fire)]'] = true; break;
        case 'water':      colorClasses['text-[var(--color-theme-water)]'] = true; break;
        case 'forest':     colorClasses['text-[var(--color-theme-forest)]'] = true; break;
        case 'arcane':     colorClasses['text-[var(--color-theme-arcane)]'] = true; break;
        case 'text':       colorClasses['text-[var(--color-text)]'] = true; break;
        case 'muted':      colorClasses['text-[var(--color-text-muted)]'] = true; break;
        case 'foreground': colorClasses['text-[var(--color-foreground)]'] = true; break;
        case 'accent':     colorClasses['text-[var(--color-accent)]'] = true; break;
        case 'white':      colorClasses['text-white'] = true; break;
        case 'slate-100':  colorClasses['text-slate-100'] = true; break;
        case 'slate-200':  colorClasses['text-slate-200'] = true; break;
        case 'slate-300':  colorClasses['text-slate-300'] = true; break;
        case 'slate-400':  colorClasses['text-slate-400'] = true; break;
        case 'slate-500':  colorClasses['text-slate-500'] = true; break;
        case 'slate-600':  colorClasses['text-slate-600'] = true; break;
        case 'slate-700':  colorClasses['text-slate-700'] = true; break;
        case 'slate-800':  colorClasses['text-slate-800'] = true; break;
        case 'slate-900':  colorClasses['text-slate-900'] = true; break;
        case 'black':      colorClasses['text-black'] = true; break;
      }
    }

    const combined: any = { ...baseClasses, ...colorClasses };

    const extras = this.extraClasses();
    if (extras) {
      extras.split(' ').forEach(cls => {
        if (cls.trim()) {
          combined[cls.trim()] = true;
        }
      });
    }
    return combined;
  });
}
