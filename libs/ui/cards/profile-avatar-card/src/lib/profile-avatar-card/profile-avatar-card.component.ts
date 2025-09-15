// --- VERVANG VOLLEDIG BESTAND: libs/ui/card/src/lib/profile-avatar-card/profile-avatar-card.component.ts ---
/**
 * @file profile-avatar-card.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Een presentational component voor het weergeven van een profiel of avatar met titel en subtitel.
 *   Styling is gebaseerd op een ronde afbeelding, hoofdtitel en secundaire titel.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { ProfileAvatarCardData, TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';

@Component({
  selector: 'royal-code-ui-profile-avatar-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    UiImageComponent, UiTitleComponent, UiParagraphComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data(); as d) {
      <a [routerLink]="d.route || '#'"
         class="flex flex-col items-center text-center p-6 h-full group/avatar-card"
         [attr.aria-label]="d.titleKey">
        <div class="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-primary">
          <royal-code-ui-image
            [src]="d.imageUrl"
            [alt]="d.titleKey"
            rounding="full"
            objectFit="cover"
            extraClasses="group-hover/avatar-card:scale-105 transition-transform duration-300"
          />
        </div>
        <royal-code-ui-title
          [level]="TitleTypeEnum.H3"
          [text]="d.titleKey | translate"
          extraClasses="!text-xl !font-semibold !mb-1 group-hover/avatar-card:text-primary transition-colors"
        />
        <royal-code-ui-paragraph
          [text]="d.subtitleKey | translate"
          size="sm"
          color="primary"
          extraClasses="font-medium"
        />
      </a>
    }
  `,
  styles: [`:host { display: block; height: 100%; }`]
})
export class UiProfileAvatarCardComponent {
  data = input.required<ProfileAvatarCardData>();
  protected readonly TitleTypeEnum = TitleTypeEnum;
}