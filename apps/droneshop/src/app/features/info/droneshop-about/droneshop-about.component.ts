/**
 * @file droneshop-about.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description Component for the 'About Us' page.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { TeamComponent } from '@royal-code/ui/team'; // Importeer de team component

@Component({
  selector: 'droneshop-about',
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    UiTitleComponent, UiParagraphComponent,
    TeamComponent // Voeg de team component toe
  ],
  template: `
    <div class="container-max py-12 px-4">
      <header class="text-center mb-16">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H1"
          [text]="'aboutPage.title' | translate"
          extraClasses="!text-4xl !font-bold mb-4"
        />
        <royal-code-ui-paragraph color="muted" extraClasses="max-w-3xl mx-auto text-lg">
          {{ 'aboutPage.subtitle' | translate }}
        </royal-code-ui-paragraph>
      </header>

      <main class="max-w-4xl mx-auto space-y-12">
        <section class="prose lg:prose-xl text-secondary">
          <p>{{ 'aboutPage.story.p1' | translate }}</p>
          <p>{{ 'aboutPage.story.p2' | translate }}</p>
          <p><strong>{{ 'aboutPage.story.p3' | translate }}</strong></p>
        </section>

        <!-- Team Section -->
        <royal-code-ui-team />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopAboutComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
}