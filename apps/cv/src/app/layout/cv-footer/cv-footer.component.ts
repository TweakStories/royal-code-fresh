/**
 * @file cv-footer.component.ts (CV App)
 * @Version 1.2.0 (USP Section Disabled)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Applicatie-specifieke "wrapper" component voor de CV footer.
 *   Schakelt de USP-sectie expliciet uit voor de CV-app.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CV_APP_NAVIGATION } from '../../config/cv-navigation';
import { UiFooterComponent, SocialLink } from '@royal-code/ui/navigation';

@Component({
  selector: 'app-cv-footer',
  standalone: true,
  imports: [CommonModule, UiFooterComponent],
  template: `
    <royal-code-ui-footer
      [supportLinks]="footerLinks.supportLinks"
      [shopLinks]="footerLinks.shopLinks"
      [companyLinks]="footerLinks.companyLinks"
      [appName]="'Roy van de Wetering'"
      [socialLinks]="socialLinks"
      [paymentMethodsEnabled]="false"
      [enableUspSection]="false"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvFooterComponent {
  protected readonly footerLinks = CV_APP_NAVIGATION.footer ?? { supportLinks: [], shopLinks: [], companyLinks: [] };
  
  protected readonly socialLinks: SocialLink[] = [
    { url: 'https://github.com/TweakStories', icon: 'Github' },
    { url: 'https://www.linkedin.com/in/rvdwp/', icon: 'Linkedin' }
  ];
}