// --- IN apps/cv/src/app/components/certification-card/certification-card.component.ts, VERVANG HET VOLLEDIGE BESTAND ---
/**
 * @file certification-card.component.ts (CV App)
 * @description Een presentational component die een enkel certificaat toont.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
// Aangepast importpad voor de verplaatste modellen
import { CertificationItem } from '../../core/models/experience.model'; // <-- CORRECT PAD
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'app-cv-certification-card',
  standalone: true,
  imports: [TranslateModule, UiTitleComponent, UiIconComponent],
  template: `
    <div class="certification-card flex items-start gap-4 bg-card p-4 rounded-xs border border-border h-full">
      <royal-code-ui-icon [icon]="AppIcon.BadgeCheck" sizeVariant="lg" colorClass="text-primary mt-1" />
      <div class="flex-grow">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H4" 
          [text]="certification().nameKey | translate"
          extraClasses="!text-base !font-semibold"
        />
        <p class="text-sm text-secondary font-medium">{{ certification().issuingBody }}</p>
        <p class="text-xs text-muted mt-1">{{ certification().dateKey | translate }}</p>
        @if (certification().credentialUrl) {
          <a [href]="certification().credentialUrl" target="_blank" rel="noopener noreferrer" class="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
            {{ 'cv.experience.viewCredential' | translate }}
            <royal-code-ui-icon [icon]="AppIcon.ExternalLink" sizeVariant="xs" />
          </a>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvCertificationCardComponent {
  certification = input.required<CertificationItem>();
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}