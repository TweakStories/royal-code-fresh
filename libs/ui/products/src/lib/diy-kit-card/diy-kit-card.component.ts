/**
 * @file diy-kit-card.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Een presentational component specifiek voor het weergeven van een "Build-It-Yourself"
 *   drone kit op de overzichtspagina. Toont de belangrijkste features en een
 *   directe, hardcoded link naar de product detail/configuratie pagina.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiListComponent, ListTypesEnum } from '@royal-code/ui/list';
import { DiyKitProductCardData } from '@royal-code/features/products/domain'; // <<< CORRECTE IMPORT

@Component({
  selector: 'droneshop-diy-kit-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    UiTitleComponent, UiParagraphComponent, UiImageComponent,
    UiButtonComponent, UiIconComponent, UiListComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (kit(); as k) {
      <div class="h-full bg-card border-2 border-black shadow-lg hover:shadow-primary/20 hover:border-primary transition-all duration-300 flex flex-col group">
        <div class="relative w-full aspect-[4/3] overflow-hidden">
          <royal-code-ui-image [src]="k.imageUrl" [alt]="k.nameKey | translate" objectFit="cover" extraClasses="w-full h-full group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div class="p-4 flex flex-col flex-grow">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="k.nameKey | translate" extraClasses="!mb-2" />
          <royal-code-ui-paragraph color="muted" size="sm" [text]="k.descriptionKey | translate" extraClasses="mb-4" />
          
          <div class="flex-grow"></div>

          <div class="space-y-4 my-4">
             <royal-code-ui-list [listType]="ListTypesEnum.Custom" [list]="k.features" [itemTemplate]="featureTemplate" />
          </div>

          <a [routerLink]="k.route" class="mt-auto">
            <royal-code-ui-button type="primary" sizeVariant="md" extraClasses="w-full rounded-none" [enableNeonEffect]="true">
              {{ 'droneshop.diyKitsOverview.productCardCta' | translate }}
            </royal-code-ui-button>
          </a>
        </div>
      </div>
    }

    <ng-template #featureTemplate let-feature>
      <div class="flex items-start gap-3">
        <royal-code-ui-icon [icon]="feature.icon" sizeVariant="sm" extraClass="flex-shrink-0 text-primary mt-1" />
        <royal-code-ui-paragraph size="sm" extraClasses="text-secondary">{{ feature.textKey | translate }}</royal-code-ui-paragraph>
      </div>
    </ng-template>
  `,
  styles: [`:host { display: block; height: 100%; }`]
})
export class DiyKitCardComponent {
  kit = input.required<DiyKitProductCardData>();
  
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly ListTypesEnum = ListTypesEnum;
}