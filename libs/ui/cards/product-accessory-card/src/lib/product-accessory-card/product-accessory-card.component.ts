/**
 * @file product-accessory-card.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Een presentational component voor het weergeven van een enkel accessoire in een carousel.
 *   Het design is gebaseerd op de oorspronkelijke "Essential Accessories" sectie van de
 *   DroneExplanationPageComponent, met rechthoekige afbeeldingen en specifieke styling.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { ProductAccessoryCardData, TitleTypeEnum } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-product-accessory-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    UiImageComponent, UiTitleComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (accessory(); as acc) {
      <a [routerLink]="acc.route"
         class="snap-start flex-shrink-0 w-48 bg-surface border border-border rounded-lg shadow-sm hover:shadow-md transition-all group">
        <div class="h-32 w-full bg-muted rounded-t-lg overflow-hidden">
          <royal-code-ui-image
            [src]="acc.imageUrl"
            [alt]="acc.name"
            objectFit="cover"
            class="w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div class="p-4 text-center">
          <royal-code-ui-title
            [level]="TitleTypeEnum.H4"
            [text]="acc.name"
            extraClasses="!text-md !font-semibold !mb-2 group-hover:text-primary transition-colors truncate"
          />
        </div>
      </a>
    }
  `,
  styles: [`:host { display: block; height: 100%; }`]
})
export class UiProductAccessoryCardComponent {
  accessory = input.required<ProductAccessoryCardData>();
  protected readonly TitleTypeEnum = TitleTypeEnum;
}