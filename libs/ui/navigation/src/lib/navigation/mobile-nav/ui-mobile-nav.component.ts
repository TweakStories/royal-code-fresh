/**
 * @fileoverview Defines the bottom navigation bar component for mobile views.
 * Displays primary navigation items and a trigger for the main menu modal.
 * Prioritizes inline Tailwind utility classes for styling based on project guidelines.
 *
 * @Component UiMobileNavComponent
 * @description Renders a fixed bottom navigation bar visible only on smaller screens (md:hidden).
 *              Uses semantic Tailwind classes which utilize CSS variables defined in styles.scss for theming.
 */
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

@Component({
  selector: 'royal-code-ui-mobile-nav',
  standalone: true,
  imports: [RouterModule, UiIconComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
template: `
    <div class="fixed bottom-0 left-0 right-0 bg-background shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] border-t border-border md:hidden z-50 h-16">
      <nav class="container-max h-full px-1">
        <div class="flex justify-around items-stretch h-full">
          @for (item of menuItems(); track trackItemId($index, item)) {
             @if (item.displayHint?.includes(NavDisplayHintEnum.MobileBottom)) {
                 @if (item.menuType === 'dropdown') {
                    <button (click)="openMenuModalClicked.emit()" type="button" class="flex flex-1 flex-col items-center justify-center p-1 min-w-[60px] text-center text-muted-foreground rounded-md hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background group transition-colors duration-150" aria-label="Open main menu">
                       <royal-code-ui-icon [icon]="item.icon || AppIcon.Menu" sizeVariant="md" extraClass="mb-0.5 group-hover:scale-110 transition-transform"/>
                       <span class="text-[10px] leading-tight font-medium group-hover:text-primary">{{ item.labelKey | translate }}</span>
                    </button>
                 } @else if (item.route) {
                     <a [routerLink]="item.route" class="flex flex-1 flex-col items-center justify-center p-1 min-w-[60px] text-center text-muted-foreground rounded-md hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background group transition-colors duration-150" routerLinkActive="text-primary font-semibold" [routerLinkActiveOptions]="{exact: item.route === '/'}">
                        <royal-code-ui-icon [icon]="item.icon || AppIcon.CircleDot" sizeVariant="md" extraClass="mb-0.5 group-hover:scale-110 transition-transform"/>
                         <span class="text-[10px] leading-tight font-medium group-hover:text-primary">{{ item.labelKey | translate }}</span>
                     </a>
                 }
              }
          }
        </div>
      </nav>
    </div>
  `,
})
export class UiMobileNavComponent {
  /** Input signal providing the array of navigation items to display. */
  readonly menuItems: InputSignal<NavigationItem[]> = input.required<NavigationItem[]>();
  /** Output event emitter triggered when the user clicks the button intended to open the main menu modal. */
  readonly openMenuModalClicked = output<void>();

  /** Exposes the AppIcon enum to the template for fallback icons. */
  readonly AppIcon = AppIcon;
  /** Exposes the NavDisplayHintEnum to the template for display hint filtering. */
  readonly NavDisplayHintEnum = NavDisplayHintEnum;
  /** Optional logger injection. */
  private logger = inject(LoggerService, { optional: true });
  private readonly logPrefix = '[UiMobileNavComponent]';

  /**
   * TrackBy function for the @for loop to optimize rendering.
   * @param index - The index of the item in the array.
   * @param item - The NavigationItem object.
   * @returns A unique identifier (ID or index) for the item.
   */
  trackItemId(index: number, item: NavigationItem): number | string {
    return item.id ?? index;
  }
}