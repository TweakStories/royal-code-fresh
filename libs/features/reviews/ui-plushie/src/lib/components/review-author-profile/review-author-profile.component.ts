/**
 * @file review-author-profile.component.ts
 * @Description Component for displaying a review author's profile, including avatar, name, level, and reputation.
 *              Acts as a composite component for `UiProfileImageComponent` and `UiParagraphComponent`.
 */
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';


import { UiProfileImageComponent } from '@royal-code/ui/media'; // Correct path
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { Profile } from '@royal-code/shared/domain'; 

@Component({
  selector: 'lib-review-author-profile',
  standalone: true,
  imports: [
    UiProfileImageComponent,
    UiParagraphComponent,
],
  template: `
    <!-- Main wrapper div for avatar + text. This div is a flex container, not a fixed-size container. -->
    <!-- It is the clickable area, with accessibility attributes. -->
    <div
      class="flex items-center gap-3 cursor-pointer"
      tabindex="0"
      role="button"
      [attr.aria-label]="'Bekijk profiel van ' + (profile().displayName || 'gebruiker')"
      (click)="onAuthorClick()"
      (keydown.enter)="onAuthorClick()"
      (keydown.space)="onAuthorClick(); $event.preventDefault()"
    >
      <!-- UiProfileImageComponent: Internally handles its size (e.g., w-12 h-12 for 'lg'). -->
      <royal-code-ui-profile-image
        [source]="profile().avatar"
        [displayName]="profile().displayName"
        [size]="'xl'"
        [showStatus]="false"
        class="flex-shrink-0"
      />

      <!-- Text container: flex-grow makes it take available space. -->
      <div class="flex flex-col flex-grow min-w-0">
        <royal-code-ui-paragraph
          [text]="profile().displayName"
          size="md"
          color="foreground"
          extraClasses="font-semibold truncate"
        />

        @if (authorLevel()) {
          <royal-code-ui-paragraph
            [text]="'Level ' + authorLevel()"
            size="sm"
            color="primary"
            extraClasses="italic"
          />
        }

        @if (authorReputation()) {
          <royal-code-ui-paragraph
            [text]="'Reputatie: ' + authorReputation()"
            size="sm"
            color="primary"
          />
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      /* The host element wraps the internal div. It should simply display as a block. */
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewProfileComponent {
  readonly profile = input.required<Profile>();
  readonly authorLevel = input<number | undefined>();
  readonly authorReputation = input<number | undefined>();
  readonly authorClick = output<string>();

  onAuthorClick(): void {
    if (this.profile()?.id) {
      this.authorClick.emit(this.profile().id);
    }
  }
}
