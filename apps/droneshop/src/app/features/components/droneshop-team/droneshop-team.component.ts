/**
 * @file droneshop-team.component.ts
 * @Version 2.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Applicatie-specifieke component die het team toont via de ItemCarousel,
 *   die op zijn beurt de nieuwe, herbruikbare UiProfileAvatarCardComponent rendert.
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// UI Imports
import { ItemCarouselComponent } from '@royal-code/ui/card';
import { UiTitleComponent, TitleTypeEnum } from '@royal-code/ui/title';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
// Importeer de nieuwe component en interface
import { UiProfileAvatarCardComponent, ProfileAvatarCardData } from '@royal-code/ui/card'; 

@Component({
  selector: 'droneshop-team',
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    ItemCarouselComponent,
    UiTitleComponent, UiParagraphComponent,
    UiProfileAvatarCardComponent // Importeer de nieuwe card
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 md:py-16 text-center">
      <royal-code-ui-title
        [level]="TitleTypeEnum.H2"
        text="Ons Team"
        extraClasses="!text-3xl md:!text-4xl !font-bold !mb-4"
      />
      <royal-code-ui-paragraph color="muted" extraClasses="max-w-2xl mx-auto mb-10">
        Ontmoet de gepassioneerde FPV-enthousiastelingen die Droneshop tot leven brengen.
      </royal-code-ui-paragraph>

      <royal-code-ui-item-carousel
        [items]="teamMembers()"
        [itemTemplate]="teamMemberTemplate"
        titleKey=""
      />

      <!-- De template geeft nu simpelweg de nieuwe card component door -->
      <ng-template #teamMemberTemplate let-memberData>
        <div class="w-48 sm:w-56"> <!-- Container met vaste breedte voor consistentie in de carousel -->
          <royal-code-ui-profile-avatar-card [data]="memberData" />
        </div>
      </ng-template>
    </section>
  `,
  styles: [`:host { display: block; }`]
})
export class DroneshopTeamComponent {
  protected readonly TitleTypeEnum = TitleTypeEnum;

  // De data wordt nu direct gemapt naar de ProfileAvatarCardData interface
  // De data wordt nu direct gemapt naar de ProfileAvatarCardData interface
  readonly teamMembers = signal<ProfileAvatarCardData[]>([
    { id: 'roy', name: 'Roy van de Wetering', titleKey: 'Roy van de Wetering', subtitleKey: 'team.founder', imageUrl: 'images/default-image.webp', route: '#' },
    { id: 'wesley', name: 'Wesley Guijt', titleKey: 'Wesley Guijt', subtitleKey: 'team.leadEngineer', imageUrl: 'images/default-image.webp', route: '#' },
    { id: 'bastiaan', name: 'Bastiaan Paap', titleKey: 'Bastiaan Paap', subtitleKey: 'team.marketingSpecialist', imageUrl: 'images/default-image.webp', route: '#' },
    { id: 'sjaak', name: 'Sjaak van de Wetering', titleKey: 'Sjaak van de Wetering', subtitleKey: 'team.fpvExpert', imageUrl: 'images/default-image.webp', route: '#' },
  ]);
}