/**
 * @file ui-breadcrumb.component.ts
 * @Version 2.0.0 (Definitive, Immutable & Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description
 *   De definitieve, robuuste breadcrumb component. Deze versie lost alle
 *   eerdere problemen op:
 *   1.  **TypeError: "isCurrent" is read-only:** Werkt nu 100% immutable door nieuwe
 *       objecten te creëren i.p.v. bestaande te wijzigen.
 *   2.  **Duplicatie:** Gebruikt een Map om unieke breadcrumbs per URL te garanderen.
 *   3.  **Timing/Refresh Probleem:** De logica is nu declaratief en herberekent
 *       correct wanneer de service-data beschikbaar komt.
 *   4.  **Translatie:** De template past de 'translate' pipe correct toe.
 */
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon, BreadcrumbItem} from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { ChangeDetectionStrategy, inject, computed, Component } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'royal-code-ui-breadcrumbs',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, UiIconComponent,
    UiButtonComponent, UiParagraphComponent
  ],
  template: `
    <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm">
      <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="goBack()" [attr.aria-label]="'common.buttons.back' | translate" extraClasses="flex-shrink-0">
        <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" sizeVariant="sm" />
      </royal-code-ui-button>

      <ol class="flex items-center space-x-2 truncate">
        @for (item of finalBreadcrumbs(); track item.id) {
          <li class="flex items-center">
            @if (!item.isFirst) {
              <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" extraClasses="mx-2 text-muted-foreground flex-shrink-0" />
            }
            @if (!item.isCurrent) {
              <a [routerLink]="item.url" class="font-medium text-secondary hover:text-primary transition-colors flex-shrink-0">
                {{ item.label | translate }}
              </a>
            } @else {
              <royal-code-ui-paragraph color="foreground" extraClasses="font-medium flex-shrink-0" [attr.aria-current]="'page'">
                {{ item.label | translate }}
              </royal-code-ui-paragraph>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBreadcrumbsComponent {
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly router = inject(Router);
  protected readonly AppIcon = AppIcon;

  // Dit is de definitieve, correcte logica.
  protected readonly finalBreadcrumbs = computed(() => {
    const rawBreadcrumbs = this.breadcrumbService.breadcrumbs();
    const currentUrl = this.router.url.split('?')[0];

    // Stap 1: Gebruik een Map om een unieke, geordende lijst van breadcrumbs te bouwen.
    const breadcrumbMap = new Map<string, BreadcrumbItem>();
    breadcrumbMap.set('/', { id: btoa('/'), label: 'navigation.home', url: '/', isCurrent: false });
    rawBreadcrumbs.forEach(item => breadcrumbMap.set(item.url, item));
    const uniqueBreadcrumbs = Array.from(breadcrumbMap.values());

    // Stap 2: Creëer de uiteindelijke lijst door over de unieke breadcrumbs te mappen.
    // Dit creëert NIEUWE objecten en lost de "read-only" fout op.
    return uniqueBreadcrumbs.map((item, index, arr) => ({
      ...item, // Kopieer alle eigenschappen
      isFirst: index === 0,
      isCurrent: index === arr.length - 1
    }));
  });

  goBack(): void {
    this.breadcrumbService.goBack();
  }
}