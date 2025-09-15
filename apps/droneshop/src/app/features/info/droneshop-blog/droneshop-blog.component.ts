/**
 * @file droneshop-blog.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description Component for the blog page, integrating the social feed.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { FeedComponent } from '@royal-code/features/social/ui'; // Importeer de FeedComponent

@Component({
  selector: 'droneshop-blog',
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    UiTitleComponent, UiParagraphComponent,
    FeedComponent // Voeg FeedComponent toe aan imports
  ],
  template: `
    <div class="container-max py-12 px-4">
      <header class="text-center mb-12">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H1"
          [text]="'blogPage.title' | translate"
          extraClasses="!text-4xl !font-bold mb-4"
        />
        <royal-code-ui-paragraph color="muted" extraClasses="max-w-2xl mx-auto">
          {{ 'blogPage.subtitle' | translate }}
        </royal-code-ui-paragraph>
      </header>

      <main class="max-w-4xl mx-auto space-y-10">
        <!-- Dit is waar de social feed wordt geladen -->
        <section>
          <royal-code-feed [feedId]="'droneshop-home'" />
        </section>
        
        <!-- Optionele verdere blog content kan hier later worden toegevoegd -->
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopBlogComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
}