// --- VERVANG VOLLEDIG BESTAND: libs/ui/card/src/lib/item-carousel/item-carousel.component.ts ---
/**
 * @file item-carousel.component.ts
 * @Version 4.0.1 (Definitive, Template-driven Content & Generic List, in ui/card)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description A reusable component for displaying a horizontal scrolling list of various items.
 *              Now supports a customizable `itemTemplate` for flexible content rendering,
 *              similar to UiListComponent. Resides in `@royal-code/ui/cards/card`.
 */
import { Component, ChangeDetectionStrategy, input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { ItemCarouselItem, TitleTypeEnum } from '@royal-code/shared/domain';
import { UiImageComponent } from '@royal-code/ui/media';

@Component({
  selector: 'royal-code-ui-item-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiTitleComponent, UiImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-8" [attr.aria-labelledby]="titleKey()">
      @if (titleKey()) {
        <header class="mb-4">
          <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="titleKey() | translate" [id]="titleKey()" />
        </header>
      }
      <div class="scroller relative">
        <div class="scroller__inner flex gap-4 sm:gap-6 overflow-x-auto pb-4 -mb-4 snap-x snap-mandatory">
          @for (item of items(); track trackByFn(item)) {
            <!-- Als er een custom template is, gebruik die -->
            @if (itemTemplate()) {
              <ng-container
                [ngTemplateOutlet]="itemTemplate()"
                [ngTemplateOutletContext]="{$implicit: item}"
              ></ng-container>
            } @else {
              <!-- Anders, gebruik een standaardweergave met routerLink indien beschikbaar -->
              @if (item.route) {
                <a [routerLink]="item.route"
                   class="snap-start flex-shrink-0 w-32 sm:w-40 text-center group/item focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xs"
                   [attr.aria-label]="item.name">
                  <div class="relative w-full aspect-square mb-2">
                    <div class="absolute inset-0 rounded-full border-2 border-border group-hover/item:border-primary transition-colors duration-200"></div>
                    <div class="p-1 w-full h-full">
                      <royal-code-ui-image
                        [src]="item.imageUrl"
                        [alt]="item.name"
                        rounding="full"
                        objectFit="cover"
                        class="transition-transform duration-200 group-hover/item:scale-105"
                      />
                    </div>
                  </div>
                  <span class="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">{{ item.name }}</span>
                </a>
              } @else {
                <!-- Of een simpele div als er geen route is -->
                <div class="snap-start flex-shrink-0 w-32 sm:w-40 text-center group/item">
                  <div class="relative w-full aspect-square mb-2">
                    <div class="absolute inset-0 rounded-full border-2 border-border"></div>
                    <div class="p-1 w-full h-full">
                      <royal-code-ui-image
                        [src]="item.imageUrl"
                        [alt]="item.name"
                        rounding="full"
                        objectFit="cover"
                      />
                    </div>
                  </div>
                  <span class="text-sm font-semibold text-foreground">{{ item.name }}</span>
                </div>
              }
            }
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .scroller__inner::-webkit-scrollbar { height: 8px; }
    .scroller__inner::-webkit-scrollbar-track { background: transparent; }
    .scroller__inner::-webkit-scrollbar-thumb { background-color: var(--color-border); border-radius: 20px; }
    .scroller__inner::-webkit-scrollbar-thumb:hover { background-color: var(--color-secondary); }
  `]
})
export class ItemCarouselComponent {
  readonly titleKey = input<string | undefined>();
  readonly items = input.required<ItemCarouselItem[]>();
  readonly itemTemplate = input<TemplateRef<any> | undefined>();

  protected readonly TitleTypeEnum = TitleTypeEnum;

  trackByFn(item: ItemCarouselItem): string {
    return item.id;
  }
}