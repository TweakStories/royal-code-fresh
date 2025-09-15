/**
 * @file ui-category-card.component.ts
 * @Version 1.2.0 (CRITICAL FIX: Query Parameters Support for Navigation)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-07
 * @Description
 *   FIXED: Category card component now properly supports query parameters for
 *   navigation links, enabling correct category filtering.
 */
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppIcon, Image, NavigationItem } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiImageComponent } from '@royal-code/ui/media';

@Component({
  selector: 'royal-code-ui-category-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent, UiImageComponent],
  template: `
    <div class="category-card bg-card border-2 border-black shadow-lg hover:border-primary hover:shadow-xl transition-all duration-200 ease-out h-full group cursor-pointer overflow-hidden"
         (click)="onCardClick()"
         tabindex="0"
         role="button">
      
      <!-- Full-width image tegen de top (geen rounding) -->
      <div class="w-full h-48 bg-surface-alt overflow-hidden relative">
        @if (image(); as img) {
          <royal-code-ui-image 
            [image]="img" 
            objectFit="cover" 
            extraClasses="h-full w-full group-hover:scale-110 transition-transform duration-500" 
            [rounding]="'none'" />
        } @else {
          <div class="h-full flex items-center justify-center text-primary bg-gradient-to-br from-primary/5 to-primary/15 group-hover:scale-110 transition-transform duration-500">
            <royal-code-ui-icon [icon]="icon()" sizeVariant="xl" />
          </div>
        }
        <!-- Subtle overlay voor betere tekst leesbaarheid -->
        <div class="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-200"></div>
      </div>
      
      <!-- Content section -->
      <div class="p-6">
        <!-- Title -->
        @if (titleKey(); as title) {
          <h3 class="text-2xl font-bold text-primary mb-3 group-hover:text-primary-dark transition-colors">
            {{ title | translate }}
          </h3>
        }
        
        <!-- Apple-style description -->
        @if (descriptionKey(); as descKey) {
          <p class="text-base text-secondary mb-4 leading-relaxed">
            {{ descKey | translate }}
          </p>
        }
        
        <!-- Bullet points -->
        @if (children() && children()!.length > 0) {
          <ul class="space-y-3">
            @for (child of children(); track child.id) {
              <li class="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-all duration-200 group/item">
                <div class="w-2 h-2 bg-primary rounded-full flex-shrink-0 group-hover/item:scale-125 group-hover/item:bg-primary-dark transition-all duration-200"></div>
                <!-- CRITICAL FIX: Added queryParams and queryParamsHandling support -->
                <a [routerLink]="child.route" 
                   [queryParams]="child.queryParams"
                   [queryParamsHandling]="child.queryParamsHandling || 'merge'"
                   (click)="$event.stopPropagation()" 
                   class="hover:underline hover:translate-x-1 transition-all duration-200">
                  {{ child.labelKey | translate }}
                </a>
              </li>
            }
          </ul>
        }

        <!-- View all link -->
        <div class="mt-6 pt-4 border-t border-border">
          <!-- CRITICAL FIX: Added queryParams support to main navigation link -->
          <a [routerLink]="routePath()" 
             [queryParams]="queryParams()"
             [queryParamsHandling]="queryParamsHandling() || 'merge'"
             class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-all duration-200 hover:translate-x-1">
            <span>Bekijk alle</span>
            <royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="sm" extraClass="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; height: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCategoryCardComponent {
  readonly image = input<Image | undefined>(undefined);
  readonly icon = input<AppIcon>(AppIcon.Package);
  readonly titleKey = input<string | undefined>(undefined);
  readonly descriptionKey = input<string | undefined>(undefined);
  readonly routePath = input<string | string[] | undefined>(undefined);
  readonly children = input<NavigationItem[] | undefined>(undefined);
  
  // CRITICAL FIX: Added query parameters support
  readonly queryParams = input<{ [key: string]: any } | undefined>(undefined);
  readonly queryParamsHandling = input<'merge' | 'preserve' | 'replace' | ''>('merge');
  
  protected readonly AppIcon = AppIcon;
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  onCardClick(): void {
    const route = this.routePath();
    if (route) {
      // CRITICAL FIX: Use queryParams when navigating programmatically
      this.router.navigate(Array.isArray(route) ? route : [route], {
        queryParams: this.queryParams(),
        queryParamsHandling: this.queryParamsHandling() || 'merge'
      });
    }
  }
}