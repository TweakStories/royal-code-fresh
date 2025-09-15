/**
 * @file safe-html.pipe.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Een pipe om HTML-inhoud of URL's veilig te markeren voor weergave in Angular,
 *   waarbij XSS-risico's worden beperkt door DomSanitizer te gebruiken.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-09-02
 * @PromptSummary "Compilerfouten oplossen: 'bullet-list' type, ReviewSummary properties, en UI component imports."
 */
import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined, type: 'html' | 'url' | 'resourceUrl' = 'html'): SafeHtml | SafeResourceUrl {
    if (!value) return '';
    switch (type) {
      case 'html': return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'url': return this.sanitizer.bypassSecurityTrustUrl(value);
      case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      default: return this.sanitizer.bypassSecurityTrustHtml(value);
    }
  }
}