/**
 * @file cv-header.component.ts (CV App)
 * @Version 7.0.0 (Upgraded to Shared UI Component)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   De CV header, nu geüpgraded om als een simpele "wrapper" te fungeren rond de
 *   nieuwe, herbruikbare <royal-code-ui-header>. Deze component geeft de app-specifieke
 *   logo-tekst door en injecteert de social media iconen als app-specifieke acties.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Gedeelde UI Componenten
import { UiHeaderComponent } from '@royal-code/ui/navigation';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'app-cv-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UiHeaderComponent,
    UiIconComponent
  ],
  template: `
    <royal-code-ui-header [logoText]="'Roy van de Wetering'" [enableSearch]="false">
      <div app-actions class="flex items-center gap-2">
        <a href="https://github.com/TweakStories" target="_blank" rel="noopener noreferrer" 
           class="p-2 rounded-md text-foreground hover:text-primary transition-colors" 
           aria-label="GitHub Profiel">
          <royal-code-ui-icon [icon]="AppIcon.Github" sizeVariant="sm" />
        </a>
        <a href="https://www.linkedin.com/in/rvdwp/" target="_blank" rel="noopener noreferrer" 
           class="p-2 rounded-md text-foreground hover:text-primary transition-colors" 
           aria-label="LinkedIn Profiel">
          <royal-code-ui-icon [icon]="AppIcon.Linkedin" sizeVariant="sm" />
        </a>
      </div>
    </royal-code-ui-header>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvHeaderComponent {
  protected readonly AppIcon = AppIcon;
}