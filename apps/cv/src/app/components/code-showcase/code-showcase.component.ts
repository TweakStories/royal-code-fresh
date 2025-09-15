/**
 * @file code-showcase.component.ts (CV App)
 * @version 1.0.0
 * @description Een presentational component voor het tonen van een "Under the Hood" showcase,
 *              inclusief een titel, beschrijving, afbeelding en een link naar de code op GitHub.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Image } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiIconComponent } from '@royal-code/ui/icon';

// Interface voor de data die dit component verwacht
export interface CodeShowcaseData {
  titleKey: string;
  descriptionKey: string;
  image: Image;
  githubLink: string;
}

@Component({
  selector: 'app-cv-code-showcase',
  standalone: true,
  imports: [TranslateModule, UiTitleComponent, UiParagraphComponent, UiImageComponent, UiIconComponent],
  template: `
    <div class="border border-border p-4 rounded-xs bg-surface-alt transition-shadow hover:shadow-md">
      <royal-code-ui-title 
        [level]="TitleTypeEnum.H3" 
        [text]="showcase().titleKey | translate" 
        extraClasses="!text-xl !font-semibold mb-2" 
      />
      <royal-code-ui-paragraph 
        [text]="showcase().descriptionKey | translate" 
        size="sm" 
        color="muted" 
        extraClasses="mb-4" 
      />
      <div class="mb-4 rounded-md overflow-hidden border border-border">
        <royal-code-ui-image 
          [image]="showcase().image" 
          objectFit="contain" 
          class="block w-full max-h-80 bg-background" 
        />
      </div>
      <a 
        [href]="showcase().githubLink" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="inline-flex items-center text-primary hover:underline font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1 -m-1">
        {{ 'cv.projects.detail.viewCodeOnGithub' | translate }}
        <royal-code-ui-icon [icon]="AppIcon.ExternalLink" sizeVariant="xs" extraClass="ml-1.5" />
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvCodeShowcaseComponent {
  showcase: InputSignal<CodeShowcaseData> = input.required<CodeShowcaseData>();
  
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}