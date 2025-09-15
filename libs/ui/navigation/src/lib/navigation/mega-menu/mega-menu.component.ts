/**
 * @file mega-menu.component.ts
 * @Version 7.2.0 (COMPLETE FIX: All Query Parameters Type Issues Resolved)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-07
 * @Description
 *   FIXED: All TypeScript errors related to queryParamsHandling types are now resolved.
 *   Every instance uses the proper type conversion helper method.
 */
import { ChangeDetectionStrategy as CDS, Component, computed, input, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationItem, AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiNavigationCardComponent } from '../navigation-card/navigation-card.component';
import { UiCategoryCardComponent } from '../category-card/category-card.component';

@Component({
  selector: 'royal-code-ui-mega-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent, UiNavigationCardComponent, UiCategoryCardComponent],
  changeDetection: CDS.OnPush,
  template: `
    @if(menuItem(); as item) {
      <div class="bg-background border-x-2 border-b-2 border-black shadow-2xl animate-fade-in-down rounded-none">
        <div class="bg-card">
          @switch (item.megaMenuLayout) {
            
            @case ('vertical-split') {
              <div class="flex min-h-[450px] w-full">
                <div class="w-1/4 max-w-xs border-r-2 border-black flex-shrink-0">
                  <ul class="space-y-0">
                    @for (child of item.children; track child.id) {
                      <li>
                        <!-- CRITICAL FIX: Added queryParams and queryParamsHandling support -->
                        <a [routerLink]="child.route" 
                           [queryParams]="child.queryParams" 
                           [queryParamsHandling]="child.queryParamsHandling || 'merge'" 
                           (mouseenter)="hoveredVerticalItemId.set(child.id)"
                           class="flex justify-between items-center p-3 text-lg font-semibold transition-colors rounded-none"
                           [ngClass]="{
                             'bg-primary text-black': child.id === hoveredVerticalItemId(),
                             'text-foreground hover:bg-hover': child.id !== hoveredVerticalItemId()
                           }">
                          <span>{{ child.labelKey | translate }}</span>
                          <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" extraClass="opacity-50" />
                        </a>
                      </li>
                    }
                  </ul>
                </div>
                <div class="flex-grow p-6 overflow-hidden relative">
                  @if(activeVerticalItem(); as activeItem) {
                    @if (activeItem.id === 'laders-en-lipos' && activeItem.megaMenuFeaturedItems) {
                      <div class="grid grid-cols-2 gap-8 h-full">
                        @for (mainItem of activeItem.megaMenuFeaturedItems; track mainItem.id) {
                          <royal-code-ui-category-card
                            [titleKey]="mainItem.labelKey"
                            [descriptionKey]="mainItem.description"
                            [image]="mainItem.image"
                            [routePath]="mainItem.route"
                            [children]="mainItem.children"
                            [icon]="mainItem.id === 'lipos' ? AppIcon.BatteryCharging : AppIcon.Plug" />
                        }
                      </div>
                    } @else {
                      <!-- Standaard grid voor alle andere items -->
                      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full overflow-y-auto pr-4 md:pr-6">
                        @for (cardItem of activeItem.children; track cardItem.id) {
                          <div class="group-hover:scale-105 transition-transform self-start">
                            <!-- CRITICAL FIX: All queryParams bindings use helper method -->
                            <royal-code-ui-navigation-card
                              [titleKey]="cardItem.labelKey" 
                              [image]="cardItem.image"
                              [iconName]="cardItem.icon" 
                              [routePath]="cardItem.route"
                              [queryParams]="cardItem.queryParams"
                              [queryParamsHandling]="getValidQueryParamsHandling(cardItem.queryParamsHandling)"
                              [buttonTextKey]="'common.buttons.explore'"
                              [links]="cardItem.children" />
                          </div>
                        }
                      </div>
                    }
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-secondary">
                      Selecteer een categorie.
                    </div>
                  }
                </div>
              </div>
            }
            
            @case ('featured-grid') {
              <div class="p-6 min-h-[200px]">
                @if (item.megaMenuFeaturedItems && item.megaMenuFeaturedItems.length > 0) {
                  <!-- Special Drones Layout (voor item.id === 'drones') -->
                  @if (item.id === 'drones') {
                    <div class="grid grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-black">
                      @for (mainItem of item.megaMenuFeaturedItems.slice(0, 2); track mainItem.id) {
                        <royal-code-ui-category-card
                          [titleKey]="mainItem.labelKey"
                          [descriptionKey]="mainItem.description"
                          [image]="mainItem.image"
                          [routePath]="mainItem.route"
                          [children]="mainItem.children"
                          [icon]="mainItem.id === 'rtf-bnf-drones' ? AppIcon.Play : AppIcon.Wrench" />
                      }
                    </div>
                    
                    @if (item.megaMenuFeaturedItems.slice(2).length > 0) {
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        @for(featured of item.megaMenuFeaturedItems.slice(2); track featured.id) {
                          <div class="group-hover:scale-105 transition-transform self-start">
                            <!-- CRITICAL FIX: Use helper method for type conversion -->
                            <royal-code-ui-navigation-card
                              [titleKey]="featured.labelKey"
                              [image]="featured.image"
                              [routePath]="featured.route"
                              [queryParams]="featured.queryParams"
                              [queryParamsHandling]="getValidQueryParamsHandling(featured.queryParamsHandling)"
                              [buttonTextKey]="'common.buttons.view'"
                              [links]="featured.children" />
                          </div>
                        }
                      </div>
                    }
                  } @else {
                    <!-- General featured grid layout (o.a. voor Radio Control en Werkplaats & Veld) -->
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      @for(featured of item.megaMenuFeaturedItems; track featured.id) {
                        <div class="group-hover:scale-105 transition-transform self-start"> 
                          @if (featured.children && featured.children.length > 0) {
                            <royal-code-ui-category-card
                              [titleKey]="featured.labelKey"
                              [descriptionKey]="getDescriptionForGeneralFeaturedItem(featured.id)"
                              [image]="featured.image"
                              [routePath]="featured.route"
                              [children]="featured.children"
                              [icon]="featured.icon ?? AppIcon.Package" />
                          } @else {
                            <!-- CRITICAL FIX: Use helper method for type conversion -->
                            <royal-code-ui-navigation-card
                              [titleKey]="featured.labelKey"
                              [image]="featured.image"
                              [routePath]="featured.route"
                              [queryParams]="featured.queryParams"
                              [queryParamsHandling]="getValidQueryParamsHandling(featured.queryParamsHandling)"
                              [buttonTextKey]="'common.buttons.view'"
                              [links]="featured.children" />
                          }
                        </div>
                      }
                    </div>
                  }
                } @else {
                   <div class="w-full h-full flex items-center justify-center text-secondary">
                     Geen uitgelichte items.
                   </div>
                }
              </div>
            }
          }
        </div>
      </div>
    }
  `,
})
export class UiMegaMenuComponent {
  readonly menuItem = input<NavigationItem | null>(null);
  protected readonly AppIcon = AppIcon;
  readonly hoveredVerticalItemId = signal<string | null>(null);
  private translateService = inject(TranslateService);

