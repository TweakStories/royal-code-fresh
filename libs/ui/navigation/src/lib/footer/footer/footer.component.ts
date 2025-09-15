/**
 * @file ui-footer.component.ts
 * @Version 1.3.0 (Configurable USP Section)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Generieke footer. Nu met een configureerbare USP (Unique Selling Proposition)
 *   sectie via de `enableUspSection` input.
 */
import { ChangeDetectionStrategy, Component, input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon, NavigationItem } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';

export interface SocialLink {
  url: string;
  icon: keyof typeof AppIcon;
}

@Component({
  selector: 'royal-code-ui-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiIconComponent, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-card border-t-2 border-black text-foreground">
      <!-- Sectie 1: Trust & Value Banner (USP Section) -->
      @if (enableUspSection()) {
        <section class="bg-surface-alt border-b-2 border-black">
          <div class="container-max grid grid-cols-1 md:grid-cols-3">
            <div class="flex items-center gap-4 p-6 md:border-r-2 border-black">
              <royal-code-ui-icon [icon]="AppIcon.Truck" sizeVariant="xl" extraClass="text-primary"/>
              <div>
                <h3 class="font-bold text-foreground">{{ 'footer.usp.shipping.title' | translate }}</h3>
                <p class="text-sm text-secondary">{{ 'footer.usp.shipping.text' | translate }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-6 md:border-r-2 border-black">
              <royal-code-ui-icon [icon]="AppIcon.LifeBuoy" sizeVariant="xl" extraClass="text-primary"/>
              <div>
                <h3 class="font-bold text-foreground">{{ 'footer.usp.support.title' | translate }}</h3>
                <p class="text-sm text-secondary" [innerHTML]="'footer.usp.support.text' | translate"></p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-6">
              <royal-code-ui-icon [icon]="AppIcon.ShieldCheck" sizeVariant="xl" extraClass="text-primary"/>
              <div>
                <h3 class="font-bold text-foreground">{{ 'footer.usp.secure.title' | translate }}</h3>
                <p class="text-sm text-secondary">{{ 'footer.usp.secure.text' | translate }}</p>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- Sectie 2: Hoofd-Footer (Fat Footer) -->
      <div class="container-max py-12 px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="footer-col">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.support.title' | translate }}</h4>
            <ul class="space-y-2">
              @for(link of supportLinks(); track link.id) {
                <li><a [routerLink]="link.external ? null : link.route" [href]="link.external ? link.route : null" [target]="link.external ? '_blank' : '_self'" [rel]="link.external ? 'noopener' : null" class="text-secondary hover:text-primary transition-colors">{{ link.labelKey | translate }}</a></li>
              }
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.shop.title' | translate }}</h4>
            <ul class="space-y-2">
              @for(link of shopLinks(); track link.id) {
                <li><a [routerLink]="link.route" [queryParams]="link.queryParams" class="text-secondary hover:text-primary transition-colors">{{ link.labelKey | translate }}</a></li>
              }
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.company.title' | translate }}</h4>
            <ul class="space-y-2">
              @for(link of companyLinks(); track link.id) {
                <li><a [routerLink]="link.route" class="text-secondary hover:text-primary transition-colors">{{ link.labelKey | translate }}</a></li>
              }
            </ul>
          </div>
          <div class="footer-col md:col-span-2 lg:col-span-1">
            <h4 class="font-bold mb-4 uppercase text-primary">{{ 'footer.columns.newsletter.title' | translate }}</h4>
            <p class="text-sm text-secondary mb-4">{{ 'footer.columns.newsletter.text' | translate }}</p>
            <form (submit)="$event.preventDefault()" class="flex items-center border-2 border-border focus-within:border-primary transition-colors rounded-none">
              <input type="email" placeholder="{{ 'footer.columns.newsletter.placeholder' | translate }}" class="w-full bg-transparent px-3 py-2 text-foreground focus:outline-none">
              <royal-code-ui-button type="primary" htmlType="submit" sizeVariant="md" [isRound]="false" extraClasses="border-l-2 border-border rounded-none">
                <royal-code-ui-icon [icon]="AppIcon.Mail" />
              </royal-code-ui-button>
            </form>
          </div>
        </div>
      </div>

      <!-- Sectie 3: Sub-Footer -->
      <div class="border-t-2 border-black bg-surface-alt">
        <div class="container-max py-6 px-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div class="text-secondary text-center md:text-left mb-4 md:mb-0">
            © {{ currentYear }} {{ appName() }}. Alle rechten voorbehouden.
            <a routerLink="/terms" class="hover:text-primary ml-2">Voorwaarden</a>
            <a routerLink="/privacy" class="hover:text-primary ml-2">Privacybeleid</a>
          </div>
          <div class="flex flex-col items-center md:items-end space-y-4">
            @if (socialLinks() && socialLinks()!.length > 0) {
              <div class="flex items-center gap-4">
                @for(link of socialLinks(); track link.url) {
                  <a [href]="link.url" target="_blank" rel="noopener" class="text-secondary hover:text-primary"><royal-code-ui-icon [icon]="AppIcon[link.icon]" /></a>
                }
              </div>
            }
            @if (paymentMethodsEnabled()) {
              <div class="flex items-center gap-2 h-6">
                <span class="text-xs text-secondary">iDEAL, VISA, Mastercard, PayPal</span>
              </div>
            }
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class UiFooterComponent {
  readonly supportLinks = input.required<NavigationItem[]>();
  readonly shopLinks = input.required<NavigationItem[]>();
  readonly companyLinks = input.required<NavigationItem[]>();
  readonly appName = input('Royal-Code App');
  readonly socialLinks = input<SocialLink[] | undefined>();
  readonly paymentMethodsEnabled = input(true, { transform: booleanAttribute });
  readonly enableUspSection = input(true, { transform: booleanAttribute });

  protected readonly AppIcon = AppIcon;
  readonly currentYear = new Date().getFullYear();
}