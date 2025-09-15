/**
 * @file ui-desktop-nav.component.ts
 * @Version 3.2.0 (FIX: Active Link Styling & Routing)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-10
 * @Description
 *   FIXED: De styling voor actieve navigatielinks is gecorrigeerd. De component
 *   gebruikt nu een template reference variable (#rla) met `routerLinkActive` en een
 *   conditionele `[ngClass]` om de correcte tekstkleur toe te passen. Dit lost
 *   CSS-conflicten op waarbij de basisklasse `text-foreground` de `active`
 *   status (`text-primary`) overschreef. Daarnaast is `routerLinkActiveOptions`
 *   toegevoegd om de 'Home'-knop correct af te handelen.
 */
import { ChangeDetectionStrategy, Component, computed, input, booleanAttribute } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';

@Component({
  selector: 'royal-code-ui-desktop-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul [ngClass]="listClasses()">
      @for (item of menuItems(); track item.id) {
        @if (item.displayHint?.includes(NavDisplayHintEnum.Desktop)) {
          <li>
            <a
              [routerLink]="item.route"
              [queryParams]="item.queryParams"
              [queryParamsHandling]="item.queryParamsHandling || 'merge'"
              routerLinkActive
              #rla="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: item.route === '/' }"
              class="flex items-center gap-2 transition-colors duration-200 font-semibold"
              [ngClass]="{
                'text-primary': rla.isActive,
                'text-xs text-secondary hover:text-foreground': isSubtle() && !rla.isActive,
                'text-sm text-foreground hover:text-primary': !isSubtle() && !rla.isActive
              }"
              [attr.aria-label]="item.labelKey | translate">
              @if (item.icon) {
                <royal-code-ui-icon [icon]="item.icon" sizeVariant="sm" />
              }
              <span>{{ item.labelKey | translate }}</span>
            </a>
          </li>
        }
      }
    </ul>
  `,
  // De `styles` property is verwijderd omdat de styling nu direct wordt afgehandeld door [ngClass]
  styles: [` :host { display: block; } `],
})
export class UiDesktopNavComponent {
  readonly menuItems = input.required<NavigationItem[]>();
  readonly isSubtle = input(false, { transform: booleanAttribute });

  protected readonly NavDisplayHintEnum = NavDisplayHintEnum;

  readonly listClasses = computed(() => {
    const baseClasses = ['flex', 'items-center'];
    const gapClass = this.isSubtle() ? 'gap-4' : 'gap-6';

    return [...baseClasses, gapClass].join(' ');
  });
}