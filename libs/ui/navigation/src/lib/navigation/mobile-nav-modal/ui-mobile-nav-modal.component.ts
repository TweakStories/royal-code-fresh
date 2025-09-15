/**
 * @fileoverview Defines the mobile navigation modal/drawer component.
 * @version 2.6.0 (Design & Architecture Refactor)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-08-31
 * @Description
 *   Definitive version with corrected design and architecture.
 *   - Replaces native `<button>` with `<royal-code-ui-button>` for consistency.
 *   - Applies `rounded-xs` and theme-aware text colors (`text-foreground`).
 */
import { ChangeDetectionStrategy, Component, InputSignal, computed, input, output, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '@royal-code/ui/button'; // <-- Import UiButtonComponent

@Component({
  selector: 'royal-code-ui-mobile-nav-modal',
  standalone: true,
  imports: [CommonModule, UiIconComponent, TranslateModule, UiButtonComponent], // <-- Voeg UiButtonComponent toe
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 bg-black/50 z-40 animate-fade-in-fast" (click)="onBackdropClick($event)" aria-hidden="true"></div>
      <div [@slideInRight]
          class="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-background z-50 overflow-y-auto p-4 shadow-xl flex flex-col focus:outline-none"
          role="dialog" aria-modal="true" [attr.aria-labelledby]="'mobile-menu-title'">
          <div class="flex justify-between items-center mb-4 pb-3 border-b border-border flex-shrink-0">
              <!-- DE FIX: Gebruik ui-button -->
              <royal-code-ui-button
                type="transparent"
                sizeVariant="icon"
                (clicked)="goBack()"
                [attr.aria-label]="menuStack().length > 0 ? ('common.buttons.back' | translate) : ('common.buttons.close' | translate)">
                <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" />
              </royal-code-ui-button>
              <h2 id="mobile-menu-title" class="font-semibold text-base text-foreground truncate px-2">
                  {{ currentTitle() | translate }}
              </h2>
              <!-- DE FIX: Gebruik ui-button -->
              <royal-code-ui-button
                type="transparent"
                sizeVariant="icon"
                (clicked)="requestClose()"
                [attr.aria-label]="'common.buttons.close' | translate">
                <royal-code-ui-icon [icon]="AppIcon.X" />
              </royal-code-ui-button>
          </div>
          <div class="flex-grow overflow-y-auto -mx-4 px-4 min-h-0">
              <nav class="flex flex-col space-y-1">
                  @for (item of currentItems(); track trackItemId($index, item)) {
                      @if (item.displayHint?.includes(NavDisplayHintEnum.MobileModal)) {
                          @if (item.dividerBefore) { <hr class="my-2 border-border"> }
                          <!-- DE FIX: Volledig vervangen door ui-button voor consistentie en styling -->
                          <royal-code-ui-button
                            [type]="isActive(item) ? 'primary' : 'transparent'"
                            sizeVariant="md"
                            (clicked)="handleItemClick(item)"
                            extraClasses="!justify-start w-full !rounded-xs">
                              @if(item.icon; as iconName){
                                <royal-code-ui-icon [icon]="iconName" sizeVariant="sm" class="flex-shrink-0 mr-3"
                                  [ngClass]="{
                                    'text-primary-on': isActive(item),
                                    'text-secondary': !isActive(item)
                                  }"/>
                              } @else {
                                <span class="w-5 h-5 mr-3 flex-shrink-0"></span>
                              }
                              <span class="flex-grow truncate text-left">
                                  {{ item.labelKey | translate }}
                              </span>
                              @if (item.children && item.children.length > 0) {
                                <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" extraClass="text-secondary ml-auto flex-shrink-0"/>
                              }
                          </royal-code-ui-button>
                      }
                  }
              </nav>
           </div>
        </div>
    }
  `,
  animations: [
    trigger('slideInRight', [
        state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
        transition(':enter', [ animate('250ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateX(0)', opacity: 1 })) ]),
        transition(':leave', [ animate('200ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateX(100%)', opacity: 0 })) ])
    ])
  ],
})
export class UiMobileNavModalComponent {
  readonly AppIcon = AppIcon;
  readonly NavDisplayHintEnum = NavDisplayHintEnum;

  readonly menuItems: InputSignal<NavigationItem[]> = input.required<NavigationItem[]>();
  readonly isOpen: InputSignal<boolean> = input.required<boolean>();
  readonly closeRequested = output<void>();
  readonly navigationItemClicked = output<NavigationItem>();

  private readonly logger = inject(LoggerService, { optional: true });
  private readonly router = inject(Router);
  private readonly logPrefix = '[UiMobileNavModalComponent]';
  readonly menuStack = signal<NavigationItem[]>([]);

  readonly currentItems = computed(() => {
    const stack = this.menuStack();
    if (stack.length > 0) return stack[stack.length - 1].children ?? [];
    return this.menuItems() ?? [];
  });

  readonly currentTitle = computed(() => {
    const stack = this.menuStack();
    if (stack.length === 0) return 'navigation.menu';
    return stack[stack.length - 1].labelKey;
  });

  handleItemClick(item: NavigationItem): void {
    if (item.children && item.children.length > 0) {
      this.menuStack.update(stack => [...stack, item]);
    } else if (item.route) {
      this.navigationItemClicked.emit(item);
    }
  }

  goBack(): void {
    if (this.menuStack().length > 0) {
      this.menuStack.update(stack => stack.slice(0, -1));
    } else {
      this.requestClose();
    }
  }

  requestClose(): void {
    this.closeRequested.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  trackItemId(index: number, item: NavigationItem): number | string {
    return item.id ?? index;
  }

  isActive(item: NavigationItem): boolean {
    if (!item.route) return false;
    // Gebruik de queryParams van het item voor een preciezere check
    return this.router.isActive(this.router.createUrlTree(Array.isArray(item.route) ? item.route : [item.route], { queryParams: item.queryParams }).toString(), {
      paths: 'subset', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored'
    });
  }
}