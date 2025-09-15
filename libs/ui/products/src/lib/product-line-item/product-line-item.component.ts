// --- VERVANG VOLLEDIG BESTAND: libs/ui/products/src/lib/product-line-item/product-line-item.component.ts ---
/**
 * @file product-line-item.component.ts
 * @Version 1.1.0 (Fixed: Quantity Badge Visibility & Rounded-xs Borders)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Een herbruikbare presentational component voor het weergeven van een enkel
 *   productregelitem in een lijst (bijv. winkelwagen, orderoverzicht).
 *   Inclusief afbeelding (met fallback naar icoon en rand), naam, hoeveelheid en prijs.
 *   Nu met correcte weergave van de hoeveelheids-badge en `rounded-xs` styling.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// UI Imports
import { UiImageComponent } from '@royal-code/ui/media';
import { ProductLineItemData, TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';


@Component({
  selector: 'royal-code-ui-product-line-item',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, CurrencyPipe,
    UiImageComponent, UiParagraphComponent, UiIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (item(); as i) {
      <div class="flex items-center gap-4">
        <a [routerLink]="i.route || (i.productId ? ['/products', i.productId] : null)" 
           class="relative h-16 w-16 flex-shrink-0 block rounded-xs border border-border bg-muted group/line-item"> <!-- FIX: rounded-xs en overflow-hidden verwijderd -->
          @if (i.imageUrl) {
            <royal-code-ui-image [src]="i.imageUrl" [alt]="i.name" objectFit="cover" [rounding]="'xs'" class="w-full h-full transition-transform duration-200 group-hover/line-item:scale-105" /> <!-- FIX: [rounding]="'xs'" toegevoegd -->
          } @else {
            <div class="w-full h-full flex items-center justify-center text-muted-foreground bg-muted rounded-xs"> <!-- FIX: rounded-xs -->
              <royal-code-ui-icon [icon]="AppIcon.ImageOff" sizeVariant="md" />
            </div>
          }
          <span class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-on text-xs font-bold">
            {{ i.quantity }}
          </span>
        </a>
        <div class="flex-grow">
          <a [routerLink]="i.route || (i.productId ? ['/products', i.productId] : null)">
            <royal-code-ui-paragraph size="sm" extraClasses="font-semibold hover:text-primary transition-colors line-clamp-2">
              {{ i.name }}
            </royal-code-ui-paragraph>
          </a>
        </div>
        <div class="flex-shrink-0 text-sm font-medium">
          {{ i.lineTotal | currency:'EUR' }}
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class UiProductLineItemComponent {
  item = input.required<ProductLineItemData>();
  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;
}