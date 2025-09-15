// --- VERVANG VOLLEDIG BESTAND: libs/ui/products/src/lib/rtf-product-card/rtf-product-card.component.ts ---
/**
 * @file rtf-product-card.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Een presentational component voor het weergeven van een RTF (Ready-to-Fly) drone.
 *   Encapsuleert de layout met een afbeelding, titel, beschrijving, specificatielijst, prijs
 *   en een CTA-knop.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// UI Imports
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiListComponent, ListTypesEnum } from '@royal-code/ui/list';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { RtfProductCardData } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-rtf-product-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    UiCardComponent, UiImageComponent, UiTitleComponent, UiParagraphComponent,
    UiListComponent, UiIconComponent, UiButtonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product(); as p) {
      <royal-code-ui-card [rounding]="'lg'" extraContentClasses="!p-0 group-hover:border-primary">
        <a [routerLink]="p.route" class="block group">
          <royal-code-ui-image [src]="p.imageUrl" [alt]="p.nameKey | translate" [rounding]="'none'" extraClasses="!rounded-none !rounded-t-lg"/>
          <div class="p-6">
            <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="p.nameKey | translate" extraClasses="!mb-2" />
            <royal-code-ui-paragraph color="muted" size="sm" [text]="p.descriptionKey | translate" extraClasses="mb-4" />
            <royal-code-ui-list [listType]="ListTypesEnum.Custom" [list]="p.specs" [itemTemplate]="productSpecTemplate" />
            <div class="mt-6 flex justify-between items-center">
              <span class="text-2xl font-bold text-primary">{{p.price}}</span>
              <royal-code-ui-button type="default" extraClasses="group-hover:!bg-primary group-hover:!text-black">{{ 'droneshop.rtfDronesOverview.productCta' | translate }}</royal-code-ui-button>
            </div>
          </div>
        </a>
      </royal-code-ui-card>
    }

    <ng-template #productSpecTemplate let-specItem>
      <div class="flex items-start gap-3">
        <royal-code-ui-icon [icon]="specItem.icon" sizeVariant="sm" extraClass="flex-shrink-0 text-primary mt-1" />
        <royal-code-ui-paragraph size="sm" extraClasses="text-secondary">{{ specItem.textKey | translate }}</royal-code-ui-paragraph>
      </div>
    </ng-template>
  `,
  styles: [`:host { display: block; height: 100%; }`]
})
export class UiRtfProductCardComponent {
  product = input.required<RtfProductCardData>();
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly ListTypesEnum = ListTypesEnum;
}