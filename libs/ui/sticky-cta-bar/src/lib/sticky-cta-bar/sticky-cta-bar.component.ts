/**
 * @file sticky-cta-bar.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description A sticky bar component for product pages to keep the main
 *              call-to-action always visible.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';

@Component({
  selector: 'royal-code-sticky-cta-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiButtonComponent, UiIconComponent],
  template: `
    <div class="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border z-50 animate-fade-in-up"
         style="padding-bottom: env(safe-area-inset-bottom);">
      <div class="container-max flex items-center justify-between h-20 px-4">
        <span class="text-lg font-semibold text-foreground hidden sm:block">{{ productName() }}</span>
        <a [routerLink]="purchaseRoute()">
          <royal-code-ui-button type="primary" sizeVariant="lg" [enableNeonEffect]="true">
            <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" extraClass="mr-3" />
            <span>{{ ctaTextKey() | translate }}</span>
          </royal-code-ui-button>
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StickyCtaBarComponent {
  productName = input.required<string>();
  purchaseRoute = input.required<string | string[]>();
  ctaTextKey = input.required<string>();
  protected readonly AppIcon = AppIcon;
}