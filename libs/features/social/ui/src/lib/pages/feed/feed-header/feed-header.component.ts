/**
 * @file feed-header.component.ts
 * @version 1.2.0 (Corrected API and Template Bindings)
 * @author Royal-Code MonorepoAppDevAI
 */
import { Component, ChangeDetectionStrategy, input, OutputEmitterRef, output, computed, inject, InputSignal, signal, Signal } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon, PrivacyLevel } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';
import { UiImageComponent } from '@royal-code/ui/media';
import { LoggerService } from '@royal-code/core/core-logging';
import { AuthFacade } from '@royal-code/store/auth';
import { ImageVariant } from '@royal-code/shared/domain';
import { Profile } from '@royal-code/shared/domain';
import { DateTimeInfo } from 'libs/shared/base-models/src/lib/common.model';

@Component({
  selector: 'royal-code-feed-header',
  standalone: true,
  imports: [ CommonModule, RouterModule, TranslateModule, UiImageComponent, UiIconComponent, UiDropdownComponent, DatePipe, TitleCasePipe ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="flex items-center justify-between w-full py-2 px-4 bg-card-primary">
  <a [routerLink]="['/profile', profile().id]"
     [title]="('social.feed.viewProfile' | translate) + ' ' + profile().displayName"
     class="flex items-center space-x-3 flex-1 min-w-0 group/header">

    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0 bg-muted">
      @if (avatarImageVariants(); as variants) {
          <royal-code-ui-image
            [variants]="variants"
            [alt]="('social.feed.avatarAlt' | translate: { name: profile().displayName })"
            [rounded]="true"
            [objectFit]="'cover'"
            (imageError)="handleAvatarError()"
            class="w-full h-full"
          />
      } @else {
         <div class="w-full h-full flex items-center justify-center text-secondary-foreground text-lg font-semibold bg-secondary">
            {{ profile().displayName.charAt(0).toUpperCase() || '?' }}
         </div>
      }
    </div>

    <div class="flex flex-col min-w-0">
      <div class="flex items-center space-x-1 flex-wrap">
        <span class="font-semibold text-sm md:text-base text-foreground group-hover/header:text-primary group-hover/header:underline truncate">
          {{ profile().displayName }}
        </span>
<span class="text-xs text-primary whitespace-nowrap">• {{ displayableTimestampS() | date:'shortTime' }}</span>
        @if (privacyIcon(); as icon) {
          <royal-code-ui-icon [icon]="icon" sizeVariant="xs" [colorClass]="'text-primary-foreground'" [title]="privacy() | titlecase" extraClass="ml-1" />
        }
      </div>
      <div class="text-xs text-primary-foreground/80 mt-0.5 flex flex-wrap items-center gap-x-1.5 opacity-80">
        <span>{{ 'social.feed.level' | translate }}: {{ profile().level || 'N/A' }}</span>
        <span class="hidden sm:inline">•</span>
        <span>{{ 'social.feed.reputation' | translate }}: {{ profile().reputation || 'N/A' }}</span>
        @if(contextInfo()){
          <span class="hidden sm:inline">•</span>
          <span class="italic">{{ contextInfo() }}</span>
        }
      </div>
    </div>
  </a>

  <div class="ml-2 flex-shrink-0">
    <royal-code-ui-dropdown alignment="right" [offsetX]="0">
      <button dropdown-trigger type="button" class="p-2 -m-2 rounded-full text-primary-foreground hover:text-primary hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 transition-colors" [attr.aria-label]="'social.feed.aria.moreOptions' | translate">
        <royal-code-ui-icon [icon]="AppIcon.MoreHorizontal" sizeVariant="md"></royal-code-ui-icon>
      </button>
      <div dropdown>
        <div class="shadow-lg rounded-md py-1 w-40 bg-popover border border-border text-popover-foreground">
          @if(canEditOrDelete()) {
            <button class="action-button-menu" (click)="editClicked.emit()">
             <royal-code-ui-icon [icon]="AppIcon.Edit3" sizeVariant="xs" extraClass="mr-2"/>
             {{ 'common.buttons.edit' | translate }}
            </button>
            <button class="action-button-menu text-destructive" (click)="deleteClicked.emit()">
             <royal-code-ui-icon [icon]="AppIcon.Trash2" sizeVariant="xs" extraClass="mr-2"/>
             {{ 'common.buttons.delete' | translate }}
            </button>
            <hr class="my-1 border-border">
          }
          <button class="action-button-menu" (click)="onShare()">
            <royal-code-ui-icon [icon]="AppIcon.Share" sizeVariant="xs" extraClass="mr-2"/>
            {{ 'common.buttons.share' | translate }}
          </button>
          <button class="action-button-menu" (click)="reportClicked.emit()">
             <royal-code-ui-icon [icon]="AppIcon.Flag" sizeVariant="xs" extraClass="mr-2"/>
             {{ 'common.buttons.report' | translate }}
           </button>
        </div>
      </div>
    </royal-code-ui-dropdown>
  </div>
</div>
`
})
export class FeedHeaderComponent {
  private readonly logger = inject(LoggerService, { optional: true });
  private readonly authFacade = inject(AuthFacade);
  private readonly logPrefix = '[FeedHeaderComponent]';

  readonly profile: InputSignal<Profile> = input.required<Profile>();
  readonly createdAt: InputSignal<Date | string | DateTimeInfo> = input.required<Date | string | DateTimeInfo>();
  readonly privacy: InputSignal<PrivacyLevel> = input.required<PrivacyLevel>();
  readonly contextInfo: InputSignal<string | undefined> = input<string>();

  readonly editClicked: OutputEmitterRef<void> = output<void>();
  readonly deleteClicked: OutputEmitterRef<void> = output<void>();
  readonly reportClicked: OutputEmitterRef<void> = output<void>();
  readonly shareClicked: OutputEmitterRef<void> = output<void>();

  readonly AppIcon = AppIcon;
  private readonly avatarLoadError = signal(false);

  readonly canEditOrDelete = computed(() => {
    const currentUserId = this.authFacade.currentUser()?.id;
    const itemAuthorId = this.profile()?.id;
    return !!currentUserId && !!itemAuthorId && currentUserId === itemAuthorId;
  });

  readonly privacyIcon = computed((): AppIcon | null => {
    switch (this.privacy()) {
      case PrivacyLevel.PUBLIC: return AppIcon.Globe;
      case PrivacyLevel.FRIENDS: return AppIcon.Users;
      case PrivacyLevel.PRIVATE: return AppIcon.Lock;
      default: return null;
    }
  });

  readonly avatarImageVariants: Signal<ImageVariant[] | undefined> = computed(() => {
    const avatar = this.profile()?.avatar;
    if (avatar && !this.avatarLoadError()) {
      return avatar.variants;
    }
    return undefined;
  });

  constructor() {
    this.logger?.debug(`${this.logPrefix} Initialized.`);
  }

  onShare(): void {
    this.logger?.info(`${this.logPrefix} Share button clicked for item by ${this.profile()?.displayName}.`);
    this.shareClicked.emit();
  }

  handleAvatarError(): void {
    this.logger?.warn(`${this.logPrefix} Avatar image for ${this.profile()?.displayName} failed to load. Falling back to initials.`);
    this.avatarLoadError.set(true);
  }

isDateTimeInfo(value: any): value is DateTimeInfo {
  return typeof value === 'object' && value !== null && 'iso' in value;
}

readonly displayableTimestampS = computed<string | undefined>(() => {
  const createdAtValue = this.createdAt(); // 'this' is optioneel afhankelijk van uw class structuur

  if (!createdAtValue) {
    return undefined;
  }
  if (this.isDateTimeInfo(createdAtValue)) {
    return createdAtValue.iso;
  }
  if (createdAtValue instanceof Date) {
    return createdAtValue.toISOString();
  }
  // Als het al een string is (vermoedelijk ISO), geef het direct terug.
  if (typeof createdAtValue === 'string') {
    return createdAtValue;
  }

  // Fallback voor onverwachte types
  return undefined;
});


}