/**
 * @file droneshop-footer.component.ts
 * @Version 2.2.0 (FIX: Correct SocialLink Typing)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Een applicatie-specifieke "wrapper" component voor de Droneshop footer.
 *   - FIX: lost een TS2322-compilatiefout op door de `socialLinks`-array expliciet
 *     te typeren met de `SocialLink`-interface.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DRONESHOP_FOOTER_LINKS } from '../../config/droneshop-navigation';
import { UiFooterComponent, SocialLink } from '@royal-code/ui/navigation';
import { NavigationItem } from '@royal-code/shared/domain';

@Component({
  selector: 'droneshop-footer',
  standalone: true,
  imports: [CommonModule, UiFooterComponent],
  template: `
    <royal-code-ui-footer
      [supportLinks]="footerLinks.supportLinks"
      [shopLinks]="footerLinks.shopLinks"
      [companyLinks]="footerLinks.companyLinks"
      [appName]="'Droneshop'"
      [socialLinks]="socialLinks"
      [paymentMethodsEnabled]="true"
      [enableUspSection]="true"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopFooterComponent {
  protected readonly footerLinks: {
    supportLinks: NavigationItem[],
    shopLinks: NavigationItem[],
    companyLinks: NavigationItem[]
  } = DRONESHOP_FOOTER_LINKS;
  
  // DE FIX: De array wordt nu expliciet getypeerd als SocialLink[]
  protected readonly socialLinks: SocialLink[] = [
    { url: '#', icon: 'Facebook' },
    { url: '#', icon: 'Instagram' },
    { url: '#', icon: 'Youtube' },
    { url: '#', icon: 'Twitter' },
  ];
}