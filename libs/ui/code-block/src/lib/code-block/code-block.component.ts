/**
 * @file code-block.component.ts (Shared UI)
 * @description Een component voor het weergeven van code met syntax highlighting via direct highlight.js aanroep.
 *              Deze versie bevat een definitieve fix voor de tekst-overflow en line-break problemen.
 */
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, PLATFORM_ID, inject, OnChanges, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Belangrijk: Geen import van highlight.js hier, we vertrouwen op globale 'hljs'
declare const hljs: any; 

// << DE ABSOLUTE, DEFINITIEVE FIX >>
export type CodeBlockLanguage =
  | 'typescript'
  | 'csharp'
  | 'powershell'
  | 'json'
  | 'html'
  | 'mermaid'
  | 'cli'
  | 'css'; // << DE FIX: 'css' toegevoegd


@Component({
  selector: 'royal-code-ui-code-block',
  standalone: true,
  imports: [],
  template: `
    <pre><code #codeElement [class]="'language-' + language()"></code></pre>
  `,
  styles: [`
    :host { display: block; }
    /* Definitive fix for overflow and line breaks */
    code.hljs {
      @apply p-4 rounded-md bg-background border border-border text-xs !important;
      font-family: 'Fira Code', 'JetBrains Mono', monospace !important;
      white-space: pre-wrap !important;
      word-break: break-word !important;
      overflow-wrap: break-word !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent implements AfterViewInit, OnChanges {
  // << DE FIX: language input gebruikt nu de nieuwe CodeBlockLanguage type >>
  code = input.required<string>();
  language = input<CodeBlockLanguage>('typescript'); // << DE FIX: Type is nu CodeBlockLanguage

  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly platformId: Object;
  private codeElement: HTMLElement | null = null;

  constructor () {
    this.platformId = inject(PLATFORM_ID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] || changes['language']) {
      this.highlightCode();
    }
  }

  ngAfterViewInit(): void {
    this.codeElement = this.el.nativeElement.querySelector('code');
    this.highlightCode();
  }

  private highlightCode(): void {
    if (isPlatformBrowser(this.platformId) && this.codeElement && typeof hljs !== 'undefined') {
      this.codeElement.textContent = this.code();
      this.codeElement.className = 'language-' + this.language();

      try {
        hljs.highlightElement(this.codeElement);
      } catch (e) {
        console.error('Highlight.js failed to highlight code:', e);
        this.codeElement.innerHTML = `<pre>${this.code()}</pre>`;
      }
    } else if (this.codeElement) {
        this.codeElement.textContent = this.code();
    }
  }
}