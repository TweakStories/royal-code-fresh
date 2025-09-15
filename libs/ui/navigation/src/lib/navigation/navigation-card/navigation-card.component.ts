/**
 * @file ui-navigation-card.component.ts
 * @Version 7.2.0 (FIX: Hover Image Scale Animation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description
 *   Een conversie-geoptimaliseerde navigatiekaart die nu `queryParams` en `queryParamsHandling` ondersteunt.
 *   Deze versie implementeert de "scale on hover" animatie voor de afbeeldingen, consistent
 *   met de `UiCategoryCardComponent`, inclusief een fix voor de hover-afbeelding.
 */
import { ChangeDetectionStrategy, Component, InputSignal, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon, Image, NavigationItem, NavigationBadge } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiListComponent } from '@royal-code/ui/list';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';

@Component({
  selector: 'royal-code-ui-navigation-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiButtonComponent, UiImageComponent, UiListComponent, UiBadgeComponent, UiParagraphComponent],
  template: `
    <div
      class="navigation-card flex flex-col text-left bg-card border-2 border-black shadow-lg hover:border-primary transition-all duration-200 ease-out h-full group group-hover:scale-105"
      [ngClass]="{'cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background': !links()?.length}"
      (click)="onCardClick()"
      (mouseenter)="isHovering.set(true)"
      (mouseleave)="isHovering.set(false)"
      [attr.tabindex]="links()?.length ? null : '0'"
      role="group">

      <div class="overflow-hidden">
        @if (badges() && badges()!.length > 0) {
          <div class="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
            @for(badge of badges(); track badge.text) {
              <royal-code-ui-badge [color]="badge.color" [size]="badge.size || 'xs'">
                {{ badge.text }}
              </royal-code-ui-badge>
            }
          </div>
        }

        <div class="aspect-video w-full">
          <div class="relative h-full w-full bg-surface-alt rounded-none transition-transform duration-300">
            <!-- Standaard Afbeelding met schaal-animatie op hover -->
            <royal-code-ui-image
              [image]="image()"
              objectFit="cover"
              extraClasses="absolute inset-0 h-full w-full transition-opacity duration-500 group-hover:scale-110 transition-transform duration-500"
              [ngClass]="isHovering() && hoverImage() ? 'opacity-0' : 'opacity-100'"
              [rounding]="'none'" />

            <!-- Hover Afbeelding (rendert er bovenop) met schaal-animatie op hover -->
            @if (hoverImage()) {
              <royal-code-ui-image
                [image]="hoverImage()"
                objectFit="cover"
                extraClasses="absolute inset-0 h-full w-full transition-opacity duration-500 group-hover:scale-110 transition-transform duration-500"
                [ngClass]="isHovering() ? 'opacity-100' : 'opacity-0'"
                [rounding]="'none'" />
            }
          </div>
        </div>
      </div>

      <div class="flex-grow p-4 flex flex-col border-t-2 border-black">
        @if (titleKey(); as title) {
          <h3 class="text-md font-semibold text-text mb-2 group-hover:text-primary transition-colors">
            {{ title | translate }}
          </h3>
        }

        @if (description(); as desc) {
          <royal-code-ui-paragraph size="sm" color="muted" extraClasses="mb-3 line-clamp-2">
            {{ desc }}
          </royal-code-ui-paragraph>
        }

        @if (priceRangeKey(); as priceRange) {
           <p class="text-sm font-semibold text-foreground mb-3">{{ priceRange | translate }}</p>
        }

        <div class="mt-auto">
          @if (links() && links()!.length > 0) {
            <royal-code-ui-list
              [list]="links()!"
              [listType]="'text'"
              [displayPropertyKey]="'labelKey'"
              (itemClick)="onLinkClick($event)" />
          } @else {
            <royal-code-ui-button
              type="primary"
              sizeVariant="sm"
              [extraClasses]="'w-full rounded-none'"
              [attr.tabindex]="-1"
              class="pointer-events-none">
              {{ buttonTextKey() | translate }}
            </royal-code-ui-button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; height: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiNavigationCardComponent {
  readonly image: InputSignal<Image | undefined> = input<Image | undefined>(undefined);
  readonly hoverImage: InputSignal<Image | undefined> = input<Image | undefined>(undefined);
  readonly iconName: InputSignal<AppIcon | undefined> = input<AppIcon | undefined>(undefined);
  readonly titleKey: InputSignal<string | undefined> = input<string | undefined>(undefined);
  readonly description: InputSignal<string | undefined> = input<string | undefined>(undefined); 
  readonly buttonTextKey: InputSignal<string> = input<string>('common.buttons.explore');
  readonly routePath: InputSignal<string | string[] | undefined> = input<string | string[] | undefined>(undefined);
  readonly queryParams = input<{ [key: string]: any } | undefined>();
  readonly queryParamsHandling = input<'merge' | 'preserve' | ''>('');
  readonly links = input<NavigationItem[] | undefined>();

  readonly badges = input<NavigationBadge[] | undefined>();
  readonly priceRangeKey = input<string | undefined>();

  private readonly router = inject(Router);
  readonly isHovering = signal(false);

  onCardClick(): void {
    const route = this.routePath();
    if (route && (!this.links() || this.links()!.length === 0)) {
      this.router.navigate(Array.isArray(route) ? route : [route], { 
        queryParams: this.queryParams(),
        queryParamsHandling: this.queryParamsHandling() || null
      });
    }
  }

  onLinkClick(item: NavigationItem): void {
    if (item.route) {
      this.router.navigate(Array.isArray(item.route) ? item.route : [item.route], { 
        queryParams: item.queryParams,
        queryParamsHandling: item.queryParamsHandling || null
      });
    }
  }
}