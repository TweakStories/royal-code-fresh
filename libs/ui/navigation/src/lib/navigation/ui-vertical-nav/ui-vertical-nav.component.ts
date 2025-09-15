/**
 * @file ui-vertical-nav.component.ts
 * @Version 9.2.0 (Definitive NG0955 TrackBy Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Vertical navigation component with a definitive fix for the NG0955 error
 *   by implementing a strict trackBy function based on the unique item.id.
 */
import { Component, ChangeDetectionStrategy, input, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavigationItem, AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { StorageService } from '@royal-code/core/storage';

const NAV_EXPANDED_STATE_KEY = 'admin_nav_expanded_items';

@Component({
  selector: 'royal-code-ui-vertical-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent],
  template: `
    <nav class="p-2 space-y-1">
      <!-- DE FIX: Gebruik track trackById om de NG0955 fout op te lossen -->
      @for(item of items(); track trackById($index, item)) {
        @if(item.dividerBefore) {
          <hr class="my-2 border-border" />
        }
        @if(item.isSectionHeader) {
          <h3 class="px-3 pt-4 pb-1 text-xs font-semibold uppercase text-secondary">
            {{ item.labelKey | translate }}
          </h3>
        } @else {
          <!-- Main link container -->
          <a [routerLink]="item.children && item.children.length > 0 ? null : item.route"
             (click)="handleItemClick(item, $event)"
             class="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors w-full cursor-pointer"
             [ngClass]="getLinkClasses(item)">
            
            @if(item.icon) {
              <royal-code-ui-icon [icon]="item.icon" sizeVariant="sm" />
            }
            <span class="flex-grow">{{ item.labelKey | translate }}</span>
            
            @if (item.children && item.children.length > 0) {
              <royal-code-ui-icon
                [icon]="AppIcon.ChevronRight"
                sizeVariant="sm"
                class="transition-transform duration-200"
                [ngClass]="{ 'rotate-90': isExpanded(item.id) }"
              />
            }
          </a>

          @if (item.children && item.children.length > 0 && isExpanded(item.id)) {
            <ul class="ml-4 mt-1 pl-3 border-l border-border space-y-1 animate-fade-in-fast">
              @for (child of item.children; track trackById($index, child)) {
                <li>
                  <a [routerLink]="child.route"
                     [routerLinkActiveOptions]="{ exact: true }"
                     routerLinkActive="!bg-hover !text-foreground font-semibold"
                     class="flex items-center gap-3 px-3 py-2 text-sm rounded-xs transition-colors w-full text-muted-foreground hover:bg-hover hover:text-foreground">
                    <span>{{ child.labelKey | translate }}</span>
                  </a>
                </li>
              }
            </ul>
          }
        }
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiVerticalNavComponent {
  items = input.required<NavigationItem[]>();
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  protected readonly AppIcon = AppIcon;

  private expandedItems = signal<Set<string>>(new Set());
  private currentUrl = signal(this.router.url);

  constructor() {
    const storedExpandedItems = this.storageService.getItem<string[]>(NAV_EXPANDED_STATE_KEY);
    if (storedExpandedItems) {
      this.expandedItems.set(new Set(storedExpandedItems));
    }

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });

    effect(() => {
      const items = this.items(); 
      this.currentUrl(); 
      
      if (!items) return;
      
      const newSet = new Set(this.expandedItems());
      let changed = false;
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          const shouldBeExpanded = this.isParentOrChildActive(item);
          if (shouldBeExpanded && !newSet.has(item.id)) {
            newSet.add(item.id);
            changed = true;
          }
        }
      }
      
      if (changed) {
        this.expandedItems.set(newSet);
      }
      
      this.storageService.setItem(NAV_EXPANDED_STATE_KEY, Array.from(this.expandedItems()));
    });
  }
  
  // DE FIX: trackBy functie die de unieke item.id gebruikt
  trackById(index: number, item: NavigationItem): string {
    return item.id;
  }

  getLinkClasses(item: NavigationItem): Record<string, boolean> {
    const isActive = this.isParentOrChildActive(item);
    return {
      'bg-primary text-black rounded-xs': isActive && item.id !== 'logout',
      'bg-surface-alt font-semibold rounded-xs': isActive && item.id === 'logout',
      'text-muted-foreground hover:bg-hover hover:text-foreground rounded-md': !isActive && item.id !== 'logout',
      'text-muted-foreground hover:bg-error/10 hover:text-error rounded-md': !isActive && item.id === 'logout',
    };
  }

  handleItemClick(item: NavigationItem, event: MouseEvent): void {
    if (item.children && item.children.length > 0) {
      event.preventDefault();
      this.toggleExpand(item.id);
    } else if (item.route) {
      this.router.navigate(Array.isArray(item.route) ? item.route : [item.route]);
    }
  }

  isParentOrChildActive(item: NavigationItem): boolean {
    const currentUrl = this.currentUrl();
    const isParentActive = item.route ? this.router.isActive(item.route as string, { paths: 'exact', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' }) : false;
    if (isParentActive && (!item.children || item.children.length === 0)) return true;
    if (item.children) return item.children.some(child => child.route ? this.router.isActive(child.route as string, { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' }) : false);
    return false;
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }

  private toggleExpand(itemId: string): void {
    this.expandedItems.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(itemId)) newSet.delete(itemId); else newSet.add(itemId);
      return newSet;
    });
  }
}