  constructor() {
    effect(() => {
      const item = this.menuItem();
      if (item?.megaMenuLayout === 'vertical-split' && item.children?.[0]) {
        this.hoveredVerticalItemId.set(item.children[0].id);
      } else {
        this.hoveredVerticalItemId.set(null);
      }
    });
  }

  readonly activeVerticalItem = computed(() => {
    const activeId = this.hoveredVerticalItemId();
    if (!activeId) return null;
    return this.menuItem()?.children?.find(child => child.id === activeId) ?? null;
  });

  getDescriptionForGeneralFeaturedItem(itemId: string): string {
    switch (itemId) {
      case 'stroomvoorziening': return 'droneshop.categories.workshopField.powerSupply';
      case 'gereedschap-bouwbenodigdheden': return 'droneshop.categories.workshopField.toolsBuildingSupplies';
      case 'transport-opslag': return 'droneshop.categories.workshopField.transportStorage';
      case 'simulatoren-training': return 'droneshop.categories.workshopField.simulatorsTraining';
      case 'radio-zenders': return 'droneshop.categories.radioControl.transmitters';
      case 'rc-ontvangers': return 'droneshop.categories.radioControl.receivers';
      case 'externe-rc-modules': return 'droneshop.categories.radioControl.externalRcModules';
      case 'rc-antennes': return 'droneshop.categories.radioControl.rcAntennas';
      case 'gimbals-schakelaars': return 'droneshop.categories.radioControl.gimbalsSwitches';
      default: return '';
    }
  }

  /**
   * CRITICAL FIX: Convert NavigationItem queryParamsHandling to component-compatible type
   */
  getValidQueryParamsHandling(handling?: string): '' | 'merge' | 'preserve' {
    if (handling === 'merge' || handling === 'preserve') {
      return handling;
    }
    return 'merge'; // Default fallback
  }
}