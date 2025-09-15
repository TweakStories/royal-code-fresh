/**
 * @file dynamic-title.directive.ts
 * @Version 1.2.0 (Definitive Content Projection Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-18
 * @Description Angular directive to dynamically render an HTML element with a specified tag
 *              (e.g., h1-h6, p) and set its text content. This directive allows for
 *              semantic flexibility in components that need to display titles or text
 *              blocks where the exact HTML tag might vary based on input.
 *              It correctly prioritizes projected content (via ng-content in the host component)
 *              over its 'textContentForDirective' input by robustly detecting meaningful projected content.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-18
 * @PromptSummary Fixed `DynamicTitleDirective` to correctly detect meaningful projected content by filtering out Angular's internal ng-container and comment nodes, resolving issues with empty paragraphs and titles.
 */
import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  AfterContentChecked,
  inject
} from '@angular/core';

@Directive({
  selector: '[libRoyalCodeDynamicTitle]',
  standalone: true,
})
export class DynamicTitleDirective implements OnChanges, AfterContentChecked {
  /**
   * @Input tag
   * @description The HTML tag to be rendered (e.g., 'h1', 'h2', 'p').
   * Defaults to 'p' if not specified.
   */
  @Input() tag: string = 'p';

  /**
   * @Input textContentForDirective
   * @description The text content to be displayed within the dynamic tag,
   *              but only if no *meaningful* content is projected into the host element via ng-content.
   */
  @Input() textContentForDirective: string = '';

  private hostElement: HTMLElement;
  private dynamicallyCreatedElement: HTMLElement | null = null;
  private previousTag: string = '';
  private previousTextContent: string = '';
  private hasMeaningfulProjectedContentCache: boolean | undefined = undefined;

  private elementRef = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);

  constructor() {
    this.hostElement = this.elementRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update if tag or text content input changes.
    // The actual rendering logic is deferred to AfterContentChecked to ensure
    // ng-content has been processed.
    if (changes['tag'] || changes['textContentForDirective']) {
      // Mark cache as dirty so AfterContentChecked will re-evaluate
      this.hasMeaningfulProjectedContentCache = undefined;
      // If tag changes, we must recreate the element.
      if (changes['tag'] && changes['tag'].currentValue !== changes['tag'].previousValue) {
        this.recreateDynamicElement();
      }
    }
  }

  ngAfterContentChecked(): void {
    // This hook runs after ng-content has been checked.
    // It's a suitable place to check for projected content and update text.
    const currentMeaningfulProjectedContent = this.checkForMeaningfulProjectedContent();

    if (this.hasMeaningfulProjectedContentCache === undefined ||
        this.hasMeaningfulProjectedContentCache !== currentMeaningfulProjectedContent ||
        this.previousTextContent !== this.textContentForDirective ||
        !this.dynamicallyCreatedElement || // Element might have been recreated
        (this.dynamicallyCreatedElement && this.dynamicallyCreatedElement.tagName.toLowerCase() !== this.tag.toLowerCase()) // Tag might have changed
       ) {

      this.hasMeaningfulProjectedContentCache = currentMeaningfulProjectedContent;
      this.previousTextContent = this.textContentForDirective;

      if (!this.dynamicallyCreatedElement || this.dynamicallyCreatedElement.tagName.toLowerCase() !== this.tag.toLowerCase()) {
        this.recreateDynamicElement();
      }
      this.updateElementContent();
    }
  }

  /**
   * @method recreateDynamicElement
   * @description Removes the existing dynamically created element (if any) and creates a new one
   *              with the current `tag`. This is called when the `tag` input changes.
   * @private
   */
  private recreateDynamicElement(): void {
    if (this.dynamicallyCreatedElement && this.hostElement.contains(this.dynamicallyCreatedElement)) {
      this.renderer.removeChild(this.hostElement, this.dynamicallyCreatedElement);
    }
    this.dynamicallyCreatedElement = this.renderer.createElement(this.tag.toLowerCase());
    this.renderer.appendChild(this.hostElement, this.dynamicallyCreatedElement);
    this.previousTag = this.tag.toLowerCase();
  }

  /**
   * @method checkForMeaningfulProjectedContent
   * @description Determines if there is *meaningful* content projected into the host element.
   *              Ignores Angular's internal comment nodes and empty text nodes or structural element wrappers.
   * @returns {boolean} True if meaningful projected content is found, false otherwise.
   * @private
   */
  private checkForMeaningfulProjectedContent(): boolean {
    const childNodes = Array.from(this.hostElement.childNodes);
    for (const node of childNodes) {
      // Ignore the element created by this directive itself.
      if (node === this.dynamicallyCreatedElement) {
        continue;
      }

      // Ignore Angular's internal comment nodes (e.g., <!--container--> from ng-content)
      if (node.nodeType === Node.COMMENT_NODE) {
        continue;
      }

      // If it's a text node, check if it contains actual non-whitespace content.
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent && node.textContent.trim().length > 0) {
          return true; // Found meaningful text content
        }
        continue; // Ignore empty text nodes (e.g., just whitespace)
      }

      // If it's an element node, check if it's not an Angular internal structural element
      // (like ng-container or ng-template) and if it contains any content.
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = (node as HTMLElement).tagName.toLowerCase();
        // Explicitly ignore common Angular structural elements that might be empty wrappers
        if (tagName === 'ng-container' || tagName === 'ng-template' || tagName.startsWith('ng-')) {
          continue;
        }
        // For other actual element nodes, assume it's meaningful projected content
        // if it has children or non-whitespace text content itself.
        const element = node as HTMLElement;
        if (element.children.length > 0 || (element.textContent ?? '').trim().length > 0) {
            return true;
        }
      }
    }
    return false;
  }

  /**
   * @method updateElementContent
   * @description Sets the textContent of the dynamically created element, but only if
   *              no *meaningful* content has been projected into the host element.
   * @private
   */
  private updateElementContent(): void {
    if (!this.dynamicallyCreatedElement) {
      return;
    }

    if (this.hasMeaningfulProjectedContentCache) {
      // If there's meaningful projected content, clear our dynamic element's text.
      // The projected content should then be rendered by Angular directly into this element.
      // We only clear if there's actual text to clear to avoid unnecessary DOM operations.
      if (this.dynamicallyCreatedElement.textContent !== '') {
        this.renderer.setProperty(this.dynamicallyCreatedElement, 'textContent', '');
      }
    } else {
      // No meaningful projected content, so use textContentForDirective.
      // Only update if the content has actually changed to avoid unnecessary DOM operations.
      if (this.dynamicallyCreatedElement.textContent !== this.textContentForDirective) {
        this.renderer.setProperty(
          this.dynamicallyCreatedElement,
          'textContent',
          this.textContentForDirective
        );
      }
    }
  }
}