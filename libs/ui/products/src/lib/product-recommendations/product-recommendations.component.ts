/**
 * @file product-recommendations.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description
 *   Een slimme component die een lijst met aanbevolen producten ophaalt en weergeeft
 *   in een horizontaal scrollende carousel met ProductHeroCardComponent's.
 */
import { Component, ChangeDetectionStrategy, inject, Input, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductFacade } from '@royal-code/features/products/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { ProductHeroCardComponent } from '../product-hero-card/product-hero-card.component';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'royal-code-ui-product-recommendations',
  standalone: true,
  imports: [CommonModule, UiTitleComponent, ProductHeroCardComponent, UiSpinnerComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <section class="py-8" [attr.aria-labelledby]="title || 'recommendations-title'">
      <royal-code-ui-title
        [level]="TitleTypeEnum.H2"
        [text]="title"
        id="recommendations-title"
        extraClasses="text-center !mb-6"
      />
      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <royal-code-ui-spinner size="lg" />
        </div>
      } @else if (recommendations().length > 0) {
        <div class="relative">
          <div class="flex gap-4 overflow-x-auto pb-4 -mb-4 snap-x snap-mandatory">
            @for (product of recommendations(); track product.id) {
              <div class="snap-start flex-shrink-0 w-64 sm:w-72 md:w-80">
                <royal-code-ui-product-hero-card [productInput]="product" />
              </div>
            }
          </div>
        </div>
      } @else {
        <p class="text-center text-secondary">{{ 'products.noRecommendations' | translate }}</p>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    /* Voegt scrollbar styling toe voor betere UX op desktop */
    div[overflow-x-auto]::-webkit-scrollbar { height: 8px; }
    div[overflow-x-auto]::-webkit-scrollbar-track { background: var(--color-surface); }
    div[overflow-x-auto]::-webkit-scrollbar-thumb { background-color: var(--color-border); border-radius: 20px; border: 2px solid var(--color-surface); }
    div[overflow-x-auto]::-webkit-scrollbar-thumb:hover { background-color: var(--color-secondary); }
  `]
})
export class ProductRecommendationsComponent implements OnInit {
  private readonly productFacade = inject(ProductFacade);

  @Input() title: string = 'Anderen bekeken ook';
  @Input() limit: number = 8; // De API endpoint parameter heet 'Limit', maar hier noemen we het 'count'
  
  readonly recommendations = this.productFacade.recommendations;
  readonly isLoading = this.productFacade.isLoading;
  readonly TitleTypeEnum = TitleTypeEnum;

  ngOnInit(): void {
    // Roep de facade aan om het laden van aanbevelingen te starten.
    // De 'limit' input wordt momenteel niet doorgegeven aan de facade/API,
    // maar dit kan in de toekomst worden uitgebreid in de action/effect.
    this.productFacade.loadRecommendations();
  }
